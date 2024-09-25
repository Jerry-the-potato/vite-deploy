import { useState, useEffect, useRef } from "react";
import lokaVolterra from '../js/lokaVolterra.js'
import manager from "../js/animateManager.js";
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from "./RecordBtn.jsx";
const CanvasSectionS1 = ({ratio, min, sectinoID = "LokaVolterra"}) => {
    const canvas = useRef(null);
    const bitmap = useRef(null);
    const section = useRef(null);
    useEffect(()=>{
		window.addEventListener("resize", lokaVolterra.resize, false);
        lokaVolterra.setCanvas(canvas.current, bitmap.current);
        manager.addSubjectElement(section.current);
        manager.registerAnimationCallback("update" + sectinoID, lokaVolterra.update);
        manager.registerAnimationCallback("render" + sectinoID, lokaVolterra.render);
        manager.registerTrigger("worker" + sectinoID, () => lokaVolterra.pauseWorker(true), () => lokaVolterra.pauseWorker(false));
        return () => {
            window.removeEventListener("resize", lokaVolterra.resize);
            lokaVolterra.cleanup();
            manager.removeSubjectID(sectinoID);
            manager.unregisterAnimationCallback("update" + sectinoID);
            manager.unregisterAnimationCallback("render" + sectinoID);
            manager.unRegisterTrigger("worker" + sectinoID);
        }
    }, []);

    const menu = useRef(null);
    const state = {
        "useMouse": useState(0),
        "isTransform": useState(0),
        "isGravity": useState(0),
        "alpha": useState(5),
        "beta": useState(10),
        "gamma": useState(5),
        "delta": useState(10),
        "dlength": useState(10),
        "speed": useState(10)
    }
    function handleCanvasControl(e){
        const ID = e.target.id;
        const value = e.target.value;
        if(!state[ID]){
            console.warn("invalid key(ID): " + ID + ", check whether it is in object state");
            return;
        }
        const setState = state[ID][1];
        setState(value * 1);
    }
    useEffect(()=>{
        const data = {};
        Object.keys(state).forEach((key) => {
            data[key] = state[key][0];
        });
        lokaVolterra.algorithm.updateData(data);
    }, [state])
    const [isMain, setIsMain] = useState(true);
    const [isWorker, setIsWorker] = useState(true);
    function handlePauseMain(){
        const methodMap = {
            true: (name) => manager.publicPauseAnimation(name),
            false: (name) => manager.publicResumeAnimation(name),
        };
        methodMap[isMain]("render" + sectinoID);
        methodMap[isMain]("update" + sectinoID);
        setIsMain(!isMain);
    }
    function handlePauseWorker(){
        lokaVolterra["pauseWorker"](!isWorker);
        setIsWorker(!isWorker);
    }
    function handleClick(e){
        const ID = e.target.id;
        lokaVolterra.changeType(ID);
    }
    return (
        <section ref={section} className="section" id={sectinoID}>
            <canvas value={Math.random()} ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <canvas ref={bitmap} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>Lotka Volterra 實驗場 + Web Woker</h3></header>
                <div className="parameter">
                    <label>Alpha</label><input onChange={handleCanvasControl} type="number" id="alpha" value={state.alpha[0]}></input>
                    <label>Beta</label><input onChange={handleCanvasControl} type="number" id="beta" value={state.beta[0]}></input>
                    <label>Gamma</label><input onChange={handleCanvasControl} type="number" id="gamma" value={state.gamma[0]}></input>
                    <label>Delta</label><input onChange={handleCanvasControl} type="number" id="delta" value={state.delta[0]}></input>
                    <label>Vector Size</label><input onChange={handleCanvasControl} type="number" id="dlength" value={state.dlength[0]}></input>
                    <label>Transform Speed</label><input onChange={handleCanvasControl} type="number" id="speed" value={state.speed[0]}></input>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <button onClick={handleClick} id="taro">芋頭</button>
                    <button onClick={handleClick} id="plate">盤子</button>
                    <button onClick={handleClick} id="hourglass">沙漏</button>
                    <button onClick={handleClick} id="cookie">幸運餅乾</button>
                    <button onClick={handleCanvasControl} id="useMouse" value={state.useMouse[0] ? 0 : 1}>{state.useMouse[0] ? "取消滑鼠控制" : "滑鼠控制參數"}</button>
                    <button onClick={handleCanvasControl} id="isGravity" value={state.isGravity[0] ? 0 : 1}>{state.isGravity[0] == "1" ? "閉關引力(受影響粒子不可逆)" : "開啟引力(將有不可逆的影響)"}</button>
                    <button onClick={handleCanvasControl} id="isTransform" value={state.isTransform[0] ? 0 : 1}>{state.isTransform[0] == "1" ? "取消縮放" : "加入縮放"}</button>
                    <button onClick={handlePauseMain} id="pauseMain">{isMain ? "停止(左)" : "開始(左)"}</button>
                    <button onClick={handlePauseWorker} id="pauseWorker">{isWorker ? "停止(右)" : "開始(右)"}</button>
                    <RecordBtn canvas={canvas}></RecordBtn>
                </div>
                <div id="dialogbox"><p id="dialog">∫此微分方程用於描述捕食者和獵物的此消彼長，沿著中心點呈現漩渦紋理</p></div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
            </div>
        </section>
    );
};

export default CanvasSectionS1;