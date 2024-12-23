import { Server } from 'socket.io';

let io;

export const initializeWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            allowedHeaders: ["my-custom-header"],
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

export const getIoInstance = () => io;