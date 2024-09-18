## 以最簡為原則

本文將介紹如何以簡單的設計實現響應式布局（RWD），兼顧桌面與移動端需求，並比較 React 和 Vue 的不同實作方式。

![https://ithelp.ithome.com.tw/upload/images/20240914/20135197npuP2RN7Ix.png](https://ithelp.ithome.com.tw/upload/images/20240914/20135197npuP2RN7Ix.png)
> "左圖展示的是高度受限的排版，右圖則是寬度受限。接下來的代碼展示如何動態調整布局來適應不同裝置。"
### 設計概念
每一個功能區域都被包裝在一個 DIV 容器中（Playground元件），並使用 href 跳轉到不同的區塊。這樣的設計使頁面結構簡潔、清晰：

```
function App(){
    return (
        <>
            <Playground margin={20}/>
        </>
    );
}
```

> 使用 margin 來控制佈局，而不是直接採用全螢幕顯示，搭配後面的設計，可以更精確地控制 canvas 繪圖的位置，避免因螢幕比例不同而導致的問題。

### 動態調整寬高
為了確保容器能夠隨著視窗大小變化，我們自製一個 useWindowSize hook，監聽resize事件，減去 margin 得到寬高：

#### React－利用useState儲存寬高
```
// 使用方法
const [width, height] = useWindowSize(margin);

// 實作細節
import { useLayoutEffect, useState } from 'react';

export default function useWindowSize(margin){
    const [size, setSize] = useState([
        window.innerWidth - margin * 2,
        window.innerHeight - margin * 2
    ]);
    useLayoutEffect(() => {
        const updateSize = () => setSize([
            window.innerWidth - margin * 2,
            window.innerHeight - margin * 2
        ]);
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}
```
#### Vue－利用ref儲存寬高
```
// 使用方法
const { width, height } = useWindowSize(props.margin);

// 實作細節
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';

export function useWindowSize(margin) {
const width = ref(window.innerWidth - margin * 2);
const height = ref(window.innerHeight - margin * 2);

const updateSize = () => {
    width.value = window.innerWidth - margin * 2;
    height.value = window.innerHeight - margin * 2;
};

onMounted(() => {
    window.addEventListener('resize', updateSize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSize);
});

watchEffect(() => {
    updateSize();
});

return { width, height };
}
```


### RWD實現
需求設定為兩個目標：
1. 畫面固定比例，桌機1:1、移動端1:2
2. 移動端像素要放大兩倍

這裡，我們將寬高轉換為 min 和 ratio，並根據裝置比例動態調整佈局：

#### React－用{}容納變數
```
function getStyle(){
    return{
        "width": min + "px",
        "height": min * ratio + "px",
        "margin": margin +"px auto"
    }
}
return (
    <div style={getStyle()}>
        //......
    </div>
)
```

對於 canvas，我們進一步乘以 ratio 來放大像素：
`<canvas width={min * ratio} height={ratio * min * ratio}></canvas>`

#### Vue－用""容納變數、用:傳遞參數
```
<template>
    <div :style="getStyle()">
        //......
    </div>
</template>
```
`<canvas :width="max * ratio" :height="ratio * max * ratio"></canvas>`
## 元件實作
在 Playground 元件中，我們將 min 和 ratio 傳遞給子元件，讓 canvas 可以正確設定：

```
function Playground({margin}){
    //......
    return (
        <>
            <div style={getStyle()}>
                <CanvasSection1 ratio={ratio} min={min}/>
                <CanvasSection2 ratio={ratio} min={min}/>
                <CanvasSection3 ratio={ratio} min={min}/>
            </div>
        </>
    )
}
```
### 比例與畫面更新

在元件中，我們使用 992px 作為桌面與移動端的斷點，並根據視窗大小動態更新 ratio 和 min：
#### React 直接在元件內更新
```
const breakpoint = 992 - margin * 2;
const [width, height] = useWindowSize(margin);
const ratio = (width > breakpoint) ? 1 : 2;
const min = getMin(width, height);
```
> 一個常見的誤解是，把大部分變數都作為useState來定義，在這個例子中，useWindowSize 會帶動元件的渲染，使內部重新執行，屬於較單純的上下游依賴關係。
#### Vue－透過computed依賴更新，且必須定義參數型別
```
const props = defineProps({
  margin: Number,
})

const breakpoint = 992 - props.margin * 2;
const { width, height } = useWindowSize(props.margin);
const max = computed(() => getMin(width.value, height.value));
const ratio = computed(() => (width.value > breakpoint) ? 1 : 2);
```

其中，getMin 函數會根據斷點來計算不同比例下的最小值，確保佈局合理：
```
function getMin(w, h){
    const min = (w > breakpoint)
        ? ((w < h) ? w : h)
        : ((w < h * 0.5) ? w : h * 0.5);
    return min;
}
```
> 例如：如果螢幕寬高是 340x740，扣除 margin 後為 300x700，則將高度除以二進行比較（即 300x350），最終得出最小值為 300，最終佈局為 300x600。

### 結語
透過這種簡單且高效的設計方法，我們實現了自適應的響應式布局，灑花～如同開篇提到的，第一個主題會先從元件下手，準備好一個canvas友善的開發環境，開頭展示的圖片，是下個主題會用到的粒子系統，敬請期待囉~