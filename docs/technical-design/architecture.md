# 技術架構設計文件

## 1. 系統架構概述

### 1.1 架構原則
- **模組化設計**：高內聚、低耦合的模組結構
- **關注點分離**：UI、邏輯、渲染的清晰分層
- **可擴展性**：支援新演算法與功能的擴展
- **效能優先**：針對視覺化與動畫的效能最佳化

### 1.2 技術選型

#### 前端框架
- **React 18.3.1**
  - 組件化開發
  - Hooks 狀態管理
  - 虛擬 DOM 效能最佳化
  - 豐富的生態系統

#### 建置工具
- **Vite 5.4.0**
  - 快速冷啟動
  - 熱模組替換 (HMR)
  - 現代化打包
  - ES6+ 支援

#### 渲染引擎
- **Three.js 0.167.1**
  - 3D 圖形渲染
  - WebGL 封裝
  - 豐富的幾何與材質
  - 動畫系統

- **原生 Canvas API**
  - 2D 圖形繪製
  - 高效能動畫
  - 自定義渲染邏輯

- **WebGL**
  - GPU 加速運算
  - 著色器程式設計
  - 分形與複雜圖形渲染

#### 物理引擎
- **Cannon.js 0.6.2**
  - 物理模擬
  - 碰撞檢測
  - 剛體動力學

## 2. 系統分層架構

```
┌─────────────────────────────────────────────────────────┐
│                    展示層 (Presentation)                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │   React 元件    │ │   UI 控制器     │ │   路由管理  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    業務層 (Business)                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │   演算法引擎    │ │   動畫管理器    │ │   狀態管理  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    渲染層 (Rendering)                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │   Canvas 2D     │ │   Three.js      │ │   WebGL     │ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    資料層 (Data)                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │   演算法資料    │ │   配置資料      │ │   媒體資源  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    工具層 (Utilities)                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │   數學工具      │ │   效能工具      │ │   通用工具  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 3. 核心模組設計

### 3.1 元件架構

#### 主要元件層次
```
App
├── Playground (主容器)
│   ├── NavigationBar (導航列)
│   ├── CanvasSection1-4 (Canvas 區域)
│   ├── RecordBtn (錄影按鈕)
│   ├── SlideMenuBtn (滑動選單)
│   └── CookieTable (資料表格)
└── 共用元件
    ├── Input (輸入元件)
    └── Table (表格元件)
```

#### 元件設計模式
- **容器/展示元件分離**
- **高階元件 (HOC) 包裝**
- **Render Props 模式**
- **Hook 邏輯複用**

### 3.2 動畫管理系統

#### 動畫管理器架構
```javascript
class AnimationManager {
  constructor() {
    this.observers = new Map();
    this.animations = new Map();
    this.rafId = null;
  }
  
  // 註冊觀察器
  registerObserver(element, config) { ... }
  
  // 管理動畫生命週期
  startAnimation(id, animation) { ... }
  stopAnimation(id) { ... }
  
  // 渲染循環
  render() { ... }
}
```

#### IntersectionObserver 整合
- **視窗進入/離開檢測**
- **動畫觸發管理**
- **效能最佳化**
- **記憶體清理**

### 3.3 演算法引擎

#### 演算法抽象基底
```javascript
class AlgorithmBase {
  constructor(data) {
    this.data = [...data];
    this.steps = [];
    this.currentStep = 0;
  }
  
  // 演算法實作
  abstract execute() { ... }
  
  // 步驟生成器
  *generateSteps() { ... }
  
  // 狀態管理
  getState() { ... }
  setState(state) { ... }
}
```

#### 排序演算法實作
- **泡沫排序**：雙層迴圈比較交換
- **快速排序**：分治法遞迴實作
- **合併排序**：遞迴合併策略
- **堆排序**：堆化過程視覺化

### 3.4 渲染引擎

#### Canvas 2D 渲染
```javascript
class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationFrame = null;
  }
  
  // 繪製圖形
  drawElements(elements) { ... }
  
  // 清除畫布
  clear() { ... }
  
  // 渲染循環
  startRender() { ... }
}
```

#### Three.js 3D 渲染
```javascript
class ThreeRenderer {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer();
    this.container = container;
  }
  
  // 初始化場景
  initScene() { ... }
  
  // 更新物件
  updateObjects(data) { ... }
  
  // 渲染場景
  render() { ... }
}
```

#### WebGL 著色器
```glsl
// 頂點著色器
attribute vec2 position;
uniform vec2 resolution;

void main() {
  vec2 zeroToOne = position / resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}

// 片段著色器
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  // 分形演算法實作
  gl_FragColor = vec4(st, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

## 4. 資料流設計

### 4.1 狀態管理策略

#### React Context + useReducer
```javascript
const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ALGORITHM_DATA':
      return { ...state, algorithmData: action.payload };
    case 'START_ANIMATION':
      return { ...state, isAnimating: true };
    case 'STOP_ANIMATION':
      return { ...state, isAnimating: false };
    default:
      return state;
  }
}
```

#### 自定義 Hooks
```javascript
function useAlgorithm(initialData) {
  const [data, setData] = useState(initialData);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const startAlgorithm = useCallback(() => { ... }, []);
  const stopAlgorithm = useCallback(() => { ... }, []);
  const nextStep = useCallback(() => { ... }, []);
  
  return { data, isRunning, currentStep, startAlgorithm, stopAlgorithm, nextStep };
}
```

### 4.2 事件系統

#### 自定義事件發射器
```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) { ... }
  off(event, listener) { ... }
  emit(event, data) { ... }
}
```

#### 元件通訊
- **父子元件**：Props 傳遞
- **兄弟元件**：共同父元件狀態
- **跨層級通訊**：Context API
- **全域事件**：自定義事件系統

## 5. 效能最佳化策略

### 5.1 渲染最佳化

#### Canvas 分層渲染
- **背景層**：靜態背景元素
- **資料層**：演算法資料視覺化
- **互動層**：滑鼠互動元素
- **UI 層**：控制介面元素

#### Three.js 最佳化
- **BufferGeometry**：高效幾何體
- **InstancedMesh**：批次渲染
- **LOD (Level of Detail)**：距離最佳化
- **Frustum Culling**：視錐體裁剪

#### WebGL 最佳化
- **Shader 快取**：著色器程式重用
- **Texture 管理**：紋理記憶體最佳化
- **Batch Rendering**：批次渲染
- **GPU Memory Pool**：GPU 記憶體池

### 5.2 記憶體管理

#### 物件池模式
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.used = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() { ... }
  release(obj) { ... }
  clear() { ... }
}
```

#### 資源清理策略
- **useEffect cleanup**：React 清理函數
- **WeakMap 引用**：弱引用避免記憶體洩漏
- **定時清理**：定期回收未使用資源
- **手動清理**：關鍵時機手動釋放

### 5.3 非同步處理

#### Web Worker 整合
```javascript
// 主執行緒
const worker = new Worker('algorithm-worker.js');
worker.postMessage({ type: 'START_SORT', data: arrayData });
worker.onmessage = (event) => {
  const { type, result } = event.data;
  if (type === 'SORT_STEP') {
    updateVisualization(result);
  }
};

// Worker 執行緒
self.onmessage = function(event) {
  const { type, data } = event.data;
  if (type === 'START_SORT') {
    const steps = bubbleSort(data);
    steps.forEach(step => {
      self.postMessage({ type: 'SORT_STEP', result: step });
    });
  }
};
```

## 6. 測試架構

### 6.1 測試策略
- **單元測試**：演算法邏輯、工具函數
- **整合測試**：元件互動、資料流
- **端到端測試**：完整使用者流程
- **效能測試**：渲染效能、記憶體使用

### 6.2 測試工具
- **Jest**：單元測試框架
- **React Testing Library**：React 元件測試
- **Cypress**：端到端測試
- **Lighthouse**：效能測試

## 7. 部署架構

### 7.1 建置流程
```yaml
# GitHub Actions Workflow
name: Build and Deploy
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 7.2 最佳化配置
- **代碼分割**：Dynamic Import
- **資源壓縮**：Gzip/Brotli
- **快取策略**：HTTP 快取頭
- **CDN 加速**：靜態資源 CDN

## 8. 監控與維護

### 8.1 效能監控
- **FPS 監控**：渲染幀率追蹤
- **記憶體監控**：記憶體使用追蹤
- **載入時間**：首屏載入效能
- **使用者行為**：互動數據收集

### 8.2 錯誤處理
- **Error Boundary**：React 錯誤邊界
- **try-catch**：異步操作錯誤處理
- **降級策略**：功能不可用時的替代方案
- **使用者回饋**：錯誤報告機制

---

*文件版本：1.0*  
*建立日期：2024年*  
*維護團隊：前端開發團隊*