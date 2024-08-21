import Input from "./Input";
function MenuS1(){
    return <div className="gamemenu">
                <header id="header"><h3>Lotka Volterra 實驗場 + Web Woker</h3></header>
                <div className="parameter">
                    <Input text="Alpha :" type="number" id="alpha-equation" value="5"/>
                    <Input text="Beta :" type="number" id="beta-equation" value="10"/>
                    <Input text="Gamma :" type="number" id="gamma-equation" value="5"/>
                    <Input text="Delta :" type="number" id="delta-equation" value="10"/>
                    <Input text="Vector Size :" type="number" id="dlength" value="10"/>
                    <Input text="Transform Speed :" type="number" id="speed" value="10"/>
                </div>
                <div className="controlpanel">
                    <label>★</label>
                    <button id="mouseOn">跟隨滑鼠</button>
                    <button id="transform">取消縮放</button>
                    <button id="pauseMain">停止(左)</button>
                    <button id="pauseWorker">停止(右)</button>
                </div>
                <div id="dialogbox" content=<p id="dialog">∫此微分方程用於描述捕食者和獵物的此消彼長，沿著中心點呈現漩渦紋理</p>/>
                <button className="slideMenu">△</button>
            </div>
}
const CanvasSectionS1 = ({ canvas, ratio, max, status, handleClick}) => {
    return (
        <section className="section" id="S1">
            <canvas id="canvasS1" ref={canvas} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <canvas id="bitmap" width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <button onClick={handleClick} value="S1" className="record">{status}</button>
            <MenuS1 />
        </section>
    );
};

export default CanvasSectionS1;