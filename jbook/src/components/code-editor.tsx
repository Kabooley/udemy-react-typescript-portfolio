import './code-editor.css';
import { useRef } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import codeShift from 'jscodeshift';
import Highlighter from 'monaco-jsx-highlighter';

interface CodeEditorProps {
    initialValue: string;
    onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
    const editorRef = useRef<any>(null);
    // editorにanyしかつけられない...
    const onEditorDidMount: OnMount = (editor, monacoEditor): void => {
        editorRef.current = editor;
        console.log(editor);
        console.log(monacoEditor);
        editor.onDidChangeModelContent(() => {
            if (!editorRef.current) return;
            onChange(editor.getValue());
        });
        editor.getModel()?.updateOptions({ tabSize: 2 });

        // Initialize highlighter
        const highlighter = new Highlighter(
            // @ts-ignore
            window.monaco,
            codeShift,
            editor
        );

        // Activate highlighting
        highlighter.highLightOnDidChangeModelContent();
    };

    const onFormatClick = (): void => {
        // get currunt value from editor
        // format that value
        // set the formatted value back in the editor
        if (!editorRef.current) return;
        const unformatted = editorRef.current.getModel().getValue();
        const formatted = prettier
            .format(unformatted, {
                parser: 'babel',
                plugins: [parser],
                useTabs: false,
                semi: true,
                singleQuote: true,
            })
            // 必ず文末に改行をもたらす機能を禁止させる
            .replace(/\n$/, '');

        editorRef.current.setValue(formatted);
    };

    return (
        <div className="editor-wrapper">
            <button
                className="button button-format is-primary is-small"
                onClick={onFormatClick}
            >
                format
            </button>
            <MonacoEditor
                // editorDidMount={onEditorDidMount}
                onMount={onEditorDidMount}
                value={initialValue}
                height="500px"
                theme="vs-dark"
                language="javascript"
                options={{
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    showUnused: false,
                    folding: false,
                    lineNumbersMinChars: 3,
                    fontSize: 16,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
