import {useState} from 'react'
import downloadMedia from '../js/downloadMedia';

export default function RecordBtn({canvas, audio}){
    const [media, setMedia] = useState({});

    const [status, setStatus] = useState("開始錄影");
    function handleClick(e){
        if(status == "停止錄影"){
            setStatus("開始錄影")
            media.recorder.stop();
            return;
        }
        const chunks = [];
        media.canvas = canvas;
        media.stream = media.canvas.captureStream(60); // fps
        if(audio){
            media.audio = audio;
            media.audio.play();
            media.audioStream = media.audio.captureStream();
            media.stream = new MediaStream([...media.stream.getVideoTracks(), ...media.audioStream.getAudioTracks()]);
        }
        media.recorder = new MediaRecorder(media.stream, { mimeType: "video/mp4; codecs=vp9" })
        media.recorder.ondataavailable = (evt) => { chunks.push(evt.data); };
        // Provide recorded data when recording stops
        media.recorder.onstop = () => {downloadMedia(chunks);};
        media.recorder.start(1000);
        setStatus("停止錄影");
    }

    return (
        <button onClick={handleClick}>{status}</button>
    )
}