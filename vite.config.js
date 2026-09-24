import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";

function getGitVersion() {
  try {
    const tag = execFileSync(
      "git",
      ["describe", "--tags", "--exact-match", "--match", "v[0-9]*", "HEAD"],
      {
        cwd: fileURLToPath(new URL(".", import.meta.url)),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();

    const version = tag.replace(/^v/, "");

    return /^\d+\.\d+\.\d+$/.test(version) ? version : "development";
  } catch {
    return "development";
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "git-version-meta",
      transformIndexHtml(html) {
        return html.replaceAll("__GIT_VERSION__", getGitVersion());
      },
    },
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
