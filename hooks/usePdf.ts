'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { extractToc } from '@/lib/pdf';
import * as pdfjsLib from 'pdfjs-dist';

// Global PDF.js worker setup
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs';
}

export function usePdf() {
  const { pdfUrl, pdfDoc, setPdfDoc, setTotalPages, setLoading, setError, setToc } = useBookStore();
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!pdfUrl || pdfDoc || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    let cancelled = false;

    const load = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const doc = await loadingTask.promise;
        console.log("PDF Loaded successfully. Pages:", doc.numPages);

        if (cancelled) return;

        setTotalPages(doc.numPages);
        setPdfDoc(doc);

        // Extract TOC in background
        extractToc(doc).then((toc) => {
          if (!cancelled) setToc(toc);
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      loadingRef.current = false;
    };
  }, [pdfUrl, pdfDoc, setPdfDoc, setTotalPages, setLoading, setError, setToc]);

  const renderPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement, scale: number) => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch {
        // page render failed silently
      }
    },
    [pdfDoc]
  );

  return { pdfDoc, renderPage };
}