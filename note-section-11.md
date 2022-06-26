# Note section 11

#### 118 Issues with eager bundling

submit ボタンをなくして、

ユーザ入力内容を自動的に読み取ってバンドリングする方法に変えてみる

```TypeScript
const App = () => {
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async (input: string) => {
    if (!ref.current) {
      return;
    }

    iframe.current.srcdoc = html;

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    // setCode(result.outputFiles[0].text);
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
  };

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              const root = document.querySelector('#root');
              root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
              console.error(err);
            }
          }, false);
        </script>
      </body>
    </html>
  `;

  return (
    <div>
      <textarea
        value={input}
        // 入力を常にバンドリングを処理するonClickメソッドへ
        onChange={(e) => {
            setInput(e.target.value);
            onClick(input);
            }}
      ></textarea>
      <div>
        // <button onClick={onClick}>Submit</button>
      </div>
      <iframe ref={iframe} sandbox="allow-scripts" srcDoc={html} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));

```

chrome のタスクマネージャから CPU の負荷状況をモニタしてみよう

するとめっちゃ負荷がかかっているのが確認できる

ということで入力にすぐ応じてバンドリングするのではなくて

0.5 秒ずつまってからバンドリングする方法で実装してみる

#### 119 Quick Revert

#### 120 Options for Open Source Editor

3 つの有力なオープンソースエディタがある

-   Manoco Editor: 設定が難しいけど動くと完璧な編集機能を有する

React にこの難しい設定をやってくれるコンポーネントがあるらしい。

```bash
$ npm i --save-exact @monaco-editor/react
```

とにかくこいつを導入して

見栄えが良くて、

エディタとしての機能を十分発揮してくれる

エディタコンポーネントを導入・実装する

#### 121 Display Edtitor

```TypeScript
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = () => {
    return <MonacoEditor height="500px" />;
};

export default CodeEditor;

```

こいつを index.tsx で取り込んで表示させる

#### 122 Configuration the Editor

```TypeScript

declare const Editor: React.FC<EditorProps>;

export interface EditorProps {
    //　エディタの構成プロパティ
}
```

<MonacoEdtor />のにわたせる props は EditorProps で定義されている

先の height とか。

#### 123 Eidtor Type Defs

Monaco エディタのオプションをいじる

先の`interface EditorProps`の`options`プロパティについて

```TypeScript
export interface IStandaloneEditorConstructionOptions extends IEditorConstructionOptions, IGlobalEditorOptions
```

という interface がもとになっている

その前に monaco-editor の型定義ファイルをダウンロードする必要がある

`npm i --save-exact monaco-editor`
