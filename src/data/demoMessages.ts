import type { Conversation, Message, Participant, PatientContext } from "@/types/messages";

/**
 * DEMO MESSAGES DATA
 * 
 * Synthetic conversations for MVP demonstration.
 * Each conversation represents a realistic clinical messaging scenario:
 * 
 * 1. Maria Rodriguez (Patient) - Critical, urgent BP concern
 * 2. Robert Wilson (Caregiver) - Family member asking about father's medication
 * 3. Sarah Johnson (Patient) - Routine medication adherence check-in
 * 4. Michael Chen (Patient) - Question about new monitoring schedule
 * 5. Linda Martinez (Patient) - Post-medication change follow-up
 * 6. David Kim (Caregiver) - Wife asking about husband's diet
 */

// Clinician participant (Dr. Sarah Chen)
const clinician: Participant = {
  id: "clinician-001",
  name: "Dr. Sarah Chen",
  role: "clinician",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
};

export const demoConversations: Conversation[] = [
  {
    id: "conv-001",
    patient: {
      id: "P-2025-001",
      name: "Maria Rodriguez",
      priority: "Critical",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    participant: {
      id: "patient-001",
      name: "Maria Rodriguez",
      role: "patient",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    unreadCount: 3,
    lastMessageAt: "2m",
    lastMessagePreview: "My blood pressure reading this morning was 185/110...",
    messages: [
      {
        id: "msg-001-1",
        senderId: "patient-001",
        senderRole: "patient",
        content: "Good morning Dr. Chen. My blood pressure reading this morning was 185/110. I'm feeling a bit dizzy and have a mild headache. Should I be concerned?",
        timestamp: "Today 8:45 AM",
        isRead: false,
      },
      {
        id: "msg-001-2",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "Thank you for reaching out, Maria. That reading is concerning and higher than your target range. Please take another reading in 30 minutes and let me know the result. In the meantime, please sit down and rest.",
        timestamp: "Today 8:52 AM",
        isRead: true,
      },
      {
        id: "msg-001-3",
        senderId: "patient-001",
        senderRole: "patient",
        content: "Second reading: 180/108. Still feeling dizzy.",
        timestamp: "Today 9:22 AM",
        isRead: false,
      },
      {
        id: "msg-001-4",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "I'm adjusting your medication dosage. Please take an additional 5mg of your ACE inhibitor now. I'm scheduling a telehealth consultation for this afternoon at 2 PM. Please continue monitoring and rest.",
        timestamp: "Today 9:30 AM",
        isRead: true,
      },
      {
        id: "msg-001-5",
        senderId: "patient-001",
        senderRole: "patient",
        content: "Thank you Dr. Chen. I took the medication. Will the nurse call me for the appointment?",
        timestamp: "Today 9:35 AM",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-002",
    patient: {
      id: "P-2025-003",
      name: "James Wilson",
      priority: "Moderate",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
    participant: {
      id: "caregiver-001",
      name: "Robert Wilson",
      role: "caregiver",
      relationship: "Family Member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    },
    unreadCount: 0,
    lastMessageAt: "1h",
    lastMessagePreview: "Thank you for the medication adjustment for my father James...",
    messages: [
      {
        id: "msg-002-1",
        senderId: "caregiver-001",
        senderRole: "caregiver",
        content: "Hi Dr. Chen, I'm James Wilson's son. I wanted to ask about the medication adjustment you made for my father last week. He's been having some dizziness in the mornings.",
        timestamp: "Today 7:30 AM",
        isRead: true,
      },
      {
        id: "msg-002-2",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "Hello Robert, thank you for reaching out. Morning dizziness can be a sign that the blood pressure medication is working too well overnight. Has your father been taking his readings first thing in the morning?",
        timestamp: "Today 7:45 AM",
        isRead: true,
      },
      {
        id: "msg-002-3",
        senderId: "caregiver-001",
        senderRole: "caregiver",
        content: "Yes, his morning readings have been around 110/70, which seems lower than usual. Should we be concerned?",
        timestamp: "Today 8:00 AM",
        isRead: true,
      },
      {
        id: "msg-002-4",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "That's helpful information. I'm going to reduce his evening dose slightly. Please have him take his medication 30 minutes earlier in the evening and continue monitoring. If dizziness persists, we can schedule a follow-up.",
        timestamp: "Today 8:15 AM",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-003",
    patient: {
      id: "P-2025-006",
      name: "Sarah Johnson",
      priority: "Stable",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJ",
    },
    participant: {
      id: "patient-003",
      name: "Sarah Johnson",
      role: "patient",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJ",
    },
    unreadCount: 0,
    lastMessageAt: "3h",
    lastMessagePreview: "I've been taking my medication as prescribed and...",
    messages: [
      {
        id: "msg-003-1",
        senderId: "patient-003",
        senderRole: "patient",
        content: "Hi Dr. Chen, I've been taking my medication as prescribed and my readings have been stable around 128/82. Just wanted to check in!",
        timestamp: "Today 6:00 AM",
        isRead: true,
      },
      {
        id: "msg-003-2",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "Great to hear, Sarah! Your readings look excellent. Keep up the good work with your medication adherence. We'll continue with the current regimen. Any questions about your upcoming quarterly review?",
        timestamp: "Today 6:30 AM",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-004",
    patient: {
      id: "P-2025-008",
      name: "Michael Chen",
      priority: "Stable",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    participant: {
      id: "patient-004",
      name: "Michael Chen",
      role: "patient",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    unreadCount: 1,
    lastMessageAt: "5h",
    lastMessagePreview: "Question about the new monitoring schedule...",
    messages: [
      {
        id: "msg-004-1",
        senderId: "patient-004",
        senderRole: "patient",
        content: "Dr. Chen, I received the notification about my new monitoring schedule. Should I still take readings twice daily, or has that changed?",
        timestamp: "Yesterday 4:00 PM",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-005",
    patient: {
      id: "P-2025-004",
      name: "Linda Martinez",
      priority: "Moderate",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
    },
    participant: {
      id: "patient-005",
      name: "Linda Martinez",
      role: "patient",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
    },
    unreadCount: 0,
    lastMessageAt: "1d",
    lastMessagePreview: "The new medication seems to be working better...",
    messages: [
      {
        id: "msg-005-1",
        senderId: "patient-005",
        senderRole: "patient",
        content: "Hi Dr. Chen, the new medication (Losartan) seems to be working better. My readings have improved to around 145/90. No side effects so far.",
        timestamp: "Yesterday 10:00 AM",
        isRead: true,
      },
      {
        id: "msg-005-2",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "That's encouraging progress, Linda. Let's continue with the current dose for another week and see if we can get closer to your target of 130/80. Please continue logging your readings daily.",
        timestamp: "Yesterday 10:30 AM",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-006",
    patient: {
      id: "P-2025-005",
      name: "David Kim",
      priority: "Moderate",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    participant: {
      id: "caregiver-002",
      name: "Susan Kim",
      role: "caregiver",
      relationship: "Spouse",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Susan",
    },
    unreadCount: 0,
    lastMessageAt: "2d",
    lastMessagePreview: "Thank you for the dietary recommendations...",
    messages: [
      {
        id: "msg-006-1",
        senderId: "caregiver-002",
        senderRole: "caregiver",
        content: "Dr. Chen, I'm David's wife Susan. I'm helping him manage his diet as recommended. Could you clarify the sodium limit again? Is it 2000mg or 2300mg per day?",
        timestamp: "2 days ago",
        isRead: true,
      },
      {
        id: "msg-006-2",
        senderId: "clinician-001",
        senderRole: "clinician",
        content: "Hi Susan, thank you for being so supportive of David's health. The target is 2300mg per day as a maximum. If you can keep it closer to 2000mg, that's even better. I'll send you some helpful resources on low-sodium cooking.",
        timestamp: "2 days ago",
        isRead: true,
      },
      {
        id: "msg-006-3",
        senderId: "caregiver-002",
        senderRole: "caregiver",
        content: "Thank you for the dietary recommendations. We've been using the resources and David's readings have been improving!",
        timestamp: "2 days ago",
        isRead: true,
      },
    ],
  },
];

/**
 * Get total unread count across all conversations
 */
export const getTotalUnreadCount = (): number => {
  return demoConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
};

/**
 * Search conversations by patient name or ID
 */
export const searchConversations = (query: string): Conversation[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return demoConversations;
  
  return demoConversations.filter(conv => 
    conv.patient.name.toLowerCase().includes(lowerQuery) ||
    conv.patient.id.toLowerCase().includes(lowerQuery) ||
    conv.participant.name.toLowerCase().includes(lowerQuery)
  );
};
