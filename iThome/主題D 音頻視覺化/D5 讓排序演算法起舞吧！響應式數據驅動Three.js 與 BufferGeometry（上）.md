### 引言
昨天我們學會了頂點數據的動態更新，通過動態創建和局部更新頂點屬性，來優化了渲染效能。接下來就讓我們結合排序演算法，實作三維場景中的動畫吧！

建議先看過這兩篇文章：
* [A2 腳步踩穩囉：啟動工廠模式下的 Canvas Transition 動畫](https://ithelp.ithome.com.tw/articles/10351066)
* [C2 讓排序演算法起舞吧！最小單位：華爾滋](https://ithelp.ithome.com.tw/articles/10361096)
### 目標
我們需要結合過去所學，將動態頂點更新、響應式數據以及排序演算法動畫相結合，並提供豐富的圖形變化和參數控制。具體來說，我們需要實現以下幾點：
1. **新的資料格式**：我們需要定義一種數據格式，這種格式不僅能夠提供給 Three.js 使用的頂點數據，還要能夠滿足排序演算法 SortAlgorithm 所需的座標和路徑。
2. **響應式數據**：當使用不同的函式庫，我們無法要求排序演算法傳遞資料給 Three。為了解決這個問題，我們可以用 getter、setter 來響應數據的變化，由此更改 3D 圖形。
3. **更豐富的形狀**：藉由頂點的靈活控制，我們可以將排序演算法的結果排列成圓形，添加曲面控制使圖形更加平滑。
4. **參數控制**：我們將允許使用者或開發者即時修改數據長度、長條圖外觀（座標和顏色）等參數，動態增減頂點數據。實現更高的互動性和可視化效果。

讓我們一起來看一下具體如何實作這個三維長條圖動畫，並逐步解析其中的技術細節。以下是一個展示影片，能夠幫助你快速了解最終的效果：
[![Yes](https://img.youtube.com/vi/Q9otLH8vG18/0.jpg)](https://youtu.be/Q9otLH8vG18)

-----

### 架構
首先，我們需要建立一個長條圖物件 column，裡面包含了 geometryData（響應式數據）、geometry 和 mesh，我們會將 geometryData 提供給排序演算法操作，然後動態修改 geometry 中的頂點數據：
```javascript
// 餅就是要畫大一點！興許未來哪天就做三維的粒子系統
class ParticleSystem3D{
    constructor(){
        this.sort = new SortAlgorithm();
        this.mesh = new THREE.Group();
        this.column = this.createColumn(length, maxHeight, radius, depth);
        this.mesh.add(this.column.mesh);
    }
    getMesh(){
        return this.mesh;
    }
    update(){
        this.#transitionRadian+= this.#trasitionOmega;
        this.sort.update(this.column.geometryData);
    }
}
```
接著，再將 mesh 加入到前幾天我們所使用的 Three.js 場景，這樣每次渲染更新時，排序演算法的結果就會在畫布上：
```javascript
this.system = new ParticleSystem3D();
this.scene.add(this.system.getMesh());
```

### 長條圖的初始化
這裡稍微複習一下 BufferGeometry，和前幾篇相同，由於我們需要頻繁修改頂數據，因此我們初始化先提供空值，後續再針對每個柱體將頂點數據覆蓋到相應的緩衝區：
```javascript
// 餅就是要畫大一點！興許未來哪天就做三維的粒子系統
class ParticleSystem3D{
    constructor(){
        this.sort = new SortAlgorithm();
    }
    createColumn(length, maxHeight, radius, depth){
        const column = {length, maxHeight, radius, depth};

        const attribute = new THREE.BufferAttribute(new Float32Array(length * 36 * 3), 3);
        const colorAttribute = new THREE.BufferAttribute(new Float32Array(length * 36 * 3), 3);
        column.geometry = new THREE.BufferGeometry();
        column.geometry.setAttribute('position', attribute);
        column.geometry.setAttribute('color', colorAttribute);

        const material = new THREE.MeshBasicMaterial({ 'vertexColors': true });
        column.mesh = new THREE.Mesh( column.geometry, material ); 
        // ......下略
    }
}
```
我們用四個基本資訊來建立我們的長條圖，包含：
* length：陣列的長度
* maxHeight：最大值
* radius：以（0, 0, 0）為中心的距離半徑
* depth：由外向內延伸的深度（如果和半徑相同，就相當於繪製圓餅圖）

雖然我們提供給 Three 的頂點數據是緊密排列的，針對當中的每一個柱體，我們仍需要儲存關於它們的信息，除了整個圖形的長度、半徑、深度，還需要考慮單個柱體的高度、相對座標、更新邏輯，方便我們控制它的動畫：

```javascript
createColumn(length, maxHeight, radius, depth){
    const column = {length, maxHeight, radius, depth};
    // ......上略
    column.updateVertices = (index) => {}
    column.geometryData = new Array(length).fill().map((v, index) => {
        return this.createGeometryData(column, index);
    });
    column.geometryData.forEach((data, index) => {
        column.updateVertices(index);
    })
}
```
* updateVertices：當排序演算法更新數據時，我們需要及時更新相應柱體的頂點數據。這個函式會被用來更新第 N 個柱體的頂點座標，並將它們覆蓋到相應的緩衝區。
* createGeometryData：這個函式負責為每個柱體生成初始的幾何數據，並保留靈活性，讓我們未來增減數量的時候，可以活用這個方法。
* geometryData.forEach：在首次創建資料時，為所有的柱體更新頂點數據，

### 資料結構
如果你還記得上個主題的排序演算法，應該對這個地方不陌生，我們會提供四筆資料，分別是三個變數和一個動畫物件 path。當初在做二維的排序演算法時，我們並沒有引入響應式數據的概念，而是直接用高度來進行排序，因此沿用。
```javascript
createGeometryData(column, index){
    const {length, radius, unitHeight} = column;
    const angle = (index / length) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const height = index * unitHeight;
    const path = new Path(x, y);
    const geometryData = {x, y, height, path};
}
```
* angle：用索引值計算角度，將柱體平均分配到圓周上的初始座標。
* height：產生等比例遞增的數據集
* unitHeight？什麼時候有它了！？

### 響應式數據
我們先從一個簡單的問題切入，unitHeight 顧名思義就是每單位高度(m/unit)，所以我們可以這樣計算它：
```javascript
const unitHeight = maxHeight / length;
```
但是問題來了，如果使用者想要修改長條圖陣列的長度或高度，那這個值並不會變化，而是被定死了！為了解決這個問題，我們可以透過 getter 來設定這個數值讀取方法：
```javascript
Object.defineProperty(column, 'unitHeight', {
    get() {
        return column.maxHeight / column.length;
    }
}); 
```
這樣我們就有一個很基本的響應式數據了，不過要注意到的是，我們沒有設定 setter，相當於是一個空函式。也就是說當你嘗試賦值給 unitHeight，什麼都不會發生。這也是我所希望的，讓這個值動態更新的同時，只讀不寫。

### 針對動畫的響應式數據
那麼回到主軸，排序演算法的核心是用交換兩個柱體，並為 path 動畫設置目標點：
```javascript
class SortAlgorithm{
    static swapColumn(a, b, frame){
        [a.path.pointX, b.path.pointX] = [b.path.pointX, a.path.pointX];
        [a.path.pointY, b.path.pointY] = [b.path.pointY, a.path.pointY];
        [a.height, b.height] = [b.height, a.height];
        a.path.NewTarget(a.x, a.y, frame);
        b.path.NewTarget(b.x, b.y, frame);
    }
}
```
因此我們可以監控 pointX 和 pointY，但這麼做會有一點問題，我們需要避免重複更新頂點數據（浪費資源），所以需要進行狀態管理和延遲：
```javascript
createGeometryData(column, index){
    // ......
    const path = new Path(x, y);
    const geometryData = {x, y, height, path};

    let _pointX = path.pointX;
    let _pointY = path.pointY;
    let isUpdating = false;
    Object.defineProperty(path, 'pointX', {
        get() {
            return _pointX;
        },
        set(newX) {
            if (_pointX !== newX) {
                _pointX = newX;
                if (isUpdating) return; // 如果正在更新，則直接返回
                isUpdating = true; // 設置為正在更新
                requestAnimationFrame(() => {
                    column.update(index, path);
                    isUpdating = false; // 更新結束
                });
            }
        }
    });
    Object.defineProperty(path, 'pointY', {
        get() {
            return _pointY;
        },
        set(newY) {
            if (_pointY !== newY) {
                _pointY = newY;
                if (isUpdating) return; // 如果正在更新，則直接返回
                isUpdating = true; // 設置為正在更新
                requestAnimationFrame(() => {
                    column.updateVertices(index);
                    isUpdating = false; // 更新結束
                });
            }
        }
    });
}
```
* 初始化內部變數 _pointX、 _pointY ，用來設計 setter 並在賦值時進行檢查
* isUpdating：其中一個值改變就會打開開關，並請求下一偵執行更新。從而達到避免重複呼叫的效果。

功能確實是實現了，但是．．．好像有點複雜哎，讓我們重新思考這個問題然後簡化它。

### 簡化響應式數據
說到底，動畫的切入點是什麼？的確，座標被更新，就需要移動，但是還記得嗎？在系列文 A2 我們有設計一個倒數計時器呀！

所以接下來，我們把邏輯改成，每次倒數計時更新頂點數據（動畫執行時）：
```javascript
createGeometryData(column, index){
    const path = new Path(x, y);
    const geometryData = {x, y, height, path};

    // 初始化內部變數
    let _timer = path.timer;
    Object.defineProperty(path, 'timer', {
        get() {
            return _timer;
        },
        set(newT) {
            _timer = newT;
            column.updateVertices(index);
        }
    });
}
```
是不是簡潔了許多呢！

### 結論
在這篇文章中，我們探索了如何使用響應式數據來實現動畫效果，特別是針對排序演算法的動態柱體顯示。

最初，我們通過 Object.defineProperty 設置動態的 unitHeight，讓長條圖的高度與陣列長度保持同步變動。這為我們引入了基本的響應式數據機制。接下來，我們討論了在動畫過程中，如何讓柱體的 pointX 和 pointY 坐標進行動態更新。這涉及到如何避免重複更新頂點數據，並透過狀態管理來確保只有必要時才執行視覺變化，以優化性能。

當我們重新審視動畫的核心需求，發現可以利用倒數計時器的更新來進行簡化。通過每次動畫執行時更新數據，我們得以將邏輯簡化為較為乾淨的設計。那麼，明天我們將繼續完成後續步驟。