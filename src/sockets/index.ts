import { Server } from 'socket.io';

let io: Server;

export const initSocketIO = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: '*', // Replace with your frontend domain
        },
    });

    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);

        // Join admin room for notification
        socket.on('join-admin-room', () => {
            socket.join('admin-room');
            console.log(`✅ ${socket.id} joined admin-room`);
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};
