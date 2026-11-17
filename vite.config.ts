import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Content-Security-Policy: which outside addresses the page may load or talk to.
// GitHub Pages cannot send security headers, so the policy is written into the built
// page itself. It is left out while developing because the dev server needs inline
// scripts for live reload. Keep firebase.json and public/_headers in step with it.
const FIREBASE_AUTH_DOMAIN = 'https://powermeat-8e3ff.firebaseapp.com';
const EMULATORS = process.env.VITE_USE_EMULATORS === 'true' ? ' http://127.0.0.1:8080 http://127.0.0.1:9099 ws://127.0.0.1:8080' : '';
export const CSP =
  "default-src 'self'; " +
  "script-src 'self' https://apis.google.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +
  `frame-src https://maps.google.com https://www.google.com ${FIREBASE_AUTH_DOMAIN} https://accounts.google.com; ` +
  "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com " +
  `https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com${EMULATORS}; ` +
  "object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";

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
    // GitHub Pages serves the site from a sub-folder, e.g. /Powermeat/.
    base: process.env.BASE_PATH || '/',
    plugins: [react(), tailwindcss(), cspMeta()],
    build: { sourcemap: false, chunkSizeWarningLimit: 1000 },
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
