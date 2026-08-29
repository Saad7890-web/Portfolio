/**
 * A typographic mark that carries no information a screen reader needs: the ↗
 * on a link whose text already says where it goes, the ↓ on a button whose
 * text already says it downloads a CV. Left in the accessible name, every one
 * of them is read out — "GitHub, north east arrow", "Backend CV, downwards
 * arrow" — so they are decoration in the markup as well as on the page.
 */
export function Glyph({ children }: { children: string }) {
  return <span aria-hidden>{children}</span>;
}
