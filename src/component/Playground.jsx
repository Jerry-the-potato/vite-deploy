import { useEffect, useState, useRef } from 'react';
import useWindowSize from '../customHook/useWindowSize.js';
import CanvasSection1 from './CanvasSection1.jsx';
import CanvasSection2 from './CanvasSection2.jsx';
import CanvasSection2A from './CanvasSection2A.jsx';
import CanvasSection3 from './CanvasSection3.jsx';
import CanvasSection4 from './CanvasSection4.jsx';
import CookieTable from './CookieTable.jsx';
import NavigationBar from './NavigationBar.jsx';
import myMouse from '../js/myMouse.js';

function Playground({margin}){
    const breakpoint = 992 - margin * 2;
    const [width, height] = useWindowSize(margin);
    const ratio = (width > breakpoint) ? 1 : 2;
    const min = getMin(width, height);
    function getMin(w, h){
        const min = (w > breakpoint)
            ? ((w < h) ? w : h)
            : ((w < h * 0.5) ? w : h * 0.5);
        return min;
    }

    const divRef = useRef();
    function handleMouseMove(e){
        const rect = divRef.current.getBoundingClientRect();
        const x = ((e.pageX - rect.x)) * ratio// / (rect.width);
        const y = ((e.pageY - rect.y)) * ratio// / (rect.height);
        const frames = 30;
        myMouse.NewTarget(x, y, frames);
    }
    function handleTouchMove(e){
        const rect = divRef.current.getBoundingClientRect();
        const x = ((e.touches[0].clientX - rect.x)) * ratio// / (rect.width);
        const y = ((e.touches[0].clientY - rect.y)) * ratio// / (rect.height);
        const frames = 30;
        myMouse.NewTarget(x, y, frames);
    }
    function getStyle(){
        return{
            "width": min + "px",
            "height": min * ratio + "px",
            "margin": margin +"px auto"
        }
    }
    return (
        <>
            <div id="playground" ref={divRef} onMouseMoveCapture={handleMouseMove} onTouchMoveCapture={handleTouchMove} onTouchStartCapture={handleTouchMove}
                style={getStyle()}>
                <CanvasSection4 ratio={ratio} min={min}/>
                <CanvasSection1 ratio={ratio} min={min}/>
                <CanvasSection2A ratio={ratio} min={min}/>
                <CanvasSection2 ratio={ratio} min={min}/>
                <CanvasSection3 ratio={ratio} min={min}/>
                <CookieTable></CookieTable>
            </div>
            <NavigationBar width={(ratio == 1) ? 250 : 150} divRef={divRef}/>
        </>
    )
}

export default Playground;