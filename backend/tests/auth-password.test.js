import test from 'node:test';
import assert from 'node:assert/strict';

process.env.BCRYPT_ROUNDS = '10';

const {
      hashPassword,
      comparePassword,
      needsRehash,
      assertHashablePassword,
      getBcryptRounds,
} = await import('../src/utilities/password.utility.js');

test('hashPassword produces an async bcrypt hash and round-trips', async () => {
      const hash = await hashPassword('correct horse battery staple');

      assert.match(hash, /^\$2[aby]\$10\$/);
      assert.equal(await comparePassword('correct horse battery staple', hash), true);
      assert.equal(await comparePassword('wrong password entirely', hash), false);
});

test('getBcryptRounds validates the configured work factor', () => {
      const original = process.env.BCRYPT_ROUNDS;
      try {
            assert.equal(getBcryptRounds(), 10);

            process.env.BCRYPT_ROUNDS = '99';
            assert.equal(getBcryptRounds(), 12); // falls back to the default

            process.env.BCRYPT_ROUNDS = 'not-a-number';
            assert.equal(getBcryptRounds(), 12);
      } finally {
            process.env.BCRYPT_ROUNDS = original;
      }
});

test('assertHashablePassword enforces the length policy', () => {
      assert.throws(() => assertHashablePassword(undefined), /non-empty/);
      assert.throws(() => assertHashablePassword('short'), /at least 8/);
      assert.throws(() => assertHashablePassword('x'.repeat(73)), /72 bytes/);
      assert.doesNotThrow(() => assertHashablePassword('long-enough-password'));
});

test('hashPassword refuses unsafe input instead of hashing it', async () => {
      await assert.rejects(() => hashPassword('1234567'), /at least 8/);
      await assert.rejects(() => hashPassword('x'.repeat(80)), /72 bytes/);
});

test('comparePassword never throws on malformed hashes or missing input', async () => {
      assert.equal(await comparePassword('whatever', ''), false);
      assert.equal(await comparePassword('whatever', null), false);
      assert.equal(await comparePassword('whatever', 'not-a-bcrypt-hash'), false);
      assert.equal(await comparePassword(undefined, '$2b$10$somesaltandsomerounds'), false);
});

test('needsRehash detects hashes weaker than the configured cost', async () => {
      // Built with cost 10 == configured cost 10 -> no rehash needed.
      const current = await hashPassword('a-strong-password');
      assert.equal(await needsRehash(current), false);

      // Simulated legacy hash with a lower cost.
      const legacy = '$2b$08$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
      assert.equal(await needsRehash(legacy), true);

      // Non-bcrypt values always need rehashing.
      assert.equal(await needsRehash('plaintext'), true);
      assert.equal(await needsRehash(undefined), true);
});
