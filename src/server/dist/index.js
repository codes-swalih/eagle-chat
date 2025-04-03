"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Add a simple health check route
app.get('/', (req, res) => {
    res.send('Eagle Chat Server is running');
});
const server = http_1.default.createServer(app);
// Configure CORS for Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://eagle-chat-beryl.vercel.app', 'https://eagle-chat.vercel.app']
            : 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const users = new Map();
const waitingRooms = {
    text: [],
    video: [],
    spy: {
        questioners: [],
        watchers: []
    },
    interests: []
};
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Create a new user
    const user = {
        id: socket.id,
        socketId: socket.id,
        status: 'idle'
    };
    users.set(socket.id, user);
    // Handle user searching for a chat
    socket.on('search', (data) => {
        const { mode, language, interests, question, role } = data;
        const user = users.get(socket.id);
        if (!user)
            return;
        // Update user data
        user.mode = mode;
        user.language = language;
        user.status = 'searching';
        if (interests) {
            user.interests = interests;
        }
        // Add user to the appropriate waiting room
        if (mode === 'text') {
            waitingRooms.text.push(user);
            findMatch('text');
        }
        else if (mode === 'video') {
            waitingRooms.video.push(user);
            findMatch('video');
        }
        else if (mode === 'spy') {
            if (role === 'questioner' && question) {
                waitingRooms.spy.questioners.push(user);
            }
            else if (role === 'watcher') {
                waitingRooms.spy.watchers.push(user);
            }
            findSpyMatch();
        }
        else if (mode === 'interests') {
            waitingRooms.interests.push(user);
            findInterestsMatch();
        }
    });
    // Handle WebRTC signaling
    socket.on('signal', (data) => {
        const { to, signal } = data;
        io.to(to).emit('signal', {
            from: socket.id,
            signal
        });
    });
    // Handle chat messages
    socket.on('message', (data) => {
        const { to, text } = data;
        io.to(to).emit('message', {
            from: socket.id,
            text,
            timestamp: new Date()
        });
    });
    // Handle typing status
    socket.on('typing', (data) => {
        const { to, isTyping } = data;
        io.to(to).emit('typing', {
            from: socket.id,
            isTyping
        });
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const user = users.get(socket.id);
        if (user && user.partnerId) {
            // Notify partner about disconnection
            io.to(user.partnerId).emit('partnerDisconnected');
            // Update partner's status
            const partner = users.get(user.partnerId);
            if (partner) {
                partner.status = 'idle';
                partner.partnerId = undefined;
            }
        }
        // Remove user from waiting rooms
        removeFromWaitingRooms(socket.id);
        // Remove user from users map
        users.delete(socket.id);
    });
    // Handle ending chat
    socket.on('endChat', () => {
        const user = users.get(socket.id);
        if (user && user.partnerId) {
            // Notify partner about chat ending
            io.to(user.partnerId).emit('chatEnded');
            // Update partner's status
            const partner = users.get(user.partnerId);
            if (partner) {
                partner.status = 'idle';
                partner.partnerId = undefined;
            }
            // Update user's status
            user.status = 'idle';
            user.partnerId = undefined;
        }
    });
});
// Function to find a match for text or video chat
function findMatch(mode) {
    const waitingRoom = mode === 'text' ? waitingRooms.text : waitingRooms.video;
    if (waitingRoom.length >= 2) {
        const user1 = waitingRoom.shift();
        const user2 = waitingRoom.shift();
        // Match users
        user1.status = 'connected';
        user2.status = 'connected';
        user1.partnerId = user2.id;
        user2.partnerId = user1.id;
        // Notify users about the match
        io.to(user1.socketId).emit('matched', { partnerId: user2.id });
        io.to(user2.socketId).emit('matched', { partnerId: user1.id });
    }
}
// Function to find a match for spy mode
function findSpyMatch() {
    const { questioners, watchers } = waitingRooms.spy;
    if (questioners.length >= 1 && watchers.length >= 2) {
        const questioner = questioners.shift();
        const watcher1 = watchers.shift();
        const watcher2 = watchers.shift();
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
}
// Function to find a match based on interests
function findInterestsMatch() {
    const waitingRoom = waitingRooms.interests;
    if (waitingRoom.length >= 2) {
        // Sort users by number of matching interests
        waitingRoom.sort((a, b) => {
            if (!a.interests || !b.interests)
                return 0;
            // Find common interests
            const commonInterests = a.interests.filter(interest => b.interests?.includes(interest));
            return commonInterests.length;
        });
        const user1 = waitingRoom.pop();
        const user2 = waitingRoom.pop();
        // Find common interests
        const commonInterests = user1.interests?.filter(interest => user2.interests?.includes(interest)) || [];
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
}
// Function to remove a user from all waiting rooms
function removeFromWaitingRooms(userId) {
    waitingRooms.text = waitingRooms.text.filter(user => user.id !== userId);
    waitingRooms.video = waitingRooms.video.filter(user => user.id !== userId);
    waitingRooms.spy.questioners = waitingRooms.spy.questioners.filter(user => user.id !== userId);
    waitingRooms.spy.watchers = waitingRooms.spy.watchers.filter(user => user.id !== userId);
    waitingRooms.interests = waitingRooms.interests.filter(user => user.id !== userId);
}
// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
