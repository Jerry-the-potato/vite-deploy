import audioUrl from '../assets/Lovely Piano Song.mp3'

const SectionS2 = ({ audio, canvas, ratio, max, status, handleClick }) => {
    return (
        <section className="section" id="S2">
            <audio ref={audio} controls id="myAudio" style={{"position": "absolute", "left": "10px", "bottom": "10px", "zIndex": "100"}}>
                <source src={audioUrl}></source>
            </audio>
            <canvas id="canvasS2" ref={canvas} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <button onClick={handleClick} value="S2" className="record">{status}</button>
        </section>
    );
};

export default SectionS2;