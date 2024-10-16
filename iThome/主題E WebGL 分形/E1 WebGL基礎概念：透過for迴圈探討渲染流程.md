### **引言**
一直以來，我們在繪圖的時候要不管是用 2D 的 Canvas API 描繪形狀，或是用 3D 的 three.js 的幾何頂點描繪三角形片段，我們都離底層有一段距離。不過，有了這些經驗，相信對 WebGL 上手會更加迅速！

今天，我們將來介紹 WebGL 的原理，包括頂點著色器和片段著色器，由於這牽涉到另一個圖形語言介面，我將用 javascript 進行比喻，讓大家理解渲染的流程和方式。

### **bitmap**
在處理圖片的時候，有一種格式是 bitmap，允許我們用迴圈的方式填入顏色，例如做一個根據漸層的圖片，可以這麼做：
```javascript
const w = 1024, h = 768;
const bitmap = new Array(w * h * 3);
for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
        const index = (i * w + j) * 3;
        const r = 255 * i / h;
        const g = 255 * j / w;
        const b = 255;
        bitmap[index] = r;
        bitmap[index + 1] = g;
        bitmap[index + 2] = b;
    }
}
```
* 單執行緒：在單執行緒環境下，我們依序計算每個像素的顏色，並存入 bitmap 陣列中。這裡每個像素的顏色根據其在圖像中的位置而變化，r 和 g 的值是從 0 遞增到 255，而 b 固定為 255。

場景轉移到底層的圖形渲染，為了發揮 GPU 併行計算的優勢，會有類似這樣的分配任務機制，需要分成三步驟，用我們在系列文 B7 學過的 Web Worker 來做比喻：
```javascript
const w = 1024, h = 768;
const bitmap = new Array(w * h * 3);
const indices = new Array(w * h);

// 1. 取得任務
for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
        indices[i * w + j] = {i, j, w, h};
    }
}

// 2. 分配任務，等待結果，再發派新任務
const count = 0;
const worker = new Array(8);
for(let N = 0; N < 8; N++){
    worker[N] = new Worker('./worker.js');
    worker.onmessage = (e) => {
        const {message, color, index} = e.data;
        if(message == "finished"){
            bitmap[index] = color.r;
            bitmap[index + 1] = color.g;
            bitmap[index + 2] = color.b;
            // 分配新任務
            if (count < indices.length) {
                workers[N].postMessage(indices[count++]);
            }
        }
    };
    // 初始任務發派
    worker.postMessage(indices[count++]);
}

// 3. worker.js 內部，計算任務
self.onmessage = (msg) => {
    const {i, j, w, h} = msg.data;
    const r = 255 * i / h;
    const g = 255 * j / w;
    const b = 255;
    self.postMessage({
        message: "finished",
        color: {r, g, b},
        index: (i * w + j) * 3;
    })
}
```
* 多執行緒：在多執行緒環境中，我們將像素座標的任務分配給 8 個 Web Workers。這些 Workers 會同時處理不同的像素，並將計算結果回傳給主線程。當一個 Worker 完成任務時，它會被分配新的像素任務，直到所有像素都處理完畢。
* 此範例中，Web Workers 讓我們模擬了 GPU 的併行計算能力。每個 Worker 都相當於一個「核心」，能夠同時處理不同的計算，並且依據硬體的特性，能更快速地處理大量像素的渲染運算。這正是 GPU 在圖形渲染中具備高效能的原因之一。

這樣的非同步運算方式，雖然看似需要更多結構和邏輯，但實際上透過分工和並行處理，可以大幅提升效能，使得圖像處理速度遠超單執行緒的處理方式。對於以上三步驟，我們只需要完成其中兩個，分別是頂點著色器和片段著色器

### 1. 頂點著色器
過去幾天我們很常提到，三個一組的頂點座標和三角形片段，可以用來組成幾何體的平面，也就是說，當你輸入頂點，WebGL 的頂點著色器會開始併行計算三角形內的所有點，並將結果傳遞到後續步驟。

例如，對於上面的範例，我們可以用兩個三角形來描繪矩形的圖片：
```javascript
const w = 1024, h = 768;
const vertices = new Float32Array([
    // 左上
    0, 0,
    w, 0,
    0, h,
    // 右下
    w, 0,
    0, h,
    w, h,
])
```
* 在這裡，我們將頂點傳遞給頂點著色器。頂點著色器不僅會計算這些頂點的座標，還會對其進行預處理，比如進行座標轉換，將它們轉換到屏幕空間。我們明天會深入介紹如何使用 GLSL（OpenGL Shading Language）來實現這樣的功能。

### 2. 片段著色器
當談到片段著色器，通常我們很難理解頂點和片段的關係，但如果你回想開頭的 for 迴圈，1024 x 768 個像素需要逐一進行處理，我們可以清晰地認識到每個像素就是一個任務。

頂點著色器首先計算出三角形的頂點位置，接著將這些頂點的資訊交給片段著色器，片段著色器會對每個像素進行進一步的著色計算，決定這些像素的顏色。

```javascript
gl_FragColor = vec4(r, g, b, 1.0);
```
我剛開始學著色器的時候，我很常感到疑惑：為什麼裡面的 x y z 座標是會變的？為什麼可以藉此來設定顏色通道？這些疑惑源自於單執行緒思維的限制。

事實上，這不是一個著色器在執行，而是有數百萬個 GPU 核心在並行運行相同的著色器代碼。每個核心負責計算不同的像素，而 gl_FragCoord 會自動傳遞當前像素的座標。這使得每個像素都可以根據其自身的位置進行獨立的著色處理，實現高度並行的圖像渲染。

### 在 Javascript 中編譯著色器程式碼（shader）
用文本的形式載入或定義程式碼後，用 WebGL 上下文的建立和編譯方法後，才能正確載入並使用著色器：
```javascript
import vertexShaderSource from '../shader/vertex.glsl?raw'
const gl = canvas.getContext('webgl2');
const shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(shader, vertexShaderSource);
gl.compileShader(shader);
```

我們將其封裝起來，並在編譯錯誤時跳出警告：
```javascript
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const isSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (isSuccess) return shader;
    // 若失敗跳出警告並刪除
    console.warn("source: " + source);
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
```

最後就可以簡寫成這樣，取得頂點著色器和片段著色器：
```javascript
import vertexShaderSource from '../shader/vertex.glsl?raw'
import fragmentShaderSource from '../shader/fragment.glsl?raw'
const gl = canvas.getContext('webgl2');
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
```

### 啟用著色器
接著我們可以創建 WebGL 程式，用來組合不同的頂點著色器和片段著色器，渲染圖形：
```javascript
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
```

### **結論**
在這篇文章中，我們探討了 WebGL 渲染的基本流程，特別是頂點著色器和片段著色器的運作方式。我們以 JavaScript 的 for 迴圈為例，介紹了如何處理 bitmap，並且用 Web Worker 模擬了 GPU 的並行計算方式。

透過這篇文章的內容，希望讀者對 WebGL 的基本概念有了初步的理解，並能夠從更底層的角度看待圖形渲染的工作原理。下一步，將介紹 GLSL 語言的基本語法，並進一步探討如何利用它來自定義和優化 WebGL 的渲染工作。

![https://ithelp.ithome.com.tw/upload/images/20241014/201351973MJtDUyr3j.png](https://ithelp.ithome.com.tw/upload/images/20241014/201351973MJtDUyr3j.png)