import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <button className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
      {copied ? '✓ Copied!' : '⎘ Copy'}
    </button>
  );
}

function SkeletonLoader() {
  return (
    <div className="skeleton-lines">
      {[100, 85, 92, 70, 88, 60, 78].map((w, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

/* ── Tab: Explanation ── */
function ExplainTab({ data, loading, error }) {
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📝 Summary</h3>
        <CopyButton text={data.summary + '\n\n' + data.line_by_line} />
      </div>

      <div
        style={{
          padding: '16px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--brand-1)',
          marginBottom: 20,
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
        }}
      >
        {data.summary}
      </div>

      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
        🔍 Line-by-Line
      </h3>
      <div className="markdown-output">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.line_by_line}</ReactMarkdown>
      </div>
    </div>
  );
}

/* ── Tab: Complexity ── */
function ComplexityTab({ data, loading, error }) {
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div>
      <div className="complexity-grid">
        <div className="complexity-badge">
          <div className="complexity-label">⏱ Time Complexity</div>
          <div className="complexity-value">{data.time_complexity}</div>
        </div>
        <div className="complexity-badge">
          <div className="complexity-label">💾 Space Complexity</div>
          <div className="complexity-value">{data.space_complexity}</div>
        </div>
      </div>

      <div
        style={{
          padding: '16px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--accent-cyan)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
        }}
      >
        {data.explanation}
      </div>
    </div>
  );
}

/* ── Tab: Improvements ── */
function ImprovementsTab({ data, loading, error }) {
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>💡 Suggestions</h3>
      </div>

      <div className="markdown-output" style={{ marginBottom: 24 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.improvements}</ReactMarkdown>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>✨ Improved Code</h3>
        <CopyButton text={data.improved_code} />
      </div>
      <pre
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-code)',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {data.improved_code}
      </pre>
    </div>
  );
}

/* ── Tab: Tests ── */
function TestsTab({ data, loading, error }) {
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div>
      <div
        style={{
          padding: '14px 16px',
          background: 'rgba(0,214,143,0.08)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--accent-green)',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          marginBottom: 20,
          lineHeight: 1.7,
        }}
      >
        {data.explanation}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🧪 Unit Tests</h3>
        <CopyButton text={data.unit_tests} />
      </div>
      <pre
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-code)',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {data.unit_tests}
      </pre>
    </div>
  );
}

/* ── Error Box ── */
function ErrorBox({ message }) {
  return (
    <div
      style={{
        padding: '16px',
        background: 'rgba(255,71,87,0.08)',
        border: '1px solid rgba(255,71,87,0.25)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--accent-red)',
        fontSize: '0.875rem',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <span>⚠️</span>
      <div>
        <strong>Error:</strong> {message}
      </div>
    </div>
  );
}

/* ── Tab config ── */
const TABS = [
  { id: 'explain',      label: 'Explain',       icon: '📖', resultKey: 'explain' },
  { id: 'complexity',   label: 'Complexity',    icon: '📊', resultKey: 'complexity' },
  { id: 'improvements', label: 'Improve',       icon: '💡', resultKey: 'improvements' },
  { id: 'tests',        label: 'Tests',         icon: '🧪', resultKey: 'tests' },
];

/* ── Result Panel ── */
export default function ResultPanel({ results, loading, errors }) {
  const [activeTab, setActiveTab] = useState('explain');

  const tabData = results[activeTab];
  const tabLoading = loading[activeTab] || loading['all'] || false;
  const tabError = errors[activeTab] || errors['all'] || null;
  const hasAnyResult = Object.keys(results).length > 0;

  return (
    <div className="panel">
      {/* Tab bar */}
      <div className="tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {results[tab.id] && (
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent-green)', marginLeft: 2,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div
        className="result-panel"
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        <div className="result-header">
          <span className="result-title">
            {TABS.find(t => t.id === activeTab)?.icon}{' '}
            {TABS.find(t => t.id === activeTab)?.label}
          </span>
          {tabLoading && (
            <div className="progress-bar" style={{ width: 120 }}>
              <div className="progress-fill" />
            </div>
          )}
        </div>

        <div className="result-body">
          {!tabLoading && !tabData && !tabError && !hasAnyResult && (
            <div className="empty-state">
              <span className="empty-icon">🤖</span>
              <p className="empty-title">Ready to analyze</p>
              <p className="empty-text">
                Paste your code on the left, choose a language, then click
                &ldquo;Analyze All&rdquo; or run individual analyses.
              </p>
            </div>
          )}

          {activeTab === 'explain'      && <ExplainTab      data={tabData} loading={tabLoading} error={tabError} />}
          {activeTab === 'complexity'   && <ComplexityTab   data={tabData} loading={tabLoading} error={tabError} />}
          {activeTab === 'improvements' && <ImprovementsTab data={tabData} loading={tabLoading} error={tabError} />}
          {activeTab === 'tests'        && <TestsTab        data={tabData} loading={tabLoading} error={tabError} />}
        </div>
      </div>
    </div>
  );
}
