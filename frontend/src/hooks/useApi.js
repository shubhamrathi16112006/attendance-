import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE = 'http://localhost:5000/api';

// axios already has Authorization header set by AuthContext
// so all requests here automatically include the token

export function useApi(endpoint, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}${endpoint}`);
      setData(res.data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => { fetch(); }, [fetch, ...deps]); // eslint-disable-line

  return { data, loading, error, refetch: fetch };
}

export const api = {
  get:    (url)        => axios.get(`${BASE}${url}`),
  post:   (url, data)  => axios.post(`${BASE}${url}`, data),
  put:    (url, data)  => axios.put(`${BASE}${url}`, data),
  delete: (url)        => axios.delete(`${BASE}${url}`),
};
