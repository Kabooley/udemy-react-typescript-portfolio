# Note Section 15

Markdown editor を実装していく

https://www.npmjs.com/package/@uiw/react-md-editor

上記のモジュールを使う

`<MDEditor />`でマークダウン・エディタを
`<MDEditor.Markdown />`でプレビューを扱う

NPM のページにはデモのリンクがある

https://uiwjs.github.io/react-md-editor/

#### Installed version

`@uiw/react-md-editor@2.1.1`

あとで不具合起こるかも

#### 169 Markdown エディタをクリックしたら編集モードを表示させる

```TypeScript
import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

const TextEditor: React.FC = () => {
    const [editing, setEditing] = useState<boolean>(true);

    useEffect(() => {
        const listener = () => {
            console.log('set false');
            setEditing(false);
        };
        document.addEventListener('click', listener, { capture: true });

        return () => {
            document.removeEventListener('click', listener, { capture: true });
        };
    }, []);

    if (editing) {
        return (
            <div>
                <MDEditor />
            </div>
        );
    }
    return (
        <div
            onClick={() => {
                console.log('set true');
                setEditing(true);
            }}
        >
            <MDEditor.Markdown source={'# Header'} />
        </div>
    );
};

export default TextEditor;
```

#### JavaScript Tips: EventTarget.addEventListener の第三引数(options)

## 参考

https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener

https://www.w3.org/TR/DOM-Level-3-Events/#event-flow

https://www.quirksmode.org/js/events_order.html#link4

https://www.w3.org/TR/DOM-Level-3-Events/#event-flow

https://www.w3.org/TR/DOM-Level-3-Events/#propagation-path

https://ja.javascript.info/bubbling-and-capturing#ref-2000

##### `useCapture`(boolean を渡す場合)

> このセクションでは、イベントディスパッチメカニズムの概要と、イベントが DOM ツリーを通じてどのように伝搬するかを説明します。アプリケーションは dispatchEvent() メソッドを用いてイベントオブジェクトをディスパッチすることができ、イベントオブジェクトは DOM イベントフローによって決定されるように DOM ツリーを介して伝播します。

まずイベント・オブジェクトはイベント・ターゲットへディスパッチされる前に、そのイベントオブジェクトの伝搬経路(propagation path)をはじめに定義しなくてはならない。

> 伝搬経路は、イベントが通過する現在のイベントターゲットの順序付きリストである。この伝搬経路は、ドキュメントの階層的なツリー構造を反映しています。リストの最後の項目がイベントターゲットで、リストの前の項目はターゲットの祖先と呼ばれ、直前の項目はターゲットの親となります。

一度伝搬経路が定まったら、イベントオブジェクトは 1 つかまたは 2 つ以上のイベントフェーズを通じて渡される。

3 つのイベント・フェーズがある。

-   capture phase
-   target phase
-   bubble phase

> イベントオブジェクトは、以下に説明するようにこれらのフェイズを完了する。フェーズがサポートされていない場合、またはイベントオブジェクトの伝搬が停止されている場合、フェーズはスキップされます。例えば、bubbles 属性が false に設定されている場合、バブルフェーズはスキップされ、ディスパッチの前に stopPropagation() が呼び出された場合、すべてのフェーズがスキップされます。

propagation path:

> イベントオブジェクトがイベントターゲットに向かう途中、またはイベントターゲットから戻る途中で順次通過するカレントイベントターゲットの順序付きセット。イベントが伝搬するとき、伝搬経路の各カレントイベントターゲットは順番に currentTarget として設定される。伝播経路は、最初はイベントタイプで定義された 1 つまたは複数のイベントフェーズで構成されるが、中断することもできる（MAY）。イベントターゲットチェーン(Event Target Chain)とも呼ばれる。

つまりまとめると

イベントが発生したら...

propagation path の決定：イベントの伝搬経路を定義するフェーズをまず行われる。

イベント・オブジェクトを実際に伝搬していく 3 つのフェーズを順番に行われる

capture phase:

DOM ツリーの頂点からターゲットの親要素へ向かってイベントオブジェクトが伝搬開始される。

window オブジェクトから発行され、イベントターゲットへ向かって先の propagation path を通って、path 上のオブジェクトがバケツリレーのようにイベント・オブジェクトを下へ向かって渡していく。

target phase:

イベント・オブジェクトがイベント・ターゲットへ到着する段階。

バブルフェーズをスキップするよう例えば addEventListener で定義されてあったら、

イベント・オブジェクトのバケツリレーは、イベント実行後に終了する。

(つまりバブリングフェーズがスキップされる)

bubbling phase:

capture phase の逆をたどってイベント・オブジェクトが戻っていく段階。window オブジェクトへ戻ってきたら終了。

疑問：

イベントターゲットが伝搬してツリー上の DOM に渡されていくけど往復するならそれぞれの DOM で 2 度イベントが発生するということかしら？

MDN より、

> **イベントターゲットに登録されたイベントリスナーは、キャプチャフェーズやバブリングフェーズではなく、ターゲットフェーズのイベントになります。** キャプチャリングフェーズのイベントリスナーは、キャプチャリングフェーズ以外のイベントリスナーよりも先に呼び出されます。

検証：

ネストされた div 要素すべてに click イベントリスナをつけてみた

```JavaScript
// codesandbox

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
  <div class="list">
    <div class="top">
      TOP
      <div class="middle">
        MIDDLE
        <div class="bottom">BOTTOM</div>
      </div>
    </div>
  </div>
</div>
`;

const list = document.querySelector(".list");
const top = document.querySelector(".top");
const middle = document.querySelector(".middle");
const bottom = document.querySelector(".bottom");

const listener = (e) => {
  console.log(e.target);
  console.log(e.currentTarget);
  console.log(e.path);
  console.log("------------------");
};

(function () {
    // ひとまずデフォルトの動作(useCapture: false)
  list.addEventListener("click", listener);
  top.addEventListener("click", listener);
  middle.addEventListener("click", listener);
  bottom.addEventListener("click", listener);
})();

```

検証１：全て useCapture: false で一番ネストの一番下の要素をクリックしてみた

```bash
# clicked bottom element
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------

```

つまりバブリングフェーズでイベントが発火して、フェーズ上の経路の要素のイベントリスナが全て発火したことがわかる

おまけで、event.path は propagation path であることがわかる。

検証２：全て useCapture: true で一番ネストの一番下の要素をクリックしてみた

```JavaScript
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
```

今度は逆の現象となった。

検証３：上の要素から順番に、true, false, true, false で、一番下の要素をクリックしてみた

```bash
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
```

これまでの流れから期待通りの動き。

ここまででわかることまとめ：

-   addEventListener()の options、useCapture はどのフェーズでイベントを発火させるかを制御できる

-   propagation 上のすべての要素に、発生したイベントのリスナがついていたら通常すべて発火する

-   `キャプチャリングフェーズのイベントリスナーは、キャプチャリングフェーズ以外のイベントリスナーよりも先に呼び出されます`は真実。

まぁ当たり前ですが。

-   propagation 上のイベントリスナはすべて発火するけど、イベントターゲットのイベントリスナは、ターゲットフェーズで発火するので区別すること。

-   event.target がイベント発生源 DOM、event.currentTarget が propagation path の経路途中の DOM

-   event.path は propagation path でどこの発火したリスナで確認しても必ず同じ配列

ここまでわかっていればどんな順番でネストの要素のイベントリスナが発火するのか把握できるはず。

で、他の options を確認する。

#### capture

`useCapture`と区別すること。

**ただし検証の結果、両者はほぼ同じ代物である**

> 論理値で、この型のイベントが DOM ツリーで下に位置する EventTarget に配信 (dispatch) される前に、登録された listener に配信されることを示します。

この説明は`useCapture`の前半部分と同じ。

検証：一番下の要素のリスナだけ capture: true にしてみて、bottom 要素をクリックした

```JavaScript
(function () {
  list.addEventListener("click", listener, true);
  top.addEventListener("click", listener, true);
  middle.addEventListener("click", listener, true);
  bottom.addEventListener("click", listener, { capture: true });
})();

```

```bash
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
​
```

ただ true を渡すときと同じ。

検証２：今度は bottom 以外は false にしてみる

```JavaScript
(function () {
  list.addEventListener("click", listener, false);
  top.addEventListener("click", listener, false);
  middle.addEventListener("click", listener, false);
  bottom.addEventListener("click", listener, { capture: true });
})();
```

```bash
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
​
```

ただ false を渡すのと同じ結果になった。

検証３：すべて capture: true にしてみる

```bash
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
```

検証４：すべて capture: false にしてみる

```bash
<div class="bottom">BOTTOM</div>
<div class="bottom">BOTTOM</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="middle">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="top">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
<div class="bottom">BOTTOM</div>
<div class="list">…</div>
(10) [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLBodyElement, HTMLHtmlElement, HTMLDocument, Window]
------------------
```

3, 4 の結果も先と同じになった

違いが感じられない...

##### イベント・ターゲットのリスナだけ発火させたいとき

NOTE: **Event.target が Event.currentTarget と一致するか調べる**

`event.target === event.target.currentTarget`が true になるかどうか

NOTE: バブリングは止めるな

https://ja.javascript.info/bubbling-and-capturing#ref-2000

> **必要がなければバブリングは止めないください。**

> event.stopPropagation() は後に問題になるかもしれない隠れた落とし穴を作る場合があります。

なので`event.stopPropagation()`は非推奨である。

ということで各フェーズは邪魔しないようにプログラマは気を付けるべき。

#### removeEventListener()するときの注意

add したときと全く同じ options を渡さないと remove されないので注意

#### Event Delegation

イベント委譲

https://ja.javascript.info/event-delegation

TODO: このイベント関係のノートをまとめて JavaScript の基礎リポジトリに追加すること
