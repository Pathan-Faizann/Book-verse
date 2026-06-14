import type { TocItem } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function extractToc(pdf: any): Promise<TocItem[]> {
  try {
    const outline = await pdf.getOutline();
    if (!outline) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processItems = async (items: any[], level = 0): Promise<TocItem[]> => {
      const result: TocItem[] = [];
      for (const item of items) {
        let pageNumber = 1;
        try {
          if (item.dest) {
            const dest = typeof item.dest === 'string'
              ? await pdf.getDestination(item.dest)
              : item.dest;
            if (dest) {
              const pageRef = dest[0];
              const pageIdx = await pdf.getPageIndex(pageRef);
              pageNumber = pageIdx + 1;
            }
          }
        } catch {
          // ignore
        }
        const tocItem: TocItem = {
          title: item.title || 'Untitled',
          pageNumber,
          level,
        };
        if (item.items?.length > 0) {
          tocItem.items = await processItems(item.items, level + 1);
        }
        result.push(tocItem);
      }
      return result;
    };

    return processItems(outline);
  } catch {
    return [];
  }
}

export async function searchPdfPages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  query: string,
  onProgress?: (current: number, total: number) => void
): Promise<number[]> {
  if (!query.trim()) return [];
  const results: number[] = [];
  const total = pdf.numPages;
  const lowerQuery = query.toLowerCase();

  for (let i = 1; i <= total; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.str)
        .join(' ')
        .toLowerCase();
      if (text.includes(lowerQuery)) {
        results.push(i);
      }
      onProgress?.(i, total);
    } catch {
      // skip
    }
  }
  return results;
}

export function getProgressPercent(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((current - 1) / (total - 1)) * 100);
}

export function formatPageLabel(current: number, total: number): string {
  return `${current} / ${total}`;
}