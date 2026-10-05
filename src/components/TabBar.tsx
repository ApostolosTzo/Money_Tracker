import type { PageId } from '../types';
import { useStore } from '../store/store';
import './TabBar.css';

const TABS: Array<{ id: PageId; icon: string; label: string }> = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'analytics', icon: '🧾', label: 'Analytics' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export function TabBar() {
  const { page, setPage, settings } = useStore();
  if (!settings.showTabs) return null;

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab ${page === tab.id ? 'is-active' : ''}`}
          onClick={() => setPage(tab.id)}
          aria-current={page === tab.id ? 'page' : undefined}
        >
          <span className="tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}