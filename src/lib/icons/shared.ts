const EMOJI_RE = /\p{Extended_Pictographic}/u;

/** Un modelo puede devolver texto suelto; solo aceptamos un emoji corto de verdad. */
export function isEmoji(value: string): boolean {
  return value.length > 0 && value.length <= 8 && EMOJI_RE.test(value);
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
