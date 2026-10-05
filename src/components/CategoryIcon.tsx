import type { Category } from '../types';

/**
 * iOS-style glyphs for the built-in categories.
 *
 * Emoji render in full colour and ignore CSS, so a coloured square behind a
 * colour emoji never looks like the rest of the set. These paths are solid
 * white, which lets the category colour show through the shapes and keeps all
 * nine tiles visually consistent.
 *
 * Each entry is guarded by the category's default emoji: if the user has
 * changed the icon in Settings, that choice wins and the emoji is used instead.
 */
type Glyph = { defaultEmoji: string; path: React.ReactNode };

const GLYPHS: Record<string, Glyph> = {
  coffee: {
    defaultEmoji: '☕',
    path: (
      <>
        <path d="M4.6 8.4h12v6.6a4.6 4.6 0 0 1-4.6 4.6H9.2a4.6 4.6 0 0 1-4.6-4.6V8.4Z" />
        <path
          d="M16.6 9.9h1.2a2.9 2.9 0 0 1 0 5.8h-1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
        />
        <rect x="2.8" y="20.1" width="15.6" height="2" rx="1" />
        <path
          d="M8.4 2.6c0 1.3-1.1 1.5-1.1 2.8M12.6 2.6c0 1.3-1.1 1.5-1.1 2.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    ),
  },

  food: {
    defaultEmoji: '🍔',
    path: (
      <>
        <path d="M3.4 11.6a8.6 4.5 0 0 1 17.2 0Z" />
        <rect x="2.8" y="12.7" width="18.4" height="2.7" rx="1.35" />
        <path d="M4.4 16.5h15.2a2.6 2.6 0 0 1-2.6 2.6H7a2.6 2.6 0 0 1-2.6-2.6Z" />
      </>
    ),
  },

  // Shop front, used for the kiosk/newsstand.
  kiosk: {
    defaultEmoji: '🏪',
    path: (
      <>
        <path d="M3.9 9.6 5.6 4.9h12.8l1.7 4.7Z" />
        <path
          fillRule="evenodd"
          d="M4.6 10.7h14.8v8.8h-5.5v-5.1a1.9 1.9 0 0 0-3.8 0v5.1H4.6Z"
        />
      </>
    ),
  },

  fuel: {
    defaultEmoji: '⛽',
    path: (
      <>
        <path
          fillRule="evenodd"
          d="M4.6 4.9h7.8a1.5 1.5 0 0 1 1.5 1.5v12.2a1.5 1.5 0 0 1-1.5 1.5H4.6A1.5 1.5 0 0 1 3.1 18.6V6.4a1.5 1.5 0 0 1 1.5-1.5Zm1.7 2.3v3.5h4.4V7.2Z"
        />
        <path
          d="M14.6 9.4h2.1a2.1 2.1 0 0 1 2.1 2.1v3.4h-2.1v-2.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <rect x="2.5" y="20.2" width="12" height="1.9" rx="0.95" />
      </>
    ),
  },

  cigarette: {
    defaultEmoji: '🚬',
    path: (
      <>
        <rect x="2.4" y="12.9" width="13.4" height="4.3" rx="2.15" />
        <rect x="16.1" y="12.9" width="5.5" height="4.3" rx="2.15" opacity="0.6" />
        <path
          d="M7.2 9.4c0-1.4 1.7-1.4 1.7-2.9M11.6 9.4c0-1.4 1.7-1.4 1.7-2.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    ),
  },

  // Bank building. `iris` is the category id; the bank emoji is its default.
  iris: {
    defaultEmoji: '🏦',
    path: (
      <>
        <path d="M2.6 9.3 12 3.7l9.4 5.6Z" />
        <rect x="4.4" y="10.4" width="2.5" height="6.3" rx="0.7" />
        <rect x="8.4" y="10.4" width="2.5" height="6.3" rx="0.7" />
        <rect x="12.4" y="10.4" width="2.5" height="6.3" rx="0.7" />
        <rect x="16.4" y="10.4" width="2.5" height="6.3" rx="0.7" />
        <rect x="2.4" y="17.3" width="19.2" height="2.7" rx="1" />
      </>
    ),
  },

  subscriptions: {
    defaultEmoji: '🔁',
    path: (
      <>
        <path
          d="M12 5.4a6.6 6.6 0 0 1 6.4 5.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path d="m16.3 4.2 2.5 6.6-6.6-2.5Z" />
        <path
          d="M12 18.6a6.6 6.6 0 0 1-6.4-5.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path d="M7.7 19.8 5.2 13.2l6.6 2.5Z" />
      </>
    ),
  },

  supermarket: {
    defaultEmoji: '🛒',
    path: (
      <>
        <path
          d="M2.9 4.6h2.4l2.5 9.6h9.5l2.2-7.4H6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.6" cy="19.6" r="1.7" />
        <circle cx="16.6" cy="19.6" r="1.7" />
      </>
    ),
  },

  alcohol: {
    defaultEmoji: '🍺',
    path: (
      <>
        <path d="M4.4 5.9h10.2l-.9 12.6a1.7 1.7 0 0 1-1.7 1.6H7a1.7 1.7 0 0 1-1.7-1.6Z" />
        <path
          d="M14.6 9.4h2.5a2.4 2.4 0 0 1 0 4.8h-2.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
        />
        <rect x="3" y="3.6" width="12.9" height="2.4" rx="1.2" />
      </>
    ),
  },

  other: {
    defaultEmoji: '✏️',
    path: <path d="m16.9 3.5 3.6 3.6L9.2 18.4 3.9 20l1.6-5.3Z" />,
  },
};

const PLUS = (
  <>
    <rect x="10.1" y="4.4" width="3.8" height="15.2" rx="1.9" />
    <rect x="4.4" y="10.1" width="15.2" height="3.8" rx="1.9" />
  </>
);

interface Props {
  category: Pick<Category, 'id' | 'icon'>;
  size?: number;
  className?: string;
}

/** Renders the vector glyph when one matches, otherwise falls back to the emoji. */
export function CategoryIcon({ category, size = 24, className }: Props) {
  const glyph = GLYPHS[category.id];

  // A user-edited icon always wins over the built-in glyph.
  if (!glyph || glyph.defaultEmoji !== category.icon) {
    return (
      <span className={className} style={{ fontSize: size * 0.86, lineHeight: 1 }}>
        {category.icon}
      </span>
    );
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {glyph.path}
    </svg>
  );
}

/** The dashed "add a tile" slot. */
export function PlusGlyph({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {PLUS}
    </svg>
  );
}