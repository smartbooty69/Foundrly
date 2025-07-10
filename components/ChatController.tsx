import React, { useState, useEffect } from "react";
import ChatModal from "@/components/ChatModal";
import MessagesScreen from "@/components/MessagesScreen";
import ChatView from "@/components/chat/ChatView";

interface ChatControllerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  initialChatId?: string | null;
}

export default function ChatController({ isOpen, onClose, currentUserId, initialChatId }: ChatControllerProps) {
  const [currentView, setCurrentView] = useState<'list' | 'chat'>(initialChatId ? 'chat' : 'list');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);

  useEffect(() => {
    if (isOpen && initialChatId) {
      setCurrentView('chat');
      setSelectedChatId(initialChatId);
    }
    if (isOpen && !initialChatId) {
      setCurrentView('list');
      setSelectedChatId(null);
    }
  }, [isOpen, initialChatId]);

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    setCurrentView('chat');
  };

  const handleGoBack = () => {
    setCurrentView('list');
    setSelectedChatId(null);
  };

  return (
    <ChatModal isOpen={isOpen} onClose={onClose}>
      {currentView === 'list' ? (
        <MessagesScreen onSelectChat={handleSelectChat} onClose={onClose} />
      ) : (
        <ChatView chatId={selectedChatId} onGoBack={handleGoBack} currentUserId={currentUserId} />
      )}
    </ChatModal>
  );
} 