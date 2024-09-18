import {useState} from 'react'
import downloadMedia from '../js/downloadMedia';
const media = {};
export default function RecordBtn({canvas, audio}){
    const [isRecording, setIsRecording] = useState(false);
    function handleClick(){
        setIsRecording(!isRecording);

        if(isRecording){
            media.recorder.stop();
            return;
        }
        const chunks = [];
        media.canvas = canvas.current;
        media.stream = media.canvas.captureStream(60); // fps
        if(audio?.current){
            media.audio = audio.current;
            media.audio.play();
            media.audioStream = media.audio.captureStream();
            media.stream = new MediaStream([...media.stream.getVideoTracks(), ...media.audioStream.getAudioTracks()]);
        }
        media.recorder = new MediaRecorder(media.stream, { mimeType: "video/mp4; codecs=vp9" })
        media.recorder.ondataavailable = (evt) => { chunks.push(evt.data); };
        // Provide recorded data when recording stops
        media.recorder.onstop = () => {downloadMedia(chunks);};
        media.recorder.start(1000);
    }

    return (
        <button onClick={handleClick}>{isRecording ? "停止錄影" : "開始錄影"}</button>
    )
}