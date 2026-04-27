const clients = new Set();

export const addSSEClient = (res) => {
      clients.add(res);
};

export const removeSSEClient = (res) => {
      clients.delete(res);
};

export const broadcastUpdate = (type, data = null) => {
      const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
      for (const client of clients) {
            try {
                  client.write(payload);
            } catch {
                  clients.delete(client);
            }
      }
};
