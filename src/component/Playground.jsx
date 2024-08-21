import { useEffect, useState, useRef } from 'react';
import CanvasSectionS1 from './CanvasSection1.jsx';
import CanvasSectionS2 from './CanvasSection2.jsx';
import CanvasSectionS3 from './CanvasSection3.jsx';
import CookieTable from './CookieTable.jsx';
import downloadMedia from '../js/downloadMedia.js';

function Playground({margin}){
    
    let w = window.innerWidth - margin*2;
    let h = window.innerHeight - margin*2;
    const [ratio, setRatio] = useState(window.innerWidth > 992 ? 1 : 2);
    const [max, setMax] = useState(getMax);

    function getMax(){
        if(window.innerWidth > 992) return (w < h ? w : h);
        else return (w*2 < h ? w : h/2);
    }
    window.onresize = function handleResize(){
        w = window.innerWidth - margin*2;
        h = window.innerHeight - margin*2;
        setRatio(window.innerWidth > 992 ? 1 : 2)
        setMax(getMax);
    }

    const audio = useRef();
    const canvas = {"S1": useRef(), "S2": useRef(), "S3": useRef()};
    const [media] = useState({});
    const [status, setStatus] = useState("Record");
    function handleClick(e){
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
        <div id="playground"
            style={{"width": max + "px",
                     "height": window.innerWidth<992 ? max*2 : max + "px",
                     "margin": margin +"px auto"}}>

            <CanvasSectionS1 canvas={canvas.S1} ratio={ratio} max={max} status={status} handleClick={handleClick}/>
            <CanvasSectionS2 audio={audio} canvas={canvas.S2} ratio={ratio} max={max} status={status} handleClick={handleClick}/>
            <CanvasSectionS3 canvas={canvas.S3} ratio={ratio} max={max} status={status} handleClick={handleClick}/>
            <CookieTable></CookieTable>
        </div>
    )
}




export default Playground;