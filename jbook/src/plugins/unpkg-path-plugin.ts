import * as esbuild from 'esbuild-wasm';
import axios from 'axios';

export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {
            // path解決を示すパート
            build.onResolve({ filter: /.*/ }, async (args: any) => {
                console.log('onResolve', args);
                if (args.path === 'index.js') {
                    return { path: args.path, namespace: 'a' };
                }
                // NOTE: unpkg.comでtiny-test-pkgというとりあえずのモジュールを取得してみる
                //
                // pathの解決方法はonResolveに
                else if (args.path === 'tiny-test-pkg') {
                    return {
                        path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
                        namespace: 'a',
                    };
                }
            });

            // pathからファイルを返すパート
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log('onLoad', args);

                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        // tiny-test-pkgからモジュールを取得するので以下は無効化
            //             contents: `
            //   import message from 'tiny-test-pkg';
            //   console.log(message);
            // `,
                      // 
                        contents: `
                          const message = require('tiny-test-pkg');
                          console.log(message);
                          `,
                    };
                }

                // axiosでpathからモジュールを取得する
                const { data } = await axios.get(args.path);
                console.log(data);

                // 取得したデータを返す
                return {
                    loader: 'jsx',
                    contents: data,
                };
            });
        },
    };
};
