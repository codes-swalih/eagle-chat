import { NextRequest, NextResponse } from 'next/server';
import { Server as ServerIO } from 'socket.io';

// User tracking
interface User {
  id: string;
  socketId: string;
  interests?: string[];
  language?: string;
  mode?: 'text' | 'video' | 'spy' | 'interests';
  status: 'idle' | 'searching' | 'connected';
  partnerId?: string;
}

// Waiting rooms
interface WaitingRooms {
  text: User[];
  video: User[];
  spy: {
    questioners: User[];
    watchers: User[];
  };
  interests: User[];
}

// Global variables to track users and waiting rooms
const users = new Map<string, User>();
const waitingRooms: WaitingRooms = {
  text: [],
  video: [],
  spy: {
    questioners: [],
    watchers: []
  },
  interests: []
};

// Define functions outside the handler to avoid strict mode issues
// Function to find a match for text or video chat
const findMatch = (io: ServerIO, mode: 'text' | 'video') => {
  const waitingRoom = mode === 'text' ? waitingRooms.text : waitingRooms.video;
  
  if (waitingRoom.length >= 2) {
    const user1 = waitingRoom.shift()!;
    const user2 = waitingRoom.shift()!;
    
    // Match users
    user1.status = 'connected';
    user2.status = 'connected';
    user1.partnerId = user2.id;
    user2.partnerId = user1.id;
    
    // Notify users about the match
    io.to(user1.socketId).emit('matched', { partnerId: user2.id });
    io.to(user2.socketId).emit('matched', { partnerId: user1.id });
  }
};

// Function to find a match for spy mode
const findSpyMatch = (io: ServerIO) => {
  const { questioners, watchers } = waitingRooms.spy;
  
  if (questioners.length >= 1 && watchers.length >= 2) {
    const questioner = questioners.shift()!;
    const watcher1 = watchers.shift()!;
    const watcher2 = watchers.shift()!;
    
    // Create a unique room ID
    const roomId = `spy_${Date.now()}`;
    
    // Update user statuses
    questioner.status = 'connected';
    watcher1.status = 'connected';
    watcher2.status = 'connected';
    
    // Notify users about the match
    io.to(questioner.socketId).emit('spyMatched', {
      roomId,
      role: 'questioner',
      strangers: [watcher1.id, watcher2.id]
    });
    
    io.to(watcher1.socketId).emit('spyMatched', {
      roomId,
      role: 'stranger1',
      questioner: questioner.id,
      partner: watcher2.id
    });
    
    io.to(watcher2.socketId).emit('spyMatched', {
      roomId,
      role: 'stranger2',
      questioner: questioner.id,
      partner: watcher1.id
    });
  }
};

// Function to find a match based on interests
const findInterestsMatch = (io: ServerIO) => {
  const waitingRoom = waitingRooms.interests;
  
  if (waitingRoom.length >= 2) {
    // Sort users by number of matching interests
    waitingRoom.sort((a, b) => {
      if (!a.interests || !b.interests) return 0;
      
      // Find common interests
      const commonInterests = a.interests.filter(interest => 
        b.interests?.includes(interest)
      );
      
      return commonInterests.length;
    });
    
    const user1 = waitingRoom.pop()!;
    const user2 = waitingRoom.pop()!;
    
    // Find common interests
    const commonInterests = user1.interests?.filter(interest => 
      user2.interests?.includes(interest)
    ) || [];
    
    // Match users
    user1.status = 'connected';
    user2.status = 'connected';
    user1.partnerId = user2.id;
    user2.partnerId = user1.id;
    
    // Notify users about the match
    io.to(user1.socketId).emit('interestsMatched', {
      partnerId: user2.id,
      commonInterests
    });
    
    io.to(user2.socketId).emit('interestsMatched', {
      partnerId: user1.id,
      commonInterests
    });
  }
};

// Function to remove a user from all waiting rooms
const removeFromWaitingRooms = (userId: string) => {
  waitingRooms.text = waitingRooms.text.filter(user => user.id !== userId);
  waitingRooms.video = waitingRooms.video.filter(user => user.id !== userId);
  waitingRooms.spy.questioners = waitingRooms.spy.questioners.filter(user => user.id !== userId);
  waitingRooms.spy.watchers = waitingRooms.spy.watchers.filter(user => user.id !== userId);
  waitingRooms.interests = waitingRooms.interests.filter(user => user.id !== userId);
};

// Store the Socket.IO server instance
let io: ServerIO;

export async function GET(request: NextRequest) {
  // For App Router, we need to use a different approach
  // This endpoint will be used for health checks
  return NextResponse.json({ ok: true });
}

// This is needed for Socket.IO to work with App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';