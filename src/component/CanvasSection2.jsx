import { useState, useEffect, useRef } from 'react';
import audioUrl from '../assets/Lovely Piano Song.mp3'
import musicAnalyser from '../js/musicAnalyser';
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from './RecordBtn';

const CanvasSectionS2 = ({ratio, min, sectinoID = "MusicAnalyser"}) => {
    const canvas = useRef(null);
    const audio = useRef(null);
    const menu = useRef(null);
    const section = useRef(null);
    const [error, setError] = useState();
    useEffect(()=>{
        try{
            window.addEventListener('resize', musicAnalyser.resize, false);
            musicAnalyser.setCanvas(canvas.current);
            manager.addSubjectElement(section.current);
            manager.registerAnimationCallback("update" + sectinoID, musicAnalyser.update);
            manager.registerAnimationCallback("render" + sectinoID, musicAnalyser.render);
        } catch(e){
            setError(e.message);
        }
        return () => {
            window.removeEventListener("resize", musicAnalyser.resize);
            musicAnalyser.cleanup();
            manager.removeSubjectID(sectinoID);
            manager.unregisterAnimationCallback("update" + sectinoID);
            manager.unregisterAnimationCallback("render" + sectinoID);
        }
    }, [])
    return (
        <section ref={section} className="section" id={sectinoID}>
            <canvas ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>MusicAnalyser</h3></header>
                <div className="controlpanel">
                    <RecordBtn canvas={canvas} audio={audio}></RecordBtn>
                </div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
                <div id="dialogbox"><p id="dialog">{(error) ? (error) : ""}</p></div>
            </div>
            <audio onPlay={(e) => musicAnalyser.getAnalyser(e.target)} ref={audio} controls id="myAudio" style={{"position": "absolute", "left": "10px", "bottom": "10px"}}>
                <source src={audioUrl}></source>
            </audio>

        </section>
    );
};

export default CanvasSectionS2;