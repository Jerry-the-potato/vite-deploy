import { useState, useEffect, useRef } from "react";
import SlideMenuBtn from "./SlideMenuBtn";

export default function MenuS1({manager, lokaVolterra}){
    const menu = useRef();
    const state = {
        "useMouse": useState(0),
        "isTransform": useState(0),
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
        const name = (!isMain ? "request" : "cancel") + "AnimationByName";
        manager[name]("renderS1");
        manager[name]("updateS1");
        setIsMain(!isMain);
    }
    function handlePauseWorker(){
        lokaVolterra["pauseWorker"](!isWorker);
        setIsWorker(!isWorker);
    }
    return <div ref={menu} className="gamemenu">
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
                    <button onClick={handleCanvasControl} id="useMouse" value={state.useMouse[0] ? 0 : 1}>{state.useMouse[0] ? "取消跟隨" : "跟隨滑鼠"}</button>
                    <button onClick={handleCanvasControl} id="isTransform" value={state.isTransform[0] ? 0 : 1}>{state.isTransform[0] == "1" ? "取消縮放" : "加入縮放"}</button>
                    <button onClick={handlePauseMain} id="pauseMain">{isMain ? "停止(左)" : "開始(左)"}</button>
                    <button onClick={handlePauseWorker} id="pauseWorker">{isWorker ? "停止(右)" : "開始(右)"}</button>
                </div>
                <div id="dialogbox"><p id="dialog">∫此微分方程用於描述捕食者和獵物的此消彼長，沿著中心點呈現漩渦紋理</p></div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
            </div>
}