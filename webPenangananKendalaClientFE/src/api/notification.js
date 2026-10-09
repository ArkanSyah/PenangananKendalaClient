import axios from 'axios';

export async function getPreferences() {
  const res = await axios.get('/notification/preferences');
  return res.data.data;
}

export async function updatePreferences(payload) {
  const res = await axios.put('/notification/preferences', payload);
  return res.data.data;
}

export async function getNotificationLogs(page = 1) {
  const res = await axios.get('/notification/logs', { params: { page } });
  return res.data;
}
