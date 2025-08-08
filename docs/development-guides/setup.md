# 開發環境設定指南

## 1. 系統需求

### 1.1 基本需求
- **作業系統**：Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Node.js**：18.0 或更高版本
- **npm**：9.0 或更高版本
- **記憶體**：至少 8GB RAM (建議 16GB)
- **顯示卡**：支援 WebGL 2.0 的顯示卡

### 1.2 瀏覽器需求
- **Chrome**：90+ (建議)
- **Firefox**：88+
- **Safari**：14+
- **Edge**：90+

> **注意**：需要瀏覽器支援 WebGL 2.0 以獲得最佳體驗

## 2. 環境安裝

### 2.1 安裝 Node.js
```bash
# 使用 nvm 管理 Node.js 版本 (推薦)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 或直接從官網下載安裝
# https://nodejs.org/
```

### 2.2 驗證安裝
```bash
node --version   # 應顯示 v18.x.x
npm --version    # 應顯示 9.x.x
```

### 2.3 設定 npm 鏡像 (可選)
```bash
# 使用淘寶鏡像加速 (中國地區)
npm config set registry https://registry.npmmirror.com

# 或使用官方鏡像
npm config set registry https://registry.npmjs.org
```

## 3. 專案設定

### 3.1 克隆專案
```bash
git clone https://github.com/Jerry-the-potato/vite-deploy.git
cd vite-deploy
```

### 3.2 安裝依賴
```bash
# 安裝專案依賴
npm install

# 如果遇到網路問題，可以嘗試
npm install --registry https://registry.npmmirror.com
```

### 3.3 依賴套件說明
```json
{
  "dependencies": {
    "@emotion/react": "^11.13.3",      // React 情感化 CSS
    "@emotion/styled": "^11.13.0",     // 樣式化元件
    "@mui/material": "^6.1.5",         // Material-UI 元件庫
    "axios": "^1.7.7",                 // HTTP 客戶端
    "cannon": "^0.6.2",                // 物理引擎
    "dat.gui": "^0.7.9",               // GUI 控制面板
    "lodash": "^4.17.21",              // 工具函數庫
    "react": "^18.3.1",                // React 框架
    "react-dom": "^18.3.1",            // React DOM
    "three": "^0.167.1"                // 3D 渲染引擎
  },
  "devDependencies": {
    "@eslint/js": "^9.10.0",           // ESLint 核心
    "@types/react": "^18.3.3",         // React 型別定義
    "@types/react-dom": "^18.3.0",     // React DOM 型別定義
    "@vitejs/plugin-react": "^4.3.1",  // Vite React 插件
    "eslint": "^9.10.0",               // 代碼檢查工具
    "vite": "^5.4.0"                   // 建置工具
  }
}
```

## 4. 開發命令

### 4.1 基本命令
```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 代碼檢查
npm run lint
```

### 4.2 開發伺服器
```bash
# 啟動開發伺服器 (預設 http://localhost:5173)
npm run dev

# 指定端口
npm run dev -- --port 3000

# 指定主機
npm run dev -- --host 0.0.0.0
```

### 4.3 建置選項
```bash
# 建置並分析包大小
npm run build -- --report

# 建置並生成 source map
npm run build -- --sourcemap

# 清理並重新建置
rm -rf dist && npm run build
```

## 5. 開發工具設定

### 5.1 VS Code 配置

#### 推薦擴展
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",      // 代碼格式化
    "ms-vscode.vscode-eslint",     // ESLint 整合
    "bradlc.vscode-tailwindcss",   // Tailwind CSS 支援
    "ms-vscode.vscode-typescript", // TypeScript 支援
    "ms-vscode.live-server",       // 實時預覽
    "formulahendry.auto-rename-tag", // 自動重命名標籤
    "christian-kohler.path-intellisense" // 路徑智能提示
  ]
}
```

#### 工作區設定 (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.eol": "\n",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

### 5.2 Git 配置

#### .gitignore 配置
```gitignore
# 依賴
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 建置輸出
dist/
build/

# 環境變數
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 作業系統
.DS_Store
Thumbs.db

# 臨時檔案
*.tmp
*.temp
.cache/

# 測試覆蓋率
coverage/

# 日誌
logs/
*.log
```

#### Git Hooks (可選)
```bash
# 安裝 husky 用於 Git hooks
npm install --save-dev husky

# 設定 pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

## 6. 專案結構說明

### 6.1 目錄結構
```
vite-deploy/
├── docs/                    # 文件目錄
│   ├── system-analysis/     # 系統分析文件
│   ├── technical-design/    # 技術設計文件
│   ├── api-specs/          # API 規格文件
│   ├── development-guides/ # 開發指南
│   └── meeting-notes/      # 會議紀錄
├── src/                    # 源代碼目錄
│   ├── component/          # React 元件
│   ├── js/                 # JavaScript 模組
│   ├── css/                # 樣式文件
│   ├── shader/             # WebGL 著色器
│   ├── assets/             # 靜態資源
│   ├── customHook/         # 自定義 Hook
│   ├── App.jsx             # 主應用元件
│   └── main.jsx            # 應用入口
├── iThome/                 # iThome 鐵人賽文章
├── public/                 # 公共資源
├── dist/                   # 建置輸出 (git ignored)
├── package.json            # 專案配置
├── vite.config.js          # Vite 配置
├── eslint.config.js        # ESLint 配置
└── index.html              # HTML 模板
```

### 6.2 重要文件說明

#### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vite-deploy/',  // GitHub Pages 部署路徑
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,      // 生成 source map
    minify: 'terser',     // 使用 terser 壓縮
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          mui: ['@mui/material']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,           // 自動開啟瀏覽器
    cors: true
  }
})
```

#### eslint.config.js
```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

## 7. 開發工作流程

### 7.1 日常開發流程
```bash
# 1. 更新代碼
git pull origin main

# 2. 安裝/更新依賴 (如果有變更)
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 開發功能...

# 5. 代碼檢查
npm run lint

# 6. 建置測試
npm run build

# 7. 提交代碼
git add .
git commit -m "feat: 新增功能描述"
git push origin feature-branch
```

### 7.2 分支管理策略
```bash
# 主分支
main                    # 生產環境代碼

# 開發分支
develop                 # 開發環境代碼

# 功能分支
feature/algorithm-viz   # 演算法視覺化功能
feature/particle-system # 粒子系統功能
feature/webgl-shaders   # WebGL 著色器功能

# 修復分支
hotfix/performance-fix  # 效能修復
bugfix/canvas-issue     # Canvas 問題修復
```

### 7.3 提交訊息規範
```bash
# 功能新增
feat: 新增排序演算法視覺化功能

# 問題修復
fix: 修復粒子碰撞檢測問題

# 文件更新
docs: 更新 API 文件

# 樣式修改
style: 調整 CSS 樣式

# 代碼重構
refactor: 重構動畫管理器

# 效能優化
perf: 優化 WebGL 渲染效能

# 測試相關
test: 新增單元測試

# 建置相關
build: 更新 Vite 配置

# 其他變更
chore: 更新依賴套件
```

## 8. 除錯技巧

### 8.1 瀏覽器開發者工具

#### Performance 分析
```javascript
// 效能標記
performance.mark('algorithm-start');
// ... 演算法執行 ...
performance.mark('algorithm-end');
performance.measure('algorithm-execution', 'algorithm-start', 'algorithm-end');

// 查看結果
const measures = performance.getEntriesByType('measure');
console.log(measures);
```

#### WebGL 除錯
```javascript
// 啟用 WebGL 除錯
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

// 檢查 WebGL 錯誤
function checkGLError(gl, operation) {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error(`WebGL error in ${operation}: ${error}`);
  }
}
```

### 8.2 常見問題解決

#### 依賴安裝問題
```bash
# 清理 npm 快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install

# 使用 yarn 替代 npm
npm install -g yarn
yarn install
```

#### WebGL 不支援
```javascript
function checkWebGLSupport() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    console.error('WebGL 不支援');
    // 顯示降級提示
    showFallbackMessage();
    return false;
  }
  
  return true;
}
```

#### 效能問題
```javascript
// FPS 監控
class FPSMonitor {
  constructor() {
    this.fps = 0;
    this.lastTime = performance.now();
    this.frameCount = 0;
  }
  
  update() {
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastTime;
    
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;
      
      if (this.fps < 30) {
        console.warn(`效能警告: FPS 低於 30 (${this.fps})`);
      }
    }
  }
}
```

## 9. 部署指南

### 9.1 GitHub Pages 部署
```bash
# 建置專案
npm run build

# 部署到 GitHub Pages (自動)
git push origin main
```

### 9.2 本地預覽
```bash
# 建置並預覽
npm run build
npm run preview

# 或使用 serve
npm install -g serve
serve -s dist
```

### 9.3 其他平台部署

#### Netlify
```bash
# 建置命令
npm run build

# 發布目錄
dist
```

#### Vercel
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

## 10. 故障排除

### 10.1 常見錯誤

| 錯誤訊息 | 可能原因 | 解決方案 |
|---------|---------|---------|
| `Module not found` | 依賴未安裝或路徑錯誤 | `npm install` 或檢查導入路徑 |
| `WebGL context lost` | GPU 記憶體不足 | 減少渲染複雜度或重啟瀏覽器 |
| `Canvas is tainted` | 跨域圖片載入 | 設定 CORS 或使用同域圖片 |
| `Out of memory` | 記憶體洩漏 | 檢查物件釋放和事件監聽器清理 |

### 10.2 效能最佳化檢查清單
- [ ] 是否使用了 requestAnimationFrame
- [ ] 是否正確清理事件監聽器
- [ ] Canvas 是否使用分層渲染
- [ ] WebGL 資源是否正確釋放
- [ ] 是否使用物件池減少 GC
- [ ] 大量數據是否使用 Web Worker
- [ ] 圖片資源是否壓縮
- [ ] 是否啟用瀏覽器快取

---

*文件版本：1.0*  
*建立日期：2024年*  
*維護團隊：開發團隊*

## 附錄

### A. 快速參考

#### 常用指令速查
```bash
npm run dev     # 開發模式
npm run build   # 建置
npm run lint    # 代碼檢查
git status      # 檢查狀態
git log --oneline # 查看提交歷史
```

#### 鍵盤快捷鍵 (VS Code)
- `Ctrl+Shift+P`: 命令面板
- `Ctrl+`` `: 終端機
- `Ctrl+Shift+E`: 檔案瀏覽器
- `F12`: 轉到定義
- `Shift+F12`: 查找引用

### B. 相關連結
- [Node.js 官網](https://nodejs.org/)
- [Vite 文件](https://vitejs.dev/)
- [React 文件](https://react.dev/)
- [Three.js 文件](https://threejs.org/docs/)
- [WebGL 規格](https://www.khronos.org/webgl/)