import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useAnalysis() {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const analyze = useCallback(async (endpoint, code, language) => {
    const key = endpoint;
    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
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
      const res = await fetch(`${API_BASE}/api/analyze-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
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
