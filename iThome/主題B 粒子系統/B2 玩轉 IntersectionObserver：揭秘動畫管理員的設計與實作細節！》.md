## 1.基本結構
動畫管理員的核心是 managerMaker 函數，負責建立物件並初始化必要的屬性和方法。它包含了管理動畫請求的基本邏輯和資料結構。以下是管理員的基本結構：
```javascript
const managerMaker = function() {
    this.subject = [];
    this.request = {};
    this.globalKey = "dev";
    this.lastRequestName = [];
    // 其他方法...
}
```
> 這些屬性用於追蹤當前的動畫請求、目標元素及其狀態，為後續的動畫控制奠定基礎。

## 2.主要方法
在動畫管理員中，採用FP的原則，設計幾個主要方法負責核心功能：

* 註冊/註銷動畫回調：
    * registerAnimationCallback(name, callback)：註冊動畫回調。
        * createAnimation(name, callback)：創建動畫並設置其回調函數。
        * nameValidation：驗證名稱的有效性。這確保了所有動畫都有正確的名稱和功能。
    * unregisterAnimationCallback(name)：元件卸載時註銷動畫
* 更新動畫請求：
    * updateRequestAnimation(id)：透過特定元素的 ID 更新動畫。這使得管理員能夠根據元素的可見性動態更新動畫。
        * getRequestById(id)：根據 ID 獲取請求列表。這個方法能夠返回所有與特定 ID 相關的動畫請求。
* 建立交互觀測對象：
    * IntersectionObserver：讓元素進入視窗時，觸發動畫更新
    * addSubjectElement(HTMLElement)：將元素指定為觀察對象
    * removeSubjectID(id)：用於卸載元件時，透過 ID 移除觀察對象

### 註冊動畫回調
註冊時，除了封裝動畫以外，還要檢查名稱是否有效：
```javascript
this.registerAnimationCallback = (name, callback) => {
    this.createAnimation(name, callback);
    this.nameValidation(name);
}
```

在資料格式方面，我們將 name 作為鍵值存入請求物件中，每筆資料包含儲存方法和狀態管理：
```javascript
this.createAnimation = (name, callback) => {
    const animate = () => {
        callback();
        this.request[name].ID = requestAnimationFrame(animate);
    };
    this.request[name] = {
        method: animate,
        isPause: false,
    };
}
```
* animate：動畫方面，只有符合條件的對象會被呼叫。
* isPause：用來判斷被呼叫的對象是否處於暫停狀態。

由於動畫管理員通過觀測對象，來篩選需要呼叫的動畫，在註冊時貼心的檢查該動畫，是否包含在觀測對象列表，適時提出警告：
```javascript
this.nameValidation = (name) => {
    const isValid = Object.keys(this.subject).some(ID => name.includes(ID));
    if(!isValid) console.warn("naming issue: " + name + " should include one of following letters: " + this.subject);
}
```

註銷動畫時，先取消動畫調用，再進行清空、刪除：
```javascript
this.unregisterAnimationCallback = (name) => {
    cancelAnimationFrame(this.request[name].ID);
    this.request[name].method = null;
    delete this.request[name];
}
```

### 更新動畫請求
最基本的方法如下，就可以根據元素的可見性來播放和暫停動畫：
```javascript
const names = this.getRequestById(id);
// 請求動畫
names.forEach(name => {
    this.request[name].ID = requestAnimationFrame(this.request[name].method);
})
// 取消動畫
names.forEach(name => {
    cancelAnimationFrame(this.request[name].ID);
})
```

把請求列表中的鍵值取出，就能藉由 id 篩選出請求對象：
```javascript
this.getRequestById = (id) => {
    const req = Object.keys(this.request).filter(key => key.includes(id) || key.includes(this.globalKey));
    return req;
}
```
* globalKey：提供給開發者進行基本的測試，讓動畫不依賴觀察者，全局皆可執行，只要在註冊時包含指定名稱（預設是"dev"）

但是，這裡的設計考慮到我們 Playground 元件，包含了數個 canvas 區塊，都是對計算有一定負擔的動畫，為求效能，我們希望每個 canvas 都是獨立的，只允許畫面中的單一 canvas 執行動畫。因此切換頁面時的動作分別如下：
1. 取消原有請求
2. 開始新的請求

這個做法可以避免在 transition 切換頁面時，因為原本的畫面未離開，而造成效能負擔。
```javascript
this.updateRequestAnimation = (id) => {
    // 1.取消舊的動畫
    this.lastRequestName.forEach(name => {
        if(!this.request[name]) return;
        cancelAnimationFrame(this.request[name].ID);
    })
    // 2.開始新的動畫
    const names = this.getRequestById(id);
    if(names === null) return;
    this.lastRequestName = names;
    
    names.forEach(name => {
        if(typeof this.request[name] === "undefined") return console.warn("invalid request");
        if(typeof this.request[name].method !== "function") return console.warn("invalid requestMethod");
        if(this.request[name].isPause) return;
        this.request[name].ID = requestAnimationFrame(this.request[name].method);
    })
}
```
* 透過 lastRequestName 儲存請求列表名稱，依據這個列表取消原有動畫
* 做型別檢測，避免 request 的內容遭竄改
* 最後檢查該動畫的 isPause 狀態

### 建立交互觀測對象
這裡就是呼叫動畫的邏輯了，只要新的 Canvas 對象進來，就更新動畫。離開則不觸發。
```javascript
    this.io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if(entry.intersectionRatio === 0) return;
            this.updateRequestAnimation(entry.target.id);
        });
    });
```

如果希望元素獨立管理，在畫面中就執行動畫，畫面外就取消，則可以進行拓展：
```javascript
if(entry.intersectionRatio === 0){
    this.cancelRequestAnimation(id);
    return;
}
this.startRequestAnimation(id);
```
> 邏輯相同，利用 id 取得請求清單。當作小練習吧：該如何實現這兩個函式？和前面的 updateRequestAnimation 有何不同？

最後，新增和移除觀察對象：
```javascript
this.addSubjectElement = (element, id = element.id) => {
    if (!id) return console.warn("Element must have an ID");
    this.subject[id] = element;
    this.io.unobserve(element) // 避免多次觀察同一元素
    this.io.observe(element);
}
this.removeSubjectID = (id) => {
    if (!this.subject[id]) return console.warn("Element ID not found");
    const element = this.subject[id];
    this.io.unobserve(element);
    delete this.subject[id];
}
```
* 卸載元件時，元素可能已不存在，需要透過 ID 來註銷，所以嚴格檢查 ID 是否存在

## 3.公共方法
在 JavaScript 中沒有私有的概念，所以我們就在函式名稱加一個 public 前綴，表示這些開放給外部使用。

在這裡我們可以拓展管理員的功能，提供外部控制方法，例如：

* 隨時暫停指定的動畫，將 isPause 設置為 true：
```javascript
this.publicPauseAnimation = (name) => {
    if(!this.request[name]) return;
    cancelAnimationFrame(this.request[name].ID);
    this.request[name].isPause = true;
}
```
* 恢復之前暫停的動畫
```javascript
this.publicResumeAnimation = (name) => {
    if(!this.request[name]) return;
    this.request[name].isPause = false;
    cancelAnimationFrame(this.request[name].ID);
    this.request[name].ID = requestAnimationFrame(this.request[name].method);
}
```
* 列出所有動畫名稱
```javascript
this.publicListAllAnimations = () => {
    return Object.keys(this.request);
};
```

* 列出正在呼叫的所有動畫名稱
```javascript
this.publicListLastAnimations = () => {
    return this.lastRequestName;
};
```
## 4.最佳原則
在使用動畫管理員時，建議遵循以下原則：
* 確保每個元素都有唯一的 ID。
* 在組件卸載時，記得清理註冊的回調和觀察者，防止內存洩漏。

### 結論
managerMaker 是一個功能強大的動畫管理工具，旨在提高動畫請求的管理效率。通過有效的請求更新、觀察者模式及簡潔的 API，開發者可以更專注於動畫邏輯，而不必擔心底層的管理細節。這個管理員適用於需要高效動畫管理的各種 Web 應用，是提升用戶體驗的理想選擇。