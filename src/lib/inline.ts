const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ESCAPES[char] ?? char);
}

/** Bold, italics, and a few safe link forms used in party copy. */
export function renderInline(input: string, rsvpUrl = ''): string {
  const escaped = escapeHtml(input);
  const rsvp = escapeHtml(rsvpUrl);
  return escaped
    .replace(
      /\[([^\]]+)\]\(rsvp\)/g,
      `<a href="${rsvp}" target="_blank" rel="noopener noreferrer">$1<span class="sr-only"> (opens in a new tab)</span></a>`,
    )
    .replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1<span class="sr-only"> (opens in a new tab)</span></a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
