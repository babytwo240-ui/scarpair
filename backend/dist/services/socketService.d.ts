import { Server as SocketIOServer } from 'socket.io';
export declare function getSocketIO(): SocketIOServer | null;
export declare function initializeSocket(io: SocketIOServer): SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export default initializeSocket;
//# sourceMappingURL=socketService.d.ts.map