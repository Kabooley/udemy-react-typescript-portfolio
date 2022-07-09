import './resizable.css';
import { useEffect, useState } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

interface ResizableProps {
    direction: 'horizontal' | 'vertical';
    // NOTE: childrenをpropsとして受け取るには明示的に`children: ReactNode`のように型定義をする必要がある
    children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);
    const [innerHeight, setInnerHeight] = useState<number>(window.innerHeight);
    let resizableProps: ResizableBoxProps;

    useEffect(() => {
        const listener = () => {
            setInnerWidth(window.innerWidth);
            setInnerHeight(window.innerHeight);
        };
        window.addEventListener('resize', listener);
        return () => {
            window.removeEventListener('resize', listener);
        };
    }, []);

    if (direction === 'horizontal') {
        resizableProps = {
            className: 'resize-horizontal',
            minConstraints: [innerWidth * 0.2, Infinity],
            maxConstraints: [innerWidth * 0.75, Infinity],
            width: innerWidth * 0.75,
            height: Infinity,
            resizeHandles: ['e'],
        };
    } else {
        resizableProps = {
            minConstraints: [Infinity, 24],
            maxConstraints: [Infinity, innerHeight * 0.9],
            width: Infinity,
            height: 300,
            resizeHandles: ['s'],
        };
    }
    return <ResizableBox {...resizableProps}>{children}</ResizableBox>;
};

export default Resizable;
