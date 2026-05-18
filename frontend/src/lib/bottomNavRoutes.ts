/** Routes where the bottom tab bar should be hidden (owner/admin stack). */
const HIDDEN_PREFIXES = ['/dashboard', '/admin'];

export function shouldHideBottomNav(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
