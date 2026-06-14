'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookStore } from '@/store/useBookStore';
import PageRenderer from './Pagerenderer';
import { getProgressPercent } from '@/lib/pdf';

interface MobilePageViewerProps {
  controlsVisible: boolean;
  setControlsVisible: (visible: boolean) => void;
}

export default function MobilePageViewer({
  controlsVisible,
  setControlsVisible,
}: MobilePageViewerProps) {
  const {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    zoom,
    setZoom,
    fitMode,
    isBookmarked,
    addBookmark,
    removeBookmark,
  } = useBookStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 320, height: 460 });
  const [direction, setDirection] = useState(0);
  const prevPageRef = useRef(currentPage);

  // Gesture refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update transition direction based on page navigation
  useEffect(() => {
    if (currentPage > prevPageRef.current) {
      setDirection(1);
    } else if (currentPage < prevPageRef.current) {
      setDirection(-1);
    }
    prevPageRef.current = currentPage;
  }, [currentPage]);

  // Calculate layout dimensions based on Fit Mode and container size
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;

      const aspect = 0.72; // Standard single page aspect ratio

      let finalW = 320;
      let finalH = 460;

      if (fitMode === 'fitWidth') {
        finalW = containerW - 24; // 12px padding on each side
        finalH = finalW / aspect;

        // Prevent excessive height
        if (fitMode !== 'actualSize' && finalH > containerH * 1.5) {
          finalH = containerH * 1.5;
          finalW = finalH * aspect;
        }
      } else if (fitMode === 'fitHeight') {
        finalH = containerH - 24; // 12px padding top/bottom
        finalW = finalH * aspect;
      } else {
        // Actual Size (standard portrait device reading layout)
        finalW = 320;
        finalH = 460;
      }

      setDimensions({
        width: Math.floor(finalW),
        height: Math.floor(finalH),
      });
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);

    // Extra triggers to capture dynamic orientation shifts
    const t1 = setTimeout(calculateSize, 100);
    const t2 = setTimeout(calculateSize, 300);

    return () => {
      window.removeEventListener('resize', calculateSize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fitMode]);

  // Bookmark Toggle action with haptic feedback helper
  const handleBookmarkToggle = () => {
    if (isBookmarked(currentPage)) {
      removeBookmark(currentPage);
    } else {
      addBookmark(currentPage, `Page ${currentPage}`);
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // Light haptic pulse
      }
    }
  };

  // Touch Event Listeners for Gestures (Tap, Double Tap, Long Press, Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();

    // Start long press timer (800ms)
    longPressTimeout.current = setTimeout(() => {
      handleBookmarkToggle();
      longPressTimeout.current = null;
    }, 800);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartX.current);
    const diffY = Math.abs(touch.clientY - touchStartY.current);

    // Cancel long press timer if the user moves their finger
    if (diffX > 10 || diffY > 10) {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;

    // 1. Swipe Navigation detection (Swipe threshold > 60px, small vertical variance)
    if (duration < 500 && Math.abs(diffY) < 80) {
      if (diffX < -60) {
        // Swipe Left -> Next Page
        nextPage();
        return;
      } else if (diffX > 60) {
        // Swipe Right -> Previous Page
        prevPage();
        return;
      }
    }

    // 2. Tap detection (no movement, duration is quick)
    if (Math.abs(diffX) < 5 && Math.abs(diffY) < 5 && duration < 250) {
      const now = Date.now();
      const doubleTapThreshold = 300; // ms

      if (now - lastTapTime.current < doubleTapThreshold) {
        // Double Tap -> Toggle Zoom (100% <=> 150%)
        setZoom(zoom > 1.0 ? 1.0 : 1.5);
      } else {
        // Single Tap -> Toggle controls visibility
        setControlsVisible(!controlsVisible);
      }
      lastTapTime.current = now;
    }
  };

  // Memoized page indicators
  const pagePercent = useMemo(() => getProgressPercent(currentPage, totalPages), [currentPage, totalPages]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full flex flex-col items-center justify-start relative select-none overflow-x-hidden overflow-y-auto"
      style={{
        padding: '12px',
        paddingTop: 'env(safe-area-inset-top, 12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      }}
    >
      {/* 3D Animated Page container with vertical scrolling support when zoomed */}
      <div
        className="relative flex items-start justify-center transition-all duration-300"
        style={{
          width: '100%',
          minHeight: '100%',
          overflowY: zoom > 1.0 ? 'auto' : 'hidden',
          paddingBottom: zoom > 1.0 ? '80px' : '0px',
        }}
      >
        <div
          className="relative transition-all duration-300 flex items-center justify-center"
          style={{
            width: `${dimensions.width * zoom}px`,
            height: `${dimensions.height * zoom}px`,
            maxHeight: zoom > 1.0 ? 'none' : '100%',
          }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? '100%' : '-100%',
                  rotateY: dir > 0 ? 35 : -35,
                  opacity: 0.2,
                  transformOrigin: dir > 0 ? 'left center' : 'right center',
                }),
                center: {
                  x: 0,
                  rotateY: 0,
                  opacity: 1,
                  transformOrigin: 'center center',
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? '-100%' : '100%',
                  rotateY: dir > 0 ? -35 : 35,
                  opacity: 0.2,
                  transformOrigin: dir > 0 ? 'right center' : 'left center',
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 28 },
                rotateY: { duration: 0.35 },
                opacity: { duration: 0.25 },
              }}
              style={{
                perspective: 1200,
                transformStyle: 'preserve-3d',
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              <PageRenderer
                pageNumber={currentPage}
                scale={1.5}
                isNearby={true}
                priority={true}
                className="rounded-2xl border shadow-xl transition-all"
                showCurl={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Compact Reading Progress Card (Visible when controls toolbar is hidden) */}
      <AnimatePresence>
        {!controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 px-4 py-2 rounded-full border shadow-md backdrop-blur-md select-none pointer-events-none z-50 text-[10px] font-bold tracking-wider"
            style={{
              background: 'color-mix(in srgb, var(--bg-panel) 85%, transparent)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              boxShadow: '0 4px 12px var(--shadow)',
            }}
          >
            Page {currentPage} / {totalPages} ({pagePercent}%)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
