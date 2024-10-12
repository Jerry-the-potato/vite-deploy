import { useState, useEffect, useRef } from 'react';
import threeParticle from '../js/threeParticle';
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from './RecordBtn';
import { clamp } from 'three/src/math/MathUtils.js';

const CanvasSectionS2A = ({ratio, min, sectinoID = "Sort3D"}) => {
    const canvas = useRef(null);
    const audio = useRef(null);
    const menu = useRef(null);
    const section = useRef(null);
    const [error, setError] = useState();
    useEffect(()=>{
        try{
            window.addEventListener('resize', threeParticle.resize, false);
            threeParticle.setCanvas(canvas.current);
            manager.addSubjectElement(section.current);
            manager.registerAnimationCallback("update" + sectinoID, threeParticle.update);
            manager.registerAnimationCallback("render" + sectinoID, threeParticle.render);
        } catch(e){
            setError(e.message);
            console.warn(e.stack);
        }
        return () => {
            window.removeEventListener("resize", threeParticle.resize);
            threeParticle.cleanup();
            manager.removeSubjectID(sectinoID);
            manager.unregisterAnimationCallback("update" + sectinoID);
            manager.unregisterAnimationCallback("render" + sectinoID);
        }
    }, [])
    function handleClick(e){
        const ID = e.target.id;
        threeParticle.start(ID)
    }
    function handleParameterChange(e){
        const {id, value, min, max} = e.target;
        let newValue = value * 1;
        
        if (max != "" && newValue > max * 1) newValue = max;
        if (min != "" && newValue < min * 1) newValue = min;
        // newValue = clamp(value, min * 1, max * 1)

        e.target.value = newValue;
        threeParticle.system.setParameter(id, newValue * 1);
    }
    return (
        <section ref={section} className="section" id={sectinoID}>
            <canvas ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">   
                <header id="header"><h3>threeParticle</h3></header>
                <div className="parameter">
                    <label>長度</label><input onChange={handleParameterChange} type="number" id="length" defaultValue="64" min="3" max="4096"></input>
                    <label>高度</label><input onChange={handleParameterChange} type="number" id="maxHeight" defaultValue="255"  min="50" max="350"></input>
                    <label>半徑</label><input onChange={handleParameterChange} type="number" id="radius" defaultValue="150" min="50" max="300"></input>
                    <label>深度</label><input onChange={handleParameterChange} type="number" id="depth" defaultValue="10" min="-100" max="100"></input>
                </div>
                <div className="controlpanel">
                    <RecordBtn canvas={canvas} audio={audio}></RecordBtn>
                    <button onClick={handleClick} id="bubbleSort">泡沫排序</button>
                    <button onClick={handleClick} id="selectionSort">選擇排序</button>
                    <button onClick={handleClick} id="insertionSort">插入排序</button>
                    <button onClick={handleClick} id="quickSort">快速排序</button>
                    <button onClick={handleClick} id="mergeSort">合併排序</button>
                    <button onClick={handleClick} id="heapSort">堆排序</button>
                    <button onClick={handleClick} id="shellSort">希爾排序</button>
                    <button onClick={handleClick} id="countingSort">計數排序</button>
                    {/* <Button text="基數排序" id="radixSort"/>
                    <Button text="桶排序" id="bucketSort"/> */}
                    <button onClick={handleClick} id="randomSort">打亂</button>
                    <button onClick={handleClick} id="instantRandomSort">立刻打亂</button>
                    <button onClick={threeParticle.cancel} id="cancelSort">取消</button>
                    <button onClick={threeParticle.stepByStep} id="stepByStep">一步一步來</button>
                </div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
                <div id="dialogbox"><p id="dialog">{(error) ? (error) : ""}</p></div>
            </div>
        </section>
    );
};

export default CanvasSectionS2A;