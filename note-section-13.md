# note section 13

Draggable Resizing Components

最終的にはコードエディタとプレビューウィンドウを隣り合わせにしたい

さらに、リサイズ・ドラッグ＆ドロップできるようにしたい

#### 138 ~ 139:

エディタ枠をリサイザブルにする

npm package: React-Resizable

https://www.npmjs.com/package/react-resizable

component をリサイズしてくれるラッパーコンポーネントを作った

```TypeScript
import './resizable.css';
import { ResizableBox } from 'react-resizable';

interface ResizableProps {
    direction: 'horizontal' | 'vertical';
}

// const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
const Resizable: JSX.Element<ResizableProps> = ({ direction, children }) => {
    return (
        <ResizableBox width={Infinity} height={300} resizeHandles={['s']}>
            {children}
        </ResizableBox>
    );
};

export default Resizable;
```

リサイズ可能にするために`<Resizable>`コンポーネントでラップする
ハンドルをつけるために`resizeHandler`プロパティを追加する（方向は配列で渡すこと）
見た目は自分で CSS つくれ

とのこと

リサイズハンドル・スタインリング：

```CSS
.react-resizable-handle {
    display: block;
    background-color: #37414b;
    background-repeat: no-repeat;
    background-position: 50%;
}

.react-resizable-handle-s {
    height: 10px;
    width: 100%;
    cursor: row-resize;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
}

.react-resizable-handle-e {
    width: 10px;
    min-width: 10px;
    height: 100%;
    cursor: col-resize;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
}

```

#### 144 リサイズイベントが iframe へ送信されてしまう問題

リサイズハンドルをつかんだ後そのまま iframe へホバーすると

リサイズイベント(ドラッグイベント)が終了していないのがわかる

つまり、ドラッグを開始してサイズ変更してマウスを iframe へ移動すると

ドラッグイベントは iframe へ送信されてしまっているらしい

iframe からマウスを外すと、ドラッグイベントが再開される

解決方法：ドラッグ中は iframe の上に他の要素を作る

```TypeScript

const Preview: React.FC<PreviewProps> = ({ code }) => {

    //...

    return (
        // Added div.preview-wrapper
        <div className="preview-wrapper">
            <iframe
                style={{ backgroundColor: 'white' }}
                title="preview"
                ref={iframe}
                sandbox="allow-scripts"
                srcDoc={html}
            />
        </div>
    );
};
```

```CSS
.preview-wrapper {
    position: relative;
    height: 100%;
}

.preview-wrapper:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: red;
}

```

これで onDrag イベントは iframe へは送信されなくなった

さらに、`.react-draggable-transparent-selection`という CSS セレクタを付与すると

onDrag イベント中だけ要素が有効になって onDrag が終わると自動的に要素が無効になる

```CSS
.preview-wrapper {
    position: relative;
    height: 100%;
}

.react-draggable-transparent-selection .preview-wrapper:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    /* 透明にしておく */
    opacity: 0;
}
```

#### 146 Limitation of vertical resizing

ResizableBox のプロパティ、maxConstraints を指定する

```TypeScript
const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    return (
        <ResizableBox
        // 水平方向に無限に、垂直方向にブラウザウィンドウの90％までに
            maxConstraints={[ Infinity, window.innerHeight * 0.9 ]}
            // 最小縮小サイズも指定する
            minConstraints={[Infinity, 24]}
            width={Infinity} height={300} resizeHandles={['s']}
        >
            {children}
        </ResizableBox>
    );
};

export default Resizable;
```
#### 147: Resizing Horizontary

CodeEditorコンポーネントを別のResizableコンポーネントでラップする

```TypeScript
const CodeCell = () => {
    // ...

    return (
        <Resizable direction="vertical">
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                // 水平方向リサイズコンポーネント
                <Resizable direction="horizontal">
                    <CodeEditor
                        initialValue="const a = 1;"
                        onChange={(value) => setInput(value)}
                    />
                </Resizable>
                <div>
                    <button onClick={onClick}>Submit</button>
                </div>
                <Preview code={code} />
            </div>
        </Resizable>
    );
};
```

Resizableコンポーネントを水平方向でも使えるようにする

```TypeScript
// 変更前
// 
interface ResizableProps {
    direction: 'horizontal' | 'vertical';
    children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    return (
        <ResizableBox 
            minConstraints={[Infinity, 24]}
            maxConstraints={[ Infinity, window.innerHeight * 0.9 ]}
            width={Infinity} height={300} resizeHandles={['s']}
        >
            {children}
        </ResizableBox>
    );
};

// 変更後
// 
import './resizable.css';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

interface ResizableProps {
    // ...
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    let resizableProps: ResizableBoxProps;

    if(direction === 'horizontal') {
        resizableProps = {
            minConstraints: [window.innerWidth * 0.2, Infinity],
            maxConstraints: [window.innerWidth * 0.75, Infinity],
            width: window.innerWidth * 0.75,
            height: Infinity,
            resizeHandles: ['s'],
        }
    }
    else {
        resizableProps = {
            minConstraints: [Infinity, 24],
            maxConstraints: [Infinity, window.innerHeight * 0.9],
            width: Infinity,
            height: 300,
            resizeHandles: ['s'],
        }
    }
    return (
        <ResizableBox
            {...resizableProps}
        >
            {children}
        </ResizableBox>
    );
};

export default Resizable;

```

しかしこのままだとなぜか水平方向のリサイズハンドルが頓珍漢なところへ置かれてしまうので

```TypeScript
const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    let resizableProps: ResizableBoxProps;

    if (direction === 'horizontal') {
        resizableProps = {
            // 特別にスタイルを設けるためにclassNameを追加して
            className: 'resize-horizontal',
            minConstraints: [window.innerWidth * 0.2, Infinity],
            maxConstraints: [window.innerWidth * 0.75, Infinity],
            width: window.innerWidth * 0.75,
            height: Infinity,
            resizeHandles: ['e'],
        };
    } else {
        // ...
```

```CSS
/* resizable.css */

.resize-horizontal {
    display: flex;
    flex-direction: row;
}

/* code-editor.css */
.editor-wrapper {
    position: relative;
    height: 100%;
    width: calc(100% - 10px);
}
```

これで水平方向へ移動できるようになった

しかしこのままだとプレビュー画面の白色部分がリサイズに応じて拡縮してくれないので

```CSS
/* preview.css */
.preview-wrapper {
    position: relative;
    height: 100%;
    /* added */
    flex-grow: 1;
}

.preview-wrapper iframe {
    height: 100%;
    background-color: fff;
    /* added */
    width: 100%;
}

```
flex-growで主軸方向の寸法に対して伸長係数１にして、

iframeの幅を100%にすることで拡縮に対してすべてiframeが横幅を埋めるようになる

#### 153: An Oddity around the resizer

ウィンドウを水平方向に縮小するとプレイビューウィンドウが消える

これを解決していく

ResizableコンポーネントのminConstraintなどのプロパティはリサイズハンドルを動かしているときに、window.innerWidthなどを再計算するけど

ウィンドウのリサイズ時には当然何もしない

そのためにウィンドウのリサイズ時に反応できるようにリスナを用意する

useEffect(, [])でresizeハンドラを用意する

リスナが反応するたびにstateでwindowのinnerHeight, innerWidthを更新する

ResizableBOxのプロパティはそのstateからとるようにする

これで常に更新される

```TypeScript
import './resizable.css';
import { useEffect, useState } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

interface ResizableProps {
    // ...
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);
    const [innerHeight, setInnerHeight] = useState<number>(window.innerHeight);
    let resizableProps: ResizableBoxProps;

    useEffect(() => {
        const listener = () => {
            setInnerWidth(window.innerWidth);
            setInnerHeight(window.innerHeight);
        };
        window.addEventListener('resize', listener);
        return () => {
            window.removeEventListener('resize', listener);
        };
    }, []);

    if (direction === 'horizontal') {
        resizableProps = {
            className: 'resize-horizontal',
            minConstraints: [innerWidth * 0.2, Infinity],
            maxConstraints: [innerWidth * 0.75, Infinity],
            width: innerWidth * 0.75,
            height: Infinity,
            resizeHandles: ['e'],
        };
    } else {
        resizableProps = {
            minConstraints: [Infinity, 24],
            maxConstraints: [Infinity, innerHeight * 0.9],
            width: Infinity,
            height: 300,
            resizeHandles: ['s'],
        };
    }
    return <ResizableBox {...resizableProps}>{children}</ResizableBox>;
};

export default Resizable;
```

現状のままだとパフォーマンス上の問題がある

- ウィンドウのリサイズに一瞬遅れて処理される
- リサイズした後にウィンドウのリサイズをすると戻される

一瞬遅れて処理させる：

ウィンドウのリサイズ時に100ms待つようにする

```TypeScript
// resizable.ts

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const listener = () => {
            if(timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                setInnerWidth(window.innerWidth);
                setInnerHeight(window.innerHeight);
            }, 100);
        };
        window.addEventListener('resize', listener);
        return () => {
            window.removeEventListener('resize', listener);
        };
    }, []);
```

リサイズが元に戻ってしまう問題：

