import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BookState, Bookmark, TocItem, Theme } from '@/types';

const initialState = {
  pdfFile: null,
  pdfUrl: null,
  fileName: '',
  totalPages: 0,
  currentPage: 1,
  zoom: 1.0,
  isFullscreen: false,
  theme: 'light' as Theme,
  isLoading: false,
  error: null,
  isTocOpen: false,
  isSearchOpen: false,
  isBookmarksOpen: false,
  bookmarks: [] as Bookmark[],
  toc: [] as TocItem[],
  searchQuery: '',
  searchResults: [] as number[],
  pdfDoc: null,
  fitMode: 'fitWidth' as 'fitWidth' | 'fitHeight' | 'actualSize',
};

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPdfDoc: (doc: any) => set({ pdfDoc: doc }),
      setFitMode: (mode: 'fitWidth' | 'fitHeight' | 'actualSize') => set({ fitMode: mode }),

      setPdfFile: (file: File) => {
        const url = URL.createObjectURL(file);
        // Check if we have saved progress for this file
        const savedPage = typeof window !== 'undefined'
          ? parseInt(localStorage.getItem(`pdf_progress_${file.name}`) || '1', 10)
          : 1;
        set({
          pdfFile: file,
          pdfUrl: url,
          fileName: file.name,
          currentPage: savedPage || 1,
          error: null,
          toc: [],
          searchQuery: '',
          searchResults: [],
        });
      },

      setTotalPages: (n: number) => set({ totalPages: n }),

      goToPage: (n: number) => {
        const { totalPages, fileName } = get();
        const clamped = Math.max(1, Math.min(n, totalPages));
        if (typeof window !== 'undefined' && fileName) {
          localStorage.setItem(`pdf_progress_${fileName}`, String(clamped));
        }
        set({ currentPage: clamped });
      },

      nextPage: () => {
        const { currentPage, totalPages, goToPage } = get();
        if (currentPage < totalPages) goToPage(currentPage + 1);
      },

      prevPage: () => {
        const { currentPage, goToPage } = get();
        if (currentPage > 1) goToPage(currentPage - 1);
      },

      setZoom: (z: number) => set({ zoom: Math.max(0.5, Math.min(3, z)) }),

      toggleFullscreen: () => {
        const { isFullscreen } = get();
        if (!isFullscreen) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        set({ isFullscreen: !isFullscreen });
      },

      setTheme: (t: Theme) => set({ theme: t }),
      setLoading: (b: boolean) => set({ isLoading: b }),
      setError: (e: string | null) => set({ error: e }),
      toggleToc: () => set((s) => ({ isTocOpen: !s.isTocOpen, isSearchOpen: false, isBookmarksOpen: false })),
      toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen, isTocOpen: false, isBookmarksOpen: false })),
      toggleBookmarks: () => set((s) => ({ isBookmarksOpen: !s.isBookmarksOpen, isTocOpen: false, isSearchOpen: false })),

      addBookmark: (page: number, label?: string) => {
        const { bookmarks } = get();
        if (bookmarks.some((b) => b.pageNumber === page)) return;
        set({
          bookmarks: [
            ...bookmarks,
            { pageNumber: page, label: label || `Page ${page}`, createdAt: Date.now() },
          ],
        });
      },

      removeBookmark: (page: number) => {
        set({ bookmarks: get().bookmarks.filter((b) => b.pageNumber !== page) });
      },

      isBookmarked: (page: number) => get().bookmarks.some((b) => b.pageNumber === page),

      setToc: (toc: TocItem[]) => set({ toc }),
      setSearchQuery: (q: string) => set({ searchQuery: q }),
      setSearchResults: (r: number[]) => set({ searchResults: r }),

      reset: () => {
        const { pdfUrl } = get();
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        set({ ...initialState, theme: get().theme });
      },
    }),
    {
      name: 'pdf-book-reader-store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => { }, removeItem: () => { } })),
      partialize: (state) => ({
        theme: state.theme,
        bookmarks: state.bookmarks,
        zoom: state.zoom,
        fitMode: state.fitMode,
      }),
    }
  )
);