import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 45000;

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The AI server might be busy, please try again.');
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Is the API server running on port 8000?');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponseError(res) {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const err = await res.json();
      return err.detail || (err.errors ? err.errors.join('; ') : `HTTP error ${res.status}`);
    }
    const text = await res.text();
    return text || `HTTP error ${res.status}`;
  } catch {
    return `Server responded with status ${res.status}`;
  }
}

export function useAnalysis() {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const analyze = useCallback(async (endpoint, code, language) => {
    const key = endpoint;
    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const errorMsg = await parseResponseError(res);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setResults(prev => ({ ...prev, [key]: data }));
      return data;
    } catch (err) {
      setErrors(prev => ({ ...prev, [key]: err.message }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const analyzeAll = useCallback(async (code, language) => {
    setLoading(prev => ({ ...prev, all: true }));
    setErrors(prev => ({ ...prev, all: null }));

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/analyze-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      }, 60000); // 60s timeout for all analyses combined

      if (!res.ok) {
        const errorMsg = await parseResponseError(res);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setResults({
        explain:      data.explanation,
        complexity:   data.complexity,
        improvements: data.improvements,
        tests:        data.tests,
      });
      return data;
    } catch (err) {
      setErrors(prev => ({ ...prev, all: err.message }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults({});
    setErrors({});
    setLoading({});
  }, []);

  const isAnyLoading = Object.values(loading).some(Boolean);

  return { loading, results, errors, analyze, analyzeAll, clearResults, isAnyLoading };
}
