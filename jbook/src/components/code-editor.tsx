import { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
  const editorRef = useRef(null);
  const onEditorDidMount = (editor: any, monacoEditor: any) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      if (!editorRef.current) return;
      console.log(editor.getValue());
      onChange(editor.getValue());
    });
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
        wordWrap: "on",
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
