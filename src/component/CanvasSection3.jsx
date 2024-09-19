import { useEffect, useRef, useState } from "react";
import physic from "../js/physic";
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from "./RecordBtn";

const CanvasSectionS3 = ({ ratio, min, uniqueID = "SortAlgorithm"}) => {
    const canvas = useRef(null);
    const menu = useRef(null);
    const log = useRef(null);
    const section = useRef(null);
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
    const [path, setPath] = useState({
        'leapLinear': 0,
        'leapEasein': -2,
        'leapEaseout': 2,
    })
    function handleChange(e){
        const ID = e.target.id;
        const value = e.target.value;
        setPath((path) => {return {...path, [ID]: value}});
    }
    useEffect(() => {
        physic.setPath(path);
    }, [path]);
    function handleClick(e){
        const ID = e.target.id;
        physic.start(ID, path)
    }
    return (
        <section ref={section} className="section" id={uniqueID}>
            <canvas ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id=""><h3>粒子系統</h3></header>
                <div id="pathConfig" className="parameter">
                    <label>linear :</label><input onChange={handleChange} type="number" id="leapLinear" value={path.leapLinear}></input>
                    <label>easein :</label><input onChange={handleChange} type="number" id="leapEasein" value={path.leapEasein}></input>
                    {ratio > 1 && <>
                        <label>&emsp;</label>
                        <label>&emsp;</label>
                    </>}
                    <label>easeout :</label><input onChange={handleChange} type="number" id="leapEaseout" value={path.leapEaseout}></input>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <RecordBtn canvas={canvas}/>
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