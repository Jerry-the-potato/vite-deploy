import { useEffect, useRef, useState } from "react";
import physic from "../js/physic";
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
const CanvasSectionS3 = ({ canvas, ratio, max, status, handleClick}) => {
    const menu = useRef();
    const log = useRef();
    const section = useRef();
    const [uniqueID] = useState("SortAlgorithm");
    useEffect(()=>{
        physic.setCanvas(canvas.current, log.current);
        manager.addSubjectElement(section.current);
        manager.registerAnimationCallback("update" + uniqueID, physic.update);
        manager.registerAnimationCallback("render" + uniqueID, physic.render);
        return () => {
            physic.cleanup();
            manager.removeSubjectID(uniqueID);
            manager.unregisterAnimationCallback("update" + uniqueID);
            manager.unregisterAnimationCallback("render" + uniqueID);
        }
    }, []);
    return (
        <section ref={section} className="section" id={uniqueID}>
            <canvas ref={canvas} width={max * ratio} height={ratio * max * ratio}></canvas>
            <button onClick={handleClick} value="S3" className="record">{status}</button>
            <div ref={menu} className="gamemenu">
                <header id=""><h3>粒子系統</h3></header>
                <div id="pathConfig" className="parameter">
                    <label>linear :</label><input onChange={physic.setPath} type="number" id="leapLinear" defaultValue="0"></input>
                    <label>easein :</label><input onChange={physic.setPath} type="number" id="leapEasein" defaultValue="-2"></input>
                    <label>easeout :</label><input onChange={physic.setPath} type="number" id="leapEaseout" defaultValue="2"></input>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <button onClick={physic.start} id="bubbleSort">泡沫排序</button>
                    <button onClick={physic.start} id="selectionSort">選擇排序</button>
                    <button onClick={physic.start} id="insertionSort">插入排序</button>
                    <button onClick={physic.start} id="quickSort">快速排序</button>
                    <button onClick={physic.start} id="mergeSort">合併排序</button>
                    <button onClick={physic.start} id="heapSort">堆排序</button>
                    <button onClick={physic.start} id="shellSort">希爾排序</button>
                    <button onClick={physic.start} id="countingSort">計數排序</button>
                    {/* <Button text="基數排序" id="radixSort"/>
                    <Button text="桶排序" id="bucketSort"/> */}
                    <button onClick={physic.start} id="randomSort">打亂</button>
                    <button onClick={physic.start} id="instantRandomSort">立刻打亂</button>
                    <button onClick={physic.cancel} id="cancelSort">取消</button>
                    <button onClick={physic.stepByStep} id="stepByStep">一步一步來</button>
                </div>
                <div ref={log} id="sortLog"><p id="">碰撞模擬和重力引擎</p></div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
            </div>
        </section>
    );
};

export default CanvasSectionS3;