import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        admin: resolve(__dirname, 'admin.html'),
        admin_dashboard: resolve(__dirname, 'admin_dashboard.html'),
        book_parcel: resolve(__dirname, 'book_parcel.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        profile: resolve(__dirname, 'profile.html'),
        reports: resolve(__dirname, 'reports.html'),
        settings: resolve(__dirname, 'settings.html'),
        track: resolve(__dirname, 'track.html'),
        users: resolve(__dirname, 'users.html'),
      },
    },
  },
});