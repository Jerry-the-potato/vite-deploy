import { useEffect } from 'react';
const importScript = (resourceUrl, type = 'text/javascript') => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = resourceUrl;
    script.type = type;
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [resourceUrl, type]);
};
export default importScript;