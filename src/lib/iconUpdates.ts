/**
 * Icon migrations for built-in categories.
 *
 * Changing a default icon only affects fresh installs: an existing user's
 * categories are read from storage as-is. These entries let a shipped icon
 * change reach devices that already have data, while still respecting a
 * deliberate user choice.
 *
 * A category whose stored icon still matches `from` is rewritten to `to`.
 * Anything else is left alone, so a user who picked their own icon keeps it.
 *
 * Apply steps in order, oldest first, so a chain of swaps resolves.
 */
export interface IconUpdate {
  categoryId: string;
  /** The previous default. */
  from: string;
  /** The new default. */
  to: string;
}

export const ICON_UPDATES: IconUpdate[] = [
  // Kiosk was a newspaper stand; it is now the 🏪 shop.
  { categoryId: 'kiosk', from: '📰', to: '🏪' },
  // Iris was the generic shop front and is now a bank.
  { categoryId: 'iris', from: '🏪', to: '🏦' },
];

/**
 * The icon a stored category should now use, or null to keep the stored one.
 * Never overrides an icon the user chose themselves.
 */
export function resolveIconUpdate(categoryId: string, storedIcon: string): string | null {
  let icon = storedIcon;
  let changed = false;

  for (const step of ICON_UPDATES) {
    if (step.categoryId !== categoryId || icon !== step.from) continue;
    icon = step.to;
    changed = true;
  }

  return changed ? icon : null;
}