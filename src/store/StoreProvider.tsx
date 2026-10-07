import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { AppData, PageId } from '../types';
import { currentMonthKey } from '../lib/utils';
import { loadData, saveData } from '../lib/storage';
import { OTHER_CATEGORY, MAX_QUICK_TILES } from '../data/defaults';
import type { Action, AppStore } from './store';
import { StoreContext } from './store';

const PAGE_ORDER: PageId[] = ['home', 'analytics', 'settings'];

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'addEntry':
      return { ...state, entries: [action.entry, ...state.entries] };

    case 'updateEntry':
      return {
        ...state,
        entries: state.entries.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      };

    case 'deleteEntry':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) };

    case 'cancelEntry':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, cancelled: action.cancelled } : e,
        ),
      };

    case 'updateCategory':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c,
        ),
      };

    case 'addCategory':
      // The home grid is three across; the cap just bounds the row count.
      if (state.categories.length >= MAX_QUICK_TILES) return state;
      return { ...state, categories: [...state.categories, action.category] };

    case 'deleteCategory':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        // Entries survive, they just fall back to "Other".
        entries: state.entries.map((e) =>
          e.categoryId === action.id ? { ...e, categoryId: OTHER_CATEGORY.id } : e,
        ),
      };

    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'setMoods':
      return { ...state, settings: { ...state.settings, moods: action.moods } };

    case 'replaceAll':
      return action.data;

    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);
  const [page, setPageState] = useState<PageId>(data.settings.startPage);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [month, setMonth] = useState<string>(currentMonthKey);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Don't let the viewed month drift into the future after an import.
  useEffect(() => {
    const now = currentMonthKey();
    if (month > now) setMonth(now);
  }, [month]);

  const setPage = useCallback((next: PageId) => {
    setPageState((prev) => {
      if (prev === next) return prev;
      setDirection(PAGE_ORDER.indexOf(next) >= PAGE_ORDER.indexOf(prev) ? 1 : -1);
      return next;
    });
  }, []);

  /** Horizontal swipe: -1 goes back, +1 goes forward, clamped at the ends. */
  const swipeTo = useCallback((step: 1 | -1) => {
    setPageState((prev) => {
      const i = PAGE_ORDER.indexOf(prev);
      const next = PAGE_ORDER[Math.min(PAGE_ORDER.length - 1, Math.max(0, i + step))];
      if (next !== prev) setDirection(step);
      return next;
    });
  }, []);

  const value = useMemo<AppStore>(
    () => ({ ...data, dispatch, page, setPage, swipeTo, direction, month, setMonth }),
    [data, page, setPage, swipeTo, direction, month],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}