import { Server } from 'socket.io';

let io;

export const initializeWebSocket = (server) => {
    // io = new Server(server);

    io = new Server(server, {
        cors: {
            origin: "*", 
            // methods: ["GET", "POST"],        
            allowedHeaders: ["my-custom-header"], 
        }
    });
    

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

export const getIoInstance = () => io;