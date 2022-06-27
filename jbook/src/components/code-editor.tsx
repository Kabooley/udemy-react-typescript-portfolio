import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    initialValue: string;
    onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
    const onEditorDidMount = (getValue: () => string, monaco: Monaco) => {
        console.log(getValue());
    };

    return (
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
    );
};

export default CodeEditor;
