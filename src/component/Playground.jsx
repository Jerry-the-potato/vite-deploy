import { useEffect, useState, useRef } from 'react';
import useWindowSize from '../customHook/useWindowSize.js';
import CanvasSectionS1 from './CanvasSection1.jsx';
import CanvasSectionS2 from './CanvasSection2.jsx';
import CanvasSectionS3 from './CanvasSection3.jsx';
import CanvasSectionS4 from './CanvasSection4.jsx';
import CookieTable from './CookieTable.jsx';
import downloadMedia from '../js/downloadMedia.js';
import manager from '../js/animateManager.js';
import myMouse from '../js/myMouse.js';

function Playground({margin}){
    const [isOpen, setIsOpen] = useState(true);

    const breakpoint = 992 - margin * 2;
    const [width, height] = useWindowSize(margin);
    const [ratio, setRatio] = useState((width > breakpoint) ? 1 : 2);
    const [max, setMax] = useState(getMax(width, height));
    useEffect(()=>{
        setRatio((width > breakpoint) ? 1 : 2)
        setMax(getMax(width, height));
    }, [width]);

    function getMax(w, h){
        if(w > breakpoint) return (w < h ? w : h);
        else return (w*2 < h ? w : h/2);
    }

    const divRef = useRef();
    function handleMouseMove(e){
        const rect = divRef.current.getBoundingClientRect();
        const a = ((e.pageX - rect.x)) * ratio// / (rect.width);
        const b = ((e.pageY - rect.y)) * ratio// / (rect.height);
        const frames = 30;
        myMouse.NewTarget(a, b, frames);
    }
    function handleTouchMove(e){
        const rect = divRef.current.getBoundingClientRect();
        const a = ((e.touches[0].clientX - rect.x)) * ratio// / (rect.width);
        const b = ((e.touches[0].clientY - rect.y)) * ratio// / (rect.height);
        const frames = 30;
        myMouse.NewTarget(a, b, frames);
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
        <>
            {/* <button onClick={() => {setIsOpen(!isOpen)}}>{isOpen ? "卸載組件" : "載入組件"}</button> */}
            <div id="playground" ref={divRef} onMouseMoveCapture={handleMouseMove} onTouchMoveCapture={handleTouchMove} onTouchStartCapture={handleTouchMove}
                style={{"width": max + "px",
                        "height": max * ratio + "px",
                        "margin": margin +"px auto"}}>
                <CanvasSectionS4 ratio={ratio} max={max}/>
                {isOpen && (<CanvasSectionS1 canvas={canvas.S1} ratio={ratio} max={max} status={status} handleClick={handleRecord} manager={manager} myMouse={myMouse}/>)}
                {isOpen && <CanvasSectionS2 canvas={canvas.S2} audio={audio} ratio={ratio} max={max} status={status} handleClick={handleRecord} manager={manager} myMouse={myMouse}/>}
                {isOpen && <CanvasSectionS3 canvas={canvas.S3} ratio={ratio} max={max} status={status} handleClick={handleRecord} manager={manager} myMouse={myMouse}/>}
                <CookieTable></CookieTable>
            </div>
        </>
    )
}

export default Playground;