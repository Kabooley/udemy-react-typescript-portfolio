import './resizable.css';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

interface ResizableProps {
    direction: 'horizontal' | 'vertical';
    // NOTE: childrenをpropsとして受け取るには明示的に`children: ReactNode`のように型定義をする必要がある
    children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    let resizableProps: ResizableBoxProps;

    if(direction === 'horizontal') {
        resizableProps = {
            minConstraints: [window.innerWidth * 0.2, Infinity],
            maxConstraints: [window.innerWidth * 0.75, Infinity],
            width: window.innerWidth * 0.75,
            height: Infinity,
            resizeHandles: ['s'],
        }
    }
    else {
        resizableProps = {
            minConstraints: [Infinity, 24],
            maxConstraints: [Infinity, window.innerHeight * 0.9],
            width: Infinity,
            height: 300,
            resizeHandles: ['s'],
        }
    }
    return (
        <ResizableBox
            {...resizableProps}
        >
            {children}
        </ResizableBox>
    );
};

export default Resizable;
