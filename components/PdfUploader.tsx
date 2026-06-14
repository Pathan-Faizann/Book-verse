'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookStore } from '@/store/useBookStore';

export default function PdfUploader() {
  const { setPdfFile, theme } = useBookStore();
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type === 'application/pdf') {
        setPdfFile(file);
      }
    },
    [setPdfFile]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookIcon />
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Folio
          </h1>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Premium PDF Book Reader
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Experience your documents as beautifully animated books
        </p>
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative w-full max-w-lg animate-in"
      >
        <div {...getRootProps()} className="relative w-full">
          <input {...getInputProps()} />
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, var(--accent) 15%, transparent)`,
                  border: `2px dashed var(--accent)`,
                }}
              >
                <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>
                  Drop your PDF here
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={isDragging ? { scale: 0.98 } : { scale: 1 }}
            className="relative rounded-2xl overflow-hidden cursor-default"
            style={{
              background: 'var(--bg-panel)',
              border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: '0 4px 24px var(--shadow)',
            }}
          >
            {/* Decorative books illustration */}
            <div className="pt-10 pb-4 px-8 flex justify-center">
              <BooksIllustration theme={theme} />
            </div>

            <div className="text-center px-8 pb-8">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Open a PDF to begin reading
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Drag & drop your PDF file here, or click the button below
              </p>

              <motion.button
                onClick={open}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                  boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent)',
                }}
              >
                Choose PDF File
              </motion.button>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: 'var(--bg-surface)' }}
                    >
                      {f.icon}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {f.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>


      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        Files are processed locally. Your documents never leave your device.
      </motion.p>
    </div>
  );
}

const FEATURES = [
  { icon: '📖', label: 'Page Flip' },
  { icon: '🔖', label: 'Bookmarks' },
  { icon: '🔍', label: 'Search' },
  { icon: '🌙', label: 'Themes' },
  { icon: '⌨️', label: 'Shortcuts' },
  { icon: '💾', label: 'Auto-Save' },
];

function BookIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="6" width="28" height="24" rx="3" fill="var(--accent)" opacity="0.15" />
      <rect x="6" y="8" width="10" height="20" rx="2" fill="var(--accent)" opacity="0.5" />
      <rect x="18" y="8" width="10" height="20" rx="2" fill="var(--accent)" />
      <rect x="16" y="6" width="4" height="24" rx="1" fill="var(--accent-hover)" />
    </svg>
  );
}

function BooksIllustration({ theme }: { theme: string }) {
  const colors = theme === 'vintage'
    ? ['#8b4513', '#6d3410', '#a0522d', '#5c3d1e']
    : theme === 'dark'
    ? ['#7c6af7', '#5b4fd4', '#9580ff', '#4338ca']
    : ['#4f46e5', '#7c74f5', '#312e81', '#6366f1'];

  return (
    <svg width="200" height="120" viewBox="0 0 200 120" fill="none">
      {/* Surface */}
      <rect x="10" y="105" width="180" height="4" rx="2" fill="var(--border)" />
      {/* Book 1 */}
      <rect x="20" y="45" width="22" height="60" rx="2" fill={colors[0]} />
      <rect x="20" y="45" width="4" height="60" rx="1" fill={colors[1]} />
      <rect x="28" y="55" width="10" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="28" y="60" width="8" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      {/* Book 2 - tilted */}
      <g transform="rotate(-5, 60, 75)">
        <rect x="45" y="38" width="28" height="67" rx="2" fill={colors[2]} />
        <rect x="45" y="38" width="5" height="67" rx="1" fill={colors[3]} />
        <rect x="54" y="50" width="14" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="54" y="55" width="10" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
        <rect x="54" y="60" width="12" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      </g>
      {/* Book 3 */}
      <rect x="78" y="30" width="32" height="75" rx="2" fill={colors[0]} opacity="0.8" />
      <rect x="78" y="30" width="6" height="75" rx="1" fill={colors[1]} opacity="0.8" />
      <rect x="88" y="45" width="16" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="88" y="50" width="12" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      <rect x="88" y="55" width="14" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      {/* Book 4 - small */}
      <rect x="114" y="65" width="18" height="40" rx="2" fill={colors[3]} />
      <rect x="114" y="65" width="3" height="40" rx="1" fill={colors[1]} />
      {/* Book 5 */}
      <rect x="136" y="42" width="26" height="63" rx="2" fill={colors[2]} opacity="0.9" />
      <rect x="136" y="42" width="5" height="63" rx="1" fill={colors[3]} opacity="0.9" />
      <rect x="145" y="55" width="12" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="145" y="60" width="10" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      {/* Book 6 */}
      <rect x="165" y="50" width="20" height="55" rx="2" fill={colors[0]} opacity="0.7" />
      <rect x="165" y="50" width="4" height="55" rx="1" fill={colors[1]} opacity="0.7" />
      {/* Floating particles */}
      <circle cx="100" cy="18" r="2" fill={colors[0]} opacity="0.4" />
      <circle cx="130" cy="12" r="1.5" fill={colors[2]} opacity="0.3" />
      <circle cx="70" cy="22" r="1" fill={colors[0]} opacity="0.3" />
    </svg>
  );
}