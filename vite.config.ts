import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// The same policy the host sends as a header (firebase.json / public/_headers), added
// to the built page as a fallback for hosts that cannot send headers. It is left out
// while developing because the dev server needs inline scripts for live reload.
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; " +
  "frame-src https://maps.google.com https://www.google.com; connect-src 'self'; object-src 'none'; " +
  "base-uri 'self'; form-action 'self'; upgrade-insecure-requests";

const cspMeta = (): Plugin => ({
  name: 'powermeat-csp-meta',
  apply: 'build',
  transformIndexHtml: html =>
    html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`
    )
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cspMeta()],
    build: { sourcemap: false },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
