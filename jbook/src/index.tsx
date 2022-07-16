import 'bulmaswatch/superhero/bulmaswatch.min.css';
import { createRoot } from 'react-dom/client';
// import CodeCell from './components/code-cell';
import TextEditor from './components/text-editor';

const App = () => {
    return (
        <div>
            {/* <CodeCell /> */}
            <TextEditor />
        </div>
    );
};

const _root = document.getElementById('root');
if (_root) {
    const root = createRoot(_root);
    root.render(<App />);
}
