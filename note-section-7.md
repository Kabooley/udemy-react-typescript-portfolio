# Note Section 7

講義ノートのまとめを載せる。

## まとめ\_section7

簡潔にまとめると:

ブラウザ内でユーザが入力した JavaScript コードなどを読み取って、

バンドリング・トランスパイリングしてその結果を返す機能を実装していくよ。

バンドリングもトランスパイリングも`esbuild`にやらせるよ

`esbuild`の web-assembly と plugin を使って問題を解決するよ

[ブラウザとファイルシステムについて](#ブラウザとファイルシステムについて)
[`ESBuild`について](#`ESBuild`について)
[トランスパイリングする方法](#トランスパイリングする方法)
[バンドリング in ブラウザは困難を極める](#バンドリングinブラウザは困難を極める)
[NPM レジストリとのやりとり](#NPMレジストリとのやりとり)

#### ブラウザとファイルシステムについて

**問題：ブラウザからファイルシステムにアクセスできない**

バンドリングが行っていること 4 つ

-   エントリーファイルの内容を読み取る
-   自動的に require/import/export の記述を探し出す
-   自動的にハードドライブ上のモジュールを探し出す
-   これらのファイルをすべて一つのファイルに、全ての変数、require/import/export 関係を正確にまとめる

ということで、

バンドラーはつまり次のようなコードに出会ったら

```JavaScript
import react from 'react';
```

この`react`モジュールを、通常ローカルファイルから探し出そうとする。

つまり、NPM はファイルシステムにアクセスしているのである。

ここでの問題：

ブラウザはファイルシステムにアクセスできない。

つまりブラウザ内でバンドリングさせようとすると、ファイルシステムにアクセスできないからエラーになるよ。

つまり、

ユーザコードの入力

--> Babel でトランスパイリング

--> Webpack でバンドリング NOTE: これがうまくいかない

--> 実行用のコードの出来上がり

という流れを想定した場合、

バンドリングで躓くわけである

なので webpack は使えない（もしくは適当なオプションを与えないといけない？）

今回は`ESBuild`を使うことになった

#### `ESBuild`について

https://esbuild.github.io/

現在最も高速な JavaScritp ビルドツール

他にビルドツールは webpack や parcel とかがある。

特徴として

-   内部は Go 言語によってネイティブコードに変換されており、並列処理も得意だから超高速らしい

なので、ブラウザ内部で JavaScript コードを web-assembly に変換してブラウザ内部で実行可能なものにしてくれる

`ESBuild`は JavaScript コード内でコードを書いて使用する

```TypeScript
import * as esbuild from "esbuild-wasm";
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const App = (): JSX.Element => {
    const [input, setInput] = useState<string>('');
    const [code, setCode] = useState<string>('');

    useEffect(() => {
        startService();
    }, []);

    const startService = async () => {
        // serviceはトランスパイル、コンパイル、トランスポートに利用する
        const service = await esbuild.startService({
            worker: true,
            // public/esbuild.wasmがあるから確認してねの命令
            wasmURL: "/esbiuld.wasm"
        });
        console.log(service);
    }

    // ...

    return (
      // ...
    );
};

ReactDOM.render(<App />, document.querySelector('#root'));
```

これでじ esbuild を実行すると console.log(service)が次を出力する

```console
Object
  build: S => (g(), $.build(S))
  serve: ƒ serve(S, k)
  stop: ƒ stop()
  transform: ƒ transform(S, k)
  [[Prototype]]: Object
```

それぞれ、ビルド、サーブ、ストップ、トランスフォーム(トランスパイル)という名前の関数があることがわかる

これらの関数を使ってビルドや変換などを行っていく模様

これを使って、ユーザが textarea へ入力したコードを「変換」することができる

#### トランスパイリングする方法

wasm から必要な関数を使えるようにするために`useRef`を使う

```TypeScript
import * as esbuild from "esbuild-wasm";
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const App = (): JSX.Element => {
    const ref = useRef<any>();
    const [input, setInput] = useState<string>('');
    const [code, setCode] = useState<string>('');

    useEffect(() => {
        startService();
    }, []);

    const startService = async () => {
        // serviceはトランスパイル、コンパイル、トランスポートに利用する
        ref.current = await esbuild.startService({
            worker: true,
            // public/esbuild.wasmがあるから確認してねの命令
            wasmURL: "/esbiuld.wasm"
        });
    }

    const onClick = async (): Promise<void> => {
        if(!ref.current) return;

        const result = await ref.current.transform(input, {
            loader: 'jsx',
            target: 'es2015'
        });

        setCode(result);
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

これで textarea へ以下のコードを入力すると...

```
const App = () => <div>Hi, there</div>;
```

次が web ページへ出力される

```
const App = () => /* @__PURE__ */ React.createElement("div", null, "Hi, there");
```

トランスパイル in Browser は OK

#### バンドリング in ブラウザは困難を極める

ESBuild の Transform API はファイルシステムのない環境で使える API らしいけど
同 Build API はファイルシステムが前提である

ローカルのファイルシステムの代わりに NPM Registry から探しているファイルを見つけてくるようにする

講義で示した詳しいプロセス:

1. コードを読み取る

```JavaScript
// 例
import React from 'react';
```

2. ESBuild がファイルシステムを探し出そうとするときに NPM レジストリにつなげる

3. NPM レジストリから代わりにパスを探してあげてパスを ESBuild へ返す

#### NPM レジストリとのやりとり

直接やり取りする方法はないらしい

なぜなら NPM レジストリは localhost:3000 などの URL からのリクエストは拒否するからである

講義ではサードパーティサービスを使って代わりにリクエストをしてもらう

そこで`unpkg`を使う

https://unpkg.com/

簡単に言うと、unpkg を経由してなら取得できるらしい

```url
https://unpkg.com/react
```

という感じにすると

```JavaScript
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}

```

が得られる

なので、NPM レジストリの代わりに、unpkg.com へ

`unpkg.com/react@10.0.1`みたいに URL をリクエストして

unpkg に代わりにパッケージを取得してもらって

それをレスポンスしてもらう

このことを実現する方法

```TypeScript
import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResole', args);
        return { path: args.path, namespace: 'a' };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
              import message from './message';
              console.log(message);
            `,
          };
        } else {
          return {
            loader: 'jsx',
            contents: 'export default "hi there!"',
          };
        }
      });
    },
  };
};
```

```TypeScript
import * as esbuild from "esbuild-wasm";
import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
// import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "/esbuild.wasm",
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    // buildになった
    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
    //   さっきのpluginをつかった
      plugins: [unpkgPathPlugin()],
    });

    console.log(result);

    // result....の中にトランスパイル・バンドリングされたコードが入っている
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

const _root = document.getElementById("root");
if (_root) {
  const root = createRoot(_root);
  root.render(<App />);
}
```
