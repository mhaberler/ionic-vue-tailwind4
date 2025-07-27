import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { qrcode } from "vite-plugin-qrcode";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from '@tailwindcss/vite'

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const commitMessage = execSync("git log -1  '--pretty=%B'").toString().trim();
const branchName = execSync("git rev-parse --abbrev-ref HEAD")
  .toString()
  .trim();
const buildDate = execSync("date -u +%Y-%m-%dT%H:%M:%SZ").toString().trim();


export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(),
    qrcode(),
    devtoolsJson(),
    vueDevTools(),
    tailwindcss()
    ],
    optimizeDeps: {
      exclude: [
        '@capacitor-community/safe-area',
        '@capgo/capacitor-updater',
        'capacitor-barometer'
      ],
      include: [
        '@ionic/vue',
        '@ionic/vue/css/core.css'
      ]
    },
    build: {
      target: "esnext", // This enables BigInt support
      minify: mode === "production" ? "esbuild" : false,
      commonjsOptions: {
        include: [/node_modules/]
      }
    },
    esbuild: {
      target: "esnext", // This also needs to be set for esbuild
      supported: {
        bigint: true,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
    define: {
      // demo variable
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      __GIT_COMMIT_HASH__: JSON.stringify(commitHash),
      __GIT_COMMIT_MESSAGE__: JSON.stringify(commitMessage),
      __GIT_BRANCH_NAME__: JSON.stringify(branchName),
      __VITE_BUILD_DATE__: JSON.stringify(buildDate),
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
  };
});
