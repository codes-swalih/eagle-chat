import { io, Socket } from 'socket.io-client';
import { useChatStore, Message, ChatStatus } from './store';

class SocketService {
  private socket: Socket | null = null;
  private initialized = false;

  initialize() {
    if (this.initialized) return;
    
    // Connect to the deployed Socket.IO server on Render.com
    const serverUrl = process.env.NODE_ENV === 'production'
      ? 'https://eagle-chat.onrender.com' // Deployed server URL
      : 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });
    
    this.setupEventListeners();
    this.initialized = true;
    console.log('Socket service initialized with server:', serverUrl);
  }

  private setupEventListeners() {
    if (!this.socket) return;
    
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      useChatStore.getState().setStatus('idle');
    });
    
    // Chat matching events
    this.socket.on('matched', (data: { partnerId: string }) => {
      console.log('Matched with partner:', data.partnerId);
      useChatStore.getState().setStatus('connected');
      useChatStore.getState().setPartnerId(data.partnerId);
      
      // Add a welcome message
      useChatStore.getState().addMessage({
        text: "You're now chatting with a random stranger. Say hi!",
        sender: 'stranger',
        timestamp: new Date(),
        delivered: true,
        seen: true,
      });
    });
    
    this.socket.on('interestsMatched', (data: { partnerId: string, commonInterests: string[] }) => {
      console.log('Matched with partner based on interests:', data);
      useChatStore.getState().setStatus('connected');
      useChatStore.getState().setPartnerId(data.partnerId);
      useChatStore.getState().setMatchedInterests(data.commonInterests);
      
      // Add a welcome message
      const interestsText = data.commonInterests.length > 0
        ? `You've been matched with a stranger who shares your interest${data.commonInterests.length > 1 ? 's' : ''} in: ${data.commonInterests.join(', ')}`
        : "You've been matched with a stranger.";
      
      useChatStore.getState().addMessage({
        text: interestsText,
        sender: 'stranger',
        timestamp: new Date(),
        delivered: true,
        seen: true,
      });
    });
    
    this.socket.on('spyMatched', (data: { roomId: string, role: string, questioner?: string, strangers?: string[], partner?: string }) => {
      console.log('Matched for spy mode:', data);
      useChatStore.getState().setStatus('connected');
      useChatStore.getState().setSpyData(data);
    });
    
    // Chat events
    this.socket.on('message', (data: { from: string, text: string, timestamp: Date }) => {
      useChatStore.getState().addMessage({
        text: data.text,
        sender: 'stranger',
        timestamp: new Date(data.timestamp),
        delivered: true,
        seen: true,
      });
    });
    
    this.socket.on('typing', (data: { from: string, isTyping: boolean }) => {
      useChatStore.getState().setStrangerIsTyping(data.isTyping);
    });
    
    // Disconnection events
    this.socket.on('partnerDisconnected', () => {
      useChatStore.getState().addMessage({
        text: "Your chat partner has disconnected.",
        sender: 'stranger',
        timestamp: new Date(),
        delivered: true,
        seen: true,
      });
      
      setTimeout(() => {
        useChatStore.getState().setStatus('idle');
        useChatStore.getState().setPartnerId(undefined);
      }, 3000);
    });
    
    this.socket.on('chatEnded', () => {
      useChatStore.getState().addMessage({
        text: "Your chat partner has ended the chat.",
        sender: 'stranger',
        timestamp: new Date(),
        delivered: true,
        seen: true,
      });
      
      setTimeout(() => {
        useChatStore.getState().setStatus('idle');
        useChatStore.getState().setPartnerId(undefined);
      }, 3000);
    });
    
    // WebRTC signaling
    this.socket.on('signal', (data: { from: string, signal: any }) => {
      if (useChatStore.getState().mode === 'video') {
        // Forward the signal to the WebRTC service
        const event = new CustomEvent('webrtc-signal', { detail: data });
        window.dispatchEvent(event);
      }
    });
  }

  connect(options: { 
    mode: 'text' | 'video' | 'spy' | 'interests', 
    language?: string, 
    interests?: string[],
    question?: string,
    role?: 'questioner' | 'watcher'
  }) {
    if (!this.socket) {
      this.initialize();
    }
    
    if (!this.socket) return;
    
    // Update the chat status
    useChatStore.getState().setStatus('searching');
    useChatStore.getState().setMode(options.mode);
    
    if (options.language) {
      useChatStore.getState().setLanguage(options.language);
    }
    
    if (options.interests) {
      useChatStore.getState().setInterests(options.interests);
    }
    
    // Send search request to server
    this.socket.emit('search', options);
  }

  disconnect() {
    if (!this.socket) return;
    
    // Send end chat event
    this.socket.emit('endChat');
    
    // Update the chat status and clear messages
    useChatStore.getState().setStatus('idle');
    useChatStore.getState().clearMessages();
    useChatStore.getState().setPartnerId(undefined);
  }

  sendMessage(text: string) {
    if (!this.socket || !text.trim()) return;
    
    const partnerId = useChatStore.getState().partnerId;
    if (!partnerId) return;
    
    // Add the message to the store
    const message = {
      text,
      sender: 'you' as const,
      timestamp: new Date(),
      delivered: false,
      seen: false,
    };
    
    useChatStore.getState().addMessage(message);
    
    // Send the message to the server
    this.socket.emit('message', {
      to: partnerId,
      text
    });
    
    // Simulate message delivery after 500ms
    setTimeout(() => {
      useChatStore.getState().markMessagesAsDelivered();
    }, 500);
    
    // Simulate message seen after 1.5s
    setTimeout(() => {
      useChatStore.getState().markMessagesAsSeen();
    }, 1500);
  }

  sendTypingStatus(isTyping: boolean) {
    if (!this.socket) return;
    
    const partnerId = useChatStore.getState().partnerId;
    if (!partnerId) return;
    
    useChatStore.getState().setIsTyping(isTyping);
    
    // Send typing status to the server
    this.socket.emit('typing', {
      to: partnerId,
      isTyping
    });
  }

  sendSignal(signal: any) {
    if (!this.socket) return;
    
    const partnerId = useChatStore.getState().partnerId;
    if (!partnerId) return;
    
    // Send WebRTC signal to the server
    this.socket.emit('signal', {
      to: partnerId,
      signal
    });
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;