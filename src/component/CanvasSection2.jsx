import { useState, useEffect, useRef } from 'react';
import audioUrl from '../assets/Lovely Piano Song.mp3'
import musicAnalyser from '../js/musicAnalyser';
import manager from '../js/animateManager';
import SlideMenuBtn from "./SlideMenuBtn";
import RecordBtn from './RecordBtn';

const CanvasSectionS2 = ({ratio, min, uniqueID = "MusicAnalyser"}) => {
    const canvas = useRef(null);
    const audio = useRef(null);
    const menu = useRef(null);
    const section = useRef(null);
    useEffect(()=>{
        window.addEventListener('resize', musicAnalyser.resize, false);
        musicAnalyser.setCanvas(canvas.current);
        manager.addSubjectElement(section.current);
        manager.registerAnimationCallback("update" + uniqueID, musicAnalyser.update);
        manager.registerAnimationCallback("render" + uniqueID, musicAnalyser.render);
        return () => {
            window.removeEventListener("resize", musicAnalyser.resize);
            musicAnalyser.cleanup();
            manager.removeSubjectID(uniqueID);
            manager.unregisterAnimationCallback("update" + uniqueID);
            manager.unregisterAnimationCallback("render" + uniqueID);
        }
    }, [])
    return (
        <section ref={section} className="section" id={uniqueID}>
            <canvas ref={canvas} width={min * ratio} height={ratio * min * ratio}></canvas>
            <div ref={menu} className="gamemenu">
                <header id="header"><h3>MusicAnalyser</h3></header>
                <div className="controlpanel">
                    <RecordBtn canvas={canvas} audio={audio}></RecordBtn>
                </div>
                <SlideMenuBtn menu={menu}></SlideMenuBtn>
            </div>
            <audio onPlay={musicAnalyser.getAnalyser} ref={audio} controls id="myAudio" style={{"position": "absolute", "left": "10px", "bottom": "10px"}}>
                <source src={audioUrl}></source>
            </audio>
        </section>
    );
};

export default CanvasSectionS2;