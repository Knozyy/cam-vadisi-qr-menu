import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'cv_token';
const TOKEN_TTL = '7d';
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

/** IP basina giris kilidi. Tek sifreli bir panelde kaba kuvvet tek gercek risktir. */
const attempts = new Map();

export function lockState(ip, now = Date.now()) {
  const entry = attempts.get(ip);
  if (!entry) return { locked: false, remainingMs: 0 };
  if (entry.lockedUntil > now) {
    return { locked: true, remainingMs: entry.lockedUntil - now };
  }
  if (entry.lockedUntil !== 0 && entry.lockedUntil <= now) attempts.delete(ip);
  return { locked: false, remainingMs: 0 };
}

export function recordFailure(ip, now = Date.now()) {
  const entry = attempts.get(ip) || { fails: 0, lockedUntil: 0 };
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.lockedUntil = now + LOCK_MS;
    entry.fails = 0;
  }
  attempts.set(ip, entry);
  return entry;
}

export function clearFailures(ip) {
  attempts.delete(ip);
}

export function resetAllFailures() {
  attempts.clear();
}

/** Sabit surede karsilastirma - uzunluk farki bile bilgi sizdirmasin diye hash uzerinden. */
export function verifyPassword(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = crypto.createHash('sha256').update(String(input ?? '')).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET tanimli degil - uretimde zorunlu (.env)');
    }
    return 'gelistirme-icin-gecici-anahtar';
  }
  return value;
}

export function issueToken() {
  return jwt.sign({ role: 'admin' }, secret(), { expiresIn: TOKEN_TTL });
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Giriş gerekli' });
  try {
    jwt.verify(token, secret());
    return next();
  } catch {
    return res.status(401).json({ error: 'Oturum geçersiz' });
  }
}

export function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'bilinmiyor';
}
