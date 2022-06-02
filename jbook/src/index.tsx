import * as esbuild from 'esbuild-wasm';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const App = (): JSX.Element => {
    const ref = useRef<any>();
    const [input, setInput] = useState<string>('');
    const [code, setCode] = useState<string>('');

    useEffect(() => {
        startService();
    }, []);

    const startService = async () => {
        // serviceはトランスパイル、コンパイル、トランスポートに利用する
        ref.current = await esbuild.startService({
            worker: true,
            // public/esbuild.wasmがあるから確認してねの命令
            wasmURL: '/esbiuld.wasm',
        });
    };

    const onClick = async (): Promise<void> => {
        if (!ref.current) return;

        const result = await ref.current.transform(input, {
            loader: 'jsx',
            target: 'es2015',
        });

        setCode(result);
    };

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
        </div>
    );
};

ReactDOM.render(<App />, document.querySelector('#root'));

// https://stackoverflow.com/questions/71668256/deprecation-notice-reactdom-render-is-no-longer-supported-in-react-18
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
// )
