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
