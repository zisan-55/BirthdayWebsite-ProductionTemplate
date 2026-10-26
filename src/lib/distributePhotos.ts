export type ClientPhoto = { src: string; alt?: string | null; caption?: string | null };

/** Stable round-robin order across sections; no adjacent repeats, including wrap. */
export function distributePhotos<T extends ClientPhoto>(photos: readonly T[], capacity: number): T[] {
  if (!photos.length) throw new Error("Client photos must not be empty.");
  return Array.from({ length: capacity }, (_, index) => photos[index % photos.length]);
}
