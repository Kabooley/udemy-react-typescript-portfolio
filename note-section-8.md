# Note Section 8

講義ノートのまとめをここに載せる。

要まとめ：

TODO: 相対パスの解決方法の話
TODO: URL オブジェクトの話
TODO: ネストされたモジュールのパス解決の話

[相対パスの解決](#相対パスの解決)
[URL オブジェクト](#URLオブジェクト)
[ネストされたパスの解決](#ネストされたパスの解決)
[process.env.NODE_ENV](#process.env.NODE_ENV)

## まとめ\_section8

title: Dynamic Fetching and Loading NPM Package

動的に、ユーザが入力した import/require/export を読み取って、
要求されたモジュールを NPM レジストリから取得するための方法を学んだので
そのまとめ。

section-7 まででは、

NPM パッケージを NPM レジストリから直接取得するのは不可能で、代わりに unpkg というサービスを利用するところまで来た。

そのために section-8 では ESbuild プラグインを使い倒して、

unpkg を経由しながら、動的にユーザがテキストエリアに入力した JavaScript コードを読み取って

`import/require/export`のモジュール要求を解決していく。

#### ESBuild Plug-in の機能簡単に

まず section-7 まででビルドとトランスパイルする方法を確認した。

プラグインとは、

> プラグイン API を使用すると、ビルドプロセスのさまざまな部分にコードを挿入できます。

とあるように、

プラグインは ESBuild のビルド中に実行される、（ビルドの内容を）カスタマイズ可能にするものである。

- プラグインとは：

オブジェクトで`name: string`と`setup: (build: esbuild.PluginBuild) => void`からなる。

- プラグインが実行される場面：

ビルド中のファイルから`import/require/export`のコードを見つけると、都度プラグインの各メソッドが実行される。

すこし詳しく言うと、プラグインの setup 関数が、ビルド API が呼び出されるたびに

つまり、そのモジュールをビルドするたびに一度実行される。

- setup()メソッド内で使えるメソッド２つ

メソッドには主に 2 つあって...必ず onResolve(), onLoad()の順番で定義される。

1. build.onResolve()の簡単な説明

> onResolve を使用して追加されたコールバックは、esbuild がビルドする各モジュールの各インポートパスで実行されます。

たとえば index.js が esbuild でビルド中で、index.js 内に`import ...`というように import 文があったときに、
PluginBuild.onResolve()のコールバック関数が実行される。

このコールバック関数をカスタマイズすることで、

(import が要求するモジュールの)パスをどうやって解決するかを定義できるのである。

2. build.onLoad()の簡単な説明

> onLoad を使用して追加されたコールバックは、外部としてマークされていない一意のパス/名前空間のペアごとに実行されます。

build.onResolve()が返した path と namespace の組み合わせが被らない限り（一意になる限り）PluginBuild.onLoad()のコールバック関数が実行される。

> その仕事は、モジュールの内容を返し、それを解釈する方法を esbuild に指示することです。

onLoad のコールバック関数は`contents`というプロパティを定義できて、ここに import で要求したモジュールの中身を突っ込んで返せば、要求されたモジュールがビルド中のファイルに要求通り import できた事になる。

両メソッドはこちらですこし詳しくまとめた。
[ESBuild_Plugin](#ESBuild_Plugin)
詳しい具体例もあるよ。
[plugin 具体的な解決の様子](#plugin具体的な解決の様子)

#### 相対パスの解決

次のモジュールを取得する

`https://unpkg.com/medium-test-pkg/index.js`
`https://unpkg.com/medium-test-pkg/utils.js`

ただし、utils.js は index.js で`require("./utils.js");`という呼出分で呼び出される。

つまりディレクトリ構成は、

```bash
# meidum-test-pkg
.
｜-- medium-test-pkg/
        |
        |-- index.js
        |-- utils.js
```

というように、index.js と utils.js は同じディレクトリの中にある。

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
                    path: `https://unpkg.com/${args.path}`,
                };
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
                // ...
            });
        },
    };
};

```

このままだと、次のように出力される

```bash
onResolve {path: 'index.js', importer: '', namespace: '', resolveDir: ''}

onLoad {path: 'index.js', namespace: 'a'}

onResolve {path: 'medium-test-pkg', importer: 'index.js', namespace: 'a', resolveDir: ''}

onLoad {path: 'https://unpkg.com/medium-test-pkg', namespace: 'a'}

# path: './utils'で読み取られるので...

onResolve {path: './utils', importer: 'https://unpkg.com/medium-test-pkg', namespace: 'a', resolveDir: ''}

# medium-test-pkg/utils.jsではなく
# 'https://unpkg.com/./utils'というURLになってしまう
onLoad {path: 'https://unpkg.com/./utils', namespace: 'a'}

```

ほしい URL: `https://unpkg.com/medium-test-pkg/utils.js`
取得された URL: `https://unpkg.com/./utils`

これは次の部分のせいである。

```TypeScript
build.onResolve({ filter: /.*/ }, async (args: any) => {
    console.log('onResolve', args);
    if (args.path === 'index.js') {
        return { path: args.path, namespace: 'a' };
    }
    return {
        namesapce: 'a',
        // NOTE: args.pathをそのままわたしているから
        path: `https://unpkg.com/${args.path}`,
    };
});
```

つまり、

`https://unpkg.com/medium-test-pkg/index.js`のファイル内に

`require('./utils')`とあったから、build.onResolve()でうけとった args.path が

`./utils`になったので

相対パスを示す`./`または`../`が path に含まれていたら条件分岐すればいい

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

args.importer: `https://unpkg.com/medium-test-pkg`
args.path: `./utils`

これで new URL()すると望み通りの URL が得られる。

NOTE: baseURL の末尾に`/`をつけないと欲しい URL にならないので注意

#### URL オブジェクト

https://developer.mozilla.org/ja/docs/Web/API/URL

URL コンストラクタを使うと

渡されたパスが相対パスの時には、

第二引数として baseURL を必須とする。

一方、絶対パスの時は渡された baseURL は無視される。

これを使えば、

plugin は args.importer として呼び出し元を参照するので

それを baseURL として、

args.path は importer が要求している相対パスとして取得できるから

出来上がった URL おぶじぇくとの href が解決された全体 URL として取得できる

そういう寸法

#### ネストされたパスの解決

今回は`nested-test-package`というパッケージを要求する。

パッケージの index.js は下層のディレクトリのファイルを要求する。

こんな感じ。

```bash
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

今のところネストされたファイルは解決できない。

理由は**リダイレクトに対応できていない**からである。

現状のままパス解決すると次の通りになる。

```bash
# ユーザがtextareaに次を要求したとして `const message = require('nested-test-pkg');`
onResolve `{path: 'nested-test-pkg', importer: 'index.js'}`
onLoad `{path: 'https://unplg.com/nested-test-pkg'}`
onResolve `{path: 'helpers/utils', importer: 'https://unpkg.com/nested-tesst-pkg'}`
onLoad `{path: 'https://unpkg.com/nested-tesst-pkg/helpers/utils'}`
404 そんな URL は存在しないエラー
```

要は、

次の URL を要求したら

`https://unpkg.com/nested-tesst-pkg/`

本来ならば次の URL にリダイレクトされる。

`https://unpkg.com/nested-tesst-pkg/src/index.js`

なので

- リダイレクトされるかどうか確認する
- `resolveDir`にリダイレクトの URL を登録する

```TypeScript
// Before
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        //...
        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, args.importer + '/').href,
          };
        }
        //...
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        //...
        const { data } = await axios.get(args.path);
        return {
          loader: 'jsx',
          contents: data,
        };
      });
    },
  };
};


// After
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        // ...

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(
              args.path,
            //   NOTE: importerからresolveDirに変更した
            // onLoadでの変更をしておけばresolveDIrはimporterの完全な代わりになる
              'https://unpkg.com' + args.resolveDir + '/'
            ).href,
          };
        }
        //...
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // ...
        // NOTE: requestオブジェクトを取得して
        const { data, request } = await axios.get(args.path);
        return {
          loader: 'jsx',
          contents: data,
        //   そのなかにあるリダイレクトURLをresolveDirとして登録する
          resolveDir: new URL('./', request.responseURL).pathname,
        };
      });
    },
  };
};

```

参考：

https://esbuild.github.io/plugins/#on-load-results

resolveDir:

> このモジュールのインポートパスをファイルシステム上の実際のパスに解決するときに使用するファイルシステムのディレクトリです。ファイル名前空間内のモジュールの場合、この値のデフォルトはモジュールパスのディレクトリ部分です。それ以外の場合は、プラグインが提供しない限り、この値はデフォルトで空です。プラグインが提供しない場合、esbuild のデフォルトの動作は、このモジュールの import を解決しません。このディレクトリは、このモジュールの未解決のインポートパスの上で実行されるすべての on-resolve コールバックに渡されます。

どいういことかというと

onLoad のコールバックの戻り値が resolveDir を特に指定していなかったらデフォルトで空である
(もしも resolveDir を指定したら)このモジュールの未解決のインポートパスの上で実行されるすべての on-resolve コールバックに(resolveDir として)渡される

とにかく onLoad が resolveDir を登録して返すと、未解決の import パス上で実行されるすべての onResolve コールバックが、その resolveDir を取得することになる。

今回の例でいえば、

onLoad: `request.responseURL`にはリダイレクトされる URL が入っている(`https://unpkg.com/nested-test-pkg@1.0.0/src/index.js`)

onLoad で`new URL('./', request.responseURL).pathname`つまり`"https://unpkg.com/nested-test-pkg@1.0.0/src/"`を resolveDir として登録するので

それ以降の onResolve で`resolveDir: 'https://unpkg.com/nested-test-pkg@1.0.0/src/'`として取得できるようになる

request.responseURL には常に本来の URL が返されるので

resolveDir としてその URL を登録して

onResolve のコールバックで参照できるようにすれば

リダイレクトが発生する場合にもしない場合にも対応できる。

#### process.env.NODE_ENV

```bash
 > a:https://unpkg.com/react:
   warning: Define "process.env.NODE_ENV" when bundling for the browser

```

これを解決する。

ESBuild Build API を使う。

https://esbuild.github.io/api/#define

> これはグローバル識別子を定数に置き換える機能を提供する。
> ビルド時のあるコードの挙動を、そのコードを変更することなく変更することができる

公式の例：

```JavaScript
let js = 'hooks = DEBUG && require("hooks")';

require('esbuild').transformSync(js, {
  define: { DEBUG: 'true' },
});

// {
//   code: 'hooks = require("hooks");\n',
//   map: '',
//   warnings: []
// }

require('esbuild').transformSync(js, {
  define: { DEBUG: 'false' },
})

// {
//   code: 'hooks = false;\n',
//   map: '',
//   warnings: []
// }
```

js の中身が置換されるのだと思う。

実際に使ってみる

```TypeScript
// index.ts
const App = () => {

    // ...

    const onClick = async () => {
        if (!ref.current) {
            return;
        }

        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin()],
            // NOTE: 今回追加したプロパティ
            // define property
            define: {
                'process.env.NODE_ENV': '"production"',
                // NOTE: globalはブラウザならwindow, Nodeならglobal
                global: 'window',
            },
        });

        console.log(result);

        setCode(result.outputFiles[0].text);
    };

    return (
      // ...
    );
};

```

これで再度`react`を要求してみると先の警告が消えた

#### ESBuild_Plugin

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

`build.onResolve`は、ESBuild がビルド中に`import`ステートメントを見つけるたびに実行される。

引数には filter という正規表現を必ず渡す。
この filter に一致する「呼出（つまり`import`による呼出）」を
見つけたとき（ビルド中のファイルから見つけたとき）、
`build.onResolve`のコールバック関数を実行する。

**コールバック関数はどうやってパスを解決するのかをカスタマイズできる**

コールバック関数の引数は読み取った path の情報であり

コールバック関数の戻り値は解決された path である。

コールバック関数は`path`等を含むオブジェクトを引数として受け取る

上記の例では`args`である

`path`はビルド中に読み取ったソースコードの import で指定していた未解決のパスである。

`importer`は、解決すべきこのインポートを含むモジュールのパスである。
要は読み取っている（ビルド中の）ファイルまたは URL である。

`resolveDir`は

> これは、インポートパスをファイルシステム上の実際のパスに解決するときに使用するファイルシステムのディレクトリです。ファイル名前空間内のモジュールでは、この値のデフォルトはモジュールパスのディレクトリ部分です。仮想モジュールでは、この値のデフォルトは空ですが、オンロードコールバックは仮想モジュールに解決ディレクトリを与えることもできます。その場合、そのファイル内の未解決のパスの解決コールバックに提供されます。

最終的に、主に`path`と`namespace`を含めたオブジェクト(interface onResolveResult)を返す。

onResolveResult の namespace を指定しないと、onLoad でローカル・ファイルシステムを調べるように命令してしまうので

ローカル・ファイルシステムを指定しないようにするには何かしら空でない文字列を渡す必要がある。

この戻り値は、Build.onLoad のコールバックが実行されるときに、その path 解決に使用される。

**build.onLoad():**

`build.onLoad()`はすべてのユニークな path と namespace の組み合わせのペアに対してそれぞれ実行される。

いつも onResolve --> onLoad の順番で実行されるので

ファイルの読み取り --> import パスを見つけたら onResolve --> 次に import ステートメントに対して onLoad する

filter と一致する path であったならばそれぞれのメソッドが実行される

その役目はモジュールの中身とそれらをどうやって解釈するのかを ESBuild に伝えることである

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

onLoad の引数：

filter は指定された正規表現にマッチするファイル（URL）にだけコールバック関数を実行させるフィルターである

namespace が指定されていれば、コールバックは指定したネームスペースのモジュール内のパスに対してのみ実行されます。

onLoad のコールバック関数の引数:

- path: モジュールの完全に解決されたパスです。名前空間が file である場合はファイルシステムのパスと考えるべきですが、 それ以外の場合はどのようなパスでもかまいません。

- namespace: このファイルを解決した on-resolve コールバックによって設定された、モジュールのパスがある名前空間である。

つまり build.onResolved で返されたオブジェクトの namespace はここで引き継がれる

##### plugin 具体的な解決の様子

ESBuild が entory point の index.js から読み取るとする

つぎのプラグインを使う場合

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
              const message = require('nested-test-pkg');
              console.log(message);
            `,
          };
        }

        const { data, request } = await axios.get(args.path);
        return {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
      });
    },
  };
};

```

次の通りに解決される。

- ビルド開始
- (Entry Point の)index.js を読み取る
- プラグイン unpkg-path-plugin.ts を実行
- onResolve()の条件分岐で次が実行される

```TypeScript
// path === index.jsだから
if (args.path === 'index.js') {
    return { path: args.path, namespace: 'a' };
}
```

args.path は、基礎となるモジュールのソースコードにある未解決のパスをそのまま表したものであるはずだけど
index.js のなかの import 文の何かではなくて index.js 自身であるのは
たぶんエントリーポイントであることが関係しているのかも。
（つまり、内部的に index.js を import していることになっているのかも）

- onLoad()が実行されて

```JavaScript
{path: "index.js", namespace: 'a'}
```

を受け取って

```JavaScript
if (args.path === 'index.js') {
    return {
    loader: 'jsx',
    contents: `
        const message = require('nested-test-pkg');
        console.log(message);
    `,
    };
}
```

が実行される。

onLoad で contents が指定されるともうそれ以上そのファイル（index.js）でプラグインを実行しなくなる。

なので index.js で

```JavaScript
import * as esbuild from "esbuild-wasm";
import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
// import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
```

とたくさん import 文があるけど一切無視される（プラグインがこれ以上このファイルで実行されないという意味で）

ということで次は、contents のなかで記述された、`const message = require('nested-test-pkg');`の解決に移動する。

- onResolve()で args.path: 'nested-test-pkg'を解決する

return `{path: 'nested-test-pkg', importer: 'index.js', namespace: 'a', resolveDir: ''}`

こうしてみると`importer`とは`nested-test-pkg`を要求しているファイルのことですね。

```JavaScript
return {
    namespace: 'a',
    path: `https://unpkg.com/${args.path}`,
};
```

で解決される。なので...

- onLoad()で`{path: "https://unpkg.com/nested-test-pkg", namespace: 'a'}`を取得する

```JavaScript
const { data, request } = await axios.get(args.path);

return {
    loader: "jsx",
    contents: data,
    resolveDir: new URL("./", request.responseURL).pathname,
};
```

ちなみに`https://unpkg.com/nested-test-pkg`を GET リクエストするとリダイレクトされる。

axios.get()の戻り値の request オブジェクトにはリダイレクトの URL があって、それが request.responseURL である

これを URL オブジェクトで pathname だけ切り出す。

```JavaScript
hash: ""
host: "unpkg.com"
hostname: "unpkg.com"
href: "https://unpkg.com/nested-test-pkg@1.0.0/src/"
origin: "https://unpkg.com"
password: ""
pathname: "/nested-test-pkg@1.0.0/src/"
port: ""
protocol: "https:"
search: ""
```

この pathname を resolvedDir に指定するとどうなるか。

> このモジュールのインポートパスをファイルシステム上の実際のパスに解決するときに使用するファイルシステムのディレクトリです。
> **このディレクトリは、このモジュールの未解決のインポートパスの上で実行されるすべての on-resolve コールバックに渡されます。**

つまり、ネストされた未解決パスを見つけるたびに、onResolve()の resolveDir に必ず付与されるのである。

であれば、ネストされた中のパスの解決は resolveDir があるかどうかで条件分岐すれば解決できる。

これは以降のログを見るとわかる。

```JavaScript
// 直前でonLoadが返したresolveDirを取得している
onResolve {path: './helpers/utils', importer: 'https://unpkg.com/nested-test-pkg', namespace: 'a', resolveDir: '/nested-test-pkg@1.0.0/src'}
// するとaxiosでrequestオブジェクトをチェックしてリダイレクトを確認することなく
// resolveDirで指定した通りにリダイレクトURLに変換されている！
onLoad {path: 'https://unpkg.com/nested-test-pkg@1.0.0/src/helpers/utils', namespace: 'a'}
```

つまり、resolveDir で指定しなかったら

`https://unpkg.com/nested-test-pkg/.helpers/utils`でアクセスしてしまうが

ちゃんとリダイレクト用の URL`https://unpkg.com/nested-test-pkg@1.0.0/src/helpers/utils`で解決してくれる

NOTE: これは次の部分のおかげ

```JavaScript
// onResolve
if (args.path.includes("./") || args.path.includes("../")) {
    return {
    namespace: "a",
    path: new URL(
        args.path,
        "https://unpkg.com" + args.resolveDir + "/"
    ).href,
    };
}
```

これで正しい URL（パス）が解決できた！
