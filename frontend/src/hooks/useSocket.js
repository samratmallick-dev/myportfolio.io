import { useEffect, useRef } from "react";
import { connectSocket, onSocketEvent, offSocketEvent } from "../config/socket";

export const useSocket = (eventName, callback) => {
      const callbackRef = useRef(callback);
      callbackRef.current = callback;

      useEffect(() => {
            connectSocket();

            if (!eventName) return;

            const handler = (payload) => callbackRef.current(payload);
            onSocketEvent(eventName, handler);

            return () => {
                  offSocketEvent(eventName, handler);
            };
      }, [eventName]);
};

export const useSocketConnection = () => {
      useEffect(() => {
            connectSocket();
      }, []);
};

export const useAdminSocket = (eventName, callback) => {
      const callbackRef = useRef(callback);
      callbackRef.current = callback;

      useEffect(() => {
            const socket = connectSocket();

            const joinAdmin = () => {
                  socket.emit("joinAdmin");
            };

            if (socket.connected) {
                  joinAdmin();
            }
            socket.on("connect", joinAdmin);

            if (!eventName) return;

            const handler = (payload) => callbackRef.current(payload);
            onSocketEvent(eventName, handler);

            return () => {
                  offSocketEvent(eventName, handler);
                  socket.off("connect", joinAdmin);
            };
      }, [eventName]);
};
