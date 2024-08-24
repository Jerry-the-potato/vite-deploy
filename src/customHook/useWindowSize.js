import { useLayoutEffect, useState } from 'react';

export default function useWindowSize(margin){
  const [size, setSize] = useState([window.innerWidth - margin*2, window.innerHeight - margin*2]);
  useLayoutEffect(() => {
    const updateSize = () => setSize([window.innerWidth - margin*2, window.innerHeight - margin*2]);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}