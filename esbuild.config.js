import { build } from 'esbuild';
build({
    entryPoints: ['src/index.browser.ts'],
    platform: 'browser',
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.browser.js',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    external: ['@genee/fetch'],
});

build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.js',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    external: ['@genee/fetch'],
});
