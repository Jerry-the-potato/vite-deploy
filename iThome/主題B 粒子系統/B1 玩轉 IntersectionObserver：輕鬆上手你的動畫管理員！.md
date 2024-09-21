## 動畫管理員使用指南

### 簡介
在現代網頁開發中，動態效果為用戶界面增添了生動的互動性。本篇文章將介紹一個功能簡單的動畫管理員，它能夠簡化 Canvas 動畫的管理和狀態控制，使得開發者可以輕鬆地實現效能友善的動畫效果。

### 使用方法

動畫管理員的核心功能是註冊動畫和觀察者模式：

```javascript
manager.registerAnimationCallback(name, callback);
manager.addSubjectElement(HTMLELement);
```
* callback 是開發者自定義的動畫函式
* name 是管理員辨別動畫的方式，相當於給 callback 重新命名
* 管理員使用 IntersectionObserver 來監控目標元素的可見性，據此更新動畫請求

以下是一個 React 範例：
```jsx
import React, { useEffect, useRef } from 'react';
import manager from './manager'; // 引入動畫管理員

const MyComponent = () => {
    const sectionRef = useRef(null);
    const sectionID = 'mySection';

    useEffect(() => {
        manager.addSubjectElement(sectionRef.current);
        manager.registerAnimationCallback("update" + sectionID, myUpdateFunction);
        manager.registerAnimationCallback("render" + sectionID, myRenderFunction);

        return () => {
            manager.removeSubjectID(sectionID);
            manager.unregisterAnimationCallback("update" + sectionID);
            manager.unregisterAnimationCallback("render" + sectionID);
        };
    }, []);

    const myUpdateFunction = () => {
        // 更新邏輯
    };

    const myRenderFunction = () => {
        // 渲染邏輯
    };

    return <div ref={sectionRef} id={sectionID}>內容</div>;
};
```

我在 codepen 有準備一個[線上範例](https://codepen.io/Jerry-the-potato/pen/JjgPJba)，你可以進行測試。範例中封裝了動畫邏輯，並且會讓數字持續遞增：
```
const [number, setNumber] = useState(0);
const myUpdateFunction = () => {
    setNumber((prev) => (prev < 360) ? prev + 1 : 0)
};
return <div ref={sectionRef} id={sectionID}>{number}</div>
```
* myUpdateFunction 中的函式會逐幀執行，不斷更新顯示的數字。

#### Vue 範例
若使用 Vue，實現方式如下：
```javascript
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const sectionRef = ref(null);
const sectionID = 'mySection';

const myUpdateFunction = () => {
    // 更新邏輯
};

const myRenderFunction = () => {
    // 渲染邏輯
};

onMounted(() => {
    manager.addSubjectElement(sectionRef.value);
    manager.registerAnimationCallback("update" + sectionID, myUpdateFunction);
    manager.registerAnimationCallback("render" + sectionID, myRenderFunction);
});

onBeforeUnmount(() => {
    manager.removeSubjectID(sectionID);
    manager.unregisterAnimationCallback("update" + sectionID);
    manager.unregisterAnimationCallback("render" + sectionID);
});
</script>
```

### 為什麼需要動畫管理員？
看到這裡，或許你會好奇，手動調用 requestAnimeFrame 不好嗎?
```javascript
const myUpdateFunction = () => {
    //......
    requestAnimeFrame(myUpdateFunction):
}
```

乍看之下，這樣似乎是可行的，但實際上這樣的實作並不足夠。單純使用 requestAnimationFrame 有幾個關鍵問題：

1. 請求的管理：在這樣的寫法中，你無法有效地管理所有元件請求的 ID。當你需要取消、追蹤動畫時，缺乏對 ID 的記錄會使得這變得非常困難。
2. 狀態管理：動畫管理員能夠實現開始、暫停和恢復等狀態管理。如果你想根據特定條件來控制動畫的運行，則需要一個統一的機制來管理這些狀態。
3. 組件之間的依賴：在許多情況下，動畫的狀態可能與其他兄弟元件有關聯。例如，當一個元件進入或離開視口時，可能需要啟動或暫停其他元件的動畫。這需要一個中介者來協調這些行為。

### 結論

因此，動畫管理員的角色就變得非常重要了。它不僅是動畫請求的發起者，更是整個動畫流程的統一管理者，使得程式更具可維護性和擴展性，避免因手動管理動畫而引發的混亂。

並且，由於將動畫和算法獨立分開，這允許我們將算法模組化，並將函式引入不同的元件中，實現更高的重用性和靈活性。這種模組化的設計使得動畫邏輯可以被重複利用，並能夠在不同上下文中輕鬆適應。

> ### 題外話
> 設計動畫系統是一項挑戰，需要在便利與靈活性之間取得平衡。起初，我嘗試將所有元素在 Playground 父元件中集中管理，但這會使得耦合性變高。例如，canvas 子元件將變得依賴父元件的 ID 傳入，並且父元件必須同時引入動畫管理員來觀察 canvas。最終，我選擇了在每個元件中單獨管理觀察對象，雖然增加了些許麻煩，但大大提升了元件的獨立性與可重用性。權衡取捨，這是設計中不可避免的一環。