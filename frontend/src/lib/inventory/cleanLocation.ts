export function cleanMailLocation(note: string): string {
  return note.replace(/^X\d+/i, '').replace(/【位置】/g, '').trim()
}
