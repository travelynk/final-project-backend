import { jest, describe, beforeEach, it, expect, afterEach } from "@jest/globals";
import { Server } from 'socket.io';
import { initializeWebSocket, getIoInstance } from '../websocket';

jest.mock('socket.io');

describe('initializeWebSocket', () => {
    let server;
    let onMock;
    let socket;

    beforeEach(() => {
        server = {};
        onMock = jest.fn();
        socket = {
            id: '123',
            on: jest.fn(),
        };
        Server.mockImplementation(() => ({ on: onMock }));
        console.log = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize the websocket server', () => {
        initializeWebSocket(server);

        expect(Server).toHaveBeenCalledTimes(1);
        expect(Server).toHaveBeenCalledWith(server, {
            cors: {
                origin: "*",
                allowedHeaders: ["my-custom-header"],
            }
        });
    });

    it('should listen to connection event', () => {
        initializeWebSocket(server);

        expect(onMock).toHaveBeenCalledTimes(1);
        expect(onMock).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should log user connected', () => {
        initializeWebSocket(server);
        onMock.mock.calls[0][1](socket);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('User connected:', '123');
    });

    it('should listen to disconnect event', () => {
        initializeWebSocket(server);
        onMock.mock.calls[0][1](socket);
        socket.on.mock.calls[0][1]();

        expect(socket.on).toHaveBeenCalledTimes(1);
        expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.log).toHaveBeenCalledWith('User disconnected:', '123');
    });

    it('should return the io instance', () => {
        initializeWebSocket(server);

        expect(getIoInstance()).toEqual({ on: onMock });
    });
});
