### **引言**
在現代的網頁應用中，滑鼠和觸控的互動是增強用戶體驗的關鍵因素。無論是拖曳、縮放，還是手勢操作，都能讓網頁更加生動且易於操作。這篇文章將探討如何通過滑鼠和觸控手勢來與 WebGL 進行互動，並結合 React 的狀態管理來控制畫面的縮放、平移和分形渲染。我們將介紹如何使用副作用監聽數值變化，並利用動畫物件達到流暢的畫面更新和運鏡效果，實現與分形渲染的無縫互動。

關於滑鼠延遲動畫和座標計算建議看過以下系列文：
* [A2 腳步踩穩囉：啟動工廠模式下的 Canvas Transition 動畫](https://ithelp.ithome.com.tw/articles/10351066)
* [E3 渲染的奧秘：分形茱莉亞集合的片段著色器藝術](https://ithelp.ithome.com.tw/articles/10367905)
* [E4 曼德博羅集的分形魔力：用片段著色器實現反鋸齒](https://ithelp.ithome.com.tw/articles/10368225)

### 事件總覽
我們用 React 組件做示範，包括滑鼠和觸控事件。每個事件處理器都會對應到不同的互動情境，這裡簡要解釋每個事件的作用：
1. onMouseMove：處理滑鼠移動事件，當使用者在區域內移動滑鼠時，用於動態更新畫面或捕捉滑鼠座標。
2. onWheel：處理滾輪事件，用來進行放大或縮小操作。
3. onMouseUp 和 onMouseDown：分別處理滑鼠按鍵的鬆開和按下事件，可以用來偵測拖曳動作。
4. onTouchStart、onTouchMove、onTouchEnd：這些事件是為了處理觸控設備的互動行為，在手機或平板上進行拖曳或縮放，內部邏輯由 onTouchMove 實現。

```jsx
return (
    <section ref={section} className="section" id={sectinoID}
        onMouseMove={handleMouseMove} onWheel={handleWheel}
        onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}>
    </section>
);
```

### 狀態管理
我們可以準備相對應的文本來告訴使用者當前的狀態：
```javascript
const MESSAGE_MOUSE_READY = "滑鼠可以操作畫面：";
const MESSAGE_MOUSE_LOCKED = "滑鼠已鎖定！點擊上方按鈕以解鎖";
const MESSAGE_DRAGGING = "開始拖曳移動畫面";
const MESSAGE_ZOOMING = "滾輪放大縮小"
```

先判斷滑鼠是否鎖定，然後判斷是否在縮放畫面或移動畫面
```javascript
return (
    <section>
        <div ref={logRef}><p id="dialog">
            {useMouse
                ? MESSAGE_MOUSE_READY + (
                    (isWheel) ? MESSAGE_ZOOMING : 
                        ((isMouseDown) ? MESSAGE_DRAGGING : "")
                )
                : MESSAGE_MOUSE_LOCKED}
        </p></div>
    </section>
);
```

### 偵測鼠標拖曳動作
使用者按下滑鼠時，才會開始計算座標並移動畫面，因此在這段程式碼中，我們主要利用  isMouseDown 來儲存滑鼠長壓的狀態：

```javascript
const [isMouseDown, setIsMouseDown] = useState(false);
const preMouse = useRef({x: 0, y: 0});
function handleMouseDown(e){
    if(e.target.tagName == "BUTTON" || e.target.tagName == "INPUT") return;
    setIsMouseDown(true);
    preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
    canvas.current.classList.remove('cursor-grab');
    canvas.current.classList.add('cursor-grabbing');
}
function handleMouseUp(){
    setIsMouseDown(false);
    canvas.current.classList.remove('cursor-grabbing');
    canvas.current.classList.add('cursor-grab');
}
```
* 透過 e.target.tagName 檢查事件的是否發生在按鈕或輸入框，因為在控制面板的這些按鈕或輸入框上按下時，應該避免觸發平移動畫。
* 利用 preMouse 儲存當前滑鼠座標。
* 修改 canvas 的 CSS 樣式，讓游標顯示不同圖案。

#### 鼠標移動事件
前天系列文 E3 有提到如何計算平移的座標，這邊就不贅述。除了畫面的移動外，茱莉亞集合需要輸入不同的複數常數 C 來渲染不同圖形，因此不管有沒有按下滑鼠，鼠標的位置就相當於複數平面上的座標：

```javascript
function handleMouseMove(){
    if(!useMouse) return;
    if(isMouseDown){
        const addOffsetX = (myMouse.targetX - preMouse.current.x) / zoom * 50;
        const addOffsetY = (myMouse.targetY - preMouse.current.y) / zoom * 50;
        preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
        setOffsetX(offsetX - addOffsetX);
        setOffsetY(offsetY + addOffsetY);
    }
    setReal(((myMouse.targetX - canvas.current.width / 2) / zoom * 50));
    setImaginary(-1 * ((myMouse.targetY - canvas.current.height / 2) / zoom * 50));
}
```

### 滾輪事件
首先要判斷前滾後滾，這裡我們將放大的幅度預設為 1.5、縮小為 0.5，然後根據新的縮放值修改視窗座標：
```javascript
function handleWheel(e){
    if(!useMouse) return;
    setIsWheel(true);
    const zommIn = (e.deltaY > 0) ? 0.5 : 1.5;
    const addOffsetX = (canvas.current.width / 2 - myMouse.targetX) / zoom * 50;
    const addOffsetY = -(canvas.current.height / 2 - myMouse.targetY) / zoom * 50;
    setZoom(zoom * zommIn);
    setOffsetX(offsetX + addOffsetX / zommIn - addOffsetX);
    setOffsetY(offsetY + addOffsetY / zommIn - addOffsetY);
}
```
* e.deltaY：前滾為負；後滾為正。
* 以滑鼠為縮放中心同步調整縮放和偏移（參考系列文 E3）

以上就是滑鼠的事件處理了，相對還是蠻單純的，在座標計算的基礎下，添加了簡易狀態管理和 CSS 的修改。

### 多點觸控事件
在移動端的操作方式略有不同，在進行縮放時，我們需要偵測第二個手指的加入，並且要取得兩個手指的距離來做為放大的基準值。

```javascript
const initialDistance = useRef(0);
function handleTouchStart(e) {
    preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
    setIsMouseDown(true);
    if (e.touches.length === 2) {
        setIsWheel(true);
        initialDistance.current = getDistance(e.touches[0], e.touches[1]);
    }
    else{
        setIsWheel(false);
    }
}
function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}  

```
* e.touches：這是一個觸控陣列，儲存所有正在觸控的手指頭，第一個（最先按下）的用索引值 0 取得，往後依序是 1, 2, 3... 依此類推。
* length === 2：表示使用者正在使用兩指操作（多半是縮放），此時啟用縮放功能
* 和鼠標事件不同，觸控事件的座標屬性叫做 clientX、clientY。
### 多點移動事件
同理，在手指的移動時也要分成兩個情況：

#### 1. 兩指操作（畫面縮放）
* 中心點計算：計算兩個手指座標的平均值，以此為中心點放大縮小畫面
* 距離變化計算：利用 getDistance() 函數取得新距離，並將它與初始距離進行比較，計算出 zoomIn。
* 防止頁面滾動：最後調用 e.preventDefault() 防止預設行為，因為在移動裝置上，兩指操作通常默認會觸發頁面縮放或滾動。

#### 2. 單指操作（拖曳畫面）
* 計算偏移：同上滑鼠事件
* 更新座標：同上滑鼠事件

```javascript
    function handleTouchMove(e) {
        if(e.target.tagName == "BUTTON" || e.target.tagName == "INPUT") return;
        if (e.touches.length === 2) {
            // 兩個手指，判定縮放
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const addOffsetX = (canvas.current.width / 2 - centerX) / zoom * 50;
            const addOffsetY = -(canvas.current.height / 2 - centerY) / zoom * 50;
            
            const newDistance = getDistance(e.touches[0], e.touches[1]);
            const zoomIn = newDistance / initialDistance.current;

            setZoom(zoom * zoomIn);
            setOffsetX(offsetX + addOffsetX / zoomIn - addOffsetX);
            setOffsetY(offsetY + addOffsetY / zoomIn - addOffsetY);
            // 更新初始距離
            initialDistance.current = newDistance;
        }
        else{
            // 預設為一個手指
            const addOffsetX = (myMouse.targetX - preMouse.current.x) / zoom * 50;
            const addOffsetY = (myMouse.targetY - preMouse.current.y) / zoom * 50;
            preMouse.current = {x: myMouse.targetX, y: myMouse.targetY};
            setOffsetX(offsetX - addOffsetX);
            setOffsetY(offsetY + addOffsetY);
            setReal(((myMouse.targetX - canvas.current.width / 2) / zoom * 50));
            setImaginary(-1 * ((myMouse.targetY - canvas.current.height / 2) / zoom * 50));
        }
        e.preventDefault();  // 防止頁面滾動
    }
```

### 結束觸控
最後只要在手指離開螢幕時，檢查剩下的觸控點，來更新狀態即可：

```javascript
function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        setIsWheel(false);
    }
    else if(e.touches.length === 0){
        setIsMouseDown(false);
    }
}
```

### 參數的傳遞
由於我們對畫面的控制，對渲染數據頻繁的修改，因此我們可以先用副作用監聽所有數值，接著再用 requestAnimationFrame 來管理每偵得更新請求。

```javascript
const [isJulia, setIsJulia] = useState(true);
const [useMouse, setUseMouse] = useState(1);
const [real, setReal] = useState(0);
const [imaginary, setImaginary] = useState(0);
const [zoom, setZoom] = useState(250);
const [offsetX, setOffsetX] = useState(0);
const [offsetY, setOffsetY] = useState(0);

const frameRef = useRef();
useEffect(()=>{
    const data = {isJulia, useMouse, real, imaginary, zoom, offsetX, offsetY};
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {myGLSL.updateData(data)});
}, [isJulia, useMouse, real, imaginary, zoom, offsetX, offsetY]);
```
* frameRef：儲存動畫禎的 ID 用來取消請求。
* () => {}：特別注意，在 requestAnimationFrame 中直接呼叫函式是不能傳值的，所以通常做法是用箭頭函式來包裹。

### 流暢的畫面滾動動畫
最後再補充一點，昨天沒提到我們如何流暢更新 WebGL 的參數，我們會用系列文 A2 設計的動畫物件，來達到流暢的運鏡和畫面偏移，對於一維數據，我們可以在動畫路徑使用 X 座標，並將 Y 座標設置為 0。

```javascript
const createGLSL = function(){
    this.complex = new Path(0, 0);
    this.zoom = new Path(250, 0);
    this.offset = new Path(0, 0);
    this.transform = new Path(0, 0);
    this.updateData = (data) => {
        PathConfig.resetPath(0.4, 0, 0.6);
        this.useMouse = data.useMouse;
        this.isJulia = data.isJulia;
        const frames = 30;
        this.complex.NewTarget(data.real / 50, data.imaginary / 50, frames);
        this.zoom.NewTarget(data.zoom, 0, frames);

        // offset 暫時乘以 zoom 以保持動畫流暢性，渲染時會除回去
        this.offset.NewTarget(data.offsetX / 50 * data.zoom, data.offsetY / 50 * data.zoom, frames);
    }
	return this;
}
const myGLSL = new createGLSL();
```
* 利用 NewTarget 方法來設定動畫路徑（例如從 0 漸進到 100）
* 將禎數 frames 設置為 30 禎讓動畫在 0.5 秒內完成
* 因為我們要同步修改 offset 和 zoom，為了讓畫面有自然的偏移縮放動畫，需要將 offset 先乘以 zoom 保證兩者的單位相近

接著我們用 pointX 和 pointY 來取得當前動畫禎的路徑，並將變數存入相對應的地址，完成這邊就可以銜接到昨天的曼德羅博集了。因為程式碼有點長，省略部分內容：
```javascript
this.fillJulia = () => {
    //...... 略
    this.gl.useProgram(program);
    
    const real = this.complex.pointX;
    const imaginary = this.complex.pointY;
    const zoom = this.zoom.pointX;
    const offsetX = this.offset.pointX / zoom;
    const offsetY = this.offset.pointY / zoom;
    
    const zoomLocation = this.gl.getUniformLocation(program, "u_zoom")
    const offsetLocation = this.gl.getUniformLocation(program, "u_offset")
    this.gl.uniform1f(zoomLocation, zoom);
    this.gl.uniform2f(offsetLocation, offsetX, offsetY);
    //...... 略
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}
```
* 完整版可參考文章末尾。

### **結論**
通過本文，我們學會了如何使用 React 的狀態管理和動畫物件實現與分形渲染的流暢互動。透過滑鼠和手勢的偵測，配合畫面參數的更新與動畫化處理，我們成功完成了曼德博羅集和茱莉亞集的即時控制。這樣的設計不僅提供了更好的使用者體驗，還能確保畫面在高頻互動下保持穩定。

參考我的 github：
* [gh-page](https://jerry-the-potato.github.io/vite-deploy/#JuliaSet)
* [fractalWebGL.js](https://github.com/Jerry-the-potato/vite-deploy/blob/main/src/js/fractalWebGL.js)
* [React參數狀態管理](https://github.com/Jerry-the-potato/vite-deploy/blob/main/src/component/CanvasSection4.jsx)