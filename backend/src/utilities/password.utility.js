import bcrypt from "bcryptjs";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const DEFAULT_ROUNDS = 12;
const MIN_ROUNDS = 10;
const MAX_ROUNDS = 15;

const byteLength = (value) => Buffer.byteLength(value, "utf8");

export const getPasswordPolicy = () => ({
      minLength: MIN_PASSWORD_LENGTH,
      maxLength: MAX_PASSWORD_LENGTH,
});

export const isPasswordWithinBcryptLimit = (password) =>
      typeof password === "string" && byteLength(password) <= MAX_PASSWORD_LENGTH;

export const getBcryptRounds = () => {
      const raw = Number(process.env.BCRYPT_ROUNDS);
      if (!Number.isInteger(raw) || raw < MIN_ROUNDS || raw > MAX_ROUNDS) {
            return DEFAULT_ROUNDS;
      }
      return raw;
};

export const assertHashablePassword = (password) => {
      if (typeof password !== "string" || password.length === 0) {
            throw new Error("Password must be a non-empty string");
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
            throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      }
      if (!isPasswordWithinBcryptLimit(password)) {
            throw new Error(`Password must not exceed ${MAX_PASSWORD_LENGTH} bytes`);
      }
};

export const hashPassword = async (password) => {
      assertHashablePassword(password);
      return bcrypt.hash(password, getBcryptRounds());
};

export const comparePassword = async (password, passwordHash) => {
      if (typeof password !== "string" || typeof passwordHash !== "string" || !passwordHash) {
            return false;
      }
      try {
            return await bcrypt.compare(password, passwordHash);
      } catch {
            return false;
      }
};

export const needsRehash = async (passwordHash) => {
      if (typeof passwordHash !== "string") return true;
      const match = /^\$2[aby]\$(\d{2})\$/.exec(passwordHash);
      if (!match) return true;
      return Number(match[1]) < getBcryptRounds();
};
