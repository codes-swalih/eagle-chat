import { create } from 'zustand';

export type ChatMode = 'text' | 'video' | 'spy' | 'interests';
export type ChatStatus = 'idle' | 'searching' | 'connected';
export type Message = {
  id: string;
  text: string;
  sender: 'you' | 'stranger';
  timestamp: Date;
  delivered: boolean;
  seen: boolean;
};

interface SpyData {
  roomId: string;
  role: string;
  questioner?: string;
  strangers?: string[];
  partner?: string;
}

interface ChatState {
  mode: ChatMode;
  status: ChatStatus;
  messages: Message[];
  interests: string[];
  matchedInterests: string[];
  language: string;
  isTyping: boolean;
  strangerIsTyping: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  partnerId?: string;
  spyData?: SpyData;
  
  // Actions
  setMode: (mode: ChatMode) => void;
  setStatus: (status: ChatStatus) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  clearMessages: () => void;
  setInterests: (interests: string[]) => void;
  setMatchedInterests: (interests: string[]) => void;
  setLanguage: (language: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  setStrangerIsTyping: (isTyping: boolean) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  markMessagesAsDelivered: () => void;
  markMessagesAsSeen: () => void;
  setPartnerId: (partnerId?: string) => void;
  setSpyData: (data: SpyData) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  mode: 'text',
  status: 'idle',
  messages: [],
  interests: [],
  matchedInterests: [],
  language: 'en',
  isTyping: false,
  strangerIsTyping: false,
  videoEnabled: true,
  audioEnabled: true,
  
  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: Date.now().toString() }],
  })),
  clearMessages: () => set({ messages: [] }),
  setInterests: (interests) => set({ interests }),
  setMatchedInterests: (interests) => set({ matchedInterests: interests }),
  setLanguage: (language) => set({ language }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setStrangerIsTyping: (isTyping) => set({ strangerIsTyping: isTyping }),
  toggleVideo: () => set((state) => ({ videoEnabled: !state.videoEnabled })),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  markMessagesAsDelivered: () => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.sender === 'you' && !msg.delivered ? { ...msg, delivered: true } : msg
    ),
  })),
  markMessagesAsSeen: () => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.sender === 'you' ? { ...msg, seen: true } : msg
    ),
  })),
  setPartnerId: (partnerId) => set({ partnerId }),
  setSpyData: (data) => set({ spyData: data }),
}));