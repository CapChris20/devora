// Campus Hub state provider and hooks.
// Manages reactive state across the layout (Hero, Bento Tiles, TabNav, Toast) and tab sub-pages.
// Keeps live counts in sync when events are saved, groups joined, requests resolved, and messages sent.

"use client";

// ===== IMPORTS =====

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db, getUserProfile } from "@/backend/firebase";
import { keepUpcomingEvents, sortEventsSoonestFirst } from "@/ui/shared/dates/event-dates";
import type {
  ActivityEvent,
  ActivityEventTag,
  ChatMessage,
  ConnectionRequest,
  MeetingPreference,
  PersonProfile,
  StudyGroup,
} from "@/types/activity-center";

import {
  INITIAL_CONNECTIONS,
  INITIAL_CONVERSATION_ORDER,
  INITIAL_EVENTS,
  INITIAL_MESSAGES,
  INITIAL_PEOPLE,
  INITIAL_REQUESTS,
  INITIAL_UNREAD_COUNTS,
  SAMPLE_REPLIES,
} from "./placeholder-data";

// ===== TYPES =====

export type PostEventInput = {
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  tags: ActivityEventTag[];
  link?: string;
};

export type CreateGroupInput = {
  course: string;
  topic: string;
  meetingPreference: MeetingPreference;
  coordinationMethod: string;
  description: string;
};

type ActivityCenterContextValue = {
  // Events
  events: ActivityEvent[];
  isEventsLoading: boolean;
  savedEventIds: Record<string, boolean>;
  eventFilter: string;
  setEventFilter: (filter: string) => void;
  toggleSaveEvent: (eventId: string) => void;
  isPostEventModalOpen: boolean;
  openPostEventModal: () => void;
  closePostEventModal: () => void;
  postEvent: (input: PostEventInput) => Promise<void>;

  // Study Groups
  groups: StudyGroup[];
  isGroupsLoading: boolean;
  joinedGroupIds: Record<string, boolean>;
  courseFilter: string;
  setCourseFilter: (filter: string) => void;
  toggleJoinGroup: (groupId: string) => void;
  isCreateGroupModalOpen: boolean;
  openCreateGroupModal: () => void;
  closeCreateGroupModal: () => void;
  createGroup: (input: CreateGroupInput) => void;

  // Connections
  requests: ConnectionRequest[];
  connections: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  people: Record<string, PersonProfile>;
  acceptRequest: (uid: string) => void;
  declineRequest: (uid: string) => void;

  // Messaging
  convoOrder: string[];
  activeConvoUid: string;
  setActiveConvoUid: (uid: string) => void;
  messages: Record<string, ChatMessage[]>;
  unreadCounts: Record<string, number>;
  sendMessage: (text: string) => void;
  openChatWithUser: (uid: string) => void;
  isPartnerTyping: boolean;

  // Toast
  toastText: string | null;
  showToast: (message: string) => void;

  // Summary counts for Bento WeekTiles and Tab badges
  requestsCount: number;
  unreadTotalCount: number;
  joinedGroupsCount: number;
  savedEventsCount: number;
};

// ===== CONTEXT SETUP =====

const ActivityCenterContext = createContext<ActivityCenterContextValue | null>(null);

function formatTimestamp(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedHours = (hours + 11) % 12 + 1;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ampm = hours < 12 ? "AM" : "PM";
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// ===== PROVIDER COMPONENT =====

export function ActivityCenterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Events state (live Firestore data with verified campus events fallback)
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [savedEventIds, setSavedEventIds] = useState<Record<string, boolean>>({});
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [isPostEventModalOpen, setIsPostEventModalOpen] = useState(false);

  // Restore saved events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("devora_saved_events");
      if (stored) {
        setSavedEventIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const openPostEventModal = useCallback(() => {
    setIsPostEventModalOpen(true);
  }, []);

  const closePostEventModal = useCallback(() => {
    setIsPostEventModalOpen(false);
  }, []);

  // Sync real-time events from Firestore (capped at 100 for high-concurrency scale)
  useEffect(() => {
    try {
      const q = query(collection(db, "events"), limit(100));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const firestoreEvents: ActivityEvent[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            firestoreEvents.push({
              id: docSnap.id,
              title: data.title || "",
              description: data.description || "",
              date: data.date || "",
              mon: data.mon || "NOV",
              day: String(data.day || "20"),
              dow: data.dow || "FRI",
              week: typeof data.week === "number" ? data.week : 0,
              time: data.time || "TBA",
              location: data.location || "CECS Campus",
              organizer: data.organizer || "Student",
              tags:
                Array.isArray(data.tags) && data.tags.length > 0
                  ? data.tags
                  : ["social"],
              link: data.link || undefined,
              createdBy: data.createdBy,
              createdAt: data.createdAt,
            });
          });

          // Merge live Firestore user events with curated VictorsLink campus events
          const mergedEvents = [
            ...firestoreEvents,
            ...INITIAL_EVENTS.filter(
              (ie) =>
                !firestoreEvents.some(
                  (fe) =>
                    fe.id === ie.id ||
                    fe.title.trim().toLowerCase() === ie.title.trim().toLowerCase()
                )
            ),
          ];

          setEvents(mergedEvents);
          setIsEventsLoading(false);
        },
        (err) => {
          console.warn("Firestore events onSnapshot listener:", err);
          setEvents(INITIAL_EVENTS);
          setIsEventsLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Could not attach events listener:", err);
      setEvents(INITIAL_EVENTS);
      setIsEventsLoading(false);
    }
  }, []);

  // Study Groups state (real Firestore data, zero mock data)
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Record<string, boolean>>({});
  const [courseFilter, setCourseFilter] = useState<string>("All");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // Sync real-time study groups from Firestore (capped at 100 for high-concurrency scale)
  useEffect(() => {
    try {
      const q = query(collection(db, "studyGroups"), limit(100));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const firestoreGroups: StudyGroup[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            firestoreGroups.push({
              id: docSnap.id,
              course: data.course || "",
              topic: data.topic || "",
              description: data.description || "",
              members: Array.isArray(data.members) ? data.members : [],
              meetingPreference: data.meetingPreference || "both",
              coordinationMethod: data.coordinationMethod || "",
              creatorUid: data.creatorUid,
              createdAt: data.createdAt,
            });
          });
          setGroups(firestoreGroups);
          setIsGroupsLoading(false);
        },
        (err) => {
          console.warn("Firestore studyGroups onSnapshot listener:", err);
          setIsGroupsLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Could not attach studyGroups listener:", err);
      setIsGroupsLoading(false);
    }
  }, []);

  // Connections state
  const [requests, setRequests] = useState<ConnectionRequest[]>(INITIAL_REQUESTS);
  const [connections, setConnections] = useState<string[]>(INITIAL_CONNECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [people] = useState<Record<string, PersonProfile>>(INITIAL_PEOPLE);

  // Messaging state
  const [convoOrder, setConvoOrder] = useState<string[]>(INITIAL_CONVERSATION_ORDER);
  const [activeConvoUid, setActiveConvoUid] = useState<string>("jordan");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(INITIAL_UNREAD_COUNTS);
  const [replyIndices, setReplyIndices] = useState<Record<string, number>>({});
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Toast notification state
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastText(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastText(null);
    }, 2400);
  }, []);

  // Events actions
  const toggleSaveEvent = useCallback(
    (eventId: string) => {
      setSavedEventIds((prev) => {
        const nextState = !prev[eventId];
        const updated = { ...prev, [eventId]: nextState };
        try {
          localStorage.setItem("devora_saved_events", JSON.stringify(updated));
        } catch {}

        const targetEvent = events.find((item) => item.id === eventId);
        if (targetEvent) {
          showToast(
            nextState
              ? `Saved "${targetEvent.title}" to your week`
              : `Removed "${targetEvent.title}" from your week`
          );
        }
        return updated;
      });
    },
    [events, showToast]
  );

  const postEvent = useCallback(
    async (input: PostEventInput) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be signed in to post an event.");
      }

      // Load student display name from profile
      let displayName = currentUser.displayName || "Student";
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          displayName =
            profile.displayName ||
            [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
            displayName;
        }
      } catch (profileErr) {
        console.warn("Could not load user profile displayName:", profileErr);
      }

      // Parse date for mon, day, dow, week
      const dateParts = input.date.split("-").map(Number);
      const parsedDate = new Date(
        dateParts[0],
        (dateParts[1] || 1) - 1,
        dateParts[2] || 1,
        12,
        0,
        0
      );

      const mon = parsedDate
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
      const day = String(parsedDate.getDate());
      const dow = parsedDate
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();

      // Calendar week grouping (0: This week, 1: Next week, 2: Finals push)
      const nov23 = new Date("2026-11-23T00:00:00").getTime();
      const nov30 = new Date("2026-11-30T00:00:00").getTime();
      const eventTime = parsedDate.getTime();
      let weekIndex = 0;
      if (eventTime >= nov30) {
        weekIndex = 2;
      } else if (eventTime >= nov23) {
        weekIndex = 1;
      }

      const eventsCol = collection(db, "events");
      const eventDocRef = doc(eventsCol);
      const eventId = eventDocRef.id;

      const eventPayload = {
        id: eventId,
        title: input.title,
        description: input.description,
        date: input.date,
        mon,
        day,
        dow,
        week: weekIndex,
        time: input.time || "TBA",
        location: input.location,
        organizer: displayName,
        tags: input.tags,
        link: input.link || null,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      // Write directly to /events/{eventId} in Firestore
      await setDoc(eventDocRef, eventPayload);

      // Optimistic state update
      const optimisticEvent: ActivityEvent = {
        ...eventPayload,
        link: input.link || undefined,
      };
      setEvents((prev) => [
        optimisticEvent,
        ...prev.filter((e) => e.id !== eventId),
      ]);

      showToast(`Posted event: "${input.title}"`);
    },
    [showToast]
  );

  // Study Groups actions
  const toggleJoinGroup = useCallback(
    (groupId: string) => {
      // TODO(firestore): update members array in /studyGroups/{groupId}
      setJoinedGroupIds((prev) => {
        const willBeJoined = !prev[groupId];
        const targetGroup = groups.find((item) => item.id === groupId);
        if (targetGroup) {
          showToast(
            willBeJoined
              ? `Joined ${targetGroup.course} · ${targetGroup.topic}`
              : `Left ${targetGroup.course} group`
          );
        }
        return { ...prev, [groupId]: willBeJoined };
      });
    },
    [groups, showToast]
  );

  const openCreateGroupModal = useCallback(() => {
    setIsCreateGroupModalOpen(true);
  }, []);

  const closeCreateGroupModal = useCallback(() => {
    setIsCreateGroupModalOpen(false);
  }, []);

  const createGroup = useCallback(
    async (input: CreateGroupInput) => {
      const groupsCol = collection(db, "studyGroups");
      const groupDocRef = doc(groupsCol);
      const newGroupId = groupDocRef.id;
      const currentUser = auth.currentUser;
      const creatorUid = currentUser?.uid || "student";

      const newGroupRecord: StudyGroup = {
        id: newGroupId,
        course: input.course,
        topic: input.topic.trim(),
        description:
          input.description.trim() ||
          "New group. Say hi and share what you're working on.",
        members: currentUser?.uid ? [currentUser.uid] : [],
        meetingPreference: input.meetingPreference,
        coordinationMethod:
          input.coordinationMethod.trim() ||
          "Coordination details coming soon",
        creatorUid,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(groupDocRef, {
          ...newGroupRecord,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Could not save study group to Firestore:", err);
      }

      setGroups((prev) => [newGroupRecord, ...prev]);
      setJoinedGroupIds((prev) => ({ ...prev, [newGroupId]: true }));
      setCourseFilter("All");
      setIsCreateGroupModalOpen(false);
      showToast(`Created your ${input.course} group`);
    },
    [showToast]
  );

  // Connections actions
  const acceptRequest = useCallback(
    (targetUid: string) => {
      // TODO(firestore): update /users/{uid}/connections/{targetUid} status to 'accepted'
      setRequests((prev) => prev.filter((r) => r.uid !== targetUid));
      setConnections((prev) => {
        if (prev.includes(targetUid)) return prev;
        return [targetUid, ...prev];
      });
      const person = people[targetUid];
      showToast(person ? `${person.name} is now a connection` : "Connection accepted");
    },
    [people, showToast]
  );

  const declineRequest = useCallback(
    (targetUid: string) => {
      // TODO(firestore): remove /users/{uid}/connections/{targetUid}
      setRequests((prev) => prev.filter((r) => r.uid !== targetUid));
      showToast("Request declined");
    },
    [showToast]
  );

  // Messaging actions
  const openChatWithUser = useCallback(
    (targetUid: string) => {
      setConvoOrder((prev) => {
        if (prev.includes(targetUid)) return prev;
        return [targetUid, ...prev];
      });
      setActiveConvoUid(targetUid);
      setUnreadCounts((prev) => ({ ...prev, [targetUid]: 0 }));
      router.push("/activity-center/messaging");
    },
    [router]
  );

  const sendMessage = useCallback(
    (textToSend: string) => {
      const cleanText = textToSend.trim();
      if (!cleanText) return;

      const activePeer = activeConvoUid;
      const outboundMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: "me",
        text: cleanText,
        timestamp: formatTimestamp(),
      };

      // TODO(firestore): addDoc to /conversations/{conversationId}/messages
      setMessages((prev) => ({
        ...prev,
        [activePeer]: [...(prev[activePeer] || []), outboundMessage],
      }));

      setConvoOrder((prev) => [
        activePeer,
        ...prev.filter((uid) => uid !== activePeer),
      ]);

      // Simulated peer response with typing indicator
      setTimeout(() => {
        setIsPartnerTyping(true);
      }, 450);

      setTimeout(() => {
        setIsPartnerTyping(false);
        const replyPool = SAMPLE_REPLIES[activePeer] || ["Sounds good!"];
        const currentIndex = replyIndices[activePeer] || 0;
        const replyText = replyPool[currentIndex % replyPool.length];

        setReplyIndices((prev) => ({
          ...prev,
          [activePeer]: currentIndex + 1,
        }));

        const inboundMessage: ChatMessage = {
          id: `reply_${Date.now()}`,
          senderId: activePeer,
          text: replyText,
          timestamp: formatTimestamp(),
        };

        setMessages((prev) => ({
          ...prev,
          [activePeer]: [...(prev[activePeer] || []), inboundMessage],
        }));
      }, 1700);
    },
    [activeConvoUid, replyIndices]
  );

  // Summary counts
  const requestsCount = requests.length;
  const unreadTotalCount = useMemo(
    () => Object.values(unreadCounts).reduce((total, count) => total + (count || 0), 0),
    [unreadCounts]
  );
  const joinedGroupsCount = useMemo(
    () => Object.values(joinedGroupIds).filter(Boolean).length,
    [joinedGroupIds]
  );
  // Re-check the date every few minutes so a tab left open drops yesterday's events after midnight.
  // Manipulate here: CLOCK_CHECK_INTERVAL_MS controls how often "today" is refreshed
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const CLOCK_CHECK_INTERVAL_MS = 5 * 60 * 1000;
    const clockTimer = window.setInterval(() => setCurrentTime(new Date()), CLOCK_CHECK_INTERVAL_MS);
    return () => window.clearInterval(clockTimer);
  }, []);
  // Past events (any day before today) never reach the feed, ticker, or week tiles.
  const upcomingEvents = useMemo(
    () => sortEventsSoonestFirst(keepUpcomingEvents(events, currentTime), currentTime),
    [events, currentTime]
  );

  const savedEventsCount = useMemo(
    () => Object.values(savedEventIds).filter(Boolean).length,
    [savedEventIds]
  );

  const contextValue: ActivityCenterContextValue = {
    events: upcomingEvents,
    isEventsLoading,
    savedEventIds,
    eventFilter,
    setEventFilter,
    toggleSaveEvent,
    isPostEventModalOpen,
    openPostEventModal,
    closePostEventModal,
    postEvent,

    groups,
    isGroupsLoading,
    joinedGroupIds,
    courseFilter,
    setCourseFilter,
    toggleJoinGroup,
    isCreateGroupModalOpen,
    openCreateGroupModal,
    closeCreateGroupModal,
    createGroup,

    requests,
    connections,
    searchQuery,
    setSearchQuery,
    people,
    acceptRequest,
    declineRequest,

    convoOrder,
    activeConvoUid,
    setActiveConvoUid,
    messages,
    unreadCounts,
    sendMessage,
    openChatWithUser,
    isPartnerTyping,

    toastText,
    showToast,

    requestsCount,
    unreadTotalCount,
    joinedGroupsCount,
    savedEventsCount,
  };

  return (
    <ActivityCenterContext.Provider value={contextValue}>
      {children}
    </ActivityCenterContext.Provider>
  );
}

// ===== HOOK =====

export function useActivityCenter(): ActivityCenterContextValue {
  const context = useContext(ActivityCenterContext);
  if (!context) {
    throw new Error(
      "useActivityCenter must be used within an ActivityCenterProvider"
    );
  }
  return context;
}
