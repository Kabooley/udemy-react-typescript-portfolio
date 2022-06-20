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

codesandboxもcodepenも、コード記述エリアは`iframe`を利用している

#### Displaying iframe

iframeの表示方法

1. publicディレクトリにtest.htmlを用意する。

2. localhost:3000/index.jsのHTMLにiframeでtest.htmlを埋め込む

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

iframeは、埋め込まれたwebページ(親フレーム)とは異なる実行コンテキスト(子フレーム)を生成することになる

では親フレームと子フレームは通信できないのか？

#### Cross Context

子フレームのなかで`parent`というオブジェクトは、親フレームにアクセスできるオブジェクトになる

https://developer.mozilla.org/ja/docs/Web/HTML/Element/iframe

> それぞれの閲覧コンテキストは、セッション履歴とdocumentを持ちます。他の閲覧コンテキストを埋め込んでいる閲覧コンテキストは、親閲覧コンテキストと呼ばれます。最上位の閲覧コンテキストは (親を持たないもの) は、通常はブラウザーのウィンドウで、 Window オブジェクトで表されます。

https://developer.mozilla.org/ja/docs/Web/API/Window/parent

> 現在のウィンドウまたはサブフレームの親ウィンドウへの参照を返します
> ウィンドウが親を持たない場合、parentプロパティはそれ自身への参照となる
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

ただしデフォルトのiframeの設定でフレーム間通信を許可しているから可能なのである

#### 103 Sandboxing an iframe

iframe間通信の禁止について

通信が可能な条件2つ：どちらも真であるときに通信ができる

1. iframe要素が`sandbox`プロパティを持たない,または `sandbox="allowed-same-origin"`プロパティを持つ

```HTML
<!-- sandbox属性を追加した -->
<iframe sandbox="" src="/test.html" />
```
この場合、parentを介してアクセスしようとしても`DOMException`エラーが出る

```HTML
<!-- sandbox属性を追加した -->
<iframe sandbox="allowed-same-origin" src="/test.html" />
```


2. 親ドキュメントとiFrame HTMLドキュメントをまったく同じドメイン、ポート、プロトコルから取得する場合にのみ、フレーム間の直接アクセスを実現することができる

iframeを含むページをdev toolsのネットワークタブで見てみると
iframeであるhtmlファイルは、親ファイルと同じドメイン、ポート、プロトコルから取得されているのがわかる

`https://localhost:3000`

`https://localhost:3000/test.html`

この場合、直接アクセスできる

でもたとえばiframeのほうが

`https://nothing.localhost:3000/test.html`

というように親と異なるドメインを含んだりするとアクセスできない

codesandboxでもcodepenでもそれが確認できる

#### 104 how to fix iframe?

先に挙げた、考慮すべきこと3点について:

- ユーザが入力したコードはエラーをスローしたりプログラムをクラッシュさせたりする可能性がある

    解決済。iframeで区別した埋め込んだHTMLのなかでなら大丈夫

- ユーザが入力したコードは DOM をいじってプログラムをクラッシュさせる可能性がある

    解決済。iframeで区別した埋め込んだHTMLのなかでなら大丈夫

- 悪意のある第三者がユーザのコードに悪意のあるコードを追加する可能性がある

    解決済。iframe間の直接アクセスを禁止すればだけど。

それでは次からは、

直接アクセスできなくなったiframeへ親コンテキストでユーザが入力した内容をどうやって反映させるのかを考える


#### 105 The Full Flow - How codepent and codesandbox work


Codepenの仕組み：

API@codepen.io
- フロントエンド：ユーザがコードを変更する
- API@codepen.io:コードをトランスパイルして
- API@codepen.io: フロントエンドへトランスパイル結果を返す
- フロントエンド：iframeがリロードされる
- フロントエンド：リロードされるのでHTMLとJSファイルが要求される
    このときiframeは異なるドメインへHTMLとJSを要求する
- API@cdpn.ioがHTMLとJSを返す

以上の流れならば、フロントエンドとiframeの間で通信をしないので悪意のあるコードは排除できる

codesandboxも同様であるらしい

#### 106 Do we need seperation?

何の分離なのかというと、

フロントエンドが通信するドメインと、iframeが通信するドメインと分離する必要があるかという話

結論は、分離しない。

講義の後のほうでセキュリティについて検討することにするそうです

しばらくは、locahostドメインで実行する限りは

codepenのような誰かのコードを盗んで実行するとかを防ぐようなセキュリティは必要ないので

そのようにするとのこと

講義の後半のほうではlocalhost:4005とlocalhost:4006みたいにドメインを分離するよ
#### 106 Middle Ground Approach

TODO: --- この回を理解するまで見直しましょう ----

    この時点でのアプリケーションのコンテキスト分離の方法にともなうトレードオフが検討されているので
    何を吟味して今後のアプリケーションで何を実装していくのか理解すること
-----------------------------------------------

重要なポイント:

- （作成中のアプリケーションでは）ユーザコードはブラウザ内でバンドルしているからサーバにアップロードしていないよ
- （localhost:4005, 4006など）異なるポートを使用することのポイントは、iFrame内のコンテンツが親フレームまたは親ドキュメント内のコンテンツに直接アクセスできないようにすることです。

この後の講義では、

サーバを分離しなくても、iframeと親コンテキストを分離する方法を模索する予定

