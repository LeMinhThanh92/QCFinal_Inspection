import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr';
import * as path from "path";

import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(), 
        svgr({ include: "**/*.svg?react" }),
        legacy({
            targets: ['defaults', 'not IE 11', 'chrome >= 60', 'android >= 6'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime']
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@components': path.resolve(__dirname, './src/components'),
        }
    },
    optimizeDeps: {
        exclude: ['@mui/x-date-pickers/themeAugmentation'],
    },
    server: {
        port: 7780,
        host: true
    }
})
