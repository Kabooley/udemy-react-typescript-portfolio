import './resizable.css';
import { ResizableBox } from 'react-resizable';

interface ResizableProps {
    direction: 'horizontal' | 'vertical';
    // NOTE: childrenをpropsとして受け取るには明示的に`children: ReactNode`のように型定義をする必要がある
    children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    return (
        <ResizableBox width={Infinity} height={300} resizeHandles={['s']}>
            {children}
        </ResizableBox>
    );
};

export default Resizable;
