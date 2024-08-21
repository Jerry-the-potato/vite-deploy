import Input from "./Input";
function MenuS3(){
    return <div className="gamemenu">
                <header id=""><h3>粒子系統</h3></header>
                <div id="pathConfig" className="parameter">
                    <Input text="linear :" type="number" id="linear" value="0"/>
                    <Input text="easein :" type="number" id="easein" value="-2"/>
                    <Input text="easeout :" type="number" id="easeout" value="2"/>
                </div>
                <div id="sortAlgorithm" className="controlpanel">
                    <label>★</label>
                    <button id="bubbleSort">泡沫排序</button>
                    <button id="selectionSort">選擇排序</button>
                    <button id="insertionSort">插入排序</button>
                    <button id="quickSort">快速排序</button>
                    <button id="mergeSort">合併排序</button>
                    <button id="heapSort">堆排序</button>
                    <button id="shellSort">希爾排序</button>
                    <button id="countingSort">計數排序</button>
                    {/* <Button text="基數排序" id="radixSort"/>
                    <Button text="桶排序" id="bucketSort"/> */}
                    <button id="cancelSort">取消</button>
                    <button id="stepByStep">一步一步來</button>
                    <button id="randomSort">打亂</button>
                    <button id="instantRandomSort">立刻打亂</button>
                </div>
                <div id="sortLog"><p id="">碰撞模擬和重力引擎</p></div>
                <button className="slideMenu">△</button>
            </div>
}
const CanvasSectionS3 = ({ canvas, ratio, max, status, handleClick}) => {
    return (
        <section className="section" id="S3">
            <canvas id="canvasS3" ref={canvas} width={max * ratio} height={window.innerWidth < 992 ? ratio * max * 2 : ratio * max}></canvas>
            <button onClick={handleClick} value="S3" className="record">{status}</button>
            <MenuS3 />
        </section>
    );
};

export default CanvasSectionS3;