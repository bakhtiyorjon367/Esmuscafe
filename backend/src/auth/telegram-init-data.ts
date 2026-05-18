import { createHmac } from 'crypto';

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

/** Validates Telegram Mini App initData and returns the embedded user (if any). */
export function parseAndValidateTelegramInitData(
  initData: string,
  botToken: string,
): TelegramWebAppUser | null {
  if (!initData?.trim() || !botToken?.trim()) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return null;
  }

  const entries = [...params.entries()]
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return null;
  }

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Number.isNaN(authDate)) {
    return null;
  }
  const ageSec = Math.floor(Date.now() / 1000) - authDate;
  if (ageSec < 0 || ageSec > MAX_AUTH_AGE_SEC) {
    return null;
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as TelegramWebAppUser;
    if (!user?.id || !user.first_name) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
