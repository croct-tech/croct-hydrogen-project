import type {Config} from '@react-router/dev/config';
import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';
import {vercelPreset} from '@vercel/react-router/vite';

/**
 * React Router 7.9.x Configuration for Hydrogen
 *
 * This configuration uses the official Hydrogen preset to provide optimal
 * React Router settings for Shopify Oxygen deployment. The preset enables
 * validated performance optimizations while ensuring compatibility.
 *
 * Vercel builds use the Vercel preset instead, with the Hydrogen preset's
 * settings applied inline: the two presets cannot be combined because the
 * Hydrogen preset rejects the `serverBundles` option the Vercel preset
 * relies on.
 */
export default {
  ...(process.env.VERCEL === '1'
    ? {
        appDirectory: 'app',
        buildDirectory: 'dist',
        ssr: true,
        future: {
          v8_middleware: true,
          v8_splitRouteModules: true,
          v8_viteEnvironmentApi: false,
          unstable_optimizeDeps: true,
        },
        presets: [vercelPreset()],
      }
    : {
        presets: [hydrogenPreset()],
      }),
} satisfies Config;
