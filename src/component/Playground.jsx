import { useEffect, useState, useRef } from 'react';
import useWindowSize from '../customHook/useWindowSize.js';
import CanvasSectionS1 from './CanvasSection1.jsx';
import CanvasSectionS2 from './CanvasSection2.jsx';
import CanvasSectionS3 from './CanvasSection3.jsx';
import CookieTable from './CookieTable.jsx';
import downloadMedia from '../js/downloadMedia.js';
import manager from '../js/animateManager.js';
import { Path, PathConfig } from "../js/path.js";
// import {updateS1, renderS1} from '../js/lokaVolterra.js';

function Playground({margin}){
    
    const [width, height] = useWindowSize();
    const [ratio, setRatio] = useState(width > 992 ? 1 : 2);
    const [max, setMax] = useState(getMax(width, height));
    
    useEffect(()=>{
        setRatio(width > 992 ? 1 : 2)
        setMax(getMax(width, height));
    }, [width]);

    function getMax(w, h){
        if(w > 992) return (w < h ? w : h);
        else return (w*2 < h ? w : h/2);
    }

    const sections = [useRef(), useRef(), useRef()];
    const [myMouse] = useState(new Path());
    useEffect(()=>{
        const elements = sections.map((obj) => {
            if(obj.current) return obj.current;
        })
        manager.addIntersectionObserver();
        manager.addSubjectElements(elements)
        PathConfig.resetPath();
        PathConfig.resetLeap();
        manager.addAnimationCallback(myMouse.NextFrame)
        console.log(manager);
    }, [])

    function handleMouseMove(e){
        const rect = e.target.getBoundingClientRect();
        if(true){
            const a = ((e.pageX - rect.x)) / (rect.width);
            const b = ((e.pageY - rect.y)) / (rect.height);
            const frames = 30;
            myMouse.NewTarget(a, b, frames);
        }
    }

    const audio = useRef();
    const canvas = {"S1": useRef(), "S2": useRef(), "S3": useRef()};
    const [media] = useState({});
    const [status, setStatus] = useState("Record");
    function handleRecord(e){
        if(status == "Stop"){
            setStatus("Record")
            media.recorder.stop();
            return;
        }
        const chunks = [];
        const ID = e.target.value;
        media.canvas = canvas[ID].current;
        media.stream = media.canvas.captureStream(60); // fps
        media.audio = audio.current;
        if(ID == "S2"){
            media.audio.play();
            media.audioStream = media.audio.captureStream();
            media.stream = new MediaStream([...media.stream.getVideoTracks(), ...media.audioStream.getAudioTracks()]);
        }
        media.recorder = new MediaRecorder(media.stream, { mimeType: "video/mp4; codecs=vp9" })
        media.recorder.ondataavailable = (evt) => { chunks.push(evt.data); };
        // Provide recorded data when recording stops
        media.recorder.onstop = () => {downloadMedia(chunks);};
        media.recorder.start(1000);
        setStatus("Stop");
    }

    return (
        <div id="playground" onMouseMove={handleMouseMove} 
            style={{"width": max + "px",
                     "height": window.innerWidth<992 ? max*2 : max + "px",
                     "margin": margin +"px auto"}}>

            <CanvasSectionS1 section={sections[0]} canvas={canvas.S1} ratio={ratio} max={max} status={status} handleClick={handleRecord} manager={manager} myMouse={myMouse}/>
            <CanvasSectionS2 section={sections[1]} canvas={canvas.S2} audio={audio} ratio={ratio} max={max} status={status} handleClick={handleRecord} manager={manager} myMouse={myMouse}/>
            <CanvasSectionS3 section={sections[2]} canvas={canvas.S3} ratio={ratio} max={max} status={status} handleClick={handleRecord} manager={manager} myMouse={myMouse}/>
            <CookieTable></CookieTable>
        </div>
    )
}

export default Playground;