### 開場白
鐵人賽一路走來，搗鼓東、搗鼓西的，今天想來點不同風格，來閒聊一下。別擔心不是在水文章，剩下兩個主題大概還要十篇才寫的完呢！

在這邊想特別感謝 鱈魚前輩 的支持，幾乎每篇文章都默默替我按讚，只要想到每寫完一篇，就能收穫一個讚，這份小小的鼓勵讓我多了一份堅持的理由，實在是很窩心。


我花了點時間為接下來的 3D 長條圖 加了一些細節，看著精緻了些，如果有引起你的興趣，請期待後續文章！

![https://ithelp.ithome.com.tw/upload/images/20241006/20135197oK9puELlvr.png](https://ithelp.ithome.com.tw/upload/images/20241006/20135197oK9puELlvr.png)

### 寫文章

關於寫文章這件事，我從生成式 AI 這邊獲得不少幫助，所以今天就來聊聊，怎麼讓 AI 協助撰寫文章吧！（轉得有點硬哦！）

* 以下心得使用的是通用型 AI，適合日常任務的那種。

今天從幾個面向來說明：
1. 範例
2. 使用效率
3. 它的定位

這邊先看看我是怎麼做的，首先我為主題 D 先構思好五篇文章和簡介，再讓 AI 去幫我擴寫，可以看到，它的回答相對流暢，也比較完整。

#### 第一問
根據提供的標題和內容描述，為每個系列文章撰寫簡介

* 3D圖形與音頻資料
    1. 音訊處理結合 Three.js
      * 介紹封裝架構設計包含：畫布設定、預載入、清除記憶體、事件、更新、渲染
      * 透過架構實作 Three 場景、鏡頭、輔助控制和座標軸
    2. BufferGeometry 自定義 3D 長條圖
      * 介紹 TypeArray
      * 介紹圖形渲染方法，比較相對 Canvas 方便和不方便的地方
    3. mesh、geometry、meterial 三位一體
      * 為基礎打補丁：介紹為什麼需要幾何體和材質來合成網格體
      * 提供範例解釋其多對一關係，並且談到改變座標如何層層影響
    4. 聲音格式工廠
      * 用工廠設計模式設計 Three 所需要的資料格式轉換
      * 介紹架構，輸入音訊、輸出向量和頂點
    5. 從頂點到幾何空間－封裝底層長條圖算法
      * 完成音訊到頂點的轉換
      * 為長條圖著色，如漸層效果

#### 它的回答
> ![https://ithelp.ithome.com.tw/upload/images/20241006/20135197u6u7w8Jj0Z.png](https://ithelp.ithome.com.tw/upload/images/20241006/20135197u6u7w8Jj0Z.png)

#### 第二問
根據以上群組文章的資訊，分析並判斷提綱是否完整，探討前後銜接和適合的順序，最後撰寫每篇文章的大綱：

#### 它的回答
透過明確的步驟提示，它能依序完成任務，給我一些靈感：（雖然它有點話唬爛，說要調整順序結果沒調呀！ＸＤ）
> ![https://ithelp.ithome.com.tw/upload/images/20241006/20135197gj0wmI6FF0.png](https://ithelp.ithome.com.tw/upload/images/20241006/20135197gj0wmI6FF0.png)

接著幫我構思好每篇文章的基本段落：
> ![https://ithelp.ithome.com.tw/upload/images/20241006/20135197A3OgavJSKm.png](https://ithelp.ithome.com.tw/upload/images/20241006/20135197A3OgavJSKm.png)

以上這個範例，透過 AI **言之有物**的特性，就能在撰寫文章前再復盤一次，此時問問自己，這些內容是我想寫的嗎？同時能了解到——原來下錯標題會誤導讀者那些內容。同時可以先確認文章長度和先後順序，大方向和骨幹確認好後，後續很難會出錯。

像我是一個思考很跳躍的人，我沒辦法瀑布式寫文章，AI 就作為一個編輯的角色，補足了我的缺點。

-----

### 使用效率
那麼認真講，效率**感覺**會提升，但實際上呢？我覺得有一個很大的前提——不要讓 AI 干涉你的每個流程。

首先，它確實能和你分工合作，幫助你快速完成一些事，但同時品質會被迫變高。也許你一開始文章只是想輕鬆寫寫，但隨著它的加入，就如同另一個共筆者，它幫你想到東缺一塊、西缺一塊，這些建議太好了，你沒理由拒絕，只得花時間去補。

這一點我稱之為"不穩定性"，於是，為了整篇文章的流暢，你每新增一個段落就貼給它潤稿，就像交作業一樣，然後它給了你新想法。當你要決定採用哪一版本，或是折衷方案的時候，就是費神費力之處了。

所以我認為，要適時的減少它的干涉，或許就跟管理一樣，你也需要管理你的 AI，讓他負責特定任務，越熟悉，你就越知道哪邊要依賴它了。整體來說，我覺得速度沒有提升，但品質有提升，那就算效率不錯了。

-----

### 它的定位
以前的我比較傲慢，我會說它像一個工讀生，涉略很廣但都不深。現在，它讓我學會了謙虛，我覺得七成的時候它是老師，三成的時候它是同事。

即使它不是專門寫程式的，也有能力閱讀程式碼，在撰寫這系列文章時，我是先完成程式碼，回頭重構的時候找他幫忙，我才知道，原來有些我認為複雜的任務，對它卻這麼簡單。每每到這時我就想，如果當初一開始就先問它，那該有多快！

另一方面，它知道很多我不知道的事，試想，你需要閱讀過多少篇文章，才能有像它一樣解釋一件事的口條，這大大減少了我們學習的時間。但我仍覺得我們是平等的，應以中庸的心態看待，我貼一段程式碼讓它替我講解，有時候我覺得講的好，也有時候我不喜歡就當參考。於是我學會配合它，先替程式碼和文章分段，再讓它講解，互相學習。

我建議，不能遇到什麼事情都找它，就好像你很信任一個朋友，遇到什麼都只聽它的，我認為這樣不好，物極必反，這情況反而會內耗。探索和找到它在你心目中的定位，才是我們該做的。

-----

### 結論
今天感覺水了一篇，但我還是堅持自己寫吧，什麼內容才是有價值，這是生成式 AI 出現後的一個大哉問，我覺得，想說什麼說什麼吧！就這樣寫下來，也是快兩個小時。

AI 的好處多多，但它也像一道陰影，每每完成一篇文章，我就會反思，會不會全部的內容 AI 都可以獨力完成？我投入的時間和輸出是否成正比？細思極恐、細思極恐，你覺得呢？