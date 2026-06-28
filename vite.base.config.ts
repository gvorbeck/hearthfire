import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/*
 * Fontsource ships each @font-face with both a .woff2 and a legacy .woff src.
 * Every browser we support has handled .woff2 since 2016, so the .woff URLs are
 * dead weight: Rollup emits the extra files (~270 KB across our 5 faces) and
 * they bloat the served/cached payload. This plugin rewrites fontsource CSS to
 * keep only the woff2 src, so the .woff files are never referenced or emitted.
 */
const woff2Only = (): Plugin => ({
  name: 'fontsource-woff2-only',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource') || !id.endsWith('.css')) return null;
    // Drop the trailing ", url(...woff) format('woff')" from each src list.
    const next = code.replace(/,\s*url\([^)]+\.woff\)\s*format\(['"]woff['"]\)/g, '');
    // Guardrail: if a fontsource face still references a non-woff2 .woff after
    // the rewrite, our pattern no longer matches fontsource's output (e.g. they
    // changed the src formatting). Warn loudly so the dead .woff files don't
    // silently creep back into the bundle.
    if (/url\([^)]+\.woff\)\s*format\(['"]woff['"]\)/.test(next)) {
      this.warn(`fontsource-woff2-only: failed to strip .woff fallback in ${id}; the src format may have changed.`);
    }
    return next === code ? null : { code: next, map: null };
  },
});

export default defineConfig({
  plugins: [woff2Only(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore'],
          // The Arcana card data is large (~2,850 lines total). Major and Minor
          // are split into separate chunks so each loads only when its sub-tab
          // panel is viewed (the panels are lazy-loaded in ArcanaTab), and so
          // each caches independently of the main CharacterPlaybook chunk.
          'arcana-major-data': ['@/lib/arcanaMajor'],
          'arcana-minor-data': ['@/lib/arcanaMinor'],
        },
      },
    },
  },
});
