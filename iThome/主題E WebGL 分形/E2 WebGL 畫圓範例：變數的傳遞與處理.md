### **引言**
接下來，我們來介紹如何用頂點著色器和片段著色器渲染圖形，程式碼的部分，只要是 glsl 我都會用截圖的形式。

### 頂點著色器
在使用著色器時，會用到兩種變數，分別是：
* attribute：描述每個頂點的屬性如位置、顏色，頂點著色器專用。
* uniform：全域的定值，可以透過它傳遞參數，讓 javascript 控制著色器的渲染方式。

![https://ithelp.ithome.com.tw/upload/images/20241014/20135197hLk0x3uS74.png](https://ithelp.ithome.com.tw/upload/images/20241014/20135197hLk0x3uS74.png)
* 常用的型別有浮點數 float、向量 vec2 vec3
* zeroToOne：將座標映射到 0 ~ 1 的範圍
* clipSpace：將座標映射到 -1 ~ 1 的範圍

在 WebGL 或 OpenGL 中，將頂點坐標從畫布空間轉換到剪裁空間（clip space）是渲染過程中的一個重要步驟。因為在 WebGL 的座標系統中，範圍是[-1, 1]，因此如果我們輸入的是像素座標，需要將其映射到這個範圍。

### 用 TRIANGLES 畫一個圓
昨天我們已經學過如何建立程式，現在來傳遞頂點和變數，這個過程我們需要先取得該變數的記憶體位置，並告訴 WebGL 在相對應的位置輸入變數：
```javascript
const gl = canvas.getContext('webgl2');
gl.useProgram(this.programCircle);

const resolutionUniformLocation = gl.getUniformLocation(this.programCircle, "u_resolution");
const colorUniformLocation = gl.getUniformLocation(this.programCircle, "u_color");
const centerUniformLocation = gl.getUniformLocation(this.programCircle, "u_center");
const radiusUniformLocation = gl.getUniformLocation(this.programCircle, "u_radius");

gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
gl.uniform2f(centerUniformLocation, 0.5, 0.5);
gl.uniform1f(radiusUniformLocation, 0.2);
gl.uniform4f(colorUniformLocation, 0.9, 0.9, 0.5, 1);

```
在這段程式碼中，我們首先取得了各個 uniform 變數的記憶體位置。接著，我們為這些變數設定值，包括畫布的解析度、圓心位置、半徑和顏色。

接下來，我們將取得頂點的位址並設定資訊如下：
```javascript
const positionAttributeLocation = gl.getAttribLocation(this.programCircle, "a_position");
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    canvas.width, 0,
    0, canvas.height,
    canvas.width, 0,
    0, canvas.height,
    canvas.width, canvas.height,
]), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 6);
```
* gl.TRIANGLES：這個參數決定了頂點的計算，是用我們準備的頂點三個一組組成三角形。

在這段程式碼中，我們首先取得了頂點的屬性位置，然後綁定了一個緩衝區，並將頂點資料存入這個緩衝區。接著，我們啟用了頂點屬性並告訴 WebGL 如何讀取這些資料。

#### 片段著色器
接著，在畫布的矩形範圍內，我們計算每個頂點的位置，如果在圓心內部，就設置顏色：
![https://ithelp.ithome.com.tw/upload/images/20241014/20135197HU3vfkfE0c.png](https://ithelp.ithome.com.tw/upload/images/20241014/20135197HU3vfkfE0c.png)
* gl_FragCoord：取得當前像素座標
* gl_FragColor：設定當前像素顏色

這樣就能正確繪製出圓形：
![https://ithelp.ithome.com.tw/upload/images/20241014/20135197dmB0AAevbl.png](https://ithelp.ithome.com.tw/upload/images/20241014/20135197dmB0AAevbl.png)

但是，為什麼我們的頂點跟昨天一樣，是用左上和右下兩個三角形來組成一個矩形呢？的確，如果要繪製一個圓，按照我們在 three 所學，我們會這樣做：
```javascript
const x = canvas.width / 2;
const y = canvas.height / 2;
const radius = x;
const segment = 32;
const vertices = new Float32Array(segment * 3 * 3);
for(let N = 0; N < segment; N++){
    const startAngle = 2 * Math.PI * N / segment;
    const endAngle = 2 * Math.PI * (N+1) / segment;
    vertices[N * 6] = x;
    vertices[N * 6 + 1] = y;
    vertices[N * 6 + 2] = x + radius * Math.cos(startAngle);
    vertices[N * 6 + 3] = y + radius * Math.sin(startAngle);
    vertices[N * 6 + 4] = x + radius * Math.cos(endAngle);
    vertices[N * 6 + 5] = y + radius * Math.sin(endAngle);
}
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
//...略
gl.drawArrays(gl.TRIANGLES, 0, segment * 3);
```
* 這段程式碼利用三角形近似扇形的方式來繪製圓形，透過計算圓周的每個頂點來完成。這樣就不需要在片段著色器中處理圖形。

### 頂點著色器與片段著色器的角色
這個範例給了我們一個重要的概念，頂點著色器並不是決定形狀，而是決定渲染的區域。實際上我們也能依靠片段著色器來繪製圖形。這是因為片段著色器在每個像素級別上運行，可以根據需要計算和設置顏色。

在不同的情境下，對效能的影響也會有所不同。我們可以靈活分配頂點著色器和片段著色器的任務，以選擇最佳的方案。例如，當需要繪製複雜形狀時，使用頂點著色器可以減少片段著色器的計算負擔；而對於簡單形狀，則可以使用片段著色器來簡化渲染流程。

### 繪製 Point
相同的頂點數據，我們也能設置不同的渲染方法，
```javascript
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
//...略
gl.drawArrays(gl.POINTS, 0, segment * 3);
```

![https://ithelp.ithome.com.tw/upload/images/20241014/20135197nqcLbWCNqR.png](https://ithelp.ithome.com.tw/upload/images/20241014/20135197nqcLbWCNqR.png)
![https://ithelp.ithome.com.tw/upload/images/20241014/20135197Brk1ys3bj9.png](https://ithelp.ithome.com.tw/upload/images/20241014/20135197Brk1ys3bj9.png)

### **結論**
透過本篇文章，我們探討了如何使用頂點著色器和片段著色器來渲染圖形。首先，我們了解了兩種變數類型：attribute 和 uniform，並學會如何將它們與 WebGL 程式碼結合，從而正確地傳遞資料。接著，我們學習了如何使用 TRIANGLES 和 POINTS 方法來繪製圓形，並探討了頂點著色器和片段著色器的角色和運作方式。

希望這些知識對於大家有幫助，少走彎路！共勉之。