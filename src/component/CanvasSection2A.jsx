import { useState, useEffect, useRef } from 'react';
import threeParticle from '../js/threeParticle';
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from './RecordBtn';

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
    return (
        <section ref={section} className="section" id={sectinoID}>
            <canvas ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>threeParticle</h3></header>
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