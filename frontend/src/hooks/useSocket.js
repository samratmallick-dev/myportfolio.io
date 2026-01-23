import { useEffect } from "react";
import { socket, connectSocket, disconnectSocket } from "../config/socket";

export const useSocket = (eventName, callback) => {
      useEffect(() => {
            connectSocket();

            if (eventName && callback) {
                  socket.on(eventName, callback);
            }

            return () => {
                  if (eventName && callback) {
                        socket.off(eventName, callback);
                  }
            };
      }, [eventName, callback]);

      return socket;
};

export const useSocketConnection = () => {
      useEffect(() => {
            connectSocket();

            return () => {
                  disconnectSocket();
            };
      }, []);
};

export const useAdminSocket = (eventName, callback) => {
      useEffect(() => {
            connectSocket();
            socket.emit("joinAdmin");

            if (eventName && callback) {
                  socket.on(eventName, callback);
            }

            return () => {
                  if (eventName && callback) {
                        socket.off(eventName, callback);
                  }
            };
      }, [eventName, callback]);

      return socket;
};
