const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, init) {
  const res = await fetch(API_URL + path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  const type = res.headers.get('content-type') || '';
  return type.includes('application/json') ? res.json() : res.text();
}

export const api = {
  url: API_URL,
  dashboard: () => request('/qc_cases/dashboard'),
  allCases: () => request('/qc_cases/getallcases'),
  casesByStatus: (status) => request(`/qc_cases/getcasesbystatus?status=${status}`),
  createCase: (payload) =>
    request('/qc_cases/createcase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  updateCase: (payload) =>
    request('/qc_cases/updatecase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  deleteCase: (id) =>
    request(`/qc_cases/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  allComplaints: () => request('/complaints/all'),
  createComplaint: (formData) =>
    request('/complaints/create', { method: 'POST', body: formData }),
  deleteComplaint: (id) =>
    request(`/complaints/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  attachmentUrl: (key) =>
    request('/complaints/attachment-url?key=' + encodeURIComponent(key)),
  getBroadcast: () => request('/broadcast/state'),
  updateBroadcast: (patch) =>
    request('/broadcast/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),
  streamUrl: () => API_URL + '/broadcast/stream',
};
