import './preview.css';
import { useEffect, useRef } from 'react';

interface PreviewProps {
    code: string;
    err: string;
}

const html = `
<html>
  <head>
    <style>body{background-color: fff;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
    const errorHandler = (err) => {
      const root = document.querySelector('#root');
      root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
      console.error(err);
    }

    window.addEventListener('error', (event) => {
      event.preventDefault();
      errorHandler(event.error);
    })
      window.addEventListener('message', (event) => {
        try {
          eval(event.data);
        } catch (err) {
          errorHandler(err);
        }
      }, false);
    </script>
  </body>
</html>
`;

const Preview: React.FC<PreviewProps> = ({ code, err }) => {
    const iframe = useRef<any>();

    useEffect(() => {
        iframe.current.srcdoc = html;
        setTimeout(() => {
            iframe.current.contentWindow.postMessage(code, '*');
        }, 50);
    }, [code]);

    return (
        <div className="preview-wrapper">
            <iframe
                style={{ backgroundColor: 'white' }}
                title="preview"
                ref={iframe}
                sandbox="allow-scripts"
                srcDoc={html}
            />
            {err && <div className="preview-error">{err}</div>}
        </div>
    );
};

export default Preview;
