'use client';

import dynamic from 'next/dynamic';
import { useBookStore } from '@/store/useBookStore';

const PdfUploader = dynamic(() => import('@/components/PdfUploader'), { ssr: false });
const BookViewer = dynamic(() => import('@/components/BookViewer'), { ssr: false });

export default function Home() {
  const { pdfUrl } = useBookStore();

  if (!pdfUrl) {
    return <PdfUploader />;
  }

  return <BookViewer />;
}