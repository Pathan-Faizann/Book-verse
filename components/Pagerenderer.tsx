'use client';

import { useEffect, useRef, memo, useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { usePdf } from '@/hooks/usePdf';
import { useBookStore } from '@/store/useBookStore';

interface PageRendererProps {
  pageNumber: number;
  scale?: number;
  className?: string;
  showCurl?: boolean;
  onFlipNext?: () => void;
  priority?: boolean;
  isNearby?: boolean;
}

const PageRenderer = memo(forwardRef<HTMLDivElement, PageRendererProps>(
  function PageRenderer({
    pageNumber,
    scale = 1.2,
    className = '',
    showCurl = false,
    onFlipNext,
    priority = false,
    isNearby = true,
  }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { renderPage } = usePdf();
    const [rendered, setRendered] = useState(false);
    const [loading, setLoading] = useState(true);
    const { theme } = useBookStore();

    useEffect(() => {
      if (!isNearby) {
        setLoading(true);
        setRendered(false);
        return;
      }

      let cancelled = false;
      setLoading(true);
      setRendered(false);

      const render = async () => {
        if (!canvasRef.current) return;
        await renderPage(pageNumber, canvasRef.current, scale);
        if (!cancelled) {
          setLoading(false);
          setRendered(true);
        }
      };

      if (priority) {
        render();
      } else {
        const timeout = setTimeout(render, 50);
        return () => {
          cancelled = true;
          clearTimeout(timeout);
        };
      }

      return () => {
        cancelled = true;
      };
    }, [pageNumber, scale, renderPage, priority, isNearby]);

    return (
      <div
        ref={ref}
        className={`relative page-canvas-wrap w-full h-full overflow-hidden ${className} ${theme === 'vintage' ? 'paper-texture' : ''}`}
        style={{ background: 'var(--page-bg)' }}
      >
        {/* Loading skeleton */}
        {(loading || !isNearby) && (
          <div className="absolute inset-0 flex flex-col gap-3 p-6 select-none pointer-events-none">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-32 w-full rounded mt-2" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        )}

        {/* Actual PDF canvas */}
        {isNearby && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: rendered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain"
            style={{ display: 'block' }}
          />
        )}

        {/* Page shadows for depth */}
        <div className="page-shadow-left" />

        {/* Page curl */}
        {showCurl && (
          <motion.div
            className="page-curl"
            whileHover={{ scale: 1.4 }}
            onClick={onFlipNext}
            title="Next page"
          />
        )}

        {/* Vintage page number */}
        {rendered && theme === 'vintage' && (
          <div
            className="absolute bottom-4 left-0 right-0 text-center text-xs select-none"
            style={{ color: 'var(--text-muted)', fontFamily: 'serif' }}
          >
            — {pageNumber} —
          </div>
        )}
      </div>
    );
  }
));

export default PageRenderer;