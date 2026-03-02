export interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split('\n');
  const idCounts = new Map<string, number>();

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const baseId = slugify(text);
      const count = idCounts.get(baseId) ?? 0;
      idCounts.set(baseId, count + 1);
      headings.push({
        id: count === 0 ? baseId : `${baseId}-${count}`,
        text,
        level,
      });
    }
  }

  return headings;
}
