require('esbuild')
    .build({
        entryPoints: ['src/index.browser.ts'],
        platform: 'browser',
        bundle: true,
        format: 'esm',
        outfile: 'dist/index.browser.mjs',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        external: ['@genee/fetch'],
    })
    .catch(() => process.exit(1));

require('esbuild')
    .build({
        entryPoints: ['src/index.browser.ts'],
        platform: 'browser',
        bundle: true,
        format: 'cjs',
        outfile: 'dist/index.browser.js',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        external: ['@genee/fetch'],
    })
    .catch(() => process.exit(1));

require('esbuild')
    .build({
        entryPoints: ['src/index.ts'],
        platform: 'node',
        bundle: true,
        format: 'esm',
        outfile: 'dist/index.mjs',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        external: ['@genee/fetch'],
    })
    .catch(() => process.exit(1));

require('esbuild')
    .build({
        entryPoints: ['src/index.ts'],
        platform: 'node',
        bundle: true,
        format: 'cjs',
        outfile: 'dist/index.js',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        external: ['@genee/fetch'],
    })
    .catch(() => process.exit(1));
