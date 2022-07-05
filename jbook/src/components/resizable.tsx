import './resizable.css';
import { ResizableBox } from 'react-resizable';

interface ResizableProps {
    direction: 'horizontal' | 'vertcal';
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    return (
        <ResizableBox width={Infinity} height={300} resizeHandles={['s']}>
            {children}
        </ResizableBox>
    );
};

export default Resizable;
