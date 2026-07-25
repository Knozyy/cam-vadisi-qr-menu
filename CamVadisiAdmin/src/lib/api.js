/**
 * Panel API istemcisi. httpOnly cerez ayni origin sayesinde otomatik gonderilir;
 * gelistirmede Vite proxy /api'yi 3001'e yonlendirir.
 */

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const options = { method, credentials: 'same-origin' };
  if (body !== undefined) {
    if (isForm) {
      options.body = body;
    } else {
      options.headers = { 'content-type': 'application/json' };
      options.body = JSON.stringify(body);
    }
  }
  const response = await fetch(`/api${path}`, options);
  if (response.status === 401) {
    throw new ApiError('Oturum sona erdi', 401);
  }
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(data?.error || `İstek başarısız (${response.status})`, response.status);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const api = {
  login: (password) => request('/admin/auth/login', { method: 'POST', body: { password } }),
  logout: () => request('/admin/auth/logout', { method: 'POST' }),
  session: () => request('/admin/auth/session'),

  menu: () => request('/admin/menu'),
  stats: () => request('/admin/stats'),
  resetStats: () => request('/admin/stats', { method: 'DELETE' }),

  createCategory: (body) => request('/admin/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/admin/categories/${id}`, { method: 'PUT', body }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
  reorderCategories: (ids) => request('/admin/categories/reorder', { method: 'POST', body: { ids } }),

  createProduct: (body) => request('/admin/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/admin/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  reorderProducts: (ids) => request('/admin/products/reorder', { method: 'POST', body: { ids } }),
  bulkPrice: (body) => request('/admin/products/bulk-price', { method: 'POST', body }),

  updateSettings: (body) => request('/admin/settings', { method: 'PUT', body }),

  upload: (formData) => request('/admin/upload', { method: 'POST', body: formData, isForm: true }),
};

/** Yedek indirmesi bir dosya akisidir; fetch yerine dogrudan yonlendirme. */
export function backupUrl() {
  return '/api/admin/backup';
}
