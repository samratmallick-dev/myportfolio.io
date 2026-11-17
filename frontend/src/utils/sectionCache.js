export const SECTION_CACHE_KEYS = {
      HERO: "portfolio:hero",
      ABOUT: "portfolio:about",
      EDUCATION: "portfolio:education",
      SKILLS: "portfolio:skills",
      PROJECTS: "portfolio:projects",
      SERVICES: "portfolio:services",
      CONTACT: "portfolio:contact",
};

export const SECTIONS = [
      "hero",
      "about",
      "education",
      "skills",
      "projects",
      "services",
      "contact",
];

const SECTION_ALIASES = {
      hero: "hero",
      about: "about",
      education: "education",
      skills: "skills",
      projects: "projects",
      project: "projects",
      featured: "projects",
      "featured-projects": "projects",
      services: "services",
      service: "services",
      contact: "contact",
};

export const normalizeSection = (type) => {
      if (typeof type !== "string") return null;
      return SECTION_ALIASES[type] ?? SECTION_ALIASES[type.toLowerCase()] ?? null;
};

export const isSection = (section) => SECTIONS.includes(section);

const VERSIONS_KEY = "portfolio:section-versions";
const CHANNEL_NAME = "portfolio-section-sync";

const SEEN_MESSAGE_LIMIT = 100;

const TAB_ID = `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const getTabId = () => TAB_ID;

const safeStorage = () => {
      try {
            if (typeof window === "undefined" || !window.localStorage) return null;
            return window.localStorage;
      } catch {
            return null;
      }
};

const readVersions = () => {
      const storage = safeStorage();
      if (!storage) return {};

      try {
            const raw = storage.getItem(VERSIONS_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

            return Object.fromEntries(
                  Object.entries(parsed).filter(
                        ([section, version]) => isSection(section) && Number.isFinite(version),
                  ),
            );
      } catch {
            return {};
      }
};

let sectionVersions = readVersions();

export const getSectionVersion = (section) =>
      isSection(section) ? sectionVersions[section] ?? 0 : 0;

export const recordSectionVersion = (section, version) => {
      if (!isSection(section) || !Number.isFinite(version)) return false;
      if (version <= getSectionVersion(section)) return false;

      sectionVersions = { ...sectionVersions, [section]: version };

      const storage = safeStorage();
      if (storage) {
            try {
                  storage.setItem(VERSIONS_KEY, JSON.stringify(sectionVersions));
            } catch {
                  // Storage unavailable (quota/private mode): the in-memory
                  // version still protects this tab.
                  return true;
            }
      }
      return true;
};

export const isVersionNewer = (incoming, current) =>
      Number.isFinite(incoming) && Number.isFinite(current) && incoming > current;

const serverVersions = new Map();

export const recordServerVersion = (section, version) => {
      if (!isSection(section) || !Number.isFinite(version)) return;
      serverVersions.set(section, { version, at: Date.now() });
};


export const getRecentServerVersion = (section, since = 0) => {
      const entry = serverVersions.get(section);
      if (!entry || entry.at < since) return null;
      return entry.version;
};

const localMutations = new Map();

export const markLocalMutation = (section) => {
      if (isSection(section)) localMutations.set(section, Date.now());
};

export const getLocalMutationAt = (section) => localMutations.get(section) ?? 0;


const seenMessages = new Set();
const listeners = new Set();

let channel = null;
const getChannel = () => {
      if (channel !== null) return channel;
      if (typeof BroadcastChannel === "undefined") return null;

      try {
            channel = new BroadcastChannel(CHANNEL_NAME);
            channel.addEventListener("message", (event) => {
                  handleIncomingEvent(event?.data, "broadcast");
            });
      } catch {
            channel = null;
      }
      return channel;
};

const rememberMessage = (message) => {
      const id = `${message.section}:${message.version}`;
      if (seenMessages.has(id)) return false;

      seenMessages.add(id);
      if (seenMessages.size > SEEN_MESSAGE_LIMIT) {
            const oldest = seenMessages.values();
            for (let i = 0; i < SEEN_MESSAGE_LIMIT / 2; i += 1) {
                  const value = oldest.next().value;
                  if (value === undefined) break;
                  seenMessages.delete(value);
            }
      }
      return true;
};

const handleIncomingEvent = (message, transport) => {
      if (!message || message.type !== "PORTFOLIO_SECTION_UPDATED") return;
      if (message.source === TAB_ID) return;
      if (!rememberMessage(message)) return;

      recordSectionVersion(message.section, message.version);

      listeners.forEach((listener) => {
            try {
                  listener(message, transport);
            } catch (error) {
                  console.error("Portfolio section sync listener failed:", error);
            }
      });
};

if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
            if (event.key !== VERSIONS_KEY || !event.newValue) return;
            let next;
            try {
                  next = JSON.parse(event.newValue);
            } catch {
                  return;
            }
            if (!next || typeof next !== "object") return;

            Object.entries(next).forEach(([section, version]) => {
                  if (!isSection(section) || !Number.isFinite(version)) return;
                  if (version <= (sectionVersions[section] ?? 0)) return;

                  handleIncomingEvent(
                        {
                              type: "PORTFOLIO_SECTION_UPDATED",
                              section,
                              version,
                              source: "storage",
                              transport: "storage",
                        },
                        "storage",
                  );
            });
      });
}

export const publishSectionUpdate = ({ section, version, source = TAB_ID } = {}) => {
      if (!isSection(section) || !Number.isFinite(version)) return false;

      const current = getSectionVersion(section);
      if (version < current) return false; 
      recordSectionVersion(section, version);

      const message = {
            type: "PORTFOLIO_SECTION_UPDATED",
            section,
            version,
            source,
            transport: "broadcast",
            updatedAt: new Date(version).toISOString(),
      };

      const activeChannel = getChannel();
      if (activeChannel) {
            try {
                  activeChannel.postMessage(message);
            } catch {
                  // Channel is unusable (tab unloading): drop it so the next
                  // publish recreates it; the storage event still fires.
                  channel = null;
            }
      }

      listeners.forEach((listener) => {
            try {
                  listener({ ...message, transport: "local" }, "local");
            } catch (error) {
                  console.error("Portfolio section sync listener failed:", error);
            }
      });
      return true;
};

export const subscribeSectionUpdates = (listener) => {
      if (typeof listener !== "function") return () => {};

      listeners.add(listener);
      getChannel();

      return () => {
            listeners.delete(listener);
      };
};

export const __resetSectionCacheForTests = () => {
      sectionVersions = {};
      serverVersions.clear();
      localMutations.clear();
      seenMessages.clear();
      listeners.clear();
};
