const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Terjadi kesalahan');
    err.status = res.status;
    throw err;
  }

  return data;
}

export const authApi = {
  me: () => request('/auth/me'),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const recipeApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/recipes${q ? `?${q}` : ''}`);
  },
  get: (id) => request(`/recipes/${id}`),
  create: (body) => request('/recipes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/recipes/${id}`, { method: 'DELETE' }),
  like: (id) => request(`/recipes/${id}/like`, { method: 'POST' }),
  unlike: (id) => request(`/recipes/${id}/like`, { method: 'DELETE' }),
  save: (id) => request(`/recipes/${id}/save`, { method: 'POST' }),
  unsave: (id) => request(`/recipes/${id}/save`, { method: 'DELETE' }),
  addComment: (id, content, parentId) =>
    request(`/recipes/${id}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId: parentId || null }) }),
  deleteComment: (recipeId, commentId) => request(`/recipes/${recipeId}/comments/${commentId}`, { method: 'DELETE' }),
};

export const userApi = {
  updateMe: (body) => request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  getProfile: (id) => request(`/users/${id}`),
  getUserRecipes: (id) => request(`/users/${id}/recipes`),
  searchUsers: (q = '') => request(`/users/search${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  follow: (id) => request(`/users/${id}/follow`, { method: 'POST' }),
  unfollow: (id) => request(`/users/${id}/follow`, { method: 'DELETE' }),
  mutual: () => request('/users/mutual'),
};

export const conversationApi = {
  list: () => request('/conversations'),
  unreadCount: () => request('/conversations/unread-count'),
  open: (userId) => request('/conversations', { method: 'POST', body: JSON.stringify({ userId }) }),
  messages: (id) => request(`/conversations/${id}/messages`),
  send: (id, content) => request(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  markRead: (id) => request(`/conversations/${id}/read`, { method: 'POST' }),
};

const uploadFile = (endpoint, field, file) => {
  const formData = new FormData();
  formData.append(field, file);
  return fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Gagal mengunggah foto');
      err.status = res.status;
      throw err;
    }
    return data;
  });
};

export const uploadApi = {
  avatar: (file) => uploadFile('/uploads/avatar', 'avatar', file),
  cover: (file) => uploadFile('/uploads/cover', 'cover', file),
};

export const notificationApi = {
  list: () => request('/notifications'),
  readAll: () => request('/notifications/read', { method: 'POST' }),
};
