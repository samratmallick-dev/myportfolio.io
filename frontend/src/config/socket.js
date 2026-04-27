const SSE_URL =
      (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1") + "/events";

let eventSource = null;
const listeners = new Map();

export const connectSSE = () => {
      if (eventSource) return;

      eventSource = new EventSource(SSE_URL, { withCredentials: true });

      eventSource.onmessage = (e) => {
            try {
                  const payload = JSON.parse(e.data);
                  if (payload.type === "connected") return;
                  const eventName = payload.type === "newMessage" ? "newMessage" : "portfolioUpdated";
                  const cbs = listeners.get(eventName);
                  if (cbs) cbs.forEach((cb) => cb(payload));
            } catch {
                  // ignore malformed messages
            }
      };

      eventSource.onerror = () => {
            eventSource?.close();
            eventSource = null;
            // auto-reconnect after 3s
            setTimeout(connectSSE, 3000);
      };
};

export const disconnectSSE = () => {
      eventSource?.close();
      eventSource = null;
};

export const onSSEEvent = (event, cb) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(cb);
};

export const offSSEEvent = (event, cb) => {
      listeners.get(event)?.delete(cb);
};
