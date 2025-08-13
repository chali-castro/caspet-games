import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from "vite-plugin-vuetify";
import adsense from 'vite-plugin-adsense';

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    vue(),
    vuetify({
      autoImport: { labs: true },
    }),
    adsense({
      client: process.env.VITE_ADSENSE_CLIENT,
    })
  ],
});
