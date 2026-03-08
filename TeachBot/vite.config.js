// // // import { defineConfig } from 'vite'
// // // import react from '@vitejs/plugin-react'
// // // import path from 'path';
// // // // import react from '@vitejs/plugin-react'

// // // // https://vite.dev/config/
// // // export default defineConfig({
// // //   plugins: [react()],
// // //   optimizeDeps: {
// // //     include: ["react-qr-code"],
// // //     // include: ["qrcode.react"],
// // //   },
// // //   ssr: {
// // //     // noExternal: ["qrcode.react"],
// // //     noExternal: ["react-qr-code"],
// // //   },
// // //   define: {
// // //     'process.env': process.env
// // //   },
// // //   resolve: {
// // //     alias: {
// // //       '@': path.resolve(__dirname, 'src'),
// // //       // '@': path.resolve(__dirname, 'src'), // Ensure this exists
// // //     },
// // //   },
// // //   server:{
// // //     hmr:{
// // //       clientPort:5173,
// // //       protocol: 'ws',
// // //       host:'localhost'
// // //     },
// // //     watch:{
// // //       usePolling: true
// // //     }
// // //   }
// // // })


// // // // import { defineConfig } from 'vite';
// // // // import react from '@vitejs/plugin-react';


// // // // export default defineConfig({
// // // //   plugins: [react()],
  
// // // // });


// // // // export default defineConfig({
// // // //   plugins: [react()],
// // // //   resolve: {
// // // //     alias: {
// // // //       '@': path.resolve(__dirname, './src'),
// // // //     },
// // // //   },
// // // // });


// // import { defineConfig } from 'vite';
// // import react from '@vitejs/plugin-react';
// // import path from 'path';

// // export default defineConfig({
// //   plugins: [react()],
// //   optimizeDeps: {
// //     include: ['react-qr-code'],
// //   },
// //   ssr: {
// //     noExternal: ['react-qr-code'],
// //   },
// //   define: {
// //     'process.env': process.env,
// //   },
// //   resolve: {
// //     alias: {
// //       '@': path.resolve(__dirname, 'src'),
// //     },
// //   },
// //   server: {
// //     hmr: {
// //       clientPort: 5173,
// //       protocol: 'ws',
// //       host: 'localhost',
// //     },
// //     watch: {
// //       usePolling: true,
// //     },
// //   },
// //   build: {
// //     commonjsOptions: {
// //       transformMixedEsModules: true,
// //     },
// //   },
// // });


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     include: ['react-qr-code'],
//   },
//   ssr: {
//     noExternal: ['react-qr-code'],
//   },
//   define: {
//     'process.env': process.env,
//   },
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//     },
//   },
//   server: {
//     hmr: {
//       clientPort: 5173,
//       protocol: 'ws',
//       host: 'localhost',
//     },
//     watch: {
//       usePolling: true,
//     },
//   },
//   build: {
//     commonjsOptions: {
//       transformMixedEsModules: true,
//     },
//     sourcemap: true, // For debugging
//   },
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  // base: process.env.NODE_ENV === "production" ? "/" : "/",
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    // 'process.env': process.env,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    sourcemap: true,
  },
});