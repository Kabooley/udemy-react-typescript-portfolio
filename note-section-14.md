# Error Handling

Section 14

エディタ内で`setTimeout`を追加し、そのコールバックでエラーを起こさせても、

プレビューにはエラーが表示できないという問題が残っている

また、有効でない JavaScript コードを入力されるとエラーが表示されないまま。

#### 164 Extracting Reusable Error Handling Logic

非同期ランタイムエラーをキャッチできるようにしてみよう

準備としてエラーハンドリング路軸を関数に抽出する

```TypeScript
// preview.tsx

const html = `
<html>
 <head>
   <style>body{background-color: fff;}</style>
 </head>
 <body>
   <div id="root"></div>
   <script>
   const errorHandler = (err) => {
     const root = document.querySelector('#root');
     root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
     console.error(err);
   }
     window.addEventListener('message', (event) => {
       try {
         eval(event.data);
       } catch (err) {
         errorHandler(err);
       }
     }, false);
   </script>
 </body>
</html>
`;

```

window に error イベントのリスナをつける

```TypeScript
// preview.tsx

const html = `
<html>
 <head>
   <style>body{background-color: fff;}</style>
 </head>
 <body>
   <div id="root"></div>
   <script>
   const errorHandler = (err) => {
     const root = document.querySelector('#root');
     root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
     console.error(err);
   }

   window.addEventListener('error', (event) => {
       console.log('Asynchronous Error');
     console.log(event);
   })
     window.addEventListener('message', (event) => {
       try {
         eval(event.data);
       } catch (err) {
           console.log("Synchronous Error");
         errorHandler(err);
       }
     }, false);
   </script>
 </body>
</html>
`;

```

try..catch と error イベントリスナは競合しないのか？

これは同期的なエラーは catch が、

非同期なエラーは error イベントリスナがキャッチしてくれるので

区別できる。

どうして区別できるのかわかっていない。

調べること。...調べた。今度ノートにまとめる

```JavaScript
// html
<html>
  <head>
    <style>body{background-color: fff;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
    const errorHandler = (err) => {
      const root = document.querySelector('#root');
      root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
      console.error(err);
    }

    // try...catchの特性を利用して、非同期のエラーのみ受け取る
    window.addEventListener('error', (event) => {
      // コンソールに余計なログを出力させないため
      event.preventDefault();
      errorHandler(event.error);
    })
      window.addEventListener('message', (event) => {
        try {
          eval(event.data);
        } catch (err) {
          errorHandler(err);
        }
      }, false);
    </script>
  </body>
</html>
```

#### 166 Capturing Error among Bundling

バンドリングロジック中のエラー発生を制御する

```TypeScript
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

let service: esbuild.Service;
const bundle = async (rawCode: string): Promise<string | undefined> => {
    if (!service) {
        service = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
        });
    }

    try {
        const result = await service.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window',
            },
        });
        // This is also string.
        return result.outputFiles[0].text;
    } catch (err) {
        // returns some string.
    }
};

export default bundle;
```

try...catchを追加した。

正常でも例外でもどちらも文字列を返す。

どうやってエラーとcodeを判別すべきか。

次の通りにする。

```TypeScript
// bundle/index.tsx
const bundle = async (rawCode: string) => {

  // ...

    try {
        const result = await service.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window',
            },
        });
        return {
            code: result.outputFiles[0].text,
            err: '',
        };
    } catch (err: any) {
        return {
            code: '',
            err: err.message,
        };
    }
};

// codecell.tsx
const CodeCell = () => {
    const [code, setCode] = useState<string>('');
    const [input, setInput] = useState<string>('');
    // Added new state
    const [err, setErr] = useState<string>('');

    useEffect(() => {
        console.log('use effect');
        const timer = setTimeout(async () => {
            console.log('set timeout');
            const output = await bundle(input);
            // Set both result.
            setCode(output.code);
            setErr(output.err);
        }, 1000);

        return () => {
            console.log('clear timeout');
            clearTimeout(timer);
        };
    }, [input]);

    return (
        <Resizable direction="vertical">
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <Resizable direction="horizontal">
                    <CodeEditor
                        initialValue="const a = 1;"
                        onChange={(value) => setInput(value)}
                    />
                </Resizable>
                // Send error state to preview.
                <Preview code={code} err={err} />
            </div>
        </Resizable>
    );
};

// preview.tsx
import './preview.css';
import { useEffect, useRef } from 'react';

interface PreviewProps {
    code: string;
    // Added new property
    err: string;
}

const html = `
<html>
  <head>
    <style>body{background-color: fff;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
    const errorHandler = (err) => {
      const root = document.querySelector('#root');
      root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
      console.error(err);
    }

    window.addEventListener('error', (event) => {
      event.preventDefault();
      errorHandler(event.error);
    })
      window.addEventListener('message', (event) => {
        try {
          eval(event.data);
        } catch (err) {
          errorHandler(err);
        }
      }, false);
    </script>
  </body>
</html>
`;

const Preview: React.FC<PreviewProps> = ({ code, err }) => {
    const iframe = useRef<any>();

    useEffect(() => {
        iframe.current.srcdoc = html;
        setTimeout(() => {
            iframe.current.contentWindow.postMessage(code, '*');
        }, 50);
    }, [code]);

    return (
        <div className="preview-wrapper">
            <iframe
                style={{ backgroundColor: 'white' }}
                title="preview"
                ref={iframe}
                sandbox="allow-scripts"
                srcDoc={html}
            />
            // iframeに渡さないで、iframeの上にかぶせて表示させる
            {err && <div className="preview-error">{err}</div>}
        </div>
    );
};

export default Preview;
```

## 非同期エラー try...catch vs. window.addEventListener('error')

前提：

- try...catchは同期エラーしかキャッチできない。

非同期処理の結果が返される頃は、内部的にはtry...catchを既に「抜け出している」ので

そこで発生したエラーはcatchがされない。

講義の非同期処理はここを利用している。
つまり、

同期処理は必ずcatchがキャッチしてくれるけど、非同期エラーは必ずcatchはcatchしてくれないから、結果必ずwindow.addEventListener('error')がそのエラーをキャッチする。

では、

同期エラーはcatchでもcatchして、window.addEventLIstener()でもcatchしてしまうのでは？

これは確認してみたところ、

同期エラーは必ずcatchが取得してイベントリスナは発火しなかった

なので、

- 同期エラーはcatchだけがcatchして、

- 非同期エラーはwindow.addEventaListener()だけがcatchする

とすみわけさせることができる


