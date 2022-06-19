# Note section 9

Caching For Big Performance Gains

パフォーマンス最適化のコーナー。

モジュールを取得するたびに大量のリクエストを送信している。
モジュールに必要なファイルをすべて取得するためであるが
中には同じファイルを再度ダウンロードする可能性もあり無駄も多い。

なのでこれからは

`build.onLoad()` --> `unpkg.com`という流れから

`build.onLoad()` --> `Cache` --> `unpkg.com`というように、

キャッシュ・レイヤーを追加する。

`IndexedDB`を使う...使いたいけどブラウザ内でそれを使うのは面倒であるようです

かわりに`localforage`という NPM パッケージを使う。

https://www.npmjs.com/package/localforage

#### onLoad コールバックにキャッシュ・レイヤーを設ける

簡単な使用例:

ローカルストレージのように使える

```TypeScript
import localForage from 'localforage';

const fileCache = localForage.createInstance({
    name: 'filecache',
});

(async () => {
    await fileCache.setItem('color', 'red');
    const color = await fileCache.getItem('color');
    console.log(color);
})();
```

Dev Tools `Application` の`Storage`セクションからストレージの様子がモニターできる

`Storage` `IndexedDB` `keyvaluepairs`から。

導入してみる：

- キャッシュが残っているのか確認する
- 一致するキャッシュがあればそれを返し
- なければ新たなキャッシュを保存する

```TypeScript

  build.onLoad({ filter: /.*/ }, async (args: any) => {
        //...

      // If there is cache key that same as args.path
      const cachedResult = await localForage.getItem(args.path);

      if(cachedResult) {
        // Then return it.
          return cachedResult;
      }

      // If no,
      const { data, request } = await axios.get(args.path);
      const result =  {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
      };

      // Save that result into cache and return it.
      await fileCache.setItem(args.path, result);
      return result;
  });

```

このままだと TypeError になる。

onLoad の戻り値の型と一致しない。

要は`interface onLoadResult`を満たせばいい。

型付けをした

```TypeScript

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

```

これで実行してみて Submit ボタンを押すと

ストレージに新たに保存されたパッケージが確認できる

たとえばこの後に変更を一切加えすにもう一度 Submit ボタンを押してみると、

キャッシュレイヤーが仕事をして一切リクエストが発生しなければうまくいっている。

Dev Tools の network タブから確認できる

OK

#### Bundling user input

- (esbuild の build 時に)エントリ・ポイントを受け取るようにする

```TypeScript
// index.jsx

// 変更前
const onClick = async () => {
    if (!ref.current) {
        return;
    }

    const result = await ref.current.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin()],
        // define property
        define: {
            'process.env.NODE_ENV': '"production"',
            // NOTE: globalはブラウザならwindow, Nodeならglobal
            global: 'window',
        },
    });
    setCode(result.outputFiles[0].text);
};

// 変更後

const onClick = async () => {
    if (!ref.current) {
        return;
    }

    const result = await ref.current.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        // NOTE: useStateしているinputを入力するようにした
        plugins: [unpkgPathPlugin(input)],
        // define property
        define: {
            'process.env.NODE_ENV': '"production"',
            global: 'window',
        },
    });
}

// unpkg-path-plugins.ts
//
// NOTE: 引数をとるようにした
export const unpkgPathPlugin = (inputCode: string) => {
  // ...
  build.onLoad({ filter: /.*/ }, async (args: any) => {
      console.log('onLoad', args);

      if (args.path === 'index.js') {
          return {
              loader: 'jsx',
              contents: inputCode,
          };
      }
  // ...
  }
  // ...
}
```

これで textarea に入力された内容をわりと反映するようになった

#### Breaking Up Resolve Logic with Filter

一つの onResolve()のなかに条件分岐を設けるのではなくて、

フィルタリングする対象ごとに onResolve()を設ける。

3 つに分割した

```TypeScript

export const unpkgPathPlugin = (inputCode: string) => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {

            build.onResolve({ filter: /(^index\.js$)/}, () => {
                return { path: 'index.js', namespace: 'a'};
            });

            build.onResolve({ filter: /^\.+\//}, (args: any) => {
                return {
                    namespace: 'a',
                    path: new URL(
                        args.path,
                        'https://unpkg.com' + args.resolveDir + '/'
                    ).href,
                };
            })

            build.onResolve({ filter: /.*/ }, async (args: any) => {
                return {
                    namespace: 'a',
                    path: `https://unpkg.com/${args.path}`,
                };
            });
            // ...
        }
    }
}
```

#### Refactoring to Multiple Plugins

現状の Plugin ファイルをさらに別のプラグインに分割する

```TypeScript
// feth-plugin.ts
//
// NOTE: new file added.
//
// 主にbuild.onLoad()の仕事を司る
import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache',
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        }

        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cachedResult) {
          return cachedResult;
        }
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};

// unpkg-path-plugin.ts
//
// 主にbuild.onResolve()の仕事を司ることになった
import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // Handle root entry file of 'index.js'
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // Handle relative paths in a module
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href,
        };
      });

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};


// index.jsx
//
// ２つのプラグインを扱うことになった
import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm',
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      // NOTE: 複数のプラグインを使用するようになった
      // 順番は重要
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    // console.log(result);

    setCode(result.outputFiles[0].text);
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
```

#### CSS モジュールをインポートする

ユーザがテキストエリアに CSS モジュールを import するよう書いたら...

の対処実装

JavaScript のモジュールを取得するのと何が違うのか？

それは JavaScript だと思って CSS ファイルを読み込んだから文法がおかしいというエラーになるのである。

なぜ JavaScript だと思った（JavaScript 前提な）のか？

それは plugin の`onLoadResult`で`loader`を`jsx`で指定しているからである

https://esbuild.github.io/content-types/#css

なので loader を css で指定すればいい。

問題はいま読み込んでいるファイルが jsx なのか css なのか判断しないと同じ事になることである

なので css ファイルであるかの条件分岐を設ける

```TypeScript
// fetch-plugin.ts

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {

        // ...
        const { data, request } = await axios.get(args.path);
        // 条件分岐
        const loader: esbuild.Loader = args.path.match(/.css$/) ? 'css': 'jsx';

        const result: esbuild.OnLoadResult = {
          loader: loader,
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
```

でやってみると...まだエラーが出る

「出力パスが指定されていない場合 CSS ファイルは JavaScript ファイルに import できない」という旨のエラー

https://esbuild.github.io/content-types/#css-from-js

上記の項目に

> また、JavaScript から CSS をインポートすることもできます。この場合、esbuild は与えられたエントリポイントから参照されるすべての CSS ファイルを集め、その JavaScript エントリポイントの JavaScript 出力ファイルの隣にある兄弟 CSS 出力ファイルにバンドルします。**つまり、esbuild が app.js を生成すると、app.js が参照するすべての CSS ファイルを含む app.css も生成されます。**

つまり今回使わない余計なファイルが発生してそっちに css がまとめられるのである

これだとあかんらしい。

で、css ファイルを読み込むことになったら、その内容を JavaScript が読み取って
style で JavaScript コードに突っ込んでいく(build.onLoad の戻り値の contents に突っ込んでいく)ことにする

```TypeScript
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: any) => {

        const { data, request } = await axios.get(args.path);

        const fileType: string = args.path.match(/.css$/) ? "css" : "jsx";
        const contents: string =
          fileType === "css"
            ? `
            const style = document.createElement('style');
            style.innerText = 'body { background-color: "red" }';
            document.head.appendChild(style);
        `
            : data;
        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);

        return result;
      });
```

つまり HTML の head タグ内に style タグを設けるというコードである。

先の build.onLoad の中身を...

```TypeScript
const contents: string =
    fileType === "css"
    ? `
    const style = document.createElement('style');
    style.innerText = '${data}';
    document.head.appendChild(style);
`
    : data;
```

としてみる。

すると JavaScript では無効な文字が含まれていることによるエラーが起こる

なのでエスケープする

```TypeScript
const escaped = data
    .replace(/\n/g, '')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
const contents: string =
    fileType === "css"
    ? `
    const style = document.createElement('style');
    style.innerText = '${escaped}';
    document.head.appendChild(style);
`
    : data;
```

#### リファクタリング: Extracting chaching logic

onload メソッドは return null すると、それ以降の onload メソッドを走らせない。

```TypeScript
import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

const fileCache = localForage.createInstance({
  name: "filecache",
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        // ...
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        //...
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        //...
      });
    },
  };
};

```

上記のように目祖どおが 3 つあるとして

Now we add new onlaod method on more top than another onload which gets filter parmeter with `/.*/`.

```TypeScript
const fileCache = localForage.createInstance({
  name: "filecache",
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        // ...
      });

      // NOTE: new method added with same parameter
      build.onLoad({ filter: /.*/ }, async (args: any) => {
          console.log("Didn't do anything");
          return null;
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        //...
      });

      // This also gets same parameter
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        //...
      });
    },
  };
};

```

すると、null を返す（なにもしない）onload メソッドも実行されるのがわかる。

これが何に使えるのかというと、

必ずどのメソッドでも実行される処理は上の方で定義しておけばいいということ。

```TypeScript


export const fetchPlugin = (inputCode: string) => {
    return {
        name: 'fetch-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onLoad({ filter: /(^index\.js$)/ }, () => {
                //...
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log("Didn't do anything");
                return null;
            });

            build.onLoad({ filter: /.css$/ }, async (args: any) => {

              // NOTE: 別のメソッドでも同じ処理をしている部分 ---
                const cachedResult =
                    await fileCache.getItem<esbuild.OnLoadResult>(args.path);

                if (cachedResult) {
                    return cachedResult;
                }
                // --------------------------------------------
                // ....
                return result;
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
              // NOTE: 別のメソッドでも同じ処理をしている部分 ---
                const cachedResult =
                    await fileCache.getItem<esbuild.OnLoadResult>(args.path);

                if (cachedResult) {
                    return cachedResult;
                }
                // ----------------------------------------------
                // ...
                return result;
            });
        },
    };
};
```

null を返す onload()以下のメソッドのコールバック 2 つはどちらも同じ処理を前半に行っている。

なので次の通りにすれば簡潔になる。

```TypeScript
export const fetchPlugin = (inputCode: string) => {
    return {
        name: 'fetch-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onLoad({ filter: /(^index\.js$)/ }, () => {
                // ...
            });

            // NOTE: 共通の処理をまとめる。
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                const cachedResult =
                    await fileCache.getItem<esbuild.OnLoadResult>(args.path);

                if (cachedResult) {
                    return cachedResult;
                }
            });

            build.onLoad({ filter: /.css$/ }, async (args: any) => {
              // NOTE: 上のメソッドに移して省略できた
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
              // NOTE: 上のメソッドに移して省略できた
            });
        },
    };
};

```

#### Better way to load WASM

現状だと、予め`esbuild-wasm`のパッケージ`esbuild.wasm`が public に存在しないと動かすことができない。

これは面倒なので、実行時に自動的にダウンロードするようにする。

これまた unpkg を使う。

```TypeScript
// index.jsx

const App = () => {
    const ref = useRef<any>();
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            // wasmURL: '/esbuild.wasm',
            // instead using this...
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
        });
    };
```
