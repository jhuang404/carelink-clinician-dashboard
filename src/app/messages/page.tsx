"use client";

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Phone,
  Video,
  FileText,
  Send,
  Paperclip,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { demoConversations, searchConversations } from "@/data/demoMessages";
import type { Conversation, Message, ParticipantRole } from "@/types/messages";

/**
 * MESSAGES PAGE
 * 
 * Clinical messaging center for patient/caregiver communication.
 * 
 * INTERACTION MODEL:
 * - Left panel: Conversation list with search, unread badges
 * - Right panel: Selected conversation thread + composer
 * - Selecting a conversation marks it as read
 * - Sending a message appends to thread
 * 
 * TODO (Backend Integration):
 * - Fetch conversations from API: GET /api/messages/conversations
 * - Fetch messages for conversation: GET /api/messages/:conversationId
 * - Send message: POST /api/messages/:conversationId
 * - Mark as read: PATCH /api/messages/:conversationId/read
 * - Audit logging for HIPAA compliance
 */

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  // Filter conversations based on search
  const filteredConversations = searchQuery 
    ? searchConversations(searchQuery)
    : conversations;

  // Handle URL param for preselecting conversation
  useEffect(() => {
    const patientId = searchParams.get("patientId");
    if (patientId) {
      const conv = conversations.find(c => c.patient.id === patientId);
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  /**
   * SELECT CONVERSATION
   * Marks conversation as read and updates state
   */
  const handleSelectConversation = (conv: Conversation) => {
    // Mark as read by setting unreadCount to 0
    setConversations(prev => prev.map(c => 
      c.id === conv.id 
        ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
        : c
    ));
    
    // Set selected with read status
    setSelectedConversation({
      ...conv,
      unreadCount: 0,
      messages: conv.messages.map(m => ({ ...m, isRead: true }))
    });
  };

  /**
   * SEND MESSAGE
   * Appends new message to thread and updates conversation preview
   */
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

    // Update selected conversation
    const updatedConversation: Conversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessageAt: "Just now",
      lastMessagePreview: messageInput.trim().slice(0, 50) + (messageInput.length > 50 ? "..." : ""),
    };

    setSelectedConversation(updatedConversation);

    // Update conversations list
    setConversations(prev => prev.map(c => 
      c.id === selectedConversation.id ? updatedConversation : c
    ));

    setMessageInput("");

    // TODO: POST to /api/messages/:conversationId
    // TODO: Audit log for compliance
  };

  /**
   * VIEW CHART - Navigate to patient details
   */
  const handleViewChart = () => {
    if (selectedConversation) {
      router.push(`/patients/${selectedConversation.patient.id}`);
    }
  };

  const getRoleBadgeStyle = (role: ParticipantRole) => {
    switch (role) {
      case "patient":
        return "bg-magenta-100 text-magenta-700";
      case "caregiver":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "Moderate":
        return "bg-orange-100 text-orange-700";
      case "Stable":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 -m-4 md:-m-6 2xl:-m-10">
      {/* Left Panel: Conversation List */}
      <div className="w-96 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button className="flex items-center gap-2 rounded-lg bg-magenta-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-magenta-700">
              <Plus size={16} />
              New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-magenta-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No conversations found
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
                      src={conv.participant.avatar}
                      alt={conv.participant.name}
                      className="h-12 w-12 rounded-full bg-gray-100"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 truncate">{conv.participant.name}</p>
                      <span className="text-xs text-gray-400 shrink-0">{conv.lastMessageAt}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        getRoleBadgeStyle(conv.participant.role)
                      )}>
                        {conv.participant.role}
                        {conv.participant.relationship && ` · ${conv.participant.relationship}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessagePreview}</p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-block mt-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {conv.unreadCount} new
                      </span>
                    )}
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
                    className="h-12 w-12 rounded-full bg-gray-100"
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
                      Patient ID: {selectedConversation.patient.id}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    title="Call patient (stub)"
                  >
                    <Phone size={16} />
                    Call
                  </button>
                  <button 
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    title="Video call (stub)"
                  >
                    <Video size={16} />
                    Video
                  </button>
                  <button 
                    onClick={handleViewChart}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FileText size={16} />
                    View Chart
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.map((message) => {
                const isClinicianMessage = message.senderRole === "clinician";
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isClinicianMessage && "flex-row-reverse"
                    )}
                  >
                    {!isClinicianMessage && (
                      <img
                        src={selectedConversation.participant.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full bg-gray-100 shrink-0"
                      />
                    )}
                    <div className={cn(
                      "max-w-[70%]",
                      isClinicianMessage && "text-right"
                    )}>
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
                      <p className={cn(
                        "text-xs text-gray-400 mt-1",
                        isClinicianMessage && "text-right"
                      )}>
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
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <div className="bg-white border-t p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="relative">
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
                      title="Attach file (stub)"
                    >
                      <Paperclip size={18} />
                    </button>
                  </div>
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
              
              {/* Footer info */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Press Enter to send
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Shield size={12} />
                  Secure messaging (demo)
                </span>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={24} />
              </div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a patient or caregiver to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
