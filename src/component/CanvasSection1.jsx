import { useState, useEffect, useRef } from "react";
import lokaVolterra from '../js/lokaVolterra.js'
import MenuS1 from "./MenuS1.jsx";

const CanvasSectionS1 = ({ section, manager, myMouse, canvas, ratio, max, status, handleClick}) => {
    const bitmap = useRef();
    useEffect(()=>{
        lokaVolterra.setCanvas(canvas.current, bitmap.current);
        manager.addAnimationCallback(lokaVolterra.renderS1);
        manager.addAnimationCallback(lokaVolterra.updateS1);
        lokaVolterra.algorithm.mouse = myMouse;
    }, [])
    return (
        <section ref={section} className="section" id="S1">
            <canvas id="canvasS1" ref={canvas} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <canvas id="bitmap" ref={bitmap} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <button onClick={handleClick} value="S1" className="record">{status}</button>
            <MenuS1 manager={manager} lokaVolterra={lokaVolterra}/>
        </section>
    );
};

export default CanvasSectionS1;