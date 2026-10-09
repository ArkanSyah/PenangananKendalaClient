import axios from 'axios';

export async function getQuotaUsage() {
  const res = await axios.get('/admin/quota');
  return res.data.data;
}
