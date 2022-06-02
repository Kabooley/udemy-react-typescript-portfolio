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


#### 50: webpackの舞台裏

common JSのモジュールをwebpackで変換する場合

```JavaScript
// message.js
module.exports = "Hi, there";

// index.js
const message = require('./message');

console.log(message);
```

上記をwebpackでコンパイルしてみると

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

今度はES Moduleをwebpackで変換する

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
とにかくcommon JSと変わらない内容であるようです


#### 51: one small change

Bundlerがおこなっていること

- エントリーファイルの内容を読み取る
- 自動的にrequire/import/exportの記述を探し出す
- 自動的にハードドライブ上のモジュールを探し出す
- これらのファイルをすべて一つのファイルに、全ての変数、require/import/export関係を正確にまとめる

今回作成しようとしているアプリケーションは、

ユーザが記述したコードに応じて

必要なnpm packageを自動的にimportする機能が必要である

なので

ハードドライブ上のモジュールを探させるのではなくて

NPMからモジュールをインポートさせるのである

これをoption変更でwebpackに命令する

#### 53: Options of Bundler

Bunlderのオプションを、ユーザの想定利用方法から３つ想定する


Option#1:

バックエンド・サーバでwebpackを動作させる。

通常、インストールされていないモジュールを要求する場合エラーになる

そのエラーを回避するためにプラグインを用いる

`NpmInstallWebpackPlugin`を用いる

https://v4.webpack.js.org/plugins/npm-install-webpack-plugin/

このプラグインを使えば、

インストールしていないモジュールを要求されても、
エラーを出さないでnpmインストールしてくれる


Option#2:

独自のプラグインを作成して、

新たなモジュールを要求されるたびにNPMレジストリにリクエストを送信するようにする

オプション＃１とほぼ同じ

依存関係をローカルマシンに保存しないで

かわりにレジストリに毎回連絡するという方法


Option#3

すべての処理をReactアプリケーション上で行う

NPMレジストリを使う



#### 54: Which Approach

Transpiling/Bundling remotely or locally?

どちらを実装するのか検討しなくてはならない

Remoteのメリット:

- ダウンロードしたNPMモジュールをキャッシュして、コードをより速くバンドルできます
- 動作の遅い端末や限られた帯域幅のインターネットしか使えない人にとっては有利

Localのメリット：

- APIサーバへリクエストを丸投げできるからコードの実行が早い
- APIサーバの手入れが不要である
- 
講義では最終的にローカルを採用して開発していく

高速だから

わかっている問題：Webpackはブラウザでは正しく機能しない

#### 55: Webpackの交換

ユーザコードの入力

--> Babelでトランスパイリング

--> Webpackでバンドリング NOTE: これがうまくいかない

--> 実行用のコードの出来上がり

なので`ESBuild`を使う

ESBuildはブラウザでトランスパイリングもバンドリングもできる

めちゃ速いらしい

#### 56: A Demo App


~/jbook/

#### ESBuild

https://esbuild.github.io/

ESBuikd APIを使う方法

Transform API:

ファイルを使わない

NPM モジュール `esbuild-wasm`とは：

JavaScriptコードをWeb-Assembyに変換して、ブラウザ内で実行可能にしてくれるもの

プロジェクトのnode_module/esbuild-wasm/esbuild-wasmをpublic/へコピーペーストする

ファイルにwasmのモジュールをインポートする

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

これでじesbuildを実行するとconsole.log(service)が次を出力する

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

これを使って、ユーザがtextareaへ入力したコードを「変換」することができる

#### onClickハンドラで入力されたコードを変換させるようにする

wasmから必要な関数を使えるようにするために`useRef`を使う

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

これでtextareaへ以下のコードを入力すると...

```
const App = () => <div>Hi, there</div>;
```
次がwebページへ出力される

```
const App = () => /* @__PURE__ */ React.createElement("div", null, "Hi, there");
```

トランスパイル in Browser はOK

#### Problems of Bundling in browser

https://esbuild.github.io/api/#transform-api

> The transform API call operates on a single string without access to a file system. This makes it ideal for use in environments without a file system (such as a browser) or as part of another tool chain. Here is what a simple transform looks like:

ブラウザのような「ファイルシステムのない」環境において、

このAPIをつかうといいよとのこと

https://esbuild.github.io/api/#build-api

> ビルドAPI呼び出しは、ファイルシステム内の1つ以上のファイルに対して機能します。これにより、ファイルが相互に参照し、一緒にバンドルできるようになります。単純なビルドは次のようになります。 

結局ファイルシステムに依存するよ！！

たとえば

```JavaScript
import React from 'react';
```

というコードを変換するためにESBuildが`react`というモジュールを

探し出そうとする

そのときローカルのファイルシステムから探し出そうとするよ

しかし貴方がいるのはブラウザ内であるということが重要で

ブラウザはファイルシステムにアクセスできない

なので、

ローカルのファイルシステムの代わりにNPM Registryから探しているファイルを見つけてくるようにする

講義で示した詳しいプロセス:

1. コードを読み取る


```JavaScript
import React from 'react';
```

2. ESBuildがファイルシステムを探し出そうとするときにNPMレジストリにつなげる

3. NPMレジストリから代わりにパスを探してあげてパスをESBuildへ返す

これの実装はかなり難しいそうです

覚えておくこと

**ブラウザ内でのバンドルは困難を極める**

#### Problems about NPM

直接NPMレジストリとやリトルすることはできない

かわりに外部のサービスを使うことになる

NPMがモジュールを呼出している様子をしることができる

https://docs.npmjs.com/cli/v8/commands/npm-view

```bash
# viewはパッケージ情報をよこせというコマンド
$ npm view react dist.tarball
```

上記を実行するとURLが得られて、
そのURLから圧縮ファイルを取得できる

中身のindex.js

```JavaScript
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}

```

#### NPMレジストリはocalhost:3000などのURLからのリクエストを拒否する

そういう仕様らしい

そこで`unpkg`を使う

https://unpkg.com/

簡単に言うと、unpkgを経由してなら取得できるらしい

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

なので、NPMレジストリの代わりに、unpkg.comへ

`unpkg.com/react@10.0.1`みたいにURLをリクエストして

unpkgに代わりにパッケージを取得してもらって

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


chrome dev toolsのネットワークタブを開く

## まとめ section 7: Implementing In-Browser Bundling

簡潔にまとめると:

ブラウザ内でユーザが入力したJavaScriptコードなどを読み取って、

バンドリング・トランスパイリングしてその結果を返す機能を実装していくよ。

バンドリングもトランスパイリングも`esbuild`にやらせるよ

`esbuild`のweb-assemblyとpluginを使って問題を解決するよ

#### ブラウザとファイルシステムについて

**問題：ブラウザからファイルシステムにアクセスできない**

バンドリングが行っていること4つ

- エントリーファイルの内容を読み取る
- 自動的にrequire/import/exportの記述を探し出す
- 自動的にハードドライブ上のモジュールを探し出す
- これらのファイルをすべて一つのファイルに、全ての変数、require/import/export関係を正確にまとめる

ということで、

バンドラーはつまり次のようなコードに出会ったら

```JavaScript
import react from 'react';
```

この`react`モジュールを、通常ローカルファイルから探し出そうとする。

つまり、NPMはファイルシステムにアクセスしているのである。

ここでの問題：

ブラウザはファイルシステムにアクセスできない。

つまりブラウザ内でバンドリングさせようとすると、ファイルシステムにアクセスできないからエラーになるよ。

つまり、

ユーザコードの入力

--> Babelでトランスパイリング

--> Webpackでバンドリング NOTE: これがうまくいかない

--> 実行用のコードの出来上がり

という流れを想定した場合、

バンドリングで躓くわけである

なのでwebpackは使えない（もしくは適当なオプションを与えないといけない？）

今回は`ESBuild`を使うことになった
#### ESBuildについて


https://esbuild.github.io/

現在最も高速なJavaScritpビルドツール

他にビルドツールはwebpackやparcelとかがある。

特徴として

- 内部はGo言語によってネイティブコードに変換されており、並列処理も得意だから超高速らしい

なので、ブラウザ内部でJavaScriptコードをweb-assemblyに変換してブラウザ内部で実行可能なものにしてくれる

`ESBuild`はJavaScriptコード内でコードを書いて使用する


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

これでじesbuildを実行するとconsole.log(service)が次を出力する

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

これを使って、ユーザがtextareaへ入力したコードを「変換」することができる


#### トランスパイリングする方法

wasmから必要な関数を使えるようにするために`useRef`を使う

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

これでtextareaへ以下のコードを入力すると...

```
const App = () => <div>Hi, there</div>;
```
次がwebページへ出力される

```
const App = () => /* @__PURE__ */ React.createElement("div", null, "Hi, there");
```

トランスパイル in Browser はOK

#### バンドリング in ブラウザは困難を極める

ESBuildのTransform APIはファイルシステムのない環境で使えるAPIらしいけど
同Build APIはファイルシステムが前提である

ローカルのファイルシステムの代わりにNPM Registryから探しているファイルを見つけてくるようにする

講義で示した詳しいプロセス:

1. コードを読み取る

```JavaScript
// 例
import React from 'react';
```

2. ESBuildがファイルシステムを探し出そうとするときにNPMレジストリにつなげる

3. NPMレジストリから代わりにパスを探してあげてパスをESBuildへ返す

#### NPMレジストリとのやりとり

直接やり取りする方法はないらしい

なぜならNPMレジストリはlocalhost:3000などのURLからのリクエストは拒否するからである

講義ではサードパーティサービスを使って代わりにリクエストをしてもらう

そこで`unpkg`を使う

https://unpkg.com/

簡単に言うと、unpkgを経由してなら取得できるらしい

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

なので、NPMレジストリの代わりに、unpkg.comへ

`unpkg.com/react@10.0.1`みたいにURLをリクエストして

unpkgに代わりにパッケージを取得してもらって

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


#### React Tips: 最近アップデートしたrender方法

https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis

```TypeScript
// index.ts

const _root = document.getElementById("root");
if (_root) {
  const root = createRoot(_root);
  root.render(<App />);
}
```