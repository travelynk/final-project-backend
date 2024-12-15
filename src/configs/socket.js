import { Server } from 'socket.io';

let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            allowedHeaders: [""]
        }
    });


    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
      
        // Join user to their private room based on user ID
        socket.on('join', (userId) => {
          socket.join(`user_${userId}`);
          console.log(`User ${userId} joined their private room`);
        });
      
        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
        });
      });
};

export const getIoInstance = () => io;
