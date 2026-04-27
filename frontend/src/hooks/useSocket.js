import { useEffect, useRef } from "react";
import { connectSSE, disconnectSSE, onSSEEvent, offSSEEvent } from "../config/socket";

export const useSocket = (eventName, callback) => {
      const callbackRef = useRef(callback);
      callbackRef.current = callback;

      useEffect(() => {
            connectSSE();

            if (!eventName) return;

            const handler = (payload) => callbackRef.current(payload);
            onSSEEvent(eventName, handler);

            return () => {
                  offSSEEvent(eventName, handler);
            };
      }, [eventName]);
};

export const useSocketConnection = () => {
      useEffect(() => {
            connectSSE();
            // never disconnect on unmount — SSE is a shared singleton
      }, []);
};

// kept for backward compat — admin uses SSE same as public
export const useAdminSocket = (eventName, callback) => {
      useSocket(eventName, callback);
};
