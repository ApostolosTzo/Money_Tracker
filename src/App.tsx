import { useStore } from './store/store';
import { useHorizontalSwipe } from './hooks/useGestures';
import { TabBar } from './components/TabBar';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles/global.css';

export function App() {
  const { page, swipeTo, direction } = useStore();

  // Dragging left goes forward through the pages, right goes back.
  const swipeHandlers = useHorizontalSwipe({
    onSwipeLeft: () => swipeTo(1),
    onSwipeRight: () => swipeTo(-1),
  });

  return (
    <div className="app-shell" {...swipeHandlers}>
      <div className="page-viewport" key={page} data-dir={direction === 1 ? 'fwd' : 'back'}>
        {page === 'home' ? <HomePage /> : null}
        {page === 'analytics' ? <AnalyticsPage /> : null}
        {page === 'settings' ? <SettingsPage /> : null}
      </div>
      <TabBar />
    </div>
  );
}
