### 引言
在 3D 圖形渲染和資料視覺化中，效能是關鍵問題之一。隨著資料量的增大，若繼續使用高階語言提供的內建陣列和資料結構，雖然靈活方便，通常會造成效能瓶頸。為了處理大量同質性的數據，JavaScript 提供了 TypedArray，使得我們能夠更高效地管理和操作數據。

今天，將延續昨天的架構，繼續講解如何在 Three.js 中自定義 3D 長條圖。

### TypedArray
如果有學過 C++ 或其他低階語言，就會知道在定義變數時，通常會先定義型別，同理陣列也一樣，由於提前分配固定的記憶體空間，並且密集排列，存取就能更加高效。

而 Javascript 以自由聞名，動態設計了基本類型 Array，並提供了不少靈活操作陣列的原生方法，在普通陣列中，元素實際上是一個指針，指向不同內存位置，這樣就能儲存不同類型的數據。相當於多了一個物流中心，管理多個不同類型的倉庫，比起單一倉庫來說，存取要經過更多步驟。

因此，在操作大量同型別的數據時，我們仍需要更高效的資料結構，為此 JavaScript 提供了多種 TypedArray 類型，例如：
* Int8Array: 8位帶符號整數
* Uint8Array: 8位無符號整數
* Float32Array: 32位浮點數
* Float64Array: 64位浮點數

像是昨天的頻譜分析，就使用 Uint8Array 來處理音訊；接下來要介紹的圖形渲染場景，尤其是基於 WebGL 的應用 Three.js，就會大量使用 Float32Array 來定義幾何頂點座標。

### Mesh
作為 Three 中， Mesh 是構建 3D 物件的核心，我們需要考慮以下幾點：
1. 幾何體 (Geometry)：如何構建形狀，是長條圖的關鍵
2. 材質 (Material)：如何繪製形狀的表面，特別是在顏色和光照處理
3. 燈光 (Lighting)：影響陰影和光的反射

在繪製 3D 長條圖的時候，我們的目的不是製作一個真實的場景，因此我們可以考慮無光環境，並且為長條圖自定義顏色。
### 架構
為此，我們採用以下的幾何體和材質來構建 3D 實體：
1. BufferGeometry：用於構建長條圖形狀，並能動態更新頂點數據。
2. MeshBasicMaterial：不受燈光影響的材質，適合無光源場景。

我們設計了一個類別 BufferFactory，用來生成 3D 長條圖，並用井字號區分私有變數。這允許我們靈活生成和管理多個長條圖，如下設計了一座長度為 360 的工廠陣列，可以產出並容納 6 秒內的所有長條圖。
```javascript
class BufferFactory{
    #material;
    #factorys;
    constructor(){
        this.#material = new THREE.MeshBasicMaterial({
            vertexColors: true,
        });
        this.mesh = new THREE.Group();
        this.#factorys = new Array(360).fill(0).map(()=>this.createFactory());
    }
    createFactory(){
        const factory = {
            'geometry': new THREE.BufferGeometry(),
            'mesh': null
        };
        factory.mesh = new THREE.Mesh( factory.geometry, this.#material )
        this.mesh.add(factory.mesh);
        return factory;
    }
}
```
* THREE.Mesh：初始化的時候先用幾何體和材質來製作 3D 實體，並加入場景中，這允許我們後續動態對幾何體進行修改。
* vertexColors：材質方面，我們將頂點顏色設置為真，這將允許我們自定義長條圖的顏色。

### 操作幾何體
首先回顧昨天頻譜分析後，是如何傳遞資料的：
```javascript
const createMusicAnalyser = function(){
    this.setCanvas = (canvas) => {
        //......
        this.buff = new BufferFactory();
        this.scene.add(this.buff.mesh)
    }
    this.update = () => {
        if(this.analyser){
            //......
            this.buff.transformData(data);
        }
        this.buff.update();
    }
    return this;
}
```
* 可以看到，我們已經將 mesh 群組添加到場景中，接下來就要逐禎更新音訊數據。

#### 將音訊資料轉換成頂點和幾何體
在構築幾何體時，需要提供對應的頂點和屬性（明天會詳細說明），於是我們分成三步驟，先按照直覺，準備長條圖六個面的向量數據（vector），再將其轉換為頂點數據（vertices），最後包裝成三個座標一組的屬性（attribute）。
```javascript
class BufferFactory{
    transformData(data){
        // 循環陣列
        const factory = this.#factorys.shift();
        this.#factorys.push(factory);
        // 計算頂點座標
        const vector = this.getPosition(data);
        const vertices = this.getVertices(vector);
        const attribute = new THREE.BufferAttribute(vertices, 3);
        factory.geometry.setAttribute('position', attribute);
        // 計算頂點顏色
        const colorVertices = this.getColorVertices(data, vertices);
        const colorAttribute = new THREE.BufferAttribute(colorVertices, 3)
        factory.geometry.setAttribute('color', colorAttribute);
    }
}
```
* THREE.BufferAttribute：透過它，我們能夠將自定義頂點數據傳遞到 WebGL 中，進行高效渲染。
* setAttribute：這實際上和 WebGL 傳遞變數的方式有關，因為 position、color 變數不存在 Javascript 環境中，所以用這個方式將數據綁定到 WebGL 繪圖上下文。

#### 長條圖的流動效果
> Youtube 影片
[![Yes](https://img.youtube.com/vi/X7remQEUWAU/0.jpg)](https://youtu.be/X7remQEUWAU)

當添加新的圖形時，我們希望它像水一樣，不斷流下去，直到中斷處消失。為達成這個效果，我們才將首個元素放入末尾，並且更新覆蓋它的圖形。接著，在每次更新時根據索引值來分配Ｚ軸座標，就能實現不斷循環更新的長條圖了。

```javascript
class BufferFactory{
    #depth = 2;
    updateFactorys(){
        const len = this.#factorys.length;
        this.#factorys.forEach((factory, index)=>{
            factory.mesh.position.set(0, 0, this.#depth * (index - len));
        });
    }
    update(){
        this.updateFactorys();
    }
}
```

### 結論
本文探討了 TypedArray 在 3D 圖形渲染中的應用，特別是如何使用 Three.js 結合 Float32Array 高效地生成和更新長條圖。透過簡單的工廠設計模式，我們成功構建了一個能夠處理實時資料的圖形渲染系統。明天，我們將詳細探討頂點和圖形的關係，你將學會如何利用頂點繪製圖形，並且完整演算法的封裝。

如果感興趣，可以參考 Github 上的原始碼：
* [musicAnalyser.js](https://github.com/Jerry-the-potato/vite-deploy/blob/main/src/js/musicAnalyser.js)
* [bufferFactory.js](https://github.com/Jerry-the-potato/vite-deploy/blob/main/src/js/bufferFactory.js)