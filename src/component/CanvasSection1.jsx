import { useState, useEffect, useRef } from "react";
import Input from "./Input";
import lokaVolterra from '../js/lokaVolterra.js'
function MenuS1({manager}){
    const menu = useRef();
    
    function handleSlideMenu(e){
        const m = menu.current;
        const b = e.target;
		const rectMenu = m.getBoundingClientRect();
		const rectButton = b.getBoundingClientRect();
		const height = rectButton.y - rectMenu.y;
		if(b.innerText == "△"){
			m.style.top = "-" + height + "px";
			b.innerText = "▽";
		}
		else{
			m.style.top = "1%";
			b.innerText = "△";
		}
	}
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
    const [isMain, setIsMain] = useState(true);
    const [isWorker, setIsWorker] = useState(true);
    return <div ref={menu} className="gamemenu">
                <header id="header"><h3>Lotka Volterra 實驗場 + Web Woker</h3></header>
                <div className="parameter">
                    <Input text="Alpha :" type="number" id="alpha-equation" value="5"/>
                    <Input text="Beta :" type="number" id="beta-equation" value="10"/>
                    <Input text="Gamma :" type="number" id="gamma-equation" value="5"/>
                    <Input text="Delta :" type="number" id="delta-equation" value="10"/>
                    <Input text="Vector Size :" type="number" id="dlength" value="10"/>
                    <Input text="Transform Speed :" type="number" id="speed" value="10"/>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <button id="mouseOn">跟隨滑鼠</button>
                    <button id="transform">取消縮放</button>
                    <button onClick={handlePauseMain} id="pauseMain">{isMain ? "停止(左)" : "開始(左)"}</button>
                    <button onClick={handlePauseWorker} id="pauseWorker">{isWorker ? "停止(右)" : "開始(右)"}</button>
                </div>
                <div id="dialogbox" content=<p id="dialog">∫此微分方程用於描述捕食者和獵物的此消彼長，沿著中心點呈現漩渦紋理</p>/>
                <button onClick={handleSlideMenu} className="slideMenu">△</button>
            </div>
}
const CanvasSectionS1 = ({ section, manager, canvas, ratio, max, status, handleClick}) => {
    const bitmap = useRef();
    useEffect(()=>{
        lokaVolterra.setCanvas(canvas.current, bitmap.current);
        manager.addAnimationCallback(lokaVolterra.render);
        manager.addAnimationCallback(lokaVolterra.updateS1);
    }, [])
    return (
        <section ref={section} className="section" id="S1">
            <canvas id="canvasS1" ref={canvas} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <canvas id="bitmap" ref={bitmap} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <button onClick={handleClick} value="S1" className="record">{status}</button>
            <MenuS1 manager = {manager}/>
        </section>
    );
};

export default CanvasSectionS1;