import { useState, useEffect, useRef, useMemo } from "react";
import myGLSL from "../js/fractalWebGL.js";
import manager from "../js/animateManager.js";
import myMouse from "../js/myMouse.js";
import SlideMenuBtn from "./SlideMenuBtn.jsx";
import RecordBtn from "./RecordBtn.jsx";

const MESSAGE_MOUSE_READY = "滑鼠可以操作畫面：";
const MESSAGE_MOUSE_LOCKED = "滑鼠已鎖定！點擊上方按鈕以解鎖";
const MESSAGE_DRAGGING = "開始拖曳移動畫面";
const MESSAGE_ZOOMING = "滾輪放大縮小"

const CanvasSectionS4 = ({ ratio, min, sectinoID = "JuliaSet"}) => {
    const canvas = useRef(null);
    const section = useRef(null);
    useEffect(()=>{
        manager.addSubjectElement(section.current);
        manager.registerAnimationCallback("update" + sectinoID, myGLSL.update);
        manager.registerAnimationCallback("render" + sectinoID, myGLSL.render);
        myGLSL.setCanvas(canvas.current);
        // myGLSL.update();
        return () => {
            myGLSL.dispose();
            manager.unregisterAnimationCallback("update" + sectinoID);
            manager.unregisterAnimationCallback("render" + sectinoID);
        };
    }, []);
    const [isJulia, setIsJulia] = useState(true);
    const [useMouse, setUseMouse] = useState(1);
    const [real, setReal] = useState(0);
    const [imaginary, setImaginary] = useState(0);
    const [zoom, setZoom] = useState(250);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    const frameRef = useRef();
    useEffect(()=>{
        const data = {isJulia, useMouse, real, imaginary, zoom, offsetX, offsetY};
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {myGLSL.updateData(data)});
    }, [isJulia, useMouse, real, imaginary, zoom, offsetX, offsetY]);

    // const state = {
    //     "isJulia": [isJulia, setIsJulia],
    //     "useMouse": [useMouse, setUseMouse],
    //     "real": [real, setReal],
    //     "imaginary": [imaginary, setImaginary],
    //     "zoom": [zoom, setZoom],
    //     "offsetX" : [offsetX, setOffsetX],
    //     "offsetY" : [offsetY, setOffsetY],
    //     "transform" : [transform, setTransform],
    // }
    // Object.keys(state).forEach((key) => {
    //     data[key] = state[key];
    // });
    function resetScreen(){
        setReal(0);
        setImaginary(0);
        setZoom(250);
        setOffsetX(0);
        setOffsetY(0);
    }
    const menu = useRef(null);
    
    const [isWheel, setIsWheel] = useState(false);
    function handleWheel(e){
        if(!useMouse) return;
        setIsWheel(true);
        const zommIn = (e.deltaY > 0) ? 0.5 : 1.5;
        const addOffsetX = (canvas.current.width / 2 - myMouse.targetX) / zoom * 50;
        const addOffsetY = -(canvas.current.height / 2 - myMouse.targetY) / zoom * 50;
        setZoom(zoom * zommIn);
        setOffsetX(offsetX + addOffsetX / zommIn - addOffsetX);
        setOffsetY(offsetY + addOffsetY / zommIn - addOffsetY);
    }

    const [isMouseDown, setIsMouseDown] = useState(false);
    const preMouse = useRef({x: 0, y: 0});
    const logRef = useRef(null);
    function handleMouseDown(e){
        if(e.target.tagName == "BUTTON" || e.target.tagName == "INPUT") return;
        setIsWheel(false);
        setIsMouseDown(true);
        preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
        canvas.current.classList.remove('cursor-grab');
        canvas.current.classList.add('cursor-grabbing');
    }
    function handleMouseUp(){
        setIsMouseDown(false);
        canvas.current.classList.remove('cursor-grabbing');
        canvas.current.classList.add('cursor-grab');
    }
    function handleMouseMove(){
        
        if(!useMouse) return;
        if(isMouseDown){
            const addOffsetX = (myMouse.targetX - preMouse.current.x) / zoom * 50;
            const addOffsetY = (myMouse.targetY - preMouse.current.y) / zoom * 50;
            preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
            setOffsetX(offsetX - addOffsetX);
            setOffsetY(offsetY + addOffsetY);
            // setOffsetX((prev) => prev - addOffsetX);
            // setOffsetY((prev) => prev + addOffsetY);
        }
        setReal(((myMouse.targetX - canvas.current.width / 2) / zoom * 50));
        setImaginary(-1 * ((myMouse.targetY - canvas.current.height / 2) / zoom * 50));
    }

    const initialDistance = useRef(0);
    function getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }  
    function handleTouchStart(e) {
        preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
        setIsMouseDown(true);
        if (e.touches.length === 2) {
            setIsWheel(true);
            initialDistance.current = getDistance(e.touches[0], e.touches[1]);
        }
        else{
            setIsWheel(false);
        }
    }
    function handleTouchMove(e) {
        if(e.target.tagName == "BUTTON" || e.target.tagName == "INPUT") return;
        if (e.touches.length === 2) {
            // 兩個手指，判定縮放
            // myMouse 儲存的是父層PlayGround的Touchmove事件中的第一個手指頭
            const centerX = (myMouse.targetX + e.touches[1].clientX) / 2;
            const centerY = (myMouse.targetY + e.touches[1].clientY) / 2;
            const addOffsetX = (canvas.current.width / 2 - centerX) / zoom * 50;
            const addOffsetY = -(canvas.current.height / 2 - centerY) / zoom * 50;

            const newDistance = getDistance(e.touches[0], e.touches[1]);
            const zoomIn = newDistance / initialDistance.current;
            setZoom(zoom * zoomIn);
            setOffsetX(offsetX + addOffsetX / zoomIn - addOffsetX);
            setOffsetY(offsetY + addOffsetY / zoomIn - addOffsetY);
            // 更新初始距離
            initialDistance.current = newDistance;
            e.preventDefault();  // 防止頁面滾動
        }
        else{
            // 預設為一個手指
            const addOffsetX = (myMouse.targetX - preMouse.current.x) / zoom * 50;
            const addOffsetY = (myMouse.targetY - preMouse.current.y) / zoom * 50;
            preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
            setOffsetX(offsetX - addOffsetX);
            setOffsetY(offsetY + addOffsetY);
            setReal(((myMouse.targetX - canvas.current.width / 2) / zoom * 50));
            setImaginary(-1 * ((myMouse.targetY - canvas.current.height / 2) / zoom * 50));
        }
    }
    function handleTouchEnd(e) {
        if (e.touches.length < 2) {
            setIsWheel(false);
        }
        else if(e.touches.length === 1){
            setIsMouseDown(false);
        }
    }

    const step = useMemo(() => {
        const decimal = Math.floor(Math.log(zoom) / Math.log(10)) - 1;
        return Math.pow(10, decimal);
    }, [zoom]);
    function getPreciseOffset(offset){
        return Math.floor(offset * step) / step;
    }
    const [transform, setTransform] = useState(0);
    function handleClick(value){
        myGLSL.setTransform(value);
        setTransform(value);
    }

    return (
        <section ref={section} className="section" id={sectinoID}
            onMouseMove={handleMouseMove} onWheel={handleWheel}
            onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove} 
            onTouchEnd={handleTouchEnd}>
            <canvas ref={canvas} className="cursor-grab" id="canvasS4" width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>{isJulia ? "JuliaSet" : "Manderbrot"}</h3></header>
                <div className="parameter">
                    {isJulia && <>
                        <label>Cx</label><input onChange={(e) => setReal(e.target.value * 1)} type="number" id="real" value={Math.floor(real)}></input>
                        <label>Cy</label><input onChange={(e) => setImaginary(e.target.value * 1)} type="number" id="imaginary" value={Math.floor(imaginary)}></input>
                    </>}
                    <label>zoom</label><input onChange={(e) => setZoom(e.target.value * 1)} type="number" id="zoom" step={step} value={Math.floor(zoom)}></input>
                    <label>offsetX</label><input onChange={(e) => setOffsetX(e.target.value * 1)} type="number" step={10 / step} id="offsetX" value={getPreciseOffset(offsetX)}></input>
                    {ratio > 1 && <>
                        <label>&emsp;</label>
                        <label>&emsp;</label>
                    </>}
                    <label>offsetY</label><input onChange={(e) => setOffsetY(e.target.value * 1)} type="number" id="offsetY" step={10 / step} value={getPreciseOffset(offsetY)}></input>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <button onClick={() => setUseMouse(!useMouse)} id="useMouse">{useMouse ? "只允許使用面板" : "還是用滑鼠好了"}</button>
                    <button onClick={resetScreen}>畫面置中</button>
                    <RecordBtn canvas={canvas}/>
                    <button onClick={() => setIsJulia(!isJulia)}>{isJulia == true ? "其他圖形" : "回到Julia"}</button>
                    {!isJulia && <>
                        <button onClick={() => handleClick(0)} disabled={!transform ? true : false}>查看Manderbrot</button>
                        <button onClick={() => handleClick(100)} disabled={transform ? true : false}>查看BurningShip</button>
                    </>}
                </div>
                <div ref={logRef}><p id="dialog">
                    {useMouse
                        ? MESSAGE_MOUSE_READY + (
                            (isWheel) ? MESSAGE_ZOOMING : 
                                ((isMouseDown) ? MESSAGE_DRAGGING : "")
                        )
                        : MESSAGE_MOUSE_LOCKED}
                </p></div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
            </div>
        </section>
    );
};

export default CanvasSectionS4;