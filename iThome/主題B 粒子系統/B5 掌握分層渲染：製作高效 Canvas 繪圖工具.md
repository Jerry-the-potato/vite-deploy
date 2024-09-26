### 架構設計
在昨天的文章中，我們探討了如何創建動態效果，雖然過程中省略了一些細節，但這為我們打下了良好的基礎。今天，我們將逐步補充那些細節，根據昨天的討論，目前的架構如下：
```javascript
export default function createAlgorithm(){
    //......
    this.transitionRadian = 0;
    this.trasitionOmega = Math.PI / 10000;
    this.update = () => {
        this.transitionRadian += this.trasitionOmega * this.speed;
        this.motion();
        this.addTexture();
    }
    this.render = () => {
        //......
    }
    return this;
}
```

### 渲染畫筆
在這裡，讓我們嘗試實驗性的作法，模組化繪圖方法，使其和演算法完全分離。這樣，我們可以透過委派繪圖任務給 painter 讓它管理：

```javascript
export default function createPainter(){
	this.renderTask = [];
	this.addTask = (...tasks) => {
		this.renderTask.push(...tasks);
	} 
	this.render = () => {
        // 渲染所有任務
		this.renderTask.forEach(priority => {
			this.drawTask(task);
		});
		// 刪除任務
		this.renderTask = {};
	}
    this.drawTask = (task) => {
        // 根據 task 繪製具體內容
    }
}
```

然後，當我們計算時添加渲染對象，會等到渲染時，才一次進行渲染：

```javascript
function createAlgorithm(){
    //......
    const painter = new createPainter();
    this.addTexture = (ctx) => {
        //......
        painter.addTask(渲染對象1, 渲染對象2);
    }
    this.render = (ctx) => {
		clear(ctx);
        painter.render();
    }
}
```

在這裡，painter 專注於繪圖任務，每個任務都有自己的繪圖對象 ctx，因此，若有必要，它可以同步繪圖多個 canvas。

```javascript
clear(ctx1);
clear(ctx2);
painter.render();
```

這樣的結構具備很大的靈活性，甚至還可以只渲染某一個對象：
```javascript
painter.render(ctx1);
```

### 為什麼需要畫筆來管理繪圖方法？
寫到這裡，或許你會疑惑，兜兜轉轉下來，模組化確實把功能分離成獨立的區塊，但是看上去越來越複雜，那它的好處到底是什麼？

#### 分層渲染
通過新增一個 priority 參數，我們可以像 CSS 中的 Z-Index 一樣進行分層渲染：
```javascript
this.addTask = (priority = 0, ...tasks) => {
    this.renderTask[priority] = this.renderTask[priority] || [];
    this.renderTask[priority].push(...tasks);
} 
this.render = () => {
    // 取得所有 priority 並排序
    Object.keys(this.renderTask)
        .sort((a, b) => a - b)
        .forEach(priority => {
            // 取出對應 priority 下的所有任務並渲染
            this.renderTask[priority].forEach(task => {
                this.drawTask(task);
            });
        });
    // 刪除任務
    this.renderTask = {};
}
```
這樣的設計使得繪圖順序不再依賴於函式呼叫順序，而是由 priority 決定：
```javascript
painter.addTask(1, middleView);
painter.addTask(2, frontView);
painter.addTask(0, background);
```
> 繪圖的順序會依照 priority 決定，因此會依序繪製背景、中景、前景。這樣，可以有效分離、模組化每個區塊，保持獨立性。

### 分工明確
演算法與繪圖分離，使演算法專注於計算，繪圖專注於呈現，便於分工合作。在這種架構下，我們可以更清楚地對畫布進行操作，比如，我們要把整個畫面進行偏移：

```javascript
this.render = (ctx, offset) => {
    clearBoard(ctx);
    ctx.save();
    ctx.translate(ctx.canvas.width * offset, 0);
    painter.render();
    ctx.restore();
}
```
> 這段程式碼展示了如何將畫布的變動與繪圖過程分開，不僅提高了可讀性，還使得未來的維護和擴展變得更加簡單

### 畫筆細節實作
現在，讓我們完成它的內部功能，讓我們設計幾個基本形狀，首先取得繪圖對象 ctx，和一些參數：
```javascript
this.drawTask = (task) => {
    if(!task.ctx) return;
    
    // 繪圖上下文
    const { ctx } = task;

    // 座標
    const { x, y, x2, y2 } = task;

    // 形狀
    const { r, a, b, angle } = task;

    // 文字
    const { text, size } = task;

    // 顏色
    const { color } = task;

    // ......
}
```
> 用物件解構賦值的形式，讓參數分類，保持可讀性

接著，我們設計五種基本的繪圖形狀：
```javascript
switch(task.name){
    case "circle": drawCircle(); break;
    case "point": drawPoint(); break;
    case "line": drawLine(); break;
    case "crescent": drawCrescent(); break;
    case "text": drawText(); break;
    default: console.warn(`未定義的繪圖形狀: ${task.name}`);
}
```
> switch case 在結構上的表示比較明確，並且可以有多對一的關係。

或者，可以用物件的形式設計：

```javascript
this.methodMap = {
    "circle": drawCircle,
    "point": drawPoint,
    "line": drawLine,
    "crescent": drawCrescent,
    "text": drawText,
};
this.methodMap[task.name]?.() || console.warn(`未定義的繪圖形狀: ${task.name}`);
```
最後，更可以追求簡潔用直接字串拼接函式名稱，但較不嚴謹，且管理大小寫問題較麻煩：
```javascript
this["draw" + task.name]?.() || console.warn(`未定義的繪圖形狀: ${task.name}`);
```

本系列秉持對新手友善的原則，最後讓我們介紹 Canvas 繪圖方法和封裝：
#### 畫一個圓
這個函式使用 arc 方法，接受圓心座標 (x, y) 和半徑 r，並用指定的顏色填充圓形。
```javascript
function drawCircle() {
    if(x + y + r == "NaN"){
        console.warn("drawCircle failed: missing parameter");
        return;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}
```

#### 畫一個點
為了節省資源，這個函式用正方形來表示一個點，通過 fillRect 方法來實現。點的大小由 size 決定，
```javascript
function drawPoint() {
    if(x + y + size == "NaN"){
        console.warn("drawPoint failed: missing parameter");
        return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(x - size/2, y - size/2, size, size);
}
```

#### 畫一條線
這個函式使用 moveTo 和 lineTo 方法來定義線的起點和終點，並根據指定的顏色和線寬進行繪製。
```javascript
function drawLine() {
    if(x + y + x2 + y2 == "NaN"){
        console.warn("drawLine failed: missing parameter");
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = (size)?size:1;
    ctx.stroke();
}
```
#### 畫一輪彎月
這個函式用於繪製一個彎月形狀。通過計算圓的半徑和角度，使用 arc 方法繪製內外圓，實現彎月的外觀。
```javascript
function drawCrescent(){
    if(x + y + a + b + angle + size == "NaN"){
        console.warn("drawCrescent failed: missing parameter");
        return;
    }
    const c = Math.sqrt(a * a + b * b);
    const aTan = Math.atan(a / b);
    const dx = Math.cos(angle + Math.PI / 2) * a * size;
    const dy = Math.sin(angle + Math.PI / 2) * a * size;
    ctx.beginPath();
    ctx.arc(x, y, b * size, angle, Math.PI + angle, true);
    ctx.arc(x + dx, y + dy, c * size, Math.PI + angle + aTan, angle - aTan, false); // 順時針 縮小 +-
    ctx.fillStyle = color;
    ctx.fill(); 
}
```
#### 書寫文字
這個函式用於在畫布上繪製指定的文字。它設置了字體、文字基線和對齊方式，然後使用 fillText 方法將文字繪製到畫布上。
```javascript
function drawText(){
    ctx.font = size + "px Comic Sans MS";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, Math.round(x), Math.round(y));
}
```

![https://ithelp.ithome.com.tw/upload/images/20240926/201351973Vnf2dNBkg.png](https://ithelp.ithome.com.tw/upload/images/20240926/201351973Vnf2dNBkg.png)

### 結論

在本文中，我們深入探討了如何通過模組化設計來提升 Canvas 繪圖的靈活性和可維護性。引入了 createPainter 來專注於渲染任務，這樣的分工使得演算法與繪圖方法完全分離。

此外，引入優先級的概念，使得我們能夠以靈活的方式管理繪圖的順序，類似於 CSS 中的 Z-Index，讓畫布的繪製更加有序。在這樣的設計下，我們能夠根據需求自由調整每個繪圖任務的優先級，從而提高渲染效果的靈活性。

整理而言，透過將繪圖任務與算法邏輯分開，我們能夠更清晰地管理各種繪圖形狀。無論是圓形、點、線條、彎月形狀還是文字，每個繪圖任務都有明確的接口和參數，這樣的結構不僅增強了代碼的可讀性，也方便了未來的調整和擴展。