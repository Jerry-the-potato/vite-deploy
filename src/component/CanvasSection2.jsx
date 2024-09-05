import { useState, useEffect, useRef } from 'react';
import audioUrl from '../assets/Lovely Piano Song.mp3'
import musicAnalyser from '../js/musicAnalyser';
import manager from '../js/animateManager';

const SectionS2 = ({ audio, canvas, ratio, max, status, handleClick }) => {
    const section = useRef();
    const [uniqueID] = useState("MusicAnalyser");
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
            <canvas ref={canvas} width={max * ratio} height={ratio * max * ratio}></canvas>      
            <audio onPlay={musicAnalyser.getAnalyser} ref={audio} controls id="myAudio" style={{"position": "absolute", "left": "10px", "bottom": "10px"}}>
                <source src={audioUrl}></source>
            </audio>
            <button onClick={handleClick} value="S2" className="record">{status}</button>
        </section>
    );
};

export default SectionS2;