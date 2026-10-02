import { defineConfig } from "vitepress";

// Deployed as a GitHub Pages *project* site (https://<user>.github.io/react-native-peek-preview/),
// so every asset path needs the repo name as a base. If you rename the repo,
// update this to match.
export default defineConfig({
  title: "react-native-peek-preview",
  description:
    "iOS-style long-press peek preview for React Native, with a glass action menu and safe-area aware positioning.",
  base: "/react-native-peek-preview/",
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "GitHub", link: "https://github.com/nolasco7a/react-native-peek-preview" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Getting Started", link: "/guide/getting-started" }],
      },
      {
        text: "Guide",
        items: [
          { text: "Sizing & Scrolling", link: "/guide/sizing-and-scrolling" },
          { text: "Actions", link: "/guide/actions" },
          { text: "Platform Notes", link: "/guide/platform-notes" },
        ],
      },
      {
        text: "Reference",
        items: [{ text: "API", link: "/guide/api" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/nolasco7a/react-native-peek-preview" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
    },
  },
});
