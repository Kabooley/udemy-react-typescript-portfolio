# Note: React and TypeScript Build a Portfolio Project

Note entire course

## 目次

[Section-5](#Section-5)

## Section-5

#### 3 つの大きな課題

1. プレビューへ提供されるコードは string であり、それらを安全に実行できるようにしなくてはならない

2. そのコードブラウザが実行できないような高度な JavaScript 文法を使うかもしれない

3. そのコードは import を使って他のファイルを読み取る必要があるかもしれないので実行前に import 宣言を片づけなくてはならない

#### Transpile Option (codepen)

課題２について、トランスパイリングで実装すべきものを確認する

トランスパイラの中身で行っていることを理解する (ﾌｧｯ!?)

codepen の JavaScript Processor で Babel を選んで JavaScript を実行してみる

開発者ツールの network タブを見ると

コンパイルされて実行されるまでに

どんなやりとりがされているのか垣間見ることができる

そこを確認してみると、

ユーザが書き込んだ JavaScript コードなどはバックエンドサーバへ送信されて

トランスパイルされたコードが返されているのが確認できる

このプロセスを本プロジェクトでも再現する

#### Remote Transpiling (Babel.io)

意味のないコードを打つと、そのコードに関するリクエストは全く送信されない。

なので、意味のないコードなのかどうかを送信前に確認する手順があることがわかる

code はブラウザに搭載されているトランスパイラを使ってトランスパイルする

それからバックエンドサーバへ送信する

#### 50: webpack の舞台裏

common JS のモジュールを webpack で変換する場合

```JavaScript
// message.js
module.exports = "Hi, there";

// index.js
const message = require('./message');

console.log(message);
```

上記を webpack でコンパイルしてみると

```JavaScript
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/message.js":
/*!************************!*\
  !*** ./src/message.js ***!
  \************************/
/***/ ((module) => {

eval("module.exports = \"Hi, there\";\n\n//# sourceURL=webpack://bundler/./src/message.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
eval("const message = __webpack_require__(/*! ./message */ \"./src/message.js\");\r\n\r\nconsole.log(message);\n\n//# sourceURL=webpack://bundler/./src/index.js?");
})();

/******/ })()
;
```

これだと長いので、講師がわかりやすい本質的に同じことをしているコードを示した

```JavaScript
var webpack_modules = {
    "./src/message.js": (module) => {
        module.exports = "Hi, there";
    },
};

function webpack_require(moduleId) {
    var moduleFn = webpack_modules[moduleId];
    var module = { exports: {} };
    moduleFn(module);
    // 要は"Hi, there"を返している
    return module.exports;
}

const message = webpack_require('./src/message.js');
console.log(message);
```

#### 51: ES Module and webpack

今度は ES Module を webpack で変換する

```JavaScript
// message.js
export default "Hi, there";
// index.js
import { message } from "./message";

console.log(message);
```

```JavaScript
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./message */ \"./src/message.js\");\n\r\n\r\nconsole.log(_message__WEBPACK_IMPORTED_MODULE_0__.default);\r\n\n\n//# sourceURL=webpack://bundler/./src/index.js?");

/***/ }),

/***/ "./src/message.js":
/*!************************!*\
  !*** ./src/message.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (\"Hi, there\");\n\n//# sourceURL=webpack://bundler/./src/message.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
```

とにかく common JS と変わらない内容であるようです

#### 51: one small change

Bundler がおこなっていること

-   エントリーファイルの内容を読み取る
-   自動的に require/import/export の記述を探し出す
-   自動的にハードドライブ上のモジュールを探し出す
-   これらのファイルをすべて一つのファイルに、全ての変数、require/import/export 関係を正確にまとめる

今回作成しようとしているアプリケーションは、

ユーザが記述したコードに応じて

必要な npm package を自動的に import する機能が必要である

なので

ハードドライブ上のモジュールを探させるのではなくて

NPM からモジュールをインポートさせるのである

これを option 変更で webpack に命令する

#### 53: Options of Bundler

Bunlder のオプションを、ユーザの想定利用方法から３つ想定する

Option#1:

バックエンド・サーバで webpack を動作させる。

通常、インストールされていないモジュールを要求する場合エラーになる

そのエラーを回避するためにプラグインを用いる

`NpmInstallWebpackPlugin`を用いる

https://v4.webpack.js.org/plugins/npm-install-webpack-plugin/

このプラグインを使えば、

インストールしていないモジュールを要求されても、
エラーを出さないで npm インストールしてくれる

Option#2:

独自のプラグインを作成して、

新たなモジュールを要求されるたびに NPM レジストリにリクエストを送信するようにする

オプション＃１とほぼ同じ

依存関係をローカルマシンに保存しないで

かわりにレジストリに毎回連絡するという方法

Option#3

すべての処理を React アプリケーション上で行う

NPM レジストリを使う

#### 54: Which Approach

Transpiling/Bundling remotely or locally?

どちらを実装するのか検討しなくてはならない

Remote のメリット:

-   ダウンロードした NPM モジュールをキャッシュして、コードをより速くバンドルできます
-   動作の遅い端末や限られた帯域幅のインターネットしか使えない人にとっては有利

Local のメリット：

-   API サーバへリクエストを丸投げできるからコードの実行が早い
-   API サーバの手入れが不要である
-   講義では最終的にローカルを採用して開発していく

高速だから

わかっている問題：Webpack はブラウザでは正しく機能しない

#### 55: Webpack の交換

ユーザコードの入力

--> Babel でトランスパイリング

--> Webpack でバンドリング NOTE: これがうまくいかない

--> 実行用のコードの出来上がり

なので`ESBuild`を使う

ESBuild はブラウザでトランスパイリングもバンドリングもできる

めちゃ速いらしい

#### 56: A Demo App

~/jbook/

#### ESBuild

https://esbuild.github.io/

ESBuikd API を使う方法

Transform API:

ファイルを使わない

NPM モジュール `esbuild-wasm`とは：

JavaScript コードを Web-Assemby に変換して、ブラウザ内で実行可能にしてくれるもの

プロジェクトの node_module/esbuild-wasm/esbuild-wasm を public/へコピーペーストする

ファイルに wasm のモジュールをインポートする

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

#### onClick ハンドラで入力されたコードを変換させるようにする

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

#### Problems of Bundling in browser

https://esbuild.github.io/api/#transform-api

> The transform API call operates on a single string without access to a file system. This makes it ideal for use in environments without a file system (such as a browser) or as part of another tool chain. Here is what a simple transform looks like:

ブラウザのような「ファイルシステムのない」環境において、

この API をつかうといいよとのこと

https://esbuild.github.io/api/#build-api

> ビルド API 呼び出しは、ファイルシステム内の 1 つ以上のファイルに対して機能します。これにより、ファイルが相互に参照し、一緒にバンドルできるようになります。単純なビルドは次のようになります。

結局ファイルシステムに依存するよ！！

たとえば

```JavaScript
import React from 'react';
```

というコードを変換するために ESBuild が`react`というモジュールを

探し出そうとする

そのときローカルのファイルシステムから探し出そうとするよ

しかし貴方がいるのはブラウザ内であるということが重要で

ブラウザはファイルシステムにアクセスできない

なので、

ローカルのファイルシステムの代わりに NPM Registry から探しているファイルを見つけてくるようにする

講義で示した詳しいプロセス:

1. コードを読み取る

```JavaScript
import React from 'react';
```

2. ESBuild がファイルシステムを探し出そうとするときに NPM レジストリにつなげる

3. NPM レジストリから代わりにパスを探してあげてパスを ESBuild へ返す

これの実装はかなり難しいそうです

覚えておくこと

**ブラウザ内でのバンドルは困難を極める**

#### Problems about NPM

直接 NPM レジストリとやリトルすることはできない

かわりに外部のサービスを使うことになる

NPM がモジュールを呼出している様子をしることができる

https://docs.npmjs.com/cli/v8/commands/npm-view

```bash
# viewはパッケージ情報をよこせというコマンド
$ npm view react dist.tarball
```

上記を実行すると URL が得られて、
その URL から圧縮ファイルを取得できる

中身の index.js

```JavaScript
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}

```

#### NPM レジストリは ocalhost:3000 などの URL からのリクエストを拒否する

そういう仕様らしい

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

chrome dev tools のネットワークタブを開く

## まとめ section 7: Implementing In-Browser Bundling

簡潔にまとめると:

ブラウザ内でユーザが入力した JavaScript コードなどを読み取って、

バンドリング・トランスパイリングしてその結果を返す機能を実装していくよ。

バンドリングもトランスパイリングも`esbuild`にやらせるよ

`esbuild`の web-assembly と plugin を使って問題を解決するよ

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

#### ESBuild について

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

#### React Tips: 最近アップデートした render 方法

https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis

```TypeScript
// index.ts

const _root = document.getElementById("root");
if (_root) {
  const root = createRoot(_root);
  root.render(<App />);
}
```

#### Plugin と Bundling

https://esbuild.github.io/plugins/

> The plugin API is new and still experimental.

ということでまだ実験的な機能だそうです

プラグラインが行っていることは、

import/require/export の解決である

JavaScript で書いてあるけど

依存関係の解決と求められているファイルがどこにあるのか探したり

そのファイルを読み出したりするのがお仕事である

```TypeScript
import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    // build引数はバンドルプロセスの一部を操作したり干渉したりすることができる
    // buildにはonLoadとonResolveという主要メソッドを持つ
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResole', args);
        return { path: args.path, namespace: 'a' };
      });


      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        // 以下は、onLoad関数が実際に行っていることを
        // メタ表現している
        if (args.path === 'index.js') {
          // index.jsの内容はこうですと返している
          return {
            loader: 'jsx',
            contents: `
              import message from './message';
              console.log(message);
            `,
          };
        } else {
          // index.jsじゃないならこうですとも返している
          // (message.jsの内容である)
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

プラグインは`name`と`setup`からなるオブジェクトである

> ビルド API コールに配列で渡されます。セットアップ関数は、ビルド API コールのたびに一度だけ実行されます。

ESBuild Bundling Process

-   index.js の場所を特定する (Build.onResove step)

-   index.js をロードしてみる（Build.onLoad step）

-   index.js をパースして import/require/export を探す

-   探し出した import/require/export が求めているファイルを探し出す（Build.onResolve step）

-   見つけ出したファイルをロードする（Build.onLoad step）

##### onResolve callback

`onResolve`を使って追加されたコールバック関数は ESBuild がビルドするすべてのモジュールで実行される

コールバックはどうやって path を解決するかをカスタマイズできる

たとえば講義の`onResolve`では

##### onLoad

コールバック：

> onLoad を使用して追加されたコールバックは、external としてマークされていないユニークなパス/名前空間のペアごとに実行されます。
> **その仕事は、モジュールの内容を返すことと、esbuild にそれをどのように解釈するかを伝えることです。**以下は、.txt ファイルを単語の配列に変換するプラグインの例である。

コールバックオプション：

-   filter:

> すべてのコールバックは、正規表現であるフィルターを提供する必要があります。パスがこのフィルターと一致しない場合、登録されたコールバックはスキップされます。

つまりフィルタの正規表現と一致するファイルだけ相手にすると

-   namespace?:

> これはオプションです。指定されている場合、コールバックは指定された名前空間内のモジュール内のパスでのみ実行されます

たとえば`a`という namespace を指定したら、

`a`というファイル名にたいしてのみ onLoad 関数が実行される

そういう命令である

コールバックが受け取る引数：

-   path:

> これは、モジュールの完全に解決されたパスです。名前空間が file である場合はファイルシステムのパスと考えるべきですが、 それ以外の場合はどのようなパスでもかまいません。例えば、以下のサンプルの HTTP プラグインでは、 http:// で始まるパスが特別な意味を持ちます。

#### 結局プラグインでできること

つまり、import/require/export のカスタマイズができるので

通常ローカルファイルシステムにアクセスしようとする動作を変更して

unpkg へアクセスさせるように操作できる

つまりプラグインのカスタマイズが、ネットワークからモジュールを拾ってくる
方法を実装できる部分である

#### プラグインを fetch 可能にする

`unpkg-path-plugin.ts`が何をしているのか console.log で見てみよう

```console
onResolve {path: 'index.js', importer: '', namespace: '', resolveDir: ''}

onLoad {path: 'index.js', namespace: 'a'}

onResolve {path: './message', importer: 'index.js', namespace: 'a', resolveDir: ''}

onLoad {path: './message', namespace: 'a'}
```

講義の説明通り、

onResolve --> onLoad --> onResolve --> onLoad で呼び出されている

詳しく見てみると

```JavaScript
// onResolve

{
  importer: ""
  namespace: ""
  path: "index.js"
  resolveDir: ""
}
// onLoad
{
  namespace: "a"
  path: "index.js"
}
// onResolve
{
  importer: "index.js"
  namespace: "a"
  path: "./message"
  resolveDir: ""
}
// onLoad
{
  namespace: "a"
  path: "./message"
}
```

ということで、

実際に index.js と message.js しか今のところないので

この二つのファイルを読み込んでパスを解決している

`unpkg.com/tiny-test-pkg`にアクセスするようにする

ちなみに`tiny-test-pkg`は多分開発用につかえるどうでもいいモジュールだと思う

```JavaScript
module.exports = 'hi there!';
```

をとにかく返す。

実装内容：

-   onResolve で`unpkg.com/tiny-test-pkg`を import するときの path 解決を定義する
-   onLoad で、実際に`unpkg.com/tiny-test-pkg`アクセスするときに axios を使って fetch させる

```TypeScript
import * as esbuild from 'esbuild-wasm';
import axios from 'axios';

export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {
          // path解決を示すパート
            build.onResolve({ filter: /.*/ }, async (args: any) => {
                console.log('onResolve', args);
                if(args.path === 'index.js') {
                  return { path: args.path, namespace: 'a' };
                }
                // NOTE: unpkg.comでtiny-test-pkgというとりあえずのモジュールを取得してみる
                //
                // pathの解決方法はonResolveに
                else if(args.path === 'tiny-test-pkg') {
                  return { path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js', namespace: 'a'}
                }
            });

            // pathからファイルを返すパート
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log('onLoad', args);

                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        contents: `
              import message from 'tiny-test-pkg';
              console.log(message);
            `,
                    };
                };


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
```

これでモジュールをネットワークから取得できるようになった!

まとめ：

-   プラグインは ESBuild の機能をカスタマイズしたものである

-   プラグインは`name`と`setup`からなるオブジェクトである

講義ではそのオブジェクトを返す関数を定義した

-   プラグインの setup 関数は、ビルド API コールのたびに一度だけ実行されます。

つまりコマンドラインで build コマンドを打ったら、
プラグインがあれば一度だけ実行される

-   プラグインは onResolve、onLoad という 2 つの関数をもつ

#### Refactor ESBuild Plugin

args.path が未知の場合に対処する

これまで使っていた URL: https://unplkg.com/tiny-test-pkg@1.0.0/index.js

今回取得したい URL:

-   https://unplkg.com/medium-test-pkg@1.0.0/index.js
-   https://unplkg.com/medium-test-pkg@1.0.0/medium.js

```TypeScript
// mediu-test-pkg/index.jsの中身

const toUpperCase = require('./utils');

const message = 'hi there';

module.exports = toUpperCase(message);

// medium-test-pkg/utils.js

module.exports = function (str) {
  return str.toUpperCase();
};
```

これに対応するために、Build.onResolve()と Build.onLoad を次のように変更した

```TypeScript
import * as esbuild from 'esbuild-wasm';
import axios from 'axios';

export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onResolve({ filter: /.*/ }, async (args: any) => {
                console.log('onResolve', args);
                if (args.path === 'index.js') {
                    return { path: args.path, namespace: 'a' };
                }
                return {
                    namesapce: 'a',
                    // NOTE: いかなるpathを受け付けるようになった
                    path: `https://unpkg.com/${args.path}`,
                };
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log('onLoad', args);

                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        // NOTE: 'medium-test-pkg'をrequireする
                        contents: `
                          const message = require('medium-test-pkg');
                          console.log(message);
                          `,
                    };
                }
                const { data } = await axios.get(args.path);
                console.log(data);

                return {
                    loader: 'jsx',
                    contents: data,
                };
            });
        },
    };
};

```

これを実行するとエラーになる

```bash
onResolve {path: 'index.js', importer: '', namespace: '', resolveDir: ''}

onLoad {path: 'index.js', namespace: 'a'}

onResolve {path: 'medium-test-pkg', importer: 'index.js', namespace: 'a', resolveDir: ''}

onLoad {path: 'https://unpkg.com/medium-test-pkg', namespace: 'a'}

# 上記の通り、medium-test-pkgにはアクセスできている
# 以下のように出力できている

const toUpperCase = require('./utils');

const message = 'hi there';

module.exports = toUpperCase(message);

onResolve {path: './utils', importer: 'https://unpkg.com/medium-test-pkg', namespace: 'a', resolveDir: ''}

# 下記を見ると、medium-test-pkg/utils.jsではなく
# 'https://unpkg.com/./utils'というURLになっている
onLoad {path: 'https://unpkg.com/./utils', namespace: 'a'}

 /*!
 * utils <https://github.com/jonschlinkert/utils>
 *
 * Copyright (c) 2014 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = require('./lib');

onResolve {path: './lib', importer: 'https://unpkg.com/./utils', namespace: 'a', resolveDir: ''}

onLoad {path: 'https://unpkg.com/./lib', namespace: 'a'}

# ...
```

ということで、変な URL にアクセスしようとしていたと

なぜこんな URL が生成されたのか？

理由は

`https://unplkg.com/medium-test-pkg@1.0.0/index.js`のモジュールが

`require('./utils')`で要求しているから

つまり、

`https://unpkg.com/medium-test-pkg/index.js`から require を見つけた

plugin はこれの解決を試みる

onResolve()で

```JavaScript
onResolve {path: './utils', importer: 'https://unpkg.com/medium-test-pkg', namespace: 'a', resolveDir: ''}
```

と解決される

つまり、`path: './utils'`だから onLoad で取得するときには

`args.path === ./utils'`なので`https://unpkg.com/medium-test-pkg/${args.path}`にすると

先のような URL になってしまう

ほしいのは`https://unpkg.com/medium-test-pkg/utils.js`である

onResolve()でこの URL になるように調整しなくてはならない

解決へのアプローチ：

**URL オブジェクトを使う**

https://developer.mozilla.org/ja/docs/Web/API/URL

URLコンストラクタ：

```JavaScript
// Syntax
url = new URL(url, [base])
```

url: 絶対 URL または相対 URL。url が相対 URL である場合、base URL は必須である

**baseURLに/を付けるかつけないかでhrefの結果が変わる！**

```JavaScript
// /なし
new URL('./utils', 'https://unpkg.com/medium-test-pkg');
// 最後に/をつけるとhrefの解決が望みどおりになる
new URL('./utils', 'https://unpkg.com/medium-test-pkg/');
```

出力結果

```bash
# hrefの解決に違いがあることがわかる
href: "https://unpkg.com/utils"
# こっちがほしい方
href: "https://unpkg.com/medium-test-pkg/utils"
```

これを用いて相対パスの問題を解決する

```TypeScript
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args);
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };
        }

        // NOTE: 相対パス解決
        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, args.importer + '/').href,
          };
        }
          // ...
      }
      // ...
    }
    // ...
  }
  // ...
}
```

これで相対パスの解決ができた

#### Failure reason to find nested package

`nested-test-package`からutils.jsを見つける
このパッケージは、直下にindex.jsがあるわけではなくて、
下記のようにsrc/helpers/を間に挟んでいる

中身：

```bash
# meidum-test-pkg
.
｜-- medium-test-pkg/
        |
        |-- index.js
        |-- utils.js

# nested-test-pkg
.
｜-- nested-test-pkg/
        |
        |-- src/
              |
              |-- helpers/
                    |
                    |-- utils.js
```

このように今のところネストされたファイルは解決できない

なぜか？

- FOUND `const message = require('nested-test-pkg');`
- onResolve `{path: 'nested-test-pkg', importer: 'index.js'}`
- onLoad gets `{path: 'https://unplg.com/nested-test-pkg'}`
- FOUND `./helpers/utils`

NOTE: ここのimporterが正しくない
- onResolve `{path: 'helpers/utils', importer: 'https://unpkg.com/nested-tesst-pkg'}`
- onLoad `{path: 'https://unpkg.com/nested-tesst-pkg/helpers/utils'}`
- 404 そんなURLは存在しないエラー

正しくは`https://unpkg.com/nested-tesst-pkg/src/index.js`


ということで、ネストされたパッケージを見つける場合とパッケージの直下のファイルを見つけるのではアプローチが異なる

ということでアプローチ方法を区別することにした

NPMパッケージ取得アプローチの分岐：

1. packageのメインファイルをfetchするとき

`https://unpkg.com/` + package name

これまでの方法。

こんなURLになる

`https://unpkg.com/nested-test-pkg`

上記のURLは実際には次を意味する

`https://unpkg.com/nested-test-pkg/src/index.js`



2. packageの他のファイルをfetchするとき

`https://unpkg.com/` 
  + 最後のファイルが見つかったディレクトリ
  + このファイルが要求文

  新しく実装する方法。


#### 知識：HTTPのリダイレクト

https://developer.mozilla.org/ja/docs/Web/HTTP/Redirections

> URL リダイレクトは、 URL 転送とも呼ばれ、ページ、フォーム、ウェブアプリケーション全体などに二つ以上の URL のアドレスを与える技術です。 HTTP ではこの操作のために、特別な種類のレスポンスである HTTP リダイレクトを提供しています。

今回でいえば、

`https://unpkg.com/nested-test-pkg`というURLにアクセスすると

サーバから「それはここ（`https://unpkg.com/nested-test-pkg/src/index.js`）のことだからそこにアクセスして」と返事が来て

`https://unpkg.com/nested-test-pkg/src/index.js`へアクセスしなおす



#### ネストされたパッケージを取得する機能の実装

リダイレクトを検知してそこに介入する。

1. axios.getからrequestオブジェクトを取得する

リダイレクトの情報は、axiosのなかではaxios 

```TypeScript
// unpkg-path-plugins.ts

export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {

          // ...

            build.onLoad({ filter: /.*/ }, async (args: any) => {
              // ...
              // requestを取得するようにした
                const { data, request } = await axios.get(args.path);
                // ここでログを出力
                console.log(request);
                return {
                    loader: 'jsx',
                    contents: data,
                };
            });
        },
    };
};

```

コンソールログの出力結果

```JavaScript
// requestオブジェクト

XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, …}

// 中身

onabort: ƒ handleAbort()
onerror: ƒ handleError()
onload: null
onloadend: ƒ onloadend()
onloadstart: null
onprogress: null
onreadystatechange: null
ontimeout: ƒ handleTimeout()
readyState: 4
response: "const toUpperCase = require('./helpers/utils');\n\nconst message = 'hi there';\n\nmodule.exports = toUpperCase(message);\n"
responseText: "const toUpperCase = require('./helpers/utils');\n\nconst message = 'hi there';\n\nmodule.exports = toUpperCase(message);\n"
responseType: ""
// 
// NOTE: ここにレスポンスがあって、
// レスポンスにリダイレクトするURLが含まれている
// 
responseURL: "https://unpkg.com/nested-test-pkg@1.0.0/src/index.js"
responseXML: null
status: 200
statusText: ""
timeout: 0
upload: XMLHttpRequestUpload {onloadstart: null, onprogress: null, onabort: null, onerror: null, onload: null, …}
withCredentials: false
[[Prototype]]: XMLHttpRequest
```
これをURLオブジェクトでいじると

```JavaScript
// input
new URL("./", "https://unpkg.com/nested-test-pkg@1.0.0/src/index.js")

// output
URL {origin: 'https://unpkg.com', protocol: 'https:', username: '', password: '', host: 'unpkg.com', …}

// 中身
hash: ""
host: "unpkg.com"
hostname: "unpkg.com"
href: "https://unpkg.com/nested-test-pkg@1.0.0/src/"
origin: "https://unpkg.com"
password: ""
// 
// NOTE: これがほしいpath
// 
pathname: "/nested-test-pkg@1.0.0/src/"
port: ""
protocol: "https:"
search: ""
searchParams: URLSearchParams {}
username: ""
[[Prototype]]: URL
```

## まとめ ここまでのまとめ　すっごく簡単に

web上で動作するコードエディタを作る。

web上でコードを書く際に、on demandで必要なモジュールをその都度インストールするようにする

その時にぶち当たる問題:

- 1. NPMパッケージは通常ローカルファイルから探し出そうとする

  しかし今回作成するのはweb上で動作するコードエディタなので、
  ブラウザかサーバ上にモジュールパッケージがないとダメで
  ブラウザの場合、ローカルファイルにアクセスできない。

  なのでユーザが入力したコードからimport/require/exportがあったら
  都度検査して必要なモジュールをNPMレジストリから取得するようにしないといけない

- 2. webpackは１の問題のせいでバンドリングが不可能

  なのでESBuildを使う。
  ESBuildだと、開発者定義の独自pluginを導入出来て
  機能を拡張できる。
  このおかげでimport/require/exportの問題が解決できる

- 3. NPMレジストリはlocalhost:3000からのアクセスは拒否する

  つまり直接'react'くれとはNPMにリクエストできない。
  これを解決してくれるサービスがあって、
  `unpkg`という仲介してくれるサービスを使う

- 4. ESBuildのバンドリングAPIは「ローカルファイルシステム」を要求する

  つまりESBuildをそのまま使うと、結局ローカルファイルを要求されてしまうので
  このデフォ機能を回避して拡張機能を導入させる
  それがプラグイン

  import/require/exportのコードを見つけて解決しようとするときに
  プラグインが介入するようにさせる。
  (プラグインはBuild APIの呼出のたびに実行される)

- ESBuild Plugin

プラグインは次の通り。

`name`と`build`という特別な引数を持つメソッド`setup`というメソッドからなるオブジェクトである。

```JavaScript
const plugin = {
  name: 'environment',
  setup(build) {
    build.onResolve(() => {});
    build.onLoad(() => {});
  }
}
```

**build.onResolve():**

```JavaScript
  build.onResolve({ filter: /^env$/ }, args => ({
    path: args.path,
    namespace: 'env-ns',
  }))
```

`build.onResolve`は、ESBuildがビルド中に`import`ステートメントを見つけるたびに実行される。

引数にはfilterという正規表現を必ず渡す。
このfilterに一致する「呼出（つまり`import`による呼出）」を
見つけたとき（ビルド中のファイルから見つけたとき）、
`build.onResolve`のコールバック関数を実行する。

**コールバック関数はどうやってパスを解決するのかをカスタマイズできる**

コールバック関数は`path`等を含むオブジェクトを引数として受け取る

上記の例では`args`である

`path`はビルド中に読み取ったソースコードのimportで指定していた未解決のパスである。

`importer`は、解決すべきこのインポートを含むモジュールのパスである。
要は読み取っている（ビルド中の）ファイルまたはURLである。

`resolveDir`は

> これは、インポートパスをファイルシステム上の実際のパスに解決するときに使用するファイルシステムのディレクトリです。ファイル名前空間内のモジュールでは、この値のデフォルトはモジュールパスのディレクトリ部分です。仮想モジュールでは、この値のデフォルトは空ですが、オンロードコールバックは仮想モジュールに解決ディレクトリを与えることもできます。その場合、そのファイル内の未解決のパスの解決コールバックに提供されます。

最終的に、主に`path`と`namespace`を含めたオブジェクト(interface onResolveResult)を返す。

この戻り値はBuild.onLoadが受け取る。


**build.onLoad():**

`build.onLoad()`はすべてのユニークなpathとnamespaceの組み合わせのペアに対してそれぞれ実行される。

その役目はモジュールの中身とそれらをどうやって解釈するのかをESBuildに伝えることである

```TypeScript
// 例

      build.onLoad({ filter: /.*/ }, async (args: any) => {

        const { data, request } = await axios.get(args.path);
        return {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
      });
```

onLoadの引数：

filterは指定された正規表現にマッチするファイル（URL）にだけコールバック関数を実行させるフィルターである

なにをフィルタリングの対象というのは...どこのことだ？
