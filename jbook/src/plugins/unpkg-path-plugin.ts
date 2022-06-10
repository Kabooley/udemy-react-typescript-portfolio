import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
    name: 'filecache',
});

(async () => {
    await fileCache.setItem('color', 'red');
    const color = await fileCache.getItem('color');
    console.log(color);
})();

export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onResolve({ filter: /.*/ }, async (args: any) => {
                console.log('onResolve', args);
                if (args.path === 'index.js') {
                    return { path: args.path, namespace: 'a' };
                }

                if (args.path.includes('./') || args.path.includes('../')) {
                    return {
                        namespace: 'a',
                        path: new URL(
                            args.path,
                            'https://unpkg.com' + args.resolveDir + '/'
                        ).href,
                    };
                }

                return {
                    namespace: 'a',
                    path: `https://unpkg.com/${args.path}`,
                };
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log('onLoad', args);

                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        contents: `
              const message = require('react-dom');
              console.log(message);
            `,
                    };
                }

                // Is there any cache key is same as args.path
                const cachedResult =
                    await localForage.getItem<esbuild.OnLoadResult>(args.path);

                if (cachedResult) {
                    return cachedResult;
                }

                // args.pathは常に一意の識別子として使える
                const { data, request } = await axios.get(args.path);
                // Genericsを指定する

                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: data,
                    resolveDir: new URL('./', request.responseURL).pathname,
                };

                // Save that result into cache and return it.
                await fileCache.setItem<esbuild.OnLoadResult>(
                    args.path,
                    result
                );
                return result;
            });
        },
    };
};
