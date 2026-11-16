// Activity Center state provider and hooks.
// Manages reactive state across the layout (Hero, Bento Tiles, TabNav, Toast) and tab sub-pages.
// Keeps live counts in sync when events are saved, groups joined, requests resolved, and messages sent.

"use client";

// ===== IMPORTS =====

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type {
  ActivityEvent,
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
  INITIAL_STUDY_GROUPS,
  INITIAL_UNREAD_COUNTS,
  SAMPLE_REPLIES,
} from "./placeholder-data";

// ===== TYPES =====

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
  savedEventIds: Record<string, boolean>;
  eventFilter: string;
  setEventFilter: (filter: string) => void;
  toggleSaveEvent: (eventId: string) => void;

  // Study Groups
  groups: StudyGroup[];
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

  // Events state
  const [events] = useState<ActivityEvent[]>(INITIAL_EVENTS);
  const [savedEventIds, setSavedEventIds] = useState<Record<string, boolean>>({});
  const [eventFilter, setEventFilter] = useState<string>("all");

  // Study Groups state
  const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_STUDY_GROUPS);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Record<string, boolean>>({ g3: true });
  const [courseFilter, setCourseFilter] = useState<string>("All");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

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
      // TODO(firestore): write to /users/{uid}/savedEvents/{eventId}
      setSavedEventIds((prev) => {
        const nextState = !prev[eventId];
        const targetEvent = events.find((item) => item.id === eventId);
        if (targetEvent) {
          showToast(
            nextState
              ? `Saved ${targetEvent.title} to your week`
              : "Removed from your week"
          );
        }
        return { ...prev, [eventId]: nextState };
      });
    },
    [events, showToast]
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
    (input: CreateGroupInput) => {
      // TODO(firestore): addDoc to /studyGroups
      const newGroupId = `new${Date.now()}`;
      const newGroupRecord: StudyGroup = {
        id: newGroupId,
        course: input.course,
        topic: input.topic.trim(),
        description:
          input.description.trim() ||
          "New group. Say hi and share what you're working on.",
        members: [],
        meetingPreference: input.meetingPreference,
        coordinationMethod:
          input.coordinationMethod.trim() ||
          "Coordination details coming soon",
      };

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
  const savedEventsCount = useMemo(
    () => Object.values(savedEventIds).filter(Boolean).length,
    [savedEventIds]
  );

  const contextValue: ActivityCenterContextValue = {
    events,
    savedEventIds,
    eventFilter,
    setEventFilter,
    toggleSaveEvent,

    groups,
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
