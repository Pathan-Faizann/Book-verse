export type Theme = 'light' | 'dark' | 'vintage';

export interface Bookmark {
  pageNumber: number;
  label: string;
  createdAt: number;
}

export interface TocItem {
  title: string;
  pageNumber: number;
  level: number;
  items?: TocItem[];
}

export interface BookState {
  pdfFile: File | null;
  pdfUrl: string | null;
  fileName: string;
  totalPages: number;
  currentPage: number;
  zoom: number;
  isFullscreen: boolean;
  theme: Theme;
  isLoading: boolean;
  error: string | null;
  isTocOpen: boolean;
  isSearchOpen: boolean;
  isBookmarksOpen: boolean;
  bookmarks: Bookmark[];
  toc: TocItem[];
  searchQuery: string;
  searchResults: number[];
  pdfDoc: any | null; // Shared pdfjs doc instance
  fitMode: 'fitWidth' | 'fitHeight' | 'actualSize';

  setPdfFile: (file: File) => void;
  setTotalPages: (n: number) => void;
  goToPage: (n: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setZoom: (z: number) => void;
  toggleFullscreen: () => void;
  setTheme: (t: Theme) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
  toggleToc: () => void;
  toggleSearch: () => void;
  toggleBookmarks: () => void;
  addBookmark: (page: number, label?: string) => void;
  removeBookmark: (page: number) => void;
  isBookmarked: (page: number) => boolean;
  setToc: (toc: TocItem[]) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: number[]) => void;
  setPdfDoc: (doc: any) => void;
  setFitMode: (mode: 'fitWidth' | 'fitHeight' | 'actualSize') => void;
  reset: () => void;
}
