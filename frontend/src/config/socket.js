import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8000";

export const socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
});

export const connectSocket = () => {
      if (!socket.connected) {
            socket.connect();
      }
};

export const disconnectSocket = () => {
      if (socket.connected) {
            socket.disconnect();
      }
};
