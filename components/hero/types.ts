/** Cursor state the wrapper writes and the render loop reads, once per frame. */
export interface PointerField {
  /** Normalised device coordinates, -1..1. */
  x: number;
  y: number;
  /** 0 when the cursor is away, eased to 1 while it is over the hero. */
  strength: number;
}
