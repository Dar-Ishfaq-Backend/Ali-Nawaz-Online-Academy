const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const SUPABASE_SITE_URL = (import.meta.env.VITE_SITE_URL || '').trim();
const SESSION_STORAGE_KEY = 'ali_nawaz_supabase_session';
const SESSION_EXPIRY_BUFFER_SECONDS = 60;

export const STAFF_ACCESS_RULES = [
  { identifier: 'moeedkamraan1123', role: 'Admin' },
  { identifier: 'moeedkamraan1125', role: 'Super Admin' },
  { identifier: 'dar1.ishfaq36@gmail.com', role: 'Super Admin' },
];
const RETIRED_ACCOUNT_MESSAGES = new Map([
  ['superadmin@alinawaz.academy', 'This legacy super admin account has been retired. Please use dar1.ishfaq36@gmail.com instead.'],
]);

const normalizeEmail = (value = '') => value.trim().toLowerCase();
const isRole = (value) => ['Student', 'Teacher', 'Admin', 'Super Admin'].includes(value);
const getRetiredAccountMessage = (email = '') => RETIRED_ACCOUNT_MESSAGES.get(normalizeEmail(email)) || '';

const buildSupabaseUserRecord = (profile = {}) => ({
  id: profile.id,
  name: profile.name || profile.email?.split('@')[0] || 'Student',
  email: normalizeEmail(profile.email || ''),
  role: resolveSupabaseRole(profile.email || '', profile.role),
  createdAt: profile.created_at || new Date().toISOString(),
  blocked: false,
  isDemo: false,
});

const getSessionStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getSessionStore = () => {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setSessionStore = (session) => {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const clearSessionStore = () => {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(SESSION_STORAGE_KEY);
};

const clearSupabaseSession = async (accessToken = '') => {
  if (accessToken) {
    await requestSupabase('/auth/v1/logout', {
      method: 'POST',
      accessToken,
    });
  }

  clearSessionStore();
};

const getSiteUrl = () => {
  if (SUPABASE_SITE_URL) return SUPABASE_SITE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

const getEmailIdentifiers = (email = '') => {
  const normalized = normalizeEmail(email);
  const localPart = normalized.split('@')[0] || '';
  return [normalized, localPart].filter(Boolean);
};

export const isSupabaseEnabled = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const resolveSupabaseRole = (email, fallbackRole = 'Student') => {
  const identifiers = new Set(getEmailIdentifiers(email));
  const matchedRule = STAFF_ACCESS_RULES.find((rule) => identifiers.has(rule.identifier));

  if (matchedRule) {
    return matchedRule.role;
  }

  return isRole(fallbackRole) ? fallbackRole : 'Student';
};

const buildHeaders = ({ accessToken, contentType = 'application/json', extra = {} } = {}) => {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    ...extra,
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

const formatErrorMessage = (data, fallbackMessage) => (
  data?.msg
  || data?.error_description
  || data?.message
  || data?.error
  || fallbackMessage
);

const requestSupabase = async (path, options = {}) => {
  if (!isSupabaseEnabled()) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const {
    method = 'GET',
    body,
    accessToken,
    contentType = body ? 'application/json' : null,
    headers = {},
  } = options;

  try {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: buildHeaders({ accessToken, contentType, extra: headers }),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data,
        message: formatErrorMessage(data, 'The Supabase request could not be completed.'),
      };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'The Supabase request could not be completed.',
    };
  }
};

const normalizeSession = (payload) => {
  const rawSession = payload?.session || payload;
  if (!rawSession?.access_token) return null;

  return {
    access_token: rawSession.access_token,
    refresh_token: rawSession.refresh_token || '',
    expires_at: rawSession.expires_at || (
      rawSession.expires_in
        ? Math.floor(Date.now() / 1000) + Number(rawSession.expires_in)
        : Math.floor(Date.now() / 1000) + 3600
    ),
    token_type: rawSession.token_type || 'bearer',
    user: rawSession.user || payload?.user || null,
  };
};

const storeSession = (payload) => {
  const session = normalizeSession(payload);
  if (session) {
    setSessionStore(session);
  }
  return session;
};

const isSessionExpired = (session) => (
  !session?.expires_at || session.expires_at <= Math.floor(Date.now() / 1000) + SESSION_EXPIRY_BUFFER_SECONDS
);

export const captureSupabaseSessionFromUrl = () => {
  if (typeof window === 'undefined' || !window.location.hash) return null;

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');

  if (!accessToken) return null;

  const session = storeSession({
    access_token: accessToken,
    refresh_token: params.get('refresh_token') || '',
    expires_in: params.get('expires_in') || '3600',
    token_type: params.get('token_type') || 'bearer',
  });

  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);

  return {
    session,
    type: params.get('type') || '',
  };
};

const refreshSupabaseSession = async () => {
  const session = getSessionStore();

  if (!session?.refresh_token) {
    clearSessionStore();
    return { ok: false, message: 'No active Supabase session was found.' };
  }

  const result = await requestSupabase('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: session.refresh_token },
  });

  if (!result.ok) {
    clearSessionStore();
    return result;
  }

  return { ok: true, session: storeSession(result.data) };
};

export const getSupabaseSession = async () => {
  const captured = captureSupabaseSessionFromUrl();
  let session = captured?.session || getSessionStore();

  if (!session) {
    return { ok: false, message: 'No active Supabase session was found.', recoveryType: captured?.type || '' };
  }

  if (isSessionExpired(session)) {
    const refreshed = await refreshSupabaseSession();
    if (!refreshed.ok) return refreshed;
    session = refreshed.session;
  }

  return { ok: true, session, recoveryType: captured?.type || '' };
};

const upsertSupabaseProfile = async (session, user) => {
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const role = resolveSupabaseRole(user?.email || '', user?.user_metadata?.role);

  const result = await requestSupabase('/rest/v1/profiles?on_conflict=id', {
    method: 'POST',
    accessToken: session.access_token,
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: [{
      id: user.id,
      email: normalizeEmail(user.email || ''),
      name,
      role,
    }],
  });

  if (!result.ok) {
    return { ok: false, message: result.message, profile: null };
  }

  const profile = Array.isArray(result.data) ? result.data[0] : null;
  return { ok: true, profile };
};

const getSupabaseProfile = async (session, userId) => {
  const result = await requestSupabase(`/rest/v1/profiles?id=eq.${userId}&select=id,email,name,role,created_at`, {
    accessToken: session.access_token,
  });

  if (!result.ok) {
    return { ok: false, message: result.message, profile: null };
  }

  const profile = Array.isArray(result.data) ? result.data[0] : null;
  return { ok: true, profile };
};

export const buildLocalUserFromSupabase = (user, profile = null) => ({
  id: user.id,
  name: profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student',
  email: normalizeEmail(profile?.email || user?.email || ''),
  role: resolveSupabaseRole(profile?.email || user?.email || '', profile?.role || user?.user_metadata?.role),
  createdAt: profile?.created_at || user?.created_at || new Date().toISOString(),
  blocked: false,
  isDemo: false,
});

export const listSupabaseProfiles = async () => {
  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const result = await requestSupabase('/rest/v1/profiles?select=id,name,email,role,created_at&order=created_at.desc', {
    accessToken: sessionResult.session.access_token,
  });

  if (!result.ok) {
    return result;
  }

  const users = (result.data || [])
    .filter((profile) => !getRetiredAccountMessage(profile.email))
    .map(buildSupabaseUserRecord);

  return { ok: true, users };
};

export const getSupabaseUser = async () => {
  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const userResult = await requestSupabase('/auth/v1/user', {
    accessToken: sessionResult.session.access_token,
  });

  if (!userResult.ok) {
    return userResult;
  }

  const retiredMessage = getRetiredAccountMessage(userResult.data?.email);
  if (retiredMessage) {
    await clearSupabaseSession(sessionResult.session.access_token);
    return {
      ok: false,
      message: retiredMessage,
    };
  }

  const session = storeSession({
    ...sessionResult.session,
    user: userResult.data,
  });

  const syncResult = await upsertSupabaseProfile(session, userResult.data);
  const profileResult = syncResult.ok
    ? syncResult
    : await getSupabaseProfile(session, userResult.data.id);

  return {
    ok: true,
    session,
    user: buildLocalUserFromSupabase(userResult.data, profileResult.profile),
    recoveryType: sessionResult.recoveryType || '',
  };
};

export const signInWithSupabase = async (email, password) => {
  const retiredMessage = getRetiredAccountMessage(email);
  if (retiredMessage) {
    return { ok: false, message: retiredMessage };
  }

  const result = await requestSupabase('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: {
      email: normalizeEmail(email),
      password,
    },
  });

  if (!result.ok) {
    return result;
  }

  const session = storeSession(result.data);
  const syncResult = await upsertSupabaseProfile(session, result.data.user);
  const profile = syncResult.profile;

  return {
    ok: true,
    session,
    user: buildLocalUserFromSupabase(result.data.user, profile),
  };
};

export const registerWithSupabase = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const retiredMessage = getRetiredAccountMessage(normalizedEmail);

  if (retiredMessage) {
    return { ok: false, message: retiredMessage };
  }

  const result = await requestSupabase('/auth/v1/signup', {
    method: 'POST',
    body: {
      email: normalizedEmail,
      password,
      data: {
        name: name.trim(),
        role: resolveSupabaseRole(normalizedEmail, 'Student'),
      },
    },
  });

  if (!result.ok) {
    return result;
  }

  const session = storeSession(result.data);

  if (session && result.data.user) {
    const syncResult = await upsertSupabaseProfile(session, result.data.user);

    return {
      ok: true,
      user: buildLocalUserFromSupabase(result.data.user, syncResult.profile),
      session,
      message: 'Your student account has been created successfully.',
      needsEmailConfirmation: false,
    };
  }

  return {
    ok: true,
    user: null,
    session: null,
    message: 'Check your email to confirm your account, then sign in.',
    needsEmailConfirmation: true,
  };
};

export const requestSupabasePasswordReset = async (email) => {
  const result = await requestSupabase('/auth/v1/recover', {
    method: 'POST',
    body: {
      email: normalizeEmail(email),
      redirect_to: `${getSiteUrl()}/forgot-password`,
    },
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    message: 'A password reset link has been sent. Open it in this browser to choose a new password.',
  };
};

export const updateSupabasePassword = async (newPassword) => {
  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const result = await requestSupabase('/auth/v1/user', {
    method: 'PUT',
    accessToken: sessionResult.session.access_token,
    body: {
      password: newPassword,
    },
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    message: 'Your password has been updated. You can sign in now.',
  };
};

export const signOutSupabase = async () => {
  const session = getSessionStore();

  await clearSupabaseSession(session?.access_token || '');
  return { ok: true };
};
