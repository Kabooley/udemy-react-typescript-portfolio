# note section 13

Draggable Resizing Components

最終的にはコードエディタとプレビューウィンドウを隣り合わせにしたい

さらに、リサイズ・ドラッグ＆ドロップできるようにしたい

#### 138 ~ 139:

エディタ枠をリサイザブルにする

npm package: React-Resizable

https://www.npmjs.com/package/react-resizable

componentをリサイズしてくれるラッパーコンポーネントを作った

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
見た目は自分でCSSつくれ

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

#### 144 リサイズイベントがiframeへ送信されてしまう問題

リサイズハンドルをつかんだ後そのままiframeへホバーすると

リサイズイベント(ドラッグイベント)が終了していないのがわかる

つまり、ドラッグを開始してサイズ変更してマウスをiframeへ移動すると

ドラッグイベントはiframeへ送信されてしまっているらしい

iframeからマウスを外すと、ドラッグイベントが再開される

解決方法：ドラッグ中はiframeの上に他の要素を作る

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

これでonDragイベントはiframeへは送信されなくなった

さらに、`.react-draggable-transparent-selection`というCSSセレクタを付与すると

onDragイベント中だけ要素が有効になってonDragが終わると自動的に要素が無効になる

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