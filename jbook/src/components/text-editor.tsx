import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

const TextEditor: React.FC = () => {
    const [editing, setEditing] = useState<boolean>(true);

    useEffect(() => {
        const listener = () => {
            console.log('set false');
            setEditing(false);
        };
        document.addEventListener('click', listener, { capture: true });

        return () => {
            document.removeEventListener('click', listener, { capture: true });
        };
    }, []);

    if (editing) {
        return (
            <div>
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
