import { io } from "socket.io-client";

const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL_LOCAL ||
      "http://localhost:8000";

let socket = null;
let isConnecting = false;

export const getSocket = () => {
      if (socket?.connected || isConnecting) return socket;

      isConnecting = true;

      socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
      });

      socket.on("connect", () => {
            isConnecting = false;
            console.log("✅ Socket.IO connected:", socket.id);
      });

      socket.on("disconnect", (reason) => {
            console.log("❌ Socket.IO disconnected:", reason);
      });

      socket.on("connect_error", (err) => {
            isConnecting = false;
            console.warn("🚨 Socket.IO connection error:", err.message);
      });

      socket.on("reconnect_attempt", (attempt) => {
            console.log(`🔄 Socket.IO reconnection attempt #${attempt}`);
      });

      socket.on("reconnect", (attempt) => {
            console.log(`✅ Socket.IO reconnected after ${attempt} attempts`);
      });

      socket.on("reconnect_failed", () => {
            console.error("❌ Socket.IO reconnection failed permanently");
      });

      return socket;
};

export const connectSocket = () => {
      const s = getSocket();
      if (!s.connected) s.connect();
      return s;
};

export const disconnectSocket = () => {
      if (socket) {
            socket.disconnect();
            socket = null;
            isConnecting = false;
      }
};

export const onSocketEvent = (event, callback) => {
      const s = getSocket();
      s.on(event, callback);
      return () => s.off(event, callback);
};

export const offSocketEvent = (event, callback) => {
      if (socket) socket.off(event, callback);
};

export const emitSocketEvent = (event, data) => {
      const s = getSocket();
      if (s.connected) {
            s.emit(event, data);
      } else {
            console.warn(`Socket not connected — cannot emit "${event}"`);
      }
};
