import { defineConfig } from 'vite';  
import { builtinModules } from 'node:module';  
  
export default defineConfig({  
  ssr: {  
    noExternal: true,  
  },  
  build: {  
    emptyOutDir: false,  
    ssr: 'main.tsx',  
    outDir: '../../dist/server',  
    target: 'node22',  
    sourcemap: true,  
    rollupOptions: {  
      external: [...builtinModules],  
      output: {  
        format: 'cjs',  
        entryFileNames: 'main.cjs',  
        inlineDynamicImports: true,  
      },  
    },  
  },  
}); 
