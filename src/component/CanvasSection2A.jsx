import { useState, useEffect, useRef } from 'react';
import threeParticle from '../js/threeParticle';
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from './RecordBtn';

const CanvasSectionS2A = ({ratio, min, sectinoID = "3DSort"}) => {
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
        }
        return () => {
            window.removeEventListener("resize", threeParticle.resize);
            threeParticle.cleanup();
            manager.removeSubjectID(sectinoID);
            manager.unregisterAnimationCallback("update" + sectinoID);
            manager.unregisterAnimationCallback("render" + sectinoID);
        }
    }, [])
    return (
        <section ref={section} className="section" id={sectinoID}>
            <canvas ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>threeParticle</h3></header>
                <div className="controlpanel">
                    <RecordBtn canvas={canvas} audio={audio}></RecordBtn>
                </div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
                <div id="dialogbox"><p id="dialog">{(error) ? (error) : ""}</p></div>
            </div>
        </section>
    );
};

export default CanvasSectionS2A;