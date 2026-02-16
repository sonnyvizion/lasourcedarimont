import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/lasourcedarimont/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        gitesChambres: resolve(__dirname, "gites-chambres.html"),
        laRegion: resolve(__dirname, "la-region.html")
      }
    }
  },
  server: {
    open: false
  }
});
