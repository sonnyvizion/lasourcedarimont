import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/lasourcedarimont/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        gitesChambres: resolve(__dirname, "gites-chambres.html"),
        laRegion: resolve(__dirname, "la-region.html"),
        nosPartenaires: resolve(__dirname, "nos-partenaires.html"),
        restauration: resolve(__dirname, "restauration.html"),
        contact: resolve(__dirname, "contact.html"),
        mentionsLegales: resolve(__dirname, "mentions-legales.html"),
        confidentialiteCookies: resolve(__dirname, "confidentialite-cookies.html"),
        groupesSeminaires: resolve(__dirname, "groupes-seminaires.html")
      }
    }
  },
  server: {
    open: false
  }
});
