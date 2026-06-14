'use client';

import React, { useState, useEffect } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { getProgressPercent } from '@/lib/pdf';

export default function Controls() {
  const {
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
    addBookmark,
    removeBookmark,
    isBookmarked,
    fitMode,
    setFitMode,
  } = useBookStore();

  const [inputVal, setInputVal] = useState(String(currentPage));

  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  const handlePageSubmit = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      goToPage(parsed);
    } else {
      setInputVal(String(currentPage));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageSubmit();
      e.currentTarget.blur();
    }
  };

  const handleZoomOut = () => setZoom(zoom - 0.1);
  const handleZoomIn = () => setZoom(zoom + 0.1);

  const bookmarked = isBookmarked(currentPage);
  const progressPercent = getProgressPercent(currentPage, totalPages);

  const toggleBookmarkCurrentPage = () => {
    if (bookmarked) {
      removeBookmark(currentPage);
    } else {
      addBookmark(currentPage, `Page ${currentPage}`);
    }
  };

  const cycleFitMode = () => {
    if (fitMode === 'fitWidth') setFitMode('fitHeight');
    else if (fitMode === 'fitHeight') setFitMode('actualSize');
    else setFitMode('fitWidth');
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Visual Progress Bar */}
      <div className="reading-progress rounded-full overflow-hidden w-full h-[3px]">
        <div
          className="reading-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Glassmorphic Control Panel */}
      <div
        className="flex items-center justify-between gap-1 sm:gap-4 px-2 sm:px-4 py-2 rounded-2xl border transition-all duration-300 shadow-xl"
        style={{
          background: 'color-mix(in srgb, var(--bg-panel) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
          boxShadow: '0 8px 32px var(--shadow)',
        }}
      >
        {/* Left Side: Sidebar Toggles & Search */}
        <div className="flex items-center gap-1 sm:gap-2 select-none">
          <button
            onClick={toggleToc}
            title="Table of Contents"
            className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: isTocOpen ? 'var(--accent)' : 'transparent',
              color: isTocOpen ? 'white' : 'var(--text-secondary)',
            }}
          >
            <TocIcon />
          </button>
          <button
            onClick={toggleSearch}
            title="Search Document"
            className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: isSearchOpen ? 'var(--accent)' : 'transparent',
              color: isSearchOpen ? 'white' : 'var(--text-secondary)',
            }}
          >
            <SearchIcon />
          </button>
          <button
            onClick={toggleBookmarks}
            title="Bookmarks List"
            className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: isBookmarksOpen ? 'var(--accent)' : 'transparent',
              color: isBookmarksOpen ? 'white' : 'var(--text-secondary)',
            }}
          >
            <BookmarksListIcon />
          </button>
        </div>

        {/* Center: Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 select-none">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            title="Previous Page"
            className="p-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--border)] cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <ChevronLeftIcon />
          </button>

          {/* Page Input Box */}
          <div className="flex items-center gap-1 sm:gap-2 px-2.5 py-1 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={handlePageSubmit}
              onKeyDown={handleKeyDown}
              className="w-8 sm:w-10 text-center font-bold text-xs sm:text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] outline-none transition-colors"
              style={{ color: 'var(--text-primary)' }}
            />
            <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
              / {totalPages}
            </span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            title="Next Page"
            className="p-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--border)] cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Right Side: Zoom, Fit Modes, Bookmark, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2 select-none justify-end">
          {/* Zoom Controls (Hidden on ultra small screens to optimize space, buttons instead of text) */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1 rounded transition-all disabled:opacity-35 cursor-pointer outline-none"
              style={{ color: 'var(--text-secondary)' }}
            >
              <MinusIcon />
            </button>
            <span className="text-[10px] font-bold w-10 text-center" style={{ color: 'var(--text-primary)' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3.0}
              className="p-1 rounded transition-all disabled:opacity-35 cursor-pointer outline-none"
              style={{ color: 'var(--text-secondary)' }}
            >
              <PlusIcon />
            </button>
          </div>

          {/* Auto Fit Mode Selector */}
          <button
            onClick={cycleFitMode}
            title={`Reading Mode: ${fitMode === 'fitWidth' ? 'Fit Width' : fitMode === 'fitHeight' ? 'Fit Height' : 'Actual Size'}`}
            className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <FitModeIcon mode={fitMode} />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmarkCurrentPage}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
            className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              background: bookmarked ? 'var(--accent)' : 'var(--bg-surface)',
              color: bookmarked ? 'white' : 'var(--text-secondary)',
            }}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="hidden sm:flex p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none min-w-[40px] min-h-[40px] items-center justify-center"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Auto Fit Mode Icon ─────────────────────────────────────────── */

function FitModeIcon({ mode }: { mode: 'fitWidth' | 'fitHeight' | 'actualSize' }) {
  if (mode === 'fitWidth') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <polyline points="7 6 4 9 7 12" />
        <polyline points="17 12 20 9 17 6" />
      </svg>
    );
  }
  if (mode === 'fitHeight') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="4" x2="9" y2="20" />
        <line x1="15" y1="4" x2="15" y2="20" />
        <polyline points="6 7 9 4 12 7" />
        <polyline points="12 17 9 20 6 17" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="15" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">1:1</text>
    </svg>
  );
}

/* ── Inline SVG Icons ─────────────────────────────────────────── */

function TocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BookmarksListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function FullscreenExitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
    </svg>
  );
}
