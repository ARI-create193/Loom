import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
  fileName?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string, type?: 'text' | 'file', fileName?: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message if no messages exist
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        senderId: 'system',
        senderName: 'System',
        senderAvatar: 'SY',
        content: 'Welcome to team chat! Add team members to start collaborating.',
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    // Trigger custom event to notify other tabs
    window.dispatchEvent(new CustomEvent('chatMessagesUpdated', { 
      detail: messages 
    }));
  }, [messages]);

  // Listen for chat updates from other tabs
  useEffect(() => {
    const handleChatUpdate = (event: CustomEvent) => {
      setMessages(event.detail);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chatMessages' && event.newValue) {
        setMessages(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('chatMessagesUpdated', handleChatUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('chatMessagesUpdated', handleChatUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const sendMessage = (content: string, type: 'text' | 'file' = 'text', fileName?: string) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id || 'anonymous',
      senderName: currentUser.name || 'Anonymous',
      senderAvatar: currentUser.avatar || 'A',
      content,
      timestamp: new Date().toISOString(),
      type,
      fileName
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: ChatContextType = {
    messages,
    sendMessage,
    clearMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
