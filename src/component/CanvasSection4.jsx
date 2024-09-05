import { useState, useEffect, useRef } from "react";
import myGLSL from "../js/fractalWebGL.js";
import manager from "../js/animateManager.js";
import myMouse from "../js/myMouse.js";
import SlideMenuBtn from "./SlideMenuBtn.jsx";

const CanvasSectionS4 = ({ ratio, max }) => {
    const canvas = useRef();
    const section = useRef();
    const [uniqueID] = useState("JuliaSet");
    useEffect(()=>{
        manager.addSubjectElement(section.current);
        manager.registerAnimationCallback("update" + uniqueID, myGLSL.update);
        manager.registerAnimationCallback("render" + uniqueID, myGLSL.render);
        myGLSL.setCanvas(canvas.current);
        // myGLSL.update();
        return () => {
            myGLSL.dispose();
            manager.unregisterAnimationCallback("update" + uniqueID);
            manager.unregisterAnimationCallback("render" + uniqueID);
        };
    }, []);
    const [name, setName] = useState("Julia");
    const state = {
        "name": [name, setName],
        "useMouse": useState(1),
        "real": useState(0),
        "imaginary": useState(0),
        "zoom": useState(250),
        "offsetX" : useState(0),
        "offsetY" : useState(0),
    }
    function setAllState(){
        state.real[1](0);
        state.imaginary[1](0);
        state.zoom[1](250);
        state.offsetX[1](0);
        state.offsetY[1](0);
    }
    const menu = useRef();
    function setState(key, value){
        const setFunction = state[key][1];
        setFunction(value);
    }
    function addState(key, value){
        const setFunction = state[key][1];
        const currentValue = state[key][0];
        setFunction(currentValue + value);
        return currentValue * value;
    }
    function mulState(key, value){
        const setFunction = state[key][1];
        const currentValue = state[key][0];
        setFunction(currentValue * value);
        return currentValue * value;
    }
    function handleWebGLControl(e){
        const ID = e.target.id;
        const value = e.target.value;
        if(!state[ID]){
            console.warn("invalid key(ID): " + ID + ", check whether it is in object state");
            return;
        }
        setState(ID, value * 1);
    };
    function handleWheel(e){
        const zoom = (e.deltaY > 0) ? 0.5 : 1.5;
        const offsetX = (canvas.current.width / 2 - myMouse.targetX) / state.zoom[0] * 50;
        const offsetY = -(canvas.current.height / 2 - myMouse.targetY) / state.zoom[0] * 50;
        const nextZoom = mulState("zoom", zoom);
        setState("offsetX", state.offsetX[0] + offsetX / zoom - offsetX);
        setState("offsetY", state.offsetY[0] + offsetY / zoom - offsetY);
    }

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [preMouse, setPreMouse] = useState([0, 0]);
    function handleMouseDown(){
        setIsMouseDown(true);
        setPreMouse([myMouse.targetX, myMouse.targetY]);
        canvas.current.classList.remove('cursor-grab');
        canvas.current.classList.add('cursor-grabbing');

    }
    function handleMouseUp(){
        setIsMouseDown(false);
        canvas.current.classList.remove('cursor-grabbing');
        canvas.current.classList.add('cursor-grab');
    }
    function handleMouseMove(e){
        if(!state.useMouse[0]) return;
        if(isMouseDown){
            setPreMouse([myMouse.targetX, myMouse.targetY]);
            const offsetX = (myMouse.targetX - preMouse[0]) / state.zoom[0] * 50;
            const offsetY = (myMouse.targetY - preMouse[1]) / state.zoom[0] * 50;
            addState("offsetX", -offsetX);
            addState("offsetY", offsetY);

        }
        setState("real", Math.floor((myMouse.targetX - canvas.current.width / 2) / state.zoom[0] * 100));
        setState("imaginary", -1 * Math.floor((myMouse.targetY - canvas.current.height / 2) / state.zoom[0] * 100));

    }
    const [zoomStep, setZoomStep] = useState(10);
    useEffect(()=>{
        const data = {};
        Object.keys(state).forEach((key) => {
            data[key] = state[key][0];
        });
        myGLSL.updateData(data);
    }, [state]);
    return (
        <section ref={section} className="section" id={uniqueID}
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} 
            onMouseMove={handleMouseMove} onWheel={handleWheel} >
            <canvas ref={canvas} className="cursor-grab" id="canvasS4" width={max * ratio} height={ratio * max * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>{name + "Set"}</h3></header>
                <div className="parameter">
                    {state.name[0] == "Julia" && <>
                        <label>公式: Z = Z ^ 2 + C，其中:C = 1/100 * <input onChange={handleWebGLControl} type="number" id="real" value={state.real[0]}></input>+</label>
                        <label><input onChange={handleWebGLControl} type="number" id="imaginary" value={state.imaginary[0]}></input>i</label>
                    </>}
                    <label>&emsp;</label>
                    
                    <label>zoom: <input onChange={handleWebGLControl} type="number" id="zoom" step="10" value={state.zoom[0]}></input></label>
                    <label>offset: [<input onChange={handleWebGLControl} type="number" id="offsetX" value={state.offsetX[0]}></input>,</label>
                    <label><input onChange={handleWebGLControl} type="number" id="offsetY" value={state.offsetY[0]}></input>]</label>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <button onClick={handleWebGLControl} id="useMouse" value={state.useMouse[0] ? 0 : 1}>{state.useMouse[0] ? "也可以使用面板" : "還是用滑鼠好了"}</button>
                    <button onClick={() => setName("Julia")} disabled={name == "Julia" ? true : false}>查看Julia</button>
                    <button onClick={() => setName("Manderbrot")} disabled={name == "Manderbrot" ? true : false}>查看Manderbrot</button>
                    <button onClick={setAllState}>畫面置中</button>
                </div>
                <div id="dialogbox"><p id="dialog">滑鼠可以拖曳畫面、控制滾輪局部放大</p></div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
            </div>
        </section>
    );
};

export default CanvasSectionS4;