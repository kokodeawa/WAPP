import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/WAPP/', // IMPORTANTE: Este es el nombre de tu repositorio de GitHub.
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Organizador Financiero Pro',
        short_name: 'Finanzas Pro',
        description: 'Una aplicación web intuitiva para organizar tus ingresos mensuales, asignar presupuestos a diferentes categorías de gastos y visualizar la distribución de tu dinero de manera clara y efectiva.',
        theme_color: '#171717',
        background_color: '#171717',
        display: 'standalone',
        scope: '/WAPP/', // Debe coincidir con 'base'
        start_url: '/WAPP/', // Debe coincidir con 'base'
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
