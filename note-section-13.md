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

