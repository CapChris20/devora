// Firestore integration for Activity Center CECS Clubs and Updates.
// Collections:
// - /clubs/{clubId}
// - /clubs/{clubId}/posts/{postId}
// - /users/{uid}/followedClubs/{clubId}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./start-firebase";
import type { Club, ClubPost } from "@/types/clubs";
import { REAL_SEEDED_CLUBS } from "@/ui/activity-center/clubs/seeded-clubs";

const CLUBS_COLLECTION = "clubs";
const POSTS_SUBCOLLECTION = "posts";
const USERS_COLLECTION = "users";
const FOLLOWED_CLUBS_SUBCOLLECTION = "followedClubs";

/**
 * Fetch all clubs from Firestore.
 * Automatically initializes and seeds real UM-Dearborn CECS clubs if the collection is empty.
 */
export async function fetchClubsFromFirestore(): Promise<Club[]> {
  try {
    const clubsRef = collection(db, CLUBS_COLLECTION);
    const snapshot = await getDocs(clubsRef);

    if (snapshot.empty) {
      // Seed Firestore with the real researched CECS clubs
      await seedClubsInFirestore();
      return REAL_SEEDED_CLUBS;
    }

    const clubs: Club[] = [];
    const existingIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      existingIds.add(docSnap.id);
      const data = docSnap.data();
      clubs.push({
        id: docSnap.id,
        name: data.name || "",
        shortName: data.shortName || data.name || "",
        description: data.description || "",
        category: data.category || "Academic",
        meetingFrequency: data.meetingFrequency || "Bi-weekly",
        link: data.link || undefined,
        followerCount: typeof data.followerCount === "number" ? data.followerCount : 0,
        memberCount: typeof data.memberCount === "number" ? data.memberCount : 0,
        latestPost: data.latestPost || null,
        createdAt: data.createdAt || null,
      });
    });

    // Seamlessly merge all directory clubs with any Firestore records
    for (const seeded of REAL_SEEDED_CLUBS) {
      if (!existingIds.has(seeded.id)) {
        clubs.push(seeded);
      }
    }

    return clubs;
  } catch (error) {
    console.warn("Using local seeded clubs due to Firestore read failure:", error);
    return REAL_SEEDED_CLUBS;
  }
}

/**
 * Seed all 17 researched UM-Dearborn clubs into Firestore /clubs/{clubId}.
 */
export async function seedClubsInFirestore(): Promise<void> {
  try {
    for (const club of REAL_SEEDED_CLUBS) {
      const clubRef = doc(db, CLUBS_COLLECTION, club.id);
      await setDoc(
        clubRef,
        {
          name: club.name,
          shortName: club.shortName,
          description: club.description,
          category: club.category,
          meetingFrequency: club.meetingFrequency,
          link: club.link || null,
          followerCount: club.followerCount,
          memberCount: club.memberCount,
          latestPost: club.latestPost || null,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("Error seeding clubs into Firestore:", err);
  }
}

/**
 * Fetch the IDs of all clubs followed by a specific user.
 */
export async function fetchUserFollowedClubIds(uid: string): Promise<string[]> {
  if (!uid) return [];
  try {
    const followedRef = collection(db, USERS_COLLECTION, uid, FOLLOWED_CLUBS_SUBCOLLECTION);
    const snapshot = await getDocs(followedRef);
    return snapshot.docs.map((docSnap) => docSnap.id);
  } catch (err) {
    console.warn("Could not fetch followed clubs from Firestore, falling back to empty:", err);
    return [];
  }
}

/**
 * Toggle follow/unfollow for a club.
 * Updates /users/{uid}/followedClubs/{clubId} and increments/decrements followerCount on /clubs/{clubId}.
 */
export async function toggleFollowClubInFirestore(
  uid: string,
  clubId: string,
  isCurrentlyFollowed: boolean
): Promise<boolean> {
  if (!uid || !clubId) return isCurrentlyFollowed;

  const followedDocRef = doc(db, USERS_COLLECTION, uid, FOLLOWED_CLUBS_SUBCOLLECTION, clubId);
  const clubDocRef = doc(db, CLUBS_COLLECTION, clubId);

  try {
    if (isCurrentlyFollowed) {
      // Unfollow
      await deleteDoc(followedDocRef);
      await updateDoc(clubDocRef, {
        followerCount: increment(-1),
      }).catch(() => {});
      return false;
    } else {
      // Follow
      await setDoc(followedDocRef, {
        followedAt: serverTimestamp(),
      });
      await updateDoc(clubDocRef, {
        followerCount: increment(1),
      }).catch(() => {});
      return true;
    }
  } catch (err) {
    console.error("Failed to toggle follow status in Firestore:", err);
    return isCurrentlyFollowed;
  }
}

/**
 * Fetch a single club by its ID.
 */
export async function fetchClubById(clubId: string): Promise<Club | null> {
  try {
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    const snap = await getDoc(clubRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name || "",
        shortName: data.shortName || data.name || "",
        description: data.description || "",
        category: data.category || "Academic",
        meetingFrequency: data.meetingFrequency || "Bi-weekly",
        link: data.link || undefined,
        followerCount: typeof data.followerCount === "number" ? data.followerCount : 0,
        memberCount: typeof data.memberCount === "number" ? data.memberCount : 0,
        latestPost: data.latestPost || null,
        createdAt: data.createdAt || null,
      };
    }
  } catch (err) {
    console.warn("Firestore fetchClubById failed, checking seed list:", err);
  }

  // Fallback to local real seeded clubs
  const found = REAL_SEEDED_CLUBS.find((c) => c.id === clubId);
  return found || null;
}

/**
 * Fetch the post feed for a club from /clubs/{clubId}/posts.
 */
export async function fetchClubPosts(clubId: string): Promise<ClubPost[]> {
  try {
    const postsRef = collection(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION);
    const q = query(postsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data() as DocumentData;
      return {
        id: d.id,
        clubId,
        authorUid: data.authorUid || "",
        authorName: data.authorName || "Anonymous Member",
        authorEmail: data.authorEmail,
        authorPhoto: data.authorPhoto,
        text: data.text || "",
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
      };
    });
  } catch (err) {
    console.warn("Failed to fetch club posts from Firestore:", err);
    return [];
  }
}

/**
 * Create a new update post in /clubs/{clubId}/posts and update latestPost on the club document.
 */
export async function createClubPost(
  clubId: string,
  authorUid: string,
  authorName: string,
  text: string,
  authorEmail?: string,
  authorPhoto?: string
): Promise<ClubPost | null> {
  if (!clubId || !authorUid || !text.trim()) return null;

  try {
    const postsRef = collection(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION);
    const newPostData = {
      authorUid,
      authorName,
      authorEmail: authorEmail || null,
      authorPhoto: authorPhoto || null,
      text: text.trim(),
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(postsRef, newPostData);

    // Update the club's latest post preview
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    await updateDoc(clubRef, {
      latestPost: {
        text: text.trim(),
        authorName,
        timestamp: "Just now",
      },
    }).catch(() => {});

    return {
      id: docRef.id,
      clubId,
      authorUid,
      authorName,
      authorEmail,
      authorPhoto,
      text: text.trim(),
      timestamp: new Date(),
    };
  } catch (err) {
    console.error("Failed to create club post in Firestore:", err);
    return null;
  }
}

