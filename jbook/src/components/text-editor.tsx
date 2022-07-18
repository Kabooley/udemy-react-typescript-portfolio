import "./text-editor.css";
import { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';

const TextEditor: React.FC = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [editing, setEditing] = useState<boolean>(true);

    useEffect(() => {
        const listener = (event: MouseEvent) => {
            if (
                ref.current &&
                event.target &&
                ref.current.contains(event.target as Node)
            ) {
                // Element clicked on is inside editor.
                return;
            }
            // Element clicked on is outside editor.
            setEditing(false);
        };
        document.addEventListener('click', listener, { capture: true });

        return () => {
            document.removeEventListener('click', listener, { capture: true });
        };
    }, []);

    if (editing) {
        return (
            <div ref={ref}>
                <MDEditor />
            </div>
        );
    }
    return (
        <div
            onClick={() => {
                console.log('set true');
                setEditing(true);
            }}
        >
            <MDEditor.Markdown source={'# Header'} />
        </div>
    );
};

export default TextEditor;
