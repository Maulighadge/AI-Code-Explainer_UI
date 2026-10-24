import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import toast, { Toaster } from 'react-hot-toast';

import { useAnalysis } from './hooks/useAnalysis';
import { saveToHistory } from './utils/history';
import ResultPanel from './components/ResultPanel';
import HistoryDrawer from './components/HistoryDrawer';

/* ── Language config ── */
const LANGUAGES = [
  { id: 'python',     label: 'Python',     icon: '🐍', ext: javascript() },
  { id: 'javascript', label: 'JavaScript', icon: '⚡', ext: javascript({ jsx: true }) },
  { id: 'go',         label: 'Go',         icon: '🐹', ext: go() },
];

const SAMPLE_CODE = {
  python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Example usage
nums = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(nums, 7))  # Output: 3`,

  javascript: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const search = debounce((query) => {
  console.log("Searching for:", query);
}, 300);`,

  go: `package main

import "fmt"

func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
	for i := 0; i < 10; i++ {
		fmt.Printf("F(%d) = %d\\n", i, fibonacci(i))
	}
}`,
};

/* ── Navbar ── */
function Navbar({ onHistoryOpen }) {
  return (
    <nav className="navbar">
      <a className="navbar-brand" href="/">
        <div className="brand-icon">⚡</div>
        <span className="brand-name">AI Code Explainer</span>
      </a>
      <div className="navbar-actions">
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          📄 API Docs
        </a>
        <button
          id="btn-open-history"
          className="btn btn-secondary btn-sm"
          onClick={onHistoryOpen}
        >
          🕒 History
        </button>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="hero-badge-dot" />
        Powered by Google Gemini 1.5 Flash
      </div>
      <h1 className="hero-title">
        Understand Any Code<br />
        <span>Instantly with AI</span>
      </h1>
      <p className="hero-subtitle">
        Paste code in Python, JavaScript, or Go — and get a line-by-line
        explanation, complexity analysis, improvement suggestions, and
        auto-generated unit tests in seconds.
      </p>
      <div className="feature-chips">
        {[
          { icon: '🔍', label: 'Line-by-Line Explanation' },
          { icon: '📊', label: 'Complexity Analysis' },
          { icon: '💡', label: 'Smart Improvements' },
          { icon: '🧪', label: 'Auto-Generated Tests' },
          { icon: '🕒', label: 'Code History' },
          { icon: '📋', label: 'One-Click Copy' },
        ].map(f => (
          <div className="chip" key={f.label}>
            <span className="chip-icon">{f.icon}</span>
            {f.label}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Main App ── */
export default function App() {
  const [language, setLanguage]     = useState('python');
  const [code, setCode]             = useState(SAMPLE_CODE.python);
  const [showHistory, setShowHistory] = useState(false);

  const langExt = LANGUAGES.find(l => l.id === language)?.ext || python();
  const { loading, results, errors, analyze, analyzeAll, clearResults, isAnyLoading } = useAnalysis();

  /* Switch language + load sample */
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    setCode(SAMPLE_CODE[lang] || '');
    clearResults();
  }, [clearResults]);

  /* Analyze all */
  const handleAnalyzeAll = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please enter some code first!');
      return;
    }
    const loadingToast = toast.loading('Running all analyses…');
    try {
      await analyzeAll(code, language);
      saveToHistory({ language, code, results });
      toast.success('Analysis complete!', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Analysis failed', { id: loadingToast });
    }
  }, [code, language, analyzeAll, results]);

  /* Individual analysis */
  const handleAnalyze = useCallback(async (endpoint) => {
    if (!code.trim()) {
      toast.error('Please enter some code first!');
      return;
    }
    try {
      await analyze(endpoint, code, language);
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    }
  }, [code, language, analyze]);

  /* Load from history */
  const handleLoadHistory = useCallback(({ code: c, language: l, results: r }) => {
    setCode(c);
    setLanguage(l);
    clearResults();
  }, [clearResults]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-normal)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
          },
        }}
      />

      <Navbar onHistoryOpen={() => setShowHistory(true)} />

      <Hero />

      {/* Action Buttons */}
      <div className="analyze-all-wrapper">
        <button
          id="btn-analyze-all"
          className="btn btn-primary"
          onClick={handleAnalyzeAll}
          disabled={isAnyLoading}
        >
          {isAnyLoading ? '⏳ Analyzing…' : '🚀 Analyze All'}
        </button>
        {[
          { endpoint: 'explain',      icon: '📖', label: 'Explain' },
          { endpoint: 'complexity',   icon: '📊', label: 'Complexity' },
          { endpoint: 'improvements', icon: '💡', label: 'Improve' },
          { endpoint: 'tests',        icon: '🧪', label: 'Tests' },
        ].map(a => (
          <button
            key={a.endpoint}
            id={`btn-analyze-${a.endpoint}`}
            className="btn btn-secondary btn-sm"
            onClick={() => handleAnalyze(a.endpoint)}
            disabled={isAnyLoading}
          >
            {loading[a.endpoint] ? '⏳' : a.icon} {a.label}
          </button>
        ))}
        {Object.keys(results).length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearResults}>
            🗑 Clear Results
          </button>
        )}
      </div>

      {/* Main Workspace */}
      <main className="workspace">
        {/* Left: Editor */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">📝 Code Editor</span>
            <div className="lang-selector" role="group" aria-label="Select language">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  id={`lang-btn-${lang.id}`}
                  className={`lang-btn${language === lang.id ? ' active' : ''}`}
                  onClick={() => handleLanguageChange(lang.id)}
                  aria-pressed={language === lang.id}
                >
                  {lang.icon} {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-wrapper">
            <div className="editor-toolbar">
              <div className="editor-dots">
                <div className="editor-dot" />
                <div className="editor-dot" />
                <div className="editor-dot" />
              </div>
              <span className="editor-label">
                {language}.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'go'}
              </span>
            </div>

            <CodeMirror
              id="code-editor"
              value={code}
              onChange={setCode}
              extensions={[
                langExt,
                EditorView.lineWrapping,
              ]}
              theme={oneDark}
              height="520px"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Quick stats */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              padding: '0 4px',
            }}
          >
            <span>Lines: {code.split('\n').length}</span>
            <span>Characters: {code.length}</span>
            <span>Language: {LANGUAGES.find(l => l.id === language)?.label}</span>
          </div>
        </div>

        {/* Right: Results */}
        <ResultPanel results={results} loading={loading} errors={errors} />
      </main>

      {/* History Drawer */}
      {showHistory && (
        <HistoryDrawer
          onLoad={handleLoadHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
