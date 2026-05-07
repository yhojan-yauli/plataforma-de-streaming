import type { AuthResponse } from "@/types";

const AUTH_SESSION_KEY = "auth_session";
const LEGACY_TOKEN_KEY = "auth_token";
const LEGACY_USER_KEY = "auth_user";

export const readStoredAuthSession = (): AuthResponse | null => {
  const rawSession = localStorage.getItem(AUTH_SESSION_KEY);
  if (rawSession) {
    try {
      return JSON.parse(rawSession) as AuthResponse;
    } catch {
      clearStoredAuthSession();
    }
  }

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);

  if (!legacyToken || !legacyUser) {
    return null;
  }

  try {
    return {
      token: legacyToken,
      refreshToken: "",
      expiresAt: "",
      refreshTokenExpiresAt: "",
      user: JSON.parse(legacyUser),
    };
  } catch {
    clearStoredAuthSession();
    return null;
  }
};

export const storeAuthSession = (session: AuthResponse): void => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const clearStoredAuthSession = (): void => {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};

export const isSessionExpired = (expiresAt?: string | null, skewMs = 30_000): boolean => {
  if (!expiresAt) {
    return true;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return true;
  }

  return expiresAtMs - skewMs <= Date.now();
};
