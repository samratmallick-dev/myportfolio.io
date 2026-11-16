import { useEffect, useRef } from "react";
import { connectSocket, onSocketEvent, offSocketEvent } from "../config/socket";
import { whenIdle } from "@/utils/performance";

export const useSocket = (eventName, callback) => {
      const callbackRef = useRef(callback);
      callbackRef.current = callback;

      useEffect(() => {
            let cleanup;
            let cancelIdle;
            let disposed = false;

            const start = () => {
                  if (disposed) return;

                  connectSocket();
                  if (!eventName) return;

                  const handler = (payload) => callbackRef.current(payload);
                  onSocketEvent(eventName, handler);
                  cleanup = () => offSocketEvent(eventName, handler);
            };

            const schedule = () => {
                  cancelIdle = whenIdle(start);
            };

            if (document.readyState === "complete") {
                  schedule();
            } else {
                  window.addEventListener("load", schedule, { once: true });
            }

            return () => {
                  disposed = true;
                  cancelIdle?.();
                  window.removeEventListener("load", schedule);
                  cleanup?.();
            };
      }, [eventName]);
};

export const useSocketConnection = () => {
      useEffect(() => {
            const cancelIdle = whenIdle(() => connectSocket());
            return () => cancelIdle?.();
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
