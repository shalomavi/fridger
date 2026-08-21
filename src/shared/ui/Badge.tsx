type StatusTone = 'warning' | 'danger'

/** Maps a status meaning to its semantic text-color class, so amber
 * "expiring soon" / rose "error" tones aren't re-decided per call site. */
export function statusTextClass(tone: StatusTone): string {
  return tone === 'warning' ? 'text-warning' : 'text-danger'
}
