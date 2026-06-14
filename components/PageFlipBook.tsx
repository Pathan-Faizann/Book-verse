'use client';

import { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useBookStore } from '@/store/useBookStore';
import PageRenderer from './Pagerenderer';

const FlipBook = HTMLFlipBook as any;


export default function PageFlipBook() {
  const { currentPage, totalPages, goToPage, zoom } = useBookStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);

  const [dimensions, setDimensions] = useState({ width: 380, height: 550 });
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Measure container width and height to fit the book responsively
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // standard page aspect ratio (width / height)
      const aspect = 0.72;

      if (mobile) {
        // Single page portrait mode
        let pageW = containerWidth - 24;
        let pageH = pageW / aspect;

        // Prevent vertical overflow
        if (pageH > containerHeight - 24) {
          pageH = containerHeight - 24;
          pageW = pageH * aspect;
        }

        setDimensions({
          width: Math.max(260, Math.floor(pageW)),
          height: Math.max(380, Math.floor(pageH)),
        });
      } else {
        // Two-page spread landscape mode
        let spreadW = containerWidth - 48;
        let pageH = (spreadW / 2) / aspect;

        // Prevent vertical overflow
        if (pageH > containerHeight - 48) {
          pageH = containerHeight - 48;
          spreadW = (pageH * aspect) * 2;
        }

        const pageW = spreadW / 2;
        setDimensions({
          width: Math.max(300, Math.floor(pageW)),
          height: Math.max(420, Math.floor(pageH)),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    // Extra timeout to handle mount animations
    const timeout = setTimeout(handleResize, 250);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  // Turn to page when currentPage store state changes
  useEffect(() => {
    if (!bookRef.current) return;
    try {
      const pageFlip = bookRef.current.pageFlip();
      if (!pageFlip) return;

      const currentIdx = pageFlip.getCurrentPageIndex();
      const targetIdx = currentPage - 1;

      if (currentIdx !== targetIdx && targetIdx >= 0 && targetIdx < totalPages) {
        pageFlip.turnToPage(targetIdx);
      }
    } catch {
      // Ignore errors if pageFlip isn't fully initialized
    }
  }, [currentPage, totalPages]);

  const onFlip = (e: { data: number }) => {
    const targetPage = e.data + 1;
    if (targetPage !== currentPage && targetPage >= 1 && targetPage <= totalPages) {
      goToPage(targetPage);
    }
  };

  if (!isMounted || totalPages === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[var(--accent)] animate-spin" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Preparing your book...
          </span>
        </div>
      </div>
    );
  }

  // Create page numbers to render
  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden book-container"
    >
      <div
        className="book-scene flex items-center justify-center transition-all duration-300"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          width: isMobile ? `${dimensions.width}px` : `${dimensions.width * 2}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <FlipBook
          width={dimensions.width}
          height={dimensions.height}
          size="stretch"
          minWidth={240}
          maxWidth={800}
          minHeight={360}
          maxHeight={1100}
          drawShadow={true}
          flippingTime={600}
          usePortrait={isMobile}
          startPage={currentPage - 1}
          disableFlipByClick={false}
          showCover={!isMobile}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="book-ambient"
          ref={bookRef}
        >
          {pagesArray.map((pageNum) => {
            // Lazy loading: only render active & nearby pages
            const isPageNearby = Math.abs(pageNum - currentPage) <= 2;
            const isPriority = Math.abs(pageNum - currentPage) <= 1;

            return (
              <PageRenderer
                key={pageNum}
                pageNumber={pageNum}
                scale={1.5}
                isNearby={isPageNearby}
                priority={isPriority}
                showCurl={pageNum === currentPage && pageNum < totalPages}
                onFlipNext={() => {
                  try {
                    bookRef.current?.pageFlip()?.flipNext();
                  } catch { }
                }}
              />
            );
          })}
        </FlipBook>
      </div>
    </div>
  );
}
