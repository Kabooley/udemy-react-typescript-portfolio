# Note section 10

## Section10

文字列内の JavaScript コードを実行する方法

1. eval()

悪意のあるコードに対して無力。公式に危険な関数。

なので try...catch を eval()につける

これは setTimeout()を書かれたら対処できない

#### Considerations around code execution

考えるべきこと：

- ユーザが入力したコードはエラーをスローしたりプログラムをクラッシュさせたりする可能性がある
- ユーザが入力したコードは DOM をいじってプログラムをクラッシュさせる可能性がある

  `document.body.innerHTML = "";`を実行されたら大変なことに

- 悪意のある第三者がユーザのコードに悪意のあるコードを追加する可能性がある

#### How do others solve these problems

codesandbox も codepen も、コード記述エリアは`iframe`を利用している

#### Displaying iframe

iframe の表示方法

1. public ディレクトリに test.html を用意する。

2. localhost:3000/index.js の HTML に iframe で test.html を埋め込む

```TypeScript
// index.jsx

const App = () => {
  // ...
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
            // iframeを埋め込んだ。
            <iframe src="/test.html" />
        </div>
    );
};

```

これで埋め込まれた！

#### Different execute context

iframe は、埋め込まれた web ページ(親フレーム)とは異なる実行コンテキスト(子フレーム)を生成することになる

では親フレームと子フレームは通信できないのか？

#### Cross Context

子フレームのなかで`parent`というオブジェクトは、親フレームにアクセスできるオブジェクトになる

https://developer.mozilla.org/ja/docs/Web/HTML/Element/iframe

> それぞれの閲覧コンテキストは、セッション履歴と document を持ちます。他の閲覧コンテキストを埋め込んでいる閲覧コンテキストは、親閲覧コンテキストと呼ばれます。最上位の閲覧コンテキストは (親を持たないもの) は、通常はブラウザーのウィンドウで、 Window オブジェクトで表されます。

https://developer.mozilla.org/ja/docs/Web/API/Window/parent

> 現在のウィンドウまたはサブフレームの親ウィンドウへの参照を返します
> ウィンドウが親を持たない場合、parent プロパティはそれ自身への参照となる
> ウィンドウが <iframe> 、<object> 、あるいは、<frame> で読み込まれた場合、その親ウィンドウは、ウィンドウを埋め込んだ要素が存在するウィンドウとなります。

```bash
# In Dev Tools console
#
# コンテキスト最上位
$ window.a = "this is a";
$ a
> "this is a"
# コンテキストを子フレームにした
#
# windowにはアクセスできる...
$ window
> window {}
# では上位フレームで定義したwindow.aはというと
$ window.a
> undefined
# つまり、子フレームは親フレームのwindowにあくせすできない
#
# 逆に子フレームのwindowで定義したプロパティは
$ window.b = "this is b"
# コンテキストを上位フレームにして...
$ window.b
> undefined
# アクセスできない
#
# つまり、フレームごとにwindowがあることがわかる
# ----
# 子フレームから親フレームにアクセスする方法はwindow.parentを使う
# コンテキストを子フレームにして
$ parent.a
> "this is a"
# アクセスできた
#
# 逆に、親フレームから子フレームへアクセスする方法は,
# 親コンテキスト
$ document.querySelector('iframe');
# で埋め込まれているiframe要素を取得できるので
$ document.querySelector('iframe').contentWindow
> Window {}
# これでwindow.bにアクセスできる
$ document.querySelector('iframe').contentWindow.b
> "this is b"


```

ただしデフォルトの iframe の設定でフレーム間通信を許可しているから可能なのである

#### 103 Sandboxing an iframe

iframe 間通信の禁止について

通信が可能な条件 2 つ：どちらも真であるときに通信ができる

1. iframe 要素が`sandbox`プロパティを持たない,または `sandbox="allowed-same-origin"`プロパティを持つ

```HTML
<!-- sandbox属性を追加した -->
<iframe sandbox="" src="/test.html" />
```

この場合、parent を介してアクセスしようとしても`DOMException`エラーが出る

```HTML
<!-- sandbox属性を追加した -->
<iframe sandbox="allowed-same-origin" src="/test.html" />
```

2. 親ドキュメントと iFrame HTML ドキュメントをまったく同じドメイン、ポート、プロトコルから取得する場合にのみ、フレーム間の直接アクセスを実現することができる

iframe を含むページを dev tools のネットワークタブで見てみると
iframe である html ファイルは、親ファイルと同じドメイン、ポート、プロトコルから取得されているのがわかる

`https://localhost:3000`

`https://localhost:3000/test.html`

この場合、直接アクセスできる

でもたとえば iframe のほうが

`https://nothing.localhost:3000/test.html`

というように親と異なるドメインを含んだりするとアクセスできない

codesandbox でも codepen でもそれが確認できる

#### 104 how to fix iframe?

先に挙げた、考慮すべきこと 3 点について:

- ユーザが入力したコードはエラーをスローしたりプログラムをクラッシュさせたりする可能性がある

  解決済。iframe で区別した埋め込んだ HTML のなかでなら大丈夫

- ユーザが入力したコードは DOM をいじってプログラムをクラッシュさせる可能性がある

  解決済。iframe で区別した埋め込んだ HTML のなかでなら大丈夫

- 悪意のある第三者がユーザのコードに悪意のあるコードを追加する可能性がある

  解決済。iframe 間の直接アクセスを禁止すればだけど。

それでは次からは、

直接アクセスできなくなった iframe へ親コンテキストでユーザが入力した内容をどうやって反映させるのかを考える

#### 105 The Full Flow - How codepent and codesandbox work

Codepen の仕組み：

API@codepen.io

- フロントエンド：ユーザがコードを変更する
- API@codepen.io:コードをトランスパイルして
- API@codepen.io: フロントエンドへトランスパイル結果を返す
- フロントエンド：iframe がリロードされる
- フロントエンド：リロードされるので HTML と JS ファイルが要求される
  このとき iframe は異なるドメインへ HTML と JS を要求する
- API@cdpn.ioが HTML と JS を返す

以上の流れならば、フロントエンドと iframe の間で通信をしないので悪意のあるコードは排除できる

codesandbox も同様であるらしい

#### 106 Do we need seperation?

何の分離なのかというと、

フロントエンドが通信するドメインと、iframe が通信するドメインと分離する必要があるかという話

結論は、分離しない。

講義の後のほうでセキュリティについて検討することにするそうです

しばらくは、locahost ドメインで実行する限りは

codepen のような誰かのコードを盗んで実行するとかを防ぐようなセキュリティは必要ないので

そのようにするとのこと

講義の後半のほうでは localhost:4005 と localhost:4006 みたいにドメインを分離するよ

#### 107 Middle ground approach

議論：我々が作成するアプリケーションはセキュリティのために別サーバを立てるべきか？

という話。

ここ数回の講義では、

サーバを分離しないと同一オリジン問題が発生してセキュリティ上の危険があることを学習した。

つまり、同じドメイン・ポート・プロトコルから HTML を取得する場合

悪意のあるユーザによって iframe で入力したコードが親ドきゅめんとを攻撃する手段を与えてしまうのである。

なのでサーバは分離したほうがいいね。そんな話をした。

しかし我々が作成するアプリケーションはわざわざ別サーバを作成しないといけないのか？

その答えは我々が作成しているアプリケーションが実はサーバにアクセスして HTML を得ているのではなくて

実際はブラウザ内でコードを生成している点にある。

つまり localhost:3000 を使っているけど、セキュリティ上の問題を回避するために localhost:4000 とかを用意しなくてはならないのか？

という点を検討しなくてはならない。

で、講師はその面倒を回避することにした。

理由は、

iframe 内のコンテンツと親ドキュメントを分離するほかの方法があるからである。

ポイントは`sandbox`プロパティ

最終的には別サーバを立てるように作ることになるけど

しばらくは別サーバを立てない方法でアプローチする。

#### 108 iFrame with srcDoc

iframe 側でコンテンツを生成する!!

先までの話は親ドキュメントが取得した内容をサーバを通じて iframe が取得するという方法だった。

今回は srcDoc プロパティを使って iframe 側でコンテンツを生成する

具体的な方法：

コードを渡す方法：親ドキュメントで入力されたコードは iframe の srcDoc プロパティに渡す
親ドキュメントにアクセスさせない方法：sandbox プロパティは空文字を渡す

```TypeScript
// index.jsx
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
      <iframe srcDoc={html} />
    </div>
  );


const html = `
<h1> Local HTML Doc</h1>
`;
```

これで iframe に HTML を渡すことができた

しかしまだ親ドキュメントにアクセスできてしまう

```HTML

<iframe sandbox="" srcDoc={html} />
```

これで両方実現できた

この方法のデメリットは、local ストレージにアクセスできないことである

つまりユーザは localstorageAPI を使うことはできない

#### 109 Execution using srcDoc

srcDocs に HTML を渡す方法はわかった。

srcDocs に JavaScript を渡して実行させるには？

1. 実行したい JavaScript コードをはらんだ script 要素を渡す
2. sandbox="allow-scritps"属性を iframe に渡しておく

```TypeScript
// index.jsx
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
      <iframe srcDoc={html} sandbox="allow-scritps"/>
    </div>
  );


const html = `
    <script>${code}</script>
`;
```

#### 110 Execution of unescaped code

バンドルされたコードを親コンテキストで出力する分には問題なかったのに

srcDoc へ渡すと、そのモジュールが長すぎる場合とか

「そんな文字は知らん」というエラーが出る場合がある

たとえば react-dom を import しようとしてそのバンドルされたコードを srcDoc へ渡したとする

すると、

モジュールは内部的に</script>を出力しており

パーサが JavaScript がここで終了したと判断して終了した

つまり次のようにコードが生成されたことになる

```JavaScript
const html = `
    <script>
        <script></script>
    </script>
`
```

なのでモジュール内の</script>以降が余計な文字として認識されてしまうのである

これは textarea へ次のように入力しても確認できる

```JavaScript
console.log("<script></script>");
```

これが srcDoc へわたると</script>で終了したとなるから

`console.log(`ってなに？となる

ということでこれを回避する必要があるけど...

なぜか講義は解決策を示さず次に行ってしまった。

#### 111 Communication between frames

子コンテキストから親コンテキストへまたはその逆の通信を実行する

parent.postMessageならフレーム間の直接アクセスを無効にしても通信できる

https://developer.mozilla.org/ja/docs/Web/API/Window/postMessage

> 正しく使用した window.postMessage はこの制限(同一オリジンポリシー)を安全に回避するための制御された仕組みを提供します。

> 大まかには、ウィンドウが他のウィンドウへの参照を取得できる場合 ( targetWindow = window.opener など)、targetWindow.postMessage() を使って MessageEvent をそのウィンドウ上で配信することができます。受け取ったウィンドウでは必要に応じて自由にイベントを処理することができます。window.postMessage() に渡された引数 ("message") はイベントオブジェクトを通して対象のウィンドウに公開されます。

ということで、

window.postMessage()はどういうわけか同一オリジンポリシーを回避して別スクリプトと通信できる

targetWindow.postMessage()を使ってメッセージを送信して、受信側のtargetWindowはイベントリスナでそれを受信できる

Syntax:

```TypeScript
/***
 * @param {string} message - 送信するメッセージ
 * @param {string} targetOrigin - イベントを送信するウィンドウのオリジンを指定する。`*`かURIで指定する。先までの説明でいうところのtargetWindowである。
 * 
 * */ 
window.postMessage(message, targetOrigin);
```

targetOriginの注意：

> **他のウィンドウの文書がどこにあるものか知っている場合は、 * ではなく、常に特定の targetOrigin を指定してください。特定のターゲットを指定しないと、悪意のあるサイトに送信したデータが開示されてしまいます。**


受信側：

```TypeScript
window.addEventListener("message", (event) => {
  if (event.origin !== "http://example.org:8080")
    return;

  // ...
}, false);

```
`message`イベントが持つもの

- data: 送信されたメッセージを保持しているオブジェクト
- origin: 送信元のオリジン
- source: メッセージを送信したwindowオブジェクトへの参照

オリジンについて：

> ウェブコンテンツにアクセスするために使われる URL のスキーム (プロトコル)、 ホスト (ドメイン)、 ポート によって定義されます。

セキュリティ：

当然windowオリジン間で通信できる方法なので、注意事項がたくさん。


ここまでのはなし：

- srcDoc属性を使えば、親コンテキストから子コンテキストへsandboxで同一おいリジンポリシーを守ったままコードを渡すことができる

- window.postMessage()を使えば、子コンテキストから親コンテキストへmessageにコードを含めたりしてメッセージを送信できる

#### 112 Send code to iFrame

```TypeScript
// index.tsx
const App = () => {
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
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
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });
    // No longer needed.
    // setCode(result.outputFiles[0].text);
    // 
    // Send code to 
    // 
    // HTMLIFrameElement.contentWindowは、
    // iframeのwindowオブジェクトを返す
    // このwindowオブジェクトを使ってiframeのドキュメントとその内部にアクセスできる
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
  };

  // event listener for message from parent document.
  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            eval(event.data);
          }, false);
        </script>
      </body>
    </html>
  `;


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
      // ref refs iframe ref.
      <iframe ref={iframe} sandbox="allow-scripts" srcDoc={html} />
    </div>
  );
};

```

要は、親コンテキストから子コンテキストへ

window.postMessage()を使って、バンドル済のコードを渡している

iframeはそのメッセージを`message`イベントリスナで受信する

親コンテキストはsubmitボタンがクリックされたら、

useRefで参照しておいたiframeのwindowContentに対してpostMessage()するので

iframeは親コンテキストからのメッセージを受信できる

これでたとえば次を親コンテキストで記述してsubmitすると...

```JavaScript
import ReactDOM from 'react-dom';

const App = <h1>Hi, there!</h1>;

ReactDOM.render(
  <App />,
  document.querySelector('#root');
);
```

期待通りに動作した！

キャッシングも働いてとっても高速なのも確認できる

#### 113 Highlighting Error

いまのところたとえば文法が間違っているコードをiframeに渡しても

iframe内には何も表示されない

- try...catchを使う
- 赤色強調表示させる

```TypeScript
// iframeの中身のhtml
  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            }
            catch(err) {
              const root = document.querySelector('#root');
              root.innerHTML = '<div style="color: red;">' + err + '</div>'
            }
          }, false);
        </script>
      </body>
    </html>
  `;

```

### 114: Issues with repeat execute.

In case: `document.body.innerHTML = ""`をユーザが入力したら

iframe内のhtmlのbodyないが消える

In case: 上記のままつかってみたら

前回の変更がそのまま今回入力した内容が反映される

リセット機能を実装する必要がある

#### 115: Implement Reset

iframeのbody内のHTMLリセット機能を実装する

現在のiframeの内容を取得する方法

document.querySelector('iframe').srcDocで取得できる

なので

```TypeScript
  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    // NOTE: RESET every time they submit.
    iframe.current.srcDoc = html;

    // ...

  }
```

とすれば

ユーザが`document.querySelector('body').innerHTML = ""`したあとでも

あらたにコードを書いてサブミットする限り実行を可能とする

#### 177: Warning Fixup

現状リロードするたびに警告が出る

なのでこれを解決する

