import audioUrl from '../assets/Lovely Piano Song.mp3'

const SectionS2 = ({ section, audio, canvas, ratio, max, status, handleClick }) => {
    return (
        <section ref={section} className="section" id="S2">
            <canvas id="canvasS2" ref={canvas} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>      
            <audio ref={audio} controls id="myAudio" style={{"position": "absolute", "left": "10px", "bottom": "10px"}}>
                <source src={audioUrl}></source>
            </audio>
            <button onClick={handleClick} value="S2" className="record">{status}</button>
        </section>
    );
};

export default SectionS2;