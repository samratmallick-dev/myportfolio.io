import { SECTIONS, normalizeSection } from "./sectionCache";

export const ALL_SECTIONS = "*";

export const isPublicUrl = (url = "") => String(url).startsWith("/api/v1/public/");

const NON_CONTENT_PATHS =
      /^\/api\/v1\/contact\/(send-message|mark-as-read|delete-message|get-message|get-all-messages|get-unread-count)/;


const URL_RULES = [
      { pattern: /\/public\/initial-data(?:[/?]|$)/, section: ALL_SECTIONS },
      { pattern: /\/public\/featured-projects(?:[/?]|$)/, section: "projects" },
      { pattern: /\/public\/projects(?:[/?]|$)/, section: "projects" },
      { pattern: /\/public\/hero(?:[/?]|$)/, section: "hero" },
      { pattern: /\/public\/about(?:[/?]|$)/, section: "about" },
      { pattern: /\/public\/education(?:[/?]|$)/, section: "education" },
      { pattern: /\/public\/skills(?:[/?]|$)/, section: "skills" },
      { pattern: /\/public\/services(?:[/?]|$)/, section: "services" },
      { pattern: /\/public\/contact(?:[/?]|$)/, section: "contact" },
      {
            pattern: /\/(hero|about|education|skills|projects|services|contact)\//,
            section: (match) => normalizeSection(match[1]) ?? match[1],
      },
];

/**
 * Resolve which section a URL belongs to.
 *
 * @returns {undefined|typeof ALL_SECTIONS|string}
 *   `undefined`  → URL is unrelated to portfolio content (no invalidation)
 *   `ALL_SECTIONS` → every section depends on it
 *   `'hero'` etc. → the affected section
 */
export const sectionForUrl = (url = "") => {
      const path = String(url).split("?")[0];

      if (NON_CONTENT_PATHS.test(path)) return undefined;

      for (const rule of URL_RULES) {
            const match = path.match(rule.pattern);
            if (!match) continue;
            return typeof rule.section === "function" ? rule.section(match) : rule.section;
      }

      return undefined;
};

const affectedSections = (target) => {
      if (target === ALL_SECTIONS) return [ALL_SECTIONS, ...SECTIONS];
      const section = normalizeSection(target) ?? target;
      return [section, ALL_SECTIONS];
};

/**
 * @param {{ maxEntries?: number, defaultTtl?: number }} [options]
 */
export const createHttpCache = ({ maxEntries = 120, defaultTtl = 5 * 60 * 1000 } = {}) => {
      const entries = new Map();
      const pending = new Map();
      const sequences = new Map();

      const currentSeq = (section) => sequences.get(section) ?? 0;

      const bump = (section) => {
            sequences.set(section, currentSeq(section) + 1);
      };

      const isLive = (record) => record.seq === currentSeq(record.section);

      const prune = (now) => {
            for (const [key, record] of entries) {
                  if (!isLive(record) || now - record.timestamp >= record.ttl) {
                        entries.delete(key);
                  }
            }
            while (entries.size > maxEntries) {
                  entries.delete(entries.keys().next().value);
            }
      };

      return {
            captureSeq(section) {
                  return section === undefined ? 0 : currentSeq(section);
            },

            /** @returns the cached payload, or `undefined` when there is none. */
            get(key) {
                  const record = entries.get(key);
                  if (!record) return undefined;
                  if (!isLive(record)) {
                        entries.delete(key);
                        return undefined;
                  }
                  if (Date.now() - record.timestamp >= record.ttl) {
                        entries.delete(key);
                        return undefined;
                  }
                  return record.data;
            },

            set(key, { data, section, seq, ttl = defaultTtl } = {}) {
                  if (data === undefined) return false;
                  if (seq !== currentSeq(section)) return false;

                  entries.set(key, { data, section, seq, timestamp: Date.now(), ttl });
                  prune(Date.now());
                  return true;
            },

            getPending(key) {
                  const record = pending.get(key);
                  if (!record) return null;
                  if (record.seq !== currentSeq(record.section)) {
                        pending.delete(key);
                        return null;
                  }
                  return record.promise;
            },

            setPending(key, { promise, section, seq } = {}) {
                  pending.set(key, { promise, section, seq });
            },

            deletePending(key) {
                  pending.delete(key);
            },

            invalidate(section) {
                  const targets = new Set(affectedSections(section));
                  targets.forEach(bump);

                  for (const [key, record] of entries) {
                        if (targets.has(record.section)) entries.delete(key);
                  }
                  for (const [key, record] of pending) {
                        if (targets.has(record.section)) pending.delete(key);
                  }
                  return targets.size;
            },

            clear() {
                  SECTIONS.forEach(bump);
                  bump(ALL_SECTIONS);
                  entries.clear();
                  pending.clear();
            },

            get size() {
                  return entries.size;
            },
            get pendingSize() {
                  return pending.size;
            },
      };
};

export default createHttpCache;
