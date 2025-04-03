import { useChatStore } from './store';
import socketService from './socket';
import SimplePeer from 'simple-peer';

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peer: SimplePeer.Instance | null = null;
  private initialized = false;
  private eventListenersSet = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Request access to the user's camera and microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      this.initialized = true;
      console.log('WebRTC service initialized');
      
      if (!this.eventListenersSet) {
        this.setupEventListeners();
        this.eventListenersSet = true;
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    // Listen for WebRTC signals from the socket service
    window.addEventListener('webrtc-signal', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { from, signal } = customEvent.detail;
      
      if (!this.peer) {
        // Create a new peer as the receiver
        this.createPeer(false, from);
      }
      
      // Handle the incoming signal
      this.peer?.signal(signal);
    });
  }

  private createPeer(isInitiator: boolean, partnerId: string) {
    if (!this.localStream) return;
    
    // Create a new SimplePeer instance
    this.peer = new SimplePeer({
      initiator: isInitiator,
      stream: this.localStream,
      trickle: true
    });
    
    // Handle peer events
    this.peer.on('signal', (data) => {
      // Send the signal to the partner via the socket service
      socketService.sendSignal(data);
    });
    
    this.peer.on('stream', (stream) => {
      // Emit an event with the remote stream
      const event = new CustomEvent('remote-stream', { detail: { stream } });
      window.dispatchEvent(event);
    });
    
    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.peer = null;
    });
    
    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.peer = null;
    });
  }

  async startCall() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Connect to the socket service for video chat
    socketService.connect({ mode: 'video', language: useChatStore.getState().language });
    
    // Listen for partner matching
    const unsubscribe = useChatStore.subscribe((state) => {
      if (state.status === 'connected' && state.partnerId && !this.peer) {
        // Create a new peer as the initiator
        this.createPeer(true, state.partnerId);
        unsubscribe();
      }
    });
    
    return this.localStream;
  }

  endCall() {
    // Disconnect from the socket service
    socketService.disconnect();
    
    // Close the peer connection
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    // Stop all tracks in the local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.initialized = false;
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  getLocalStream() {
    return this.localStream;
  }
}

// Create a singleton instance
const webRTCService = new WebRTCService();

export default webRTCService;