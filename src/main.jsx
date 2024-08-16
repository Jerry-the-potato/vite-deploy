import './css/index.css'
import './css/table.css'
import './css/mobile.css';
import React, { useEffect, useState, useRef} from "react";
import { createRoot } from 'react-dom/client';
import {Hyperlink, Input, Button, Section, Div, Table, Audio} from './App.jsx';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

function NavigationBar({width}){

    const [isOpen, setIsOpen] = useState(false);
    function handleClick() {
        setIsOpen(!isOpen);
    }
    return  <nav id="nav" style={{'left': isOpen ? 0 : -width +"px"}}>
                <Hyperlink text="Home" href="#home" id="tohome"/>
                <Hyperlink text="section1" href="#S1" id="toS1"/>
                <Hyperlink text="section2" href="#S2" id="toS2"/>
                <Hyperlink text="section3" href="#S3" id="toS3"/>
                <Div onClick={handleClick} id="navSlider" content=<p>{isOpen ? "X": "≡"}</p>/>
            </nav>
}
function MainScreen(){
    useEffect(()=>{
        document.getElementById("toS3").click();

    },[]);
    return <Div id="mainScreen" content=<>
        <GameBox margin={20}/>
    </>/>
}


function GameBox({margin}){
    
    let w = window.innerWidth - margin*2;
    let h = window.innerHeight - margin*2;
    const [max, setMax] = useState(getMax);
    const [tableData, setTableData] = useState([]);

    function getMax(){
        if(window.innerWidth > 992) return (w < h ? w : h);
        else return (w*2 < h ? w : h/2);
    }
    window.onresize = function handleResize(){
        w = window.innerWidth - margin*2;
        h = window.innerHeight - margin*2;
        setMax(getMax);
    }

    const columns = [
        { accessor: 'price', label: '售價' },
        { accessor: 'name', label: '品名' },
        { accessor: 'onsale', label: '在架上', format: value => (value ? '✔️' : '  ') },
        { accessor: 'tag', label: '標籤' },
        { accessor: 'rate', label: '顧客評價' },
    ]
    const rows = tableData.map((data, index) => {
        // return data; 需要ID作為Table取得key的手段
        return {url: data.url, id: index, price: data.price, name: data.name, onsale: data.onsale, tag: data.tag, rate: data.rate}
    })
    useEffect(()=>{
        const newTableData = tableData.concat([
            { id: 1, price: '50', name: "potatochip 洋芋片", onsale: true, tag: 'salty crispy delicious', rate: '⭐️⭐️⭐️⭐️' },
            { id: 2, price: '30', name: "chocolate 巧克力", onsale: false, tag: 'sweet rich smooth', rate: '⭐️⭐️⭐️⭐️⭐️' },
            { id: 3, price: '25', name: "biscuit 餅乾", onsale: true, tag: 'crunchy light buttery', rate: '⭐️' },
            { id: 4, price: '60', name: "nuts 堅果", onsale: true, tag: 'healthy crunchy tasty', rate: '⭐️⭐️⭐️⭐️' },
            { id: 5, price: '35', name: "driedfruit 果乾", onsale: false, tag: 'sweet chewy fruity', rate: '⭐️⭐️⭐️' },
            { id: 6, price: '40', name: "candy 糖果", onsale: true, tag: 'sweet colorful chewy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 7, price: '55', name: "popcorn 爆米花", onsale: false, tag: 'salty sweet crispy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 8, price: '45', name: "beefjerky 牛肉乾", onsale: true, tag: 'savory chewy spicy', rate: '⭐️⭐️⭐️⭐️⭐️' },
            { id: 9, price: '20', name: "jelly 果凍", onsale: false, tag: 'sweet fruity soft', rate: '⭐️⭐️⭐️' },
            { id: 10, price: '28', name: "cracker 薄脆餅", onsale: true, tag: 'light crispy savory', rate: '⭐️⭐️⭐️' },
            { id: 11, price: '32', name: "cookies 曲奇餅", onsale: false, tag: 'sweet buttery soft', rate: '⭐️⭐️⭐️⭐️' },
            { id: 12, price: '38', name: "seaweed 海苔", onsale: true, tag: 'salty crispy healthy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 13, price: '22', name: "mints 薄荷糖", onsale: false, tag: 'refreshing sweet cool', rate: '⭐️⭐️' },
            { id: 14, price: '42', name: "cerealbar 穀物棒", onsale: true, tag: 'healthy filling crunchy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 15, price: '33', name: "pudding 布丁", onsale: false, tag: 'sweet smooth creamy', rate: '⭐️⭐️⭐️' },
            { id: 16, price: '50', name: "granola 格蘭諾拉", onsale: true, tag: 'crunchy healthy sweet', rate: '⭐️⭐️⭐️⭐️' },
            { id: 17, price: '65', name: "trailmix 綜合果仁", onsale: false, tag: 'savory sweet healthy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 18, price: '36', name: "fruitchips 果片", onsale: true, tag: 'crunchy fruity sweet', rate: '⭐️⭐️' },
            { id: 19, price: '58', name: "caramelpopcorn 焦糖爆米花", onsale: false, tag: 'sweet crispy rich', rate: '⭐️⭐️⭐️⭐️' },
            { id: 20, price: '48', name: "yogurt 雪酪", onsale: true, tag: 'creamy tangy sweet', rate: '⭐️⭐️⭐️⭐️' }
        ])
        setTableData(newTableData);
    }, [])


    const canvasRef = useRef();
    // const media = {'canvas': undefined, 'stream': undefined, 'recorder': undefined}
    const [media, setMedia] = useState({});
    function downloadMedia(data){
        // Gather chunks of video data into a blob and create an object URL
        var blob = new Blob(data, {type: "video/webm" });
        const recording_url = URL.createObjectURL(blob);
        // Attach the object URL to an <a> element, setting the download file name
        const a = document.createElement('a');
        a.style = "display: none;";
        a.href = recording_url;
        a.download = "video.mp4";
        document.body.appendChild(a);
        // Trigger the file download
        a.click();
        setTimeout(() => {
        // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
        URL.revokeObjectURL(recording_url);
        document.body.removeChild(a);
        }, 0);
    }

    useEffect(() => {
        const chunks = [];
        const media = {}
        media.canvas = canvasRef.current;
        media.stream = media.canvas.captureStream(60); // fps
        media.recorder = new MediaRecorder(media.stream, { mimeType: "video/mp4; codecs=vp9" })
        // Record data in chunks array when data is available
        media.recorder.ondataavailable = (evt) => { chunks.push(evt.data); };
        // Provide recorded data when recording stops
        media.recorder.onstop = () => {downloadMedia(chunks);};
        setMedia(media);
    }, []);
    const [Status, setStatus] = useState("Record");
    function handleClick(){
        console.log("clicked");
        if(Status == "Record"){
            media.recorder.start(1000);
            setStatus("Stop");
            // setTimeout(() => {
            //     setStatus("Record")
            //     media.recorder.stop();
            // }, 5000)
            return;
        }
        setStatus("Record")
        media.recorder.stop();
    }

    return (
        <Div id="gameBox"
            style={{"width": max + "px",
                     "height": window.innerWidth<992 ? max*2 : max + "px",
                     "margin": margin +"px auto"}}
            content=<>
            <Section id="home" content= <>
                <Table columns={columns} rows={rows}/>
                {/* <Menu/> */}
            </>/>
            <Section id="S1" content= <>
                <h4>Opps! 似乎還在施工中</h4>
                <canvas id="canvasS1" width={max} height={window.innerWidth<992 ? max*2 : max}></canvas>
                <canvas id="bitmap" width={max} height={window.innerWidth<992 ? max*2 : max}></canvas>
                <MenuS1/>
            </>/>
            <Section id="S2" content= <>
                {/* <h4>Opps! 似乎還在施工中</h4> */}
                {/* <Menu/> */}
                <Audio id="myAudio" name="Lovely Piano Song"/>
            </>/>
            <Section id="S3" content= <>
                <h4>Opps! 似乎還在施工中</h4>
                <canvas id="canvasS3" ref={canvasRef} width={max} height={window.innerWidth<992 ? max*2 : max}></canvas>
                {/* <Menu/> */}
                <Button onClick={handleClick} id="record" text={Status}/>
                <MenuS3/>
            </>/>
        </>/>
    )
}
function MenuS1(){
    return <Div className="gamemenu" content=<>
                <header id="header"><h3>Lotka Volterra 實驗場</h3></header>
                <Div className="parameter" content=<>
                    <Input text="Alpha :" type="number" id="alpha-equation" value="5"/>
                    <Input text="Beta :" type="number" id="beta-equation" value="10"/>
                    <Input text="Gamma :" type="number" id="gamma-equation" value="5"/>
                    <Input text="Delta :" type="number" id="delta-equation" value="10"/>
                    <Input text="Vector Size :" type="number" id="dlength" value="10"/>
                    <Input text="Transform Speed :" type="number" id="speed" value="10"/>
                </>/>
                <Div className="controlpanel" content=<>
                    <label>★</label>
                    <Button text="跟隨滑鼠" id="mouseOn"/>
                    <Button text="取消縮放" id="transform"/>
                    <Button text="停止(左)" id="pauseMain"/>
                    <Button text="停止(右)" id="pauseWorker"/>
                </>/>
                <Div id="dialogbox" content=<p id="dialog">∫此微分方程用於描述捕食者和獵物的此消彼長，沿著中心點呈現漩渦紋理</p>/>
                <Button className="slideMenu" text="△"/>
            </>/>
}
function MenuS3(){
    return <Div className="gamemenu" content=<>
                <header id=""><h3>粒子系統</h3></header>
                <Div id="pathConfig" className="parameter" content=<>
                    <Input text="linear :" type="number" id="linear" value="0"/>
                    <Input text="easein :" type="number" id="easein" value="-2"/>
                    <Input text="easeout :" type="number" id="easeout" value="2"/>
                </>/>
                <Div id="sortAlgorithm" className="controlpanel" content=<>
                    <label>★</label>
                    <Button text="泡沫排序" id="bubbleSort"/>
                    <Button text="選擇排序" id="selectionSort"/>
                    <Button text="插入排序" id="insertionSort"/>
                    <Button text="快速排序" id="quickSort"/>
                    <Button text="合併排序" id="mergeSort"/>
                    <Button text="堆排序" id="heapSort"/>
                    <Button text="希爾排序" id="shellSort"/>
                    <Button text="計數排序" id="countingSort"/>
                    {/* <Button text="基數排序" id="radixSort"/>
                    <Button text="桶排序" id="bucketSort"/> */}
                    <Button text="取消" id="cancelSort"/>
                    <Button text="一步一步來" id="stepByStep"/>
                    <Button text="打亂" id="randomSort"/>
                    <Button text="立刻打亂" id="instantRandomSort"/>
                </>/>
                <Div id="sortLog" content=<p id="">碰撞模擬和重力引擎</p>/>
                <Button className="slideMenu" text="△"/>
            </>/>
}
root.render(<>
    <NavigationBar width={250}/>
    <MainScreen/>
</>);