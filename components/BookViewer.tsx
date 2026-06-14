'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePdf } from '@/hooks/usePdf';
import { useBookStore } from '@/store/useBookStore';
import ThemeToggle from './ThemeToggle';
import Controls from './Controls';
import { searchPdfPages } from '@/lib/pdf';
import { AnimatePresence, motion } from 'framer-motion';

// Dynamically import PageFlipBook to avoid Next.js SSR crashes
const PageFlipBook = dynamic(() => import('./PageFlipBook'), { ssr: false });

export default function BookViewer() {
  // Trigger PDF.js loading
  const { pdfDoc } = usePdf();

  const {
    fileName,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    zoom,
    setZoom,
    isFullscreen,
    toggleFullscreen,
    isTocOpen,
    toggleToc,
    isSearchOpen,
    toggleSearch,
    isBookmarksOpen,
    toggleBookmarks,
    bookmarks,
    toc,
    addBookmark,
    removeBookmark,
    isBookmarked,
    isLoading,
    error,
    reset,
  } = useBookStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchResults, setSearchResults] = useState<number[]>([]);

  // Page jump handler that auto-closes panels on mobile
  const handlePageJump = (pageNum: number) => {
    goToPage(pageNum);
    if (window.innerWidth < 768) {
      if (isTocOpen) toggleToc();
      if (isSearchOpen) toggleSearch();
      if (isBookmarksOpen) toggleBookmarks();
    }
  };

  // Trigger search handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfDoc || !searchQuery.trim()) return;

    setSearching(true);
    setSearchProgress(0);
    setSearchResults([]);

    try {
      const results = await searchPdfPages(pdfDoc, searchQuery, (curr, tot) => {
        setSearchProgress(Math.round((curr / tot) * 100));
      });
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(zoom + 0.1);
          break;
        case '-':
        case '_':
          e.preventDefault();
          setZoom(zoom - 0.1);
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          if (isBookmarked(currentPage)) {
            removeBookmark(currentPage);
          } else {
            addBookmark(currentPage);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentPage,
    nextPage,
    prevPage,
    zoom,
    setZoom,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleFullscreen,
  ]);

  // Handle Fullscreen Exit via ESC key updating state properly
  useEffect(() => {
    const handleFsChange = () => {
      const isFsNow = !!document.fullscreenElement;
      if (isFsNow !== isFullscreen) {
        // We sync store if needed (store handles it via window listener usually)
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullscreen]);

  // Loading Screen
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center max-w-md text-center p-8 rounded-3xl border shadow-xl"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--border)',
            boxShadow: '0 10px 30px var(--shadow)',
          }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-[var(--accent)] animate-spin mb-6" />
          <h2 className="text-xl font-bold mb-2 animate-pulse" style={{ color: 'var(--text-primary)' }}>
            Opening Document
          </h2>
          <p className="text-sm truncate w-full px-4 mb-1" style={{ color: 'var(--text-secondary)' }}>
            {fileName}
          </p>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Analyzing formatting and loading pages...
          </span>
        </motion.div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md p-8 rounded-3xl border shadow-xl"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--border)',
            boxShadow: '0 10px 30px var(--shadow)',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Failed to Load PDF
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {error}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden select-none transition-colors duration-300 reader-wrap"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Top Header Navbar */}
      <header
        className="h-16 px-4 flex items-center justify-between border-b relative z-30 transition-colors duration-300"
        style={{
          background: 'var(--bg-panel)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-[var(--bg-surface)] cursor-pointer text-sm font-semibold transition-all hover:-translate-x-0.5 active:scale-95 text-[var(--text-secondary)]"
            title="Close Book"
          >
            ← Close
          </button>
          <div className="h-4 w-[1px] bg-[var(--border)] hidden sm:block" />
          <h1 className="text-sm font-bold truncate max-w-[150px] sm:max-w-[280px] md:max-w-[400px]">
            {fileName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Reading Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Table of Contents Sidebar */}
        <AnimatePresence>
          {isTocOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute md:relative inset-y-0 left-0 w-full sm:w-80 h-full border-r z-40 flex flex-col shadow-2xl md:shadow-none"
              style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm">Table of Contents</span>
                <button
                  onClick={toggleToc}
                  className="p-1 rounded hover:bg-[var(--bg-surface)] cursor-pointer outline-none"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {toc.length === 0 ? (
                  <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    No Table of Contents outline detected in this PDF document.
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {flattenToc(toc).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageJump(item.pageNumber)}
                        className={`text-left text-xs px-3 py-2.5 rounded-lg flex items-center justify-between transition-all hover:bg-[var(--bg-surface)] cursor-pointer outline-none ${currentPage === item.pageNumber ? 'font-bold' : ''
                          }`}
                        style={{
                          paddingLeft: `${item.level * 16 + 12}px`,
                          color: currentPage === item.pageNumber ? 'var(--accent)' : 'var(--text-secondary)',
                          background: currentPage === item.pageNumber ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
                        }}
                      >
                        <span className="truncate mr-4">{item.title}</span>
                        <span className="text-[10px] opacity-75 shrink-0">p. {item.pageNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Book Canvas Spread */}
        <main className="flex-1 h-full p-2 sm:p-6 md:p-8 relative flex items-center justify-center z-10">
          <PageFlipBook />
        </main>

        {/* Search Sidebar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute md:relative inset-y-0 right-0 w-full sm:w-80 h-full border-l z-40 flex flex-col shadow-2xl md:shadow-none"
              style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm">Search Document</span>
                <button
                  onClick={toggleSearch}
                  className="p-1 rounded hover:bg-[var(--bg-surface)] cursor-pointer outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Search input form */}
              <form onSubmit={handleSearchSubmit} className="p-3 border-b flex gap-2">
                <input
                  type="text"
                  placeholder="Enter keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border focus:border-[var(--accent)] outline-none transition-colors"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-3 rounded-lg text-white text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer transition-all shrink-0"
                  style={{ background: 'var(--accent)' }}
                >
                  Search
                </button>
              </form>

              {/* Search results container */}
              <div className="flex-1 overflow-y-auto p-2">
                {searching && (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-[var(--accent)] animate-spin" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Searching pages... {searchProgress}%
                    </span>
                  </div>
                )}

                {!searching && searchResults.length === 0 && searchQuery && (
                  <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}

                {!searching && searchResults.length === 0 && !searchQuery && (
                  <div className="p-8 text-center text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>
                    Type query to perform full text search...
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {searchResults.length} matches found
                    </div>
                    {searchResults.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageJump(pageNum)}
                        className={`text-left text-xs px-3 py-2.5 rounded-lg flex items-center justify-between transition-all hover:bg-[var(--bg-surface)] cursor-pointer outline-none ${currentPage === pageNum ? 'font-bold' : ''
                          }`}
                        style={{
                          color: currentPage === pageNum ? 'var(--accent)' : 'var(--text-secondary)',
                          background: currentPage === pageNum ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
                        }}
                      >
                        <span>📄 Match found on Page {pageNum}</span>
                        <span className="text-[10px] opacity-75">Go →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bookmarks Sidebar */}
        <AnimatePresence>
          {isBookmarksOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute md:relative inset-y-0 right-0 w-full sm:w-80 h-full border-l z-40 flex flex-col shadow-2xl md:shadow-none"
              style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm">Saved Bookmarks</span>
                <button
                  onClick={toggleBookmarks}
                  className="p-1 rounded hover:bg-[var(--bg-surface)] cursor-pointer outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {bookmarks.length === 0 ? (
                  <div className="p-8 text-center text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    No bookmarks saved yet. Click the bookmark icon or press <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-surface)] font-mono text-[10px]">B</kbd> to save the current page.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {bookmarks
                      .sort((a, b) => a.pageNumber - b.pageNumber)
                      .map((bookmark) => (
                        <div
                          key={bookmark.pageNumber}
                          className="flex items-center justify-between p-1.5 rounded-lg border group hover:border-[var(--accent)] transition-all"
                          style={{
                            background: 'var(--bg-surface)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <button
                            onClick={() => handlePageJump(bookmark.pageNumber)}
                            className="flex-1 text-left text-xs px-2 py-1.5 rounded outline-none cursor-pointer"
                          >
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {bookmark.label}
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Added {new Date(bookmark.createdAt).toLocaleDateString()}
                            </div>
                          </button>
                          <button
                            onClick={() => removeBookmark(bookmark.pageNumber)}
                            title="Delete Bookmark"
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg opacity-75 group-hover:opacity-100 cursor-pointer transition-all outline-none"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Control Bar */}
      <footer
        className="p-4 border-t transition-colors duration-300 relative z-30"
        style={{
          background: 'var(--bg-panel)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <Controls />
        </div>
      </footer>
    </div>
  );
}

/* ── TOC Flattening helper ────────────────────────────────────── */

interface FlatTocItem {
  title: string;
  pageNumber: number;
  level: number;
}

function flattenToc(items: any[], level = 0): FlatTocItem[] {
  let result: FlatTocItem[] = [];
  for (const item of items) {
    result.push({
      title: item.title,
      pageNumber: item.pageNumber,
      level,
    });
    if (item.items && item.items.length > 0) {
      result = result.concat(flattenToc(item.items, level + 1));
    }
  }
  return result;
}