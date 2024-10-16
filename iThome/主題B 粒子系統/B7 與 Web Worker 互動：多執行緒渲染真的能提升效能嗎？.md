### 引言
在單執行緒的 JavaScript 中，所有的任務都在主執行緒上執行，包括渲染、事件處理與計算邏輯。這導致在進行複雜的計算時，可能會引發畫面卡頓或掉幀的情況。為了解決這類效能問題，Web Worker 提供了一種多執行緒處理的方式，能夠將計算密集的任務移出主執行緒，從而提升畫面的流暢度。

### 效能問題的背景
在先前文章中，我們探討了單執行緒渲染的效能瓶頸，特別是在處理大量粒子系統的時候，當計算引力和模擬碰撞時，效能表現尤為不佳。這是因為每幀都需要進行大量的計算，這不僅拖慢了渲染速度，還導致了用戶體驗的下降。

### Web Worker 實作範例
Web Worker 是一種允許在 JavaScript 中執行多執行緒任務的 API。透過將 Web Worker 整合到渲染過程中，可以把耗時的運算轉移到背景執行，而主執行緒則負責畫面更新與控制，使整體的畫面渲染更加流暢。

#### 基本使用方法：
```javascript
const worker = new Worker('./worker.js');

worker.postMessage(可轉移對象);

worker.onmessage = function (e) {
    console.log(e.data);
};
```

#### 可轉移對象
能夠和 Web Worker 傳輸的資料格式是有限的，它必須是可轉移對象[Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)，不過還是蠻多種類的，從基本的物件、音訊、點陣圖、到離屏 Canvas 都可以。同時要注意的是，在 Web Worker 的作用域中不包含 window 物件。

因此，我們需要一個介面和它進行溝通，剛好，我們先前就做了一個前端和演算法之間的介面，讓我們只保留和 Web Worker 有關的程式片段：
```javascript
const createLokaVolterra = function(){
	this.setCanvas = (canvas, bitmap) => {
        this.canvas = canvas;
		this.myWorker = new MyWorker();
		this.offscreen = bitmap.transferControlToOffscreen();
		this.myWorker.postMessage({
			"name": "transferControlToOffscreen",
			"canvas": this.offscreen,
		}, [this.offscreen]);
	}
	this.cleanup = () => {}
	this.resize = () => {
		this.myWorker.postMessage({
			"name": "setOffscreen",
			"w": this.canvas.width,
			"h": this.canvas.height
		});
	}
	this.pauseWorker = (isPause) => {
		this.myWorker.postMessage({"name": isPause ? "requestAnimation" : "cancelAnimation"});
	}
	this.render = () => {}
	this.update = () => {}
	return this;
}
```
* transferControlToOffscreen：這個方法可以把 Canvas 的控制權轉移，進行離屏渲染。
* offscreen：接著我們把離屏 Canvas 作為參數傳遞，此時需要特別標註其為依賴項
* resize：因為主執行緒已經失去 Canvas 控制權，設定寬高必須傳遞訊息讓 Worker 自行設定

#### Worker.js
在背景執行緒中，我們根據不同的任務名稱來分配處理，這些任務包括 Canvas 控制權的轉移、Offscreen 畫布的設定、動畫的暫停和播放。

```javascript
import lokaVolterraAlgorithm from "./lokaVolterraAlgorithm";
// 控制介面
self.onmessage = function handleMessageFromMain(msg) {
    switch(msg.data.name){
        case "transferControlToOffscreen":
			canvas = msg.data.canvas;
			ctx = canvas.getContext('2d');
			algorithm.reset(canvas.width, canvas.height);
			break;
		case "setOffscreen":
            canvas.width = msg.data.w;
            canvas.height = msg.data.h;
			break;
		case "cancelAnimation":
			cancelAnimationFrame(requestID);
			requestID = undefined;
			break;
		case "requestAnimation":
			if(requestID) self.postMessage({"name": "error", "message": "requestAnimation existed"});
			else requestID = requestAnimationFrame(main);
    }
};

let requestID = undefined;
let canvas;
let ctx;
const algorithm = new lokaVolterraAlgorithm();

// 繪圖系統-main
function main() {
	algorithm.render(ctx, 0.25);
	algorithm.update(ctx, canvas.width, canvas.height);
	requestID = requestAnimationFrame(main);
}
```
* 在這裡，我們模組化演算法的優勢就出來了，可以直接動態載入不同的邏輯模組。
* 但也意味著需要額外的處理來包裝動畫，確保我們能夠提供播放與停止的接口來正確控制動畫流程。

#### 動畫管理員
> 延續自系列文：[B2 玩轉 IntersectionObserver：揭秘動畫管理員的設計與實作細節！》](https://ithelp.ithome.com.tw/articles/10355832)

我們的動畫管理員不僅僅是管理動畫的註冊與運行，還能夠註冊特定的觸發按鈕。這些按鈕負責在畫面進入與離開時控制動畫的播放與暫停。

例如，在場景中，當用戶進入一個區域或視口中，觸發對應的動畫，當離開時自動暫停，這樣既節省了計算資源，也增強了使用者體驗：
```javascript
this.registerTrigger = (name, enter, leave) => {
    this.trigger[name] = {enter, leave};
    this.nameValidation(name);
}
```
```javascript
this.updateRequestAnimation = (id) => {
    // 停止舊的動畫
    this.lastTriggerName.forEach(name => {
        if(!this.trigger[name]) return;
        this.trigger[name].leave();
    })

    const triggerNames = this.getTriggerById(id);
    this.lastTriggerName = triggerNames;
    
    // 開始新的動畫
    triggerNames.forEach(name => {
        if(typeof this.trigger[name] === "undefined") return console.warn("invalid trigger");
        this.trigger[name].enter();
    })
}
```

#### React 中的 Canvas 元件
> 延續自系列文：[B1 玩轉 IntersectionObserver：輕鬆上手你的動畫管理員！](https://ithelp.ithome.com.tw/articles/10355796)

在 React 框架下，我們將這一套動畫管理系統集成到 Canvas 元件中，使其與 React 的生命周期保持一致。透過交互觀測技術（如 IntersectionObserver），我們可以準確地控制動畫的播放時機：
```jsx
useEffect(()=>{
    manager.registerTrigger(
        "worker" + sectinoID, 
        () => lokaVolterra.pauseWorker(true), 
        () => lokaVolterra.pauseWorker(false)
    );
    return () => {
        manager.unRegisterTrigger("worker" + sectinoID);
    }
}, []);
```
或者，作為一個按鈕提供使用者播放和暫停：
```jsx
const [isWorker, setIsWorker] = useState(true);
function handlePauseWorker(){
    lokaVolterra.pauseWorker(!isWorker);
    setIsWorker(!isWorker);
}

<button onClick={handlePauseWorker} id="pauseWorker">
    {isWorker ? "停止" : "開始"}
</button>
```

### 效能測試與比較
為了評估多執行緒渲染的效能提升，我們進行了以下測試：

1. **單執行緒渲染**：使用單一主執行緒進行粒子運算與繪製，渲染約 5000 個具有完整引力系統的粒子。
2. **多執行緒渲染**：將粒子的運算和繪圖全部交由 Web Worker 單獨處理，使主執行緒僅負責監控和管理。
3. **並行渲染**：主執行緒和 Web Worker 分別處理一個完整的粒子系統，實現並行運算。

在測試中，故意增加了粒子數量造成負載，我記錄了自己電腦每幀的渲染時間，測試結論和我之前的[相關實驗](https://ithelp.ithome.com.tw/articles/10341355)相去不遠，當時是讓 Web Worker 用 bitmap 圖片的形式傳回主執行緒，這次則是用離屏渲染的方法。

結果顯示，Web Worker 搶走了主執行緒大約 20% 的算力，我認為這跟現代處理器的多核心加速有關，這表示其他核心閒置的時候，確實能對主執行緒提供幫助。但是，Web Worker 實際上又提供了約 70% 的算力，因此，只要使用得當，多執行緒確實能提高演算法的上限。

### 挑戰與限制
儘管 Web Worker 可以有效提升效能，但其在實作中仍面臨一些挑戰與限制：

1. **資料同步**：由於 Worker 與主執行緒是分開運行的，資料在兩者之間的同步需要小心處理，否則可能會出現條件或資料不一致的情況。
2. **上下文切換的開銷**：傳遞或接收大量資料 Worker 會帶來性能開銷，尤其是像圖像數據這樣龐大的資料塊。

### 結論
Web Worker 作為一種多執行緒的解決方案，確實能在特定情況下提升渲染效能，特別是在處理大量計算密集型任務時。然而，效能的提升並非絕對，資料同步與傳輸的成本有時會帶來瓶頸。因此，在考慮使用 Web Worker 的同時，我們應該思考更多的解決方案，如將計算交由伺服器端處理，或使用 WebGL 利用 GPU 加速，而非完全依賴 CPU 進行計算。