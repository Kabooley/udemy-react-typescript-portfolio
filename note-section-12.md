# Note Section 12

How to Extract Reusable Components

#### 134: Refactoring out the Preview Compent

index.tsx の内容を抽出してプレビュー機能をコンポーネント化した

```TypeScript
// preview.tsx

import { useEffect, useRef } from 'react';

interface PreviewProps {
    code: string;
}

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

const Preview: React.FC<PreviewProps> = ({ code }) => {
    const iframe = useRef<any>();

    useEffect(() => {
        iframe.current.srcdoc = html;
        iframe.current.contentWindow.postMessage(code, '*');
    }, [code]);

    return <iframe title="preview" ref={iframe} sandbox="allow-scripts" srcDoc={html} />;
};

export default Preview;
```

```TypeScript
// index.tsx
//
// textareaの削除
// htmlの削除

import 'bulmaswatch/superhero/bulmaswatch.min.css';
import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';
import CodeEditor from './components/code-editor';
import Preview from './components/preview';

const App = () => {
    const ref = useRef<any>();
    // Previewへcodeを渡すために復活
    const [code, setCode] = useState<string>('');
    const [input, setInput] = useState<string>('');

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
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
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(input)],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window',
            },
        });

        // codeを更新するために復活
        setCode(result.outputFiles[0].text);
    };


    return (
        <div>
            <CodeEditor
                initialValue="const a = 1;"
                onChange={(value) => setInput(value)}
            />
            <div>
                <button onClick={onClick}>Submit</button>
            </div>
            <Preview code={code}/>
        </div>
    );
};

// ReactDOM.render(<App />, document.querySelector('#root'));
const _root = document.getElementById('root');
if (_root) {
    const root = createRoot(_root);
    root.render(<App />);
}
```

#### 135: Extracting Bundling Logic

バンドリングロジックの抽出

```TypeScript
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from '../plugins/unpkg-path-plugin';
import { fetchPlugin } from '../plugins/fetch-plugin';

let service: esbuild.Service;
export default async (rawCode: string) => {
    if(!service) {
        service = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
        });
    }

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

    return result.outputFiles[0].text;
}
```

```TypeScript
import 'bulmaswatch/superhero/bulmaswatch.min.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import CodeEditor from './components/code-editor';
import Preview from './components/preview';
import bundle from './bundler';

const App = () => {
    const [code, setCode] = useState<string>('');
    const [input, setInput] = useState<string>('');

    const onClick = async () => {
        const output = await bundle(input);
        setCode(output);
    };


    return (
        <div>
            <CodeEditor
                initialValue="const a = 1;"
                onChange={(value) => setInput(value)}
            />
            <div>
                <button onClick={onClick}>Submit</button>
            </div>
            <Preview code={code}/>
        </div>
    );
};

const _root = document.getElementById('root');
if (_root) {
    const root = createRoot(_root);
    root.render(<App />);
}
```

#### 137: Multiple Code editor

エディタ部分を別コンポーネントとして抽出したから複数エディタとかできるようになった

```TypeScript
import 'bulmaswatch/superhero/bulmaswatch.min.css';
import { createRoot } from 'react-dom/client';
import CodeCell from './components/code-cell';

const App = () => {
    return (
        <div>
            <CodeCell />
            <CodeCell />
        </div>
    );
};

const _root = document.getElementById('root');
if (_root) {
    const root = createRoot(_root);
    root.render(<App />);
}
```

```TypeScript
import { useState } from 'react';
import CodeEditor from '../components/code-editor';
import Preview from '../components/preview';
import bundle from '../bundler';

const CodeCell = () => {
    const [code, setCode] = useState<string>('');
    const [input, setInput] = useState<string>('');

    const onClick = async () => {
        const output = await bundle(input);
        setCode(output);
    };

    return (
        <div>
            <CodeEditor
                initialValue="const a = 1;"
                onChange={(value) => setInput(value)}
            />
            <div>
                <button onClick={onClick}>Submit</button>
            </div>
            <Preview code={code} />
        </div>
    );
};

export default CodeCell;
```
