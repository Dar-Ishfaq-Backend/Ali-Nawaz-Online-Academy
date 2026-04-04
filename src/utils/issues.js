import { getSupabaseSession, isSupabaseEnabled, requestSupabase } from './supabaseAuth';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const ISSUE_BUCKET = 'issues';
const ISSUE_SELECT = 'id,user_id,role,subject,message,screenshot_url,status,assigned_to,created_at';
const MAX_ISSUE_SCREENSHOT_SIZE = 5 * 1024 * 1024;

const ISSUE_STATUS_LABELS = {
  open: 'Open',
  resolved: 'Resolved',
  escalated: 'Escalated',
};

const ISSUE_ASSIGNEE_LABELS = {
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const ISSUE_ROLE_LABELS = {
  student: 'Student',
  admin: 'Admin',
};

const normalizeText = (value = '') => value.trim();
const normalizeViewerRole = (role = '') => {
  if (role === 'Super Admin') return 'super_admin';
  if (role === 'Admin') return 'admin';
  return 'student';
};

const buildStorageHeaders = (accessToken, contentType) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${accessToken}`,
  'x-upsert': 'false',
  ...(contentType ? { 'Content-Type': contentType } : {}),
});

const getPublicStorageUrl = (path) => (
  `${SUPABASE_URL}/storage/v1/object/public/${ISSUE_BUCKET}/${path}`
);

const buildIssueUploadPath = (userId, fileName) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
  return `${userId}/${Date.now()}-${safeName}`;
};

const parseStorageErrorMessage = async (response, fallbackMessage) => {
  const text = await response.text();
  if (!text) return fallbackMessage;

  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || fallbackMessage;
  } catch {
    return text;
  }
};

const normalizeIssueRecord = (issue, profilesById = {}) => ({
  id: issue.id,
  userId: issue.user_id,
  role: issue.role,
  roleLabel: ISSUE_ROLE_LABELS[issue.role] || issue.role,
  subject: issue.subject || '',
  message: issue.message || '',
  screenshotUrl: issue.screenshot_url || '',
  status: issue.status || 'open',
  statusLabel: ISSUE_STATUS_LABELS[issue.status] || issue.status,
  assignedTo: issue.assigned_to || 'admin',
  assignedToLabel: ISSUE_ASSIGNEE_LABELS[issue.assigned_to] || issue.assigned_to,
  createdAt: issue.created_at || '',
  reporterName: profilesById[issue.user_id]?.name || profilesById[issue.user_id]?.email?.split('@')[0] || 'Student',
  reporterEmail: profilesById[issue.user_id]?.email || '',
});

const fetchProfilesByIds = async (ids, accessToken) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const result = await requestSupabase(
    `/rest/v1/profiles?select=id,name,email,role&id=in.(${uniqueIds.join(',')})`,
    { accessToken },
  );

  if (!result.ok) {
    return {};
  }

  return Object.fromEntries((result.data || []).map((profile) => [profile.id, profile]));
};

const appendReplyToMessage = (message, reply, roleLabel, responderName) => {
  const nextMessage = normalizeText(message);
  const nextReply = normalizeText(reply);
  if (!nextReply) return nextMessage;

  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const responderLabel = responderName ? `${roleLabel} • ${responderName}` : roleLabel;

  return [
    nextMessage,
    '',
    `--- ${responderLabel} • ${timestamp} ---`,
    nextReply,
  ].filter(Boolean).join('\n');
};

const uploadIssueScreenshot = async (file, userId, accessToken) => {
  if (!file) {
    return { ok: true, path: '', publicUrl: '' };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  if (file.size > MAX_ISSUE_SCREENSHOT_SIZE) {
    return { ok: false, message: 'Please keep the screenshot under 5 MB.' };
  }

  const uploadPath = buildIssueUploadPath(userId, file.name);
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${ISSUE_BUCKET}/${uploadPath}`, {
    method: 'POST',
    headers: buildStorageHeaders(accessToken, file.type || 'application/octet-stream'),
    body: file,
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await parseStorageErrorMessage(response, 'The issue screenshot could not be uploaded.'),
    };
  }

  return {
    ok: true,
    path: uploadPath,
    publicUrl: getPublicStorageUrl(uploadPath),
  };
};

const deleteIssueScreenshot = async (path, accessToken) => {
  if (!path) return { ok: true };

  const result = await requestSupabase(`/storage/v1/object/${ISSUE_BUCKET}/${path}`, {
    method: 'DELETE',
    accessToken,
    contentType: null,
  });

  return result.ok ? { ok: true } : result;
};

export const createIssue = async ({ currentUser, subject, message, screenshotFile = null }) => {
  if (!isSupabaseEnabled()) {
    return { ok: false, message: 'Supabase is not configured for the issue system yet.' };
  }

  if (!currentUser?.id) {
    return { ok: false, message: 'Please sign in before submitting an issue.' };
  }

  const nextSubject = normalizeText(subject);
  const nextMessage = normalizeText(message);

  if (!nextSubject) {
    return { ok: false, message: 'Please enter an issue subject.' };
  }

  if (!nextMessage) {
    return { ok: false, message: 'Please describe the issue before submitting.' };
  }

  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) {
    return { ok: false, message: 'Please sign in again before submitting the issue.' };
  }

  const uploadResult = await uploadIssueScreenshot(
    screenshotFile,
    currentUser.id,
    sessionResult.session.access_token,
  );

  if (!uploadResult.ok) {
    return uploadResult;
  }

  const insertResult = await requestSupabase(`/rest/v1/issues?select=${ISSUE_SELECT}`, {
    method: 'POST',
    accessToken: sessionResult.session.access_token,
    headers: {
      Prefer: 'return=representation',
    },
    body: [{
      user_id: currentUser.id,
      role: 'student',
      subject: nextSubject,
      message: nextMessage,
      screenshot_url: uploadResult.publicUrl || '',
      status: 'open',
      assigned_to: 'admin',
    }],
  });

  if (!insertResult.ok) {
    if (uploadResult.path) {
      await deleteIssueScreenshot(uploadResult.path, sessionResult.session.access_token);
    }

    return {
      ok: false,
      message: insertResult.message || 'The issue could not be created.',
    };
  }

  const issue = Array.isArray(insertResult.data) ? insertResult.data[0] : null;
  return {
    ok: true,
    issue: normalizeIssueRecord(issue, {
      [currentUser.id]: {
        name: currentUser.name,
        email: currentUser.email,
      },
    }),
  };
};

export const fetchIssues = async ({ currentUser, viewerRole }) => {
  if (!isSupabaseEnabled()) {
    return { ok: false, message: 'Supabase is not configured for the issue system yet.' };
  }

  if (!currentUser?.id) {
    return { ok: false, message: 'Please sign in before opening the issue system.' };
  }

  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) {
    return { ok: false, message: 'Please sign in again before loading issues.' };
  }

  const normalizedViewerRole = normalizeViewerRole(viewerRole);
  const filters = [`select=${ISSUE_SELECT}`, 'order=created_at.desc'];

  if (normalizedViewerRole === 'student') {
    filters.push(`user_id=eq.${currentUser.id}`);
  } else if (normalizedViewerRole === 'admin') {
    filters.push('role=eq.student');
  } else {
    filters.push('assigned_to=eq.super_admin');
  }

  const issuesResult = await requestSupabase(`/rest/v1/issues?${filters.join('&')}`, {
    accessToken: sessionResult.session.access_token,
  });

  if (!issuesResult.ok) {
    return {
      ok: false,
      message: issuesResult.message || 'Issues could not be loaded.',
    };
  }

  const issues = issuesResult.data || [];
  const profilesById = await fetchProfilesByIds(
    issues.map((issue) => issue.user_id),
    sessionResult.session.access_token,
  );

  return {
    ok: true,
    issues: issues.map((issue) => normalizeIssueRecord(issue, profilesById)),
  };
};

export const updateIssue = async ({
  issueId,
  currentUser,
  viewerRole,
  action,
  reply = '',
}) => {
  if (!isSupabaseEnabled()) {
    return { ok: false, message: 'Supabase is not configured for the issue system yet.' };
  }

  if (!issueId || !currentUser?.id) {
    return { ok: false, message: 'The selected issue could not be updated.' };
  }

  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) {
    return { ok: false, message: 'Please sign in again before updating the issue.' };
  }

  const currentIssueResult = await requestSupabase(`/rest/v1/issues?id=eq.${issueId}&select=${ISSUE_SELECT}`, {
    accessToken: sessionResult.session.access_token,
  });

  if (!currentIssueResult.ok) {
    return { ok: false, message: currentIssueResult.message || 'The selected issue could not be found.' };
  }

  const currentIssue = Array.isArray(currentIssueResult.data) ? currentIssueResult.data[0] : null;
  if (!currentIssue) {
    return { ok: false, message: 'The selected issue could not be found.' };
  }

  const normalizedViewerRole = normalizeViewerRole(viewerRole);
  const trimmedReply = normalizeText(reply);

  if (action === 'reply' && !trimmedReply) {
    return { ok: false, message: 'Please write a reply before sending it.' };
  }

  let nextStatus = currentIssue.status || 'open';
  let nextAssignedTo = currentIssue.assigned_to || 'admin';

  if (normalizedViewerRole === 'admin') {
    if (action === 'escalate') {
      nextStatus = 'escalated';
      nextAssignedTo = 'super_admin';
    } else if (action === 'resolve') {
      nextStatus = 'resolved';
      nextAssignedTo = 'admin';
    } else {
      nextStatus = currentIssue.status === 'resolved' ? 'resolved' : 'open';
      nextAssignedTo = currentIssue.assigned_to === 'super_admin' ? 'super_admin' : 'admin';
    }
  } else {
    if (action === 'resolve') {
      nextStatus = 'resolved';
    } else {
      nextStatus = currentIssue.status === 'resolved' ? 'resolved' : 'escalated';
    }
    nextAssignedTo = 'super_admin';
  }

  const roleLabel = normalizedViewerRole === 'super_admin' ? 'Super Admin Reply' : 'Admin Reply';
  const nextMessage = trimmedReply
    ? appendReplyToMessage(currentIssue.message, trimmedReply, roleLabel, currentUser.name)
    : currentIssue.message;

  const updateResult = await requestSupabase(`/rest/v1/issues?id=eq.${issueId}&select=${ISSUE_SELECT}`, {
    method: 'PATCH',
    accessToken: sessionResult.session.access_token,
    headers: {
      Prefer: 'return=representation',
    },
    body: {
      message: nextMessage,
      status: nextStatus,
      assigned_to: nextAssignedTo,
    },
  });

  if (!updateResult.ok) {
    return {
      ok: false,
      message: updateResult.message || 'The issue could not be updated.',
    };
  }

  const profilesById = await fetchProfilesByIds(
    [currentIssue.user_id],
    sessionResult.session.access_token,
  );

  const updatedIssue = Array.isArray(updateResult.data) ? updateResult.data[0] : null;
  return {
    ok: true,
    issue: normalizeIssueRecord(updatedIssue, profilesById),
  };
};
