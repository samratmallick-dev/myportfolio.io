const getAllowedOrigins = () => {
      const defaultOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000"
      ];

      const envOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS
                  .split(",")
                  .map(o => o.trim())
                  .filter(Boolean)
            : [];

      const clientUrls = process.env.CLIENT_URL
            ? process.env.CLIENT_URL
                  .split(",")
                  .map(o => o.trim())
                  .filter(Boolean)
            : [];

      return [...new Set([...defaultOrigins, ...envOrigins, ...clientUrls])];
};

export default getAllowedOrigins;
