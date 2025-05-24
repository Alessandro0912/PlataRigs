// src/lib/api.ts
import axios from 'axios';
import { supabase } from './supabase';  // falls du Token aus Supabase holst

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use(async (config) => {
  // Token aus Supabase-Session holen
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token && config.headers) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default {
  // Lager
  getLager: () => API.get('/lager'),
  addLagerItem: (item: any) => API.post('/lager', item),
  updateLagerItem: (id: string, updates: any) =>
    API.put(`/lager/${id}`, updates),
  deleteLagerItem: (id: string) => API.delete(`/lager/${id}`),

  // PC-Sets
  getPcs: () => API.get('/pcs'),
  addPc: (pc: any) => API.post('/pcs', pc),
  updatePc: (id: string, updates: any) => API.put(`/pcs/${id}`, updates),
  deletePc: (id: string) => API.delete(`/pcs/${id}`),

  // Scraper
  scrapePrice: (query: string) => API.get(`/scrape/${encodeURIComponent(query)}`),
};
