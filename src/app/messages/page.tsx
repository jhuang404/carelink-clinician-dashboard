"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  FileText,
  Send,
  Paperclip,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, Message, ParticipantRole } from "@/types/messages";
import type { PatientProfile } from "@/types/api";

const demoScenarios: {
  messages: { role: "patient" | "clinician"; content: string; time: string }[];
  unread: number;
  lastAt: string;
}[] = [
  {
    unread: 2, lastAt: "10m",
    messages: [
      { role: "patient", content: "Good morning Dr. Chen. My blood pressure reading this morning was quite high — 178/108. I'm feeling a bit dizzy.", time: "Today 8:30 AM" },
      { role: "clinician", content: "Thank you for letting me know. Please sit down, rest, and take another reading in 30 minutes. Avoid caffeine and stress.", time: "Today 8:38 AM" },
      { role: "patient", content: "Second reading is 170/102. Still a bit dizzy but better than before.", time: "Today 9:10 AM" },
      { role: "clinician", content: "That's still elevated. I'm adjusting your medication — please take an extra 5mg of your ACE inhibitor now. I'll schedule a follow-up call this afternoon.", time: "Today 9:15 AM" },
      { role: "patient", content: "Understood, I just took it. Will the nurse call me for the appointment?", time: "Today 9:20 AM" },
    ],
  },
  {
    unread: 0, lastAt: "2h",
    messages: [
      { role: "patient", content: "Hi Dr. Chen, my readings have been stable around 132/84 this week. Feeling good overall.", time: "Today 7:00 AM" },
      { role: "clinician", content: "That's great progress! Keep up the current routine. We'll review at your next scheduled check-in.", time: "Today 7:15 AM" },
    ],
  },
  {
    unread: 1, lastAt: "3h",
    messages: [
      { role: "patient", content: "Doctor, I forgot to take my evening medication yesterday. Should I take a double dose today?", time: "Today 6:45 AM" },
      { role: "clinician", content: "No, please don't double up. Just take your regular dose at the normal time today. One missed dose is okay — consistency going forward is what matters.", time: "Today 6:55 AM" },
      { role: "patient", content: "Got it, thank you. I'll set a reminder so I don't forget again.", time: "Today 7:00 AM" },
    ],
  },
  {
    unread: 0, lastAt: "5h",
    messages: [
      { role: "patient", content: "I've been monitoring as requested. Readings this week: 140/88, 138/86, 142/90, 136/84, 139/87.", time: "Yesterday 4:00 PM" },
      { role: "clinician", content: "Thank you for the detailed report. Your numbers are trending in the right direction. Let's continue the current plan for another two weeks.", time: "Yesterday 4:30 PM" },
    ],
  },
  {
    unread: 0, lastAt: "1d",
    messages: [
      { role: "patient", content: "The new medication seems to be working better. My readings improved to around 134/82. No side effects so far.", time: "Yesterday 10:00 AM" },
      { role: "clinician", content: "That's encouraging. Let's continue with the current dose for another week and reassess. Please keep logging daily.", time: "Yesterday 10:30 AM" },
    ],
  },
];

function buildConversationFromPatient(p: PatientProfile, index: number): Conversation {
  const name = `${p.firstName} ${p.lastName}`;
  const riskMap: Record<string, "Critical" | "Moderate" | "Stable" | "Follow-up"> = {
    critical: "Critical", high: "Moderate", moderate: "Moderate", low: "Follow-up", stable: "Stable",
  };

  const scenario = demoScenarios[index % demoScenarios.length];
  const messages: Message[] = scenario.messages.map((m, i) => ({
    id: `msg-${p.id}-${i}`,
    senderId: m.role === "clinician" ? "clinician-001" : `patient-${p.id}`,
    senderRole: m.role === "clinician" ? "clinician" as const : "patient" as const,
    content: m.content,
    timestamp: m.time,
    isRead: m.role === "clinician" || i < scenario.messages.length - scenario.unread,
  }));

  const lastMsg = scenario.messages[scenario.messages.length - 1];

  return {
    id: `conv-${p.id}`,
    patient: {
      id: p.id,
      name,
      priority: riskMap[p.riskLevel] ?? "Moderate",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
    },
    participant: {
      id: `patient-${p.id}`,
      name,
      role: "patient",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
    },
    unreadCount: scenario.unread,
    lastMessageAt: scenario.lastAt,
    lastMessagePreview: lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? "..." : ""),
    messages,
  };
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [didAutoSelect, setDidAutoSelect] = useState(false);

  // Build conversations from real patient list
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const patients: PatientProfile[] = data.patients || [];
        const convs = patients.map((p, i) => buildConversationFromPatient(p, i));
        setConversations(convs);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Auto-select from URL param
  useEffect(() => {
    if (didAutoSelect || loading) return;
    const patientId = searchParams.get("patientId");
    if (!patientId) return;

    const conv = conversations.find(c => c.patient.id === patientId);
    if (conv) {
      handleSelectConversation(conv);
      setDidAutoSelect(true);
    }
  }, [searchParams, conversations, loading, didAutoSelect]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patient.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleSelectConversation = (conv: Conversation) => {
    setConversations(prev => prev.map(c =>
      c.id === conv.id
        ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
        : c
    ));
    setSelectedConversation({
      ...conv,
      unreadCount: 0,
      messages: conv.messages.map(m => ({ ...m, isRead: true })),
    });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "clinician-001",
      senderRole: "clinician",
      content: messageInput.trim(),
      timestamp: "Just now",
      isRead: true,
    };

    const updated: Conversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessageAt: "Just now",
      lastMessagePreview: messageInput.trim().slice(0, 50) + (messageInput.length > 50 ? "..." : ""),
    };

    setSelectedConversation(updated);
    setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
    setMessageInput("");
  };

  const handleViewChart = () => {
    if (selectedConversation) {
      router.push(`/patients/${selectedConversation.patient.id}`);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-700";
      case "Moderate": return "bg-orange-100 text-orange-700";
      case "Stable": return "bg-green-100 text-green-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 -m-4 md:-m-6 2xl:-m-10">
      {/* Left Panel: Conversation List */}
      <div className="w-96 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-magenta-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-magenta-200 border-t-magenta-600" />
              <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No patients found
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedConversation?.id === conv.id && "bg-magenta-50 border-l-4 border-l-magenta-500"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <img
                      src={conv.patient.avatar}
                      alt={conv.patient.name}
                      className="h-11 w-11 rounded-full bg-gray-100"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 truncate">{conv.patient.name}</p>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-gray-400 shrink-0">{conv.lastMessageAt}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{conv.patient.id}</p>
                    <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessagePreview}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Chat Thread */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Patient Header */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedConversation.patient.avatar}
                    alt={selectedConversation.patient.name}
                    className="h-11 w-11 rounded-full bg-gray-100"
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedConversation.patient.name}
                      </h3>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        getPriorityStyle(selectedConversation.patient.priority)
                      )}>
                        {selectedConversation.patient.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.patient.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleViewChart}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FileText size={16} />
                  View Chart
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                selectedConversation.messages.map((message) => {
                  const isClinicianMessage = message.senderRole === "clinician";
                  return (
                    <div
                      key={message.id}
                      className={cn("flex gap-3", isClinicianMessage && "flex-row-reverse")}
                    >
                      {!isClinicianMessage && (
                        <img
                          src={selectedConversation.participant.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full bg-gray-100 shrink-0"
                        />
                      )}
                      <div className={cn("max-w-[70%]", isClinicianMessage && "text-right")}>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 text-sm",
                            isClinicianMessage
                              ? "bg-magenta-600 text-white rounded-br-md"
                              : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                          )}
                        >
                          {message.content}
                        </div>
                        <p className={cn("text-xs text-gray-400 mt-1", isClinicianMessage && "text-right")}>
                          {message.timestamp}
                        </p>
                      </div>
                      {isClinicianMessage && (
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                          alt=""
                          className="h-8 w-8 rounded-full bg-gray-100 shrink-0"
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <div className="bg-white border-t p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full rounded-lg border border-gray-200 py-3 pl-4 pr-12 text-sm focus:border-magenta-500 focus:outline-none resize-none"
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors",
                    messageInput.trim()
                      ? "bg-magenta-600 hover:bg-magenta-700"
                      : "bg-gray-300 cursor-not-allowed"
                  )}
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Press Enter to send
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={12} />
                  Secure messaging (demo)
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={24} />
              </div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-magenta-600" />
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
