import { useState } from 'react';
import { getHistory, deleteFromHistory, clearHistory, formatDate } from '../utils/history';

export default function HistoryDrawer({ onLoad, onClose }) {
  const [history, setHistory] = useState(getHistory);

  const handleLoad = (item) => {
    onLoad(item);
    onClose();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setHistory(deleteFromHistory(id));
  };

  const handleClear = () => {
    if (window.confirm('Clear all history?')) {
      setHistory(clearHistory());
    }
  };

  return (
    <>
      <div className="history-overlay" onClick={onClose} />
      <aside className="history-drawer" role="dialog" aria-label="Code History">
        <div className="drawer-header">
          <h2 className="drawer-title">
            <span>🕒</span> Code History
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              ({history.length})
            </span>
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {history.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={handleClear}>
                🗑 Clear All
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {history.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📂</span>
              <p className="empty-title">No history yet</p>
              <p className="empty-text">Analyzed snippets will appear here</p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleLoad(item)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleLoad(item)}
              >
                <div className="history-item-header">
                  <span className="history-lang-badge">{item.language}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="history-date">{formatDate(item.timestamp)}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      onClick={e => handleDelete(e, item.id)}
                      aria-label="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="history-preview">{item.preview || '(empty)'}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
