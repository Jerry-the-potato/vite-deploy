# API 設計文件

## 1. API 概述

### 1.1 設計原則
- **RESTful 設計**：遵循 REST 架構原則
- **統一介面**：一致的 API 設計風格
- **無狀態性**：每個請求包含完整資訊
- **可擴展性**：支援未來功能擴展

### 1.2 API 版本管理
- **版本策略**：語義化版本 (Semantic Versioning)
- **向後相容**：維護舊版本 API 相容性
- **漸進升級**：平滑的版本遷移路徑

## 2. 前端內部 API

### 2.1 演算法引擎 API

#### 2.1.1 排序演算法介面
```javascript
interface SortAlgorithm {
  // 演算法基本資訊
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  
  // 執行方法
  sort(data: number[]): Promise<SortStep[]>;
  sortWithGenerator(data: number[]): Generator<SortStep>;
  
  // 狀態控制
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;
  
  // 參數配置
  setSpeed(speed: number): void;
  setVisualizationMode(mode: VisualizationMode): void;
}

interface SortStep {
  step: number;
  action: 'compare' | 'swap' | 'move' | 'mark';
  indices: number[];
  array: number[];
  metadata?: {
    comparisons: number;
    swaps: number;
    description: string;
  };
}

enum VisualizationMode {
  BAR_CHART = 'bar_chart',
  PARTICLE_SYSTEM = 'particle_system',
  THREE_D = 'three_d'
}
```

#### 2.1.2 粒子系統 API
```javascript
interface ParticleSystem {
  // 系統初始化
  initialize(config: ParticleSystemConfig): void;
  
  // 粒子管理
  addParticle(particle: Particle): void;
  removeParticle(id: string): void;
  getParticle(id: string): Particle | null;
  getAllParticles(): Particle[];
  
  // 物理模擬
  update(deltaTime: number): void;
  applyForce(force: Vector2): void;
  detectCollisions(): CollisionPair[];
  
  // 渲染控制
  render(renderer: Renderer): void;
  setRenderMode(mode: RenderMode): void;
}

interface Particle {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  radius: number;
  color: Color;
  
  // 物理屬性
  elasticity: number;
  friction: number;
  
  // 生命週期
  lifespan: number;
  age: number;
  
  // 更新方法
  update(deltaTime: number): void;
  applyForce(force: Vector2): void;
}

interface ParticleSystemConfig {
  maxParticles: number;
  gravity: Vector2;
  bounds: Rectangle;
  collisionEnabled: boolean;
  renderMode: RenderMode;
}
```

### 2.2 動畫管理 API

#### 2.2.1 動畫管理器介面
```javascript
interface AnimationManager {
  // 動畫註冊
  registerAnimation(id: string, animation: Animation): void;
  unregisterAnimation(id: string): void;
  
  // 動畫控制
  play(id: string): Promise<void>;
  pause(id: string): void;
  stop(id: string): void;
  seek(id: string, time: number): void;
  
  // 批次操作
  playAll(): void;
  pauseAll(): void;
  stopAll(): void;
  
  // 觀察器管理
  observe(element: HTMLElement, config: ObserverConfig): void;
  unobserve(element: HTMLElement): void;
  
  // 事件系統
  on(event: AnimationEvent, callback: Function): void;
  off(event: AnimationEvent, callback: Function): void;
  emit(event: AnimationEvent, data?: any): void;
}

interface Animation {
  id: string;
  duration: number;
  easing: EasingFunction;
  
  // 動畫幀
  update(progress: number): void;
  
  // 生命週期
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  
  // 控制方法
  play(): void;
  pause(): void;
  stop(): void;
  reset(): void;
}

type EasingFunction = (t: number) => number;

enum AnimationEvent {
  START = 'start',
  UPDATE = 'update',
  COMPLETE = 'complete',
  PAUSE = 'pause',
  STOP = 'stop'
}
```

### 2.3 渲染引擎 API

#### 2.3.1 Canvas 渲染器
```javascript
interface CanvasRenderer {
  // 基本設定
  initialize(canvas: HTMLCanvasElement): void;
  resize(width: number, height: number): void;
  clear(): void;
  
  // 繪製方法
  drawRectangle(x: number, y: number, width: number, height: number, style: DrawStyle): void;
  drawCircle(x: number, y: number, radius: number, style: DrawStyle): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, style: LineStyle): void;
  drawText(text: string, x: number, y: number, style: TextStyle): void;
  
  // 變換操作
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
  
  // 性能優化
  enableBatching(): void;
  disableBatching(): void;
  flush(): void;
}

interface DrawStyle {
  fillColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  alpha?: number;
}

interface LineStyle {
  color: Color;
  width: number;
  dashPattern?: number[];
}

interface TextStyle {
  font: string;
  color: Color;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom';
}
```

#### 2.3.2 Three.js 渲染器
```javascript
interface ThreeRenderer {
  // 場景管理
  initializeScene(): void;
  addObject(object: THREE.Object3D): void;
  removeObject(object: THREE.Object3D): void;
  
  // 相機控制
  setCamera(camera: THREE.Camera): void;
  setCameraPosition(x: number, y: number, z: number): void;
  setCameraTarget(x: number, y: number, z: number): void;
  
  // 光照設定
  addLight(light: THREE.Light): void;
  removeLight(light: THREE.Light): void;
  
  // 渲染控制
  render(): void;
  setRenderSize(width: number, height: number): void;
  enableShadows(enabled: boolean): void;
  
  // 資源管理
  dispose(): void;
  getMemoryUsage(): MemoryInfo;
}

interface MemoryInfo {
  geometries: number;
  textures: number;
  programs: number;
  triangles: number;
  points: number;
  lines: number;
}
```

#### 2.3.3 WebGL 著色器 API
```javascript
interface ShaderProgram {
  // 程式管理
  compile(vertexSource: string, fragmentSource: string): boolean;
  use(): void;
  dispose(): void;
  
  // Uniform 變數
  setUniform1f(name: string, value: number): void;
  setUniform2f(name: string, x: number, y: number): void;
  setUniform3f(name: string, x: number, y: number, z: number): void;
  setUniform4f(name: string, x: number, y: number, z: number, w: number): void;
  setUniformMatrix4fv(name: string, matrix: Float32Array): void;
  
  // Attribute 變數
  setAttribute(name: string, buffer: WebGLBuffer, size: number): void;
  enableAttribute(name: string): void;
  disableAttribute(name: string): void;
  
  // 紋理綁定
  bindTexture(name: string, texture: WebGLTexture, unit: number): void;
}

interface WebGLRenderer {
  // 初始化
  initialize(canvas: HTMLCanvasElement): void;
  createShaderProgram(vertexSource: string, fragmentSource: string): ShaderProgram;
  
  // 緩衝區管理
  createBuffer(data: Float32Array, usage: number): WebGLBuffer;
  updateBuffer(buffer: WebGLBuffer, data: Float32Array): void;
  deleteBuffer(buffer: WebGLBuffer): void;
  
  // 紋理管理
  createTexture(image: HTMLImageElement): WebGLTexture;
  deleteTexture(texture: WebGLTexture): void;
  
  // 繪製命令
  drawArrays(mode: number, first: number, count: number): void;
  drawElements(mode: number, count: number, type: number, offset: number): void;
  
  // 狀態管理
  viewport(x: number, y: number, width: number, height: number): void;
  clear(mask: number): void;
  enable(capability: number): void;
  disable(capability: number): void;
}
```

## 3. 外部 API 介面

### 3.1 音頻資料 API

#### 3.1.1 音頻分析器
```javascript
interface AudioAnalyzer {
  // 初始化
  initialize(audioContext: AudioContext): void;
  connect(source: AudioNode): void;
  disconnect(): void;
  
  // 分析參數
  setFFTSize(size: number): void;
  setSmoothingTimeConstant(value: number): void;
  
  // 資料獲取
  getFrequencyData(): Uint8Array;
  getTimeDomainData(): Uint8Array;
  getFrequencyFloatData(): Float32Array;
  
  // 特徵提取
  getBassLevel(): number;
  getMidLevel(): number;
  getTrebleLevel(): number;
  getAverageFrequency(): number;
  getPeakFrequency(): number;
}

interface AudioLoader {
  // 載入音頻
  loadAudio(url: string): Promise<AudioBuffer>;
  loadAudioFromFile(file: File): Promise<AudioBuffer>;
  
  // 音頻資訊
  getAudioInfo(buffer: AudioBuffer): AudioInfo;
  
  // 格式轉換
  convertToFormat(buffer: AudioBuffer, format: AudioFormat): AudioBuffer;
}

interface AudioInfo {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  length: number;
}

enum AudioFormat {
  MONO = 'mono',
  STEREO = 'stereo',
  WAV = 'wav',
  MP3 = 'mp3'
}
```

### 3.2 檔案操作 API

#### 3.2.1 資料匯入/匯出
```javascript
interface DataIO {
  // 匯入資料
  importFromJSON(file: File): Promise<any>;
  importFromCSV(file: File): Promise<number[][]>;
  importFromArray(data: any[]): void;
  
  // 匯出資料
  exportToJSON(data: any, filename: string): void;
  exportToCSV(data: number[][], filename: string): void;
  exportToPNG(canvas: HTMLCanvasElement, filename: string): void;
  
  // 錄影功能
  startRecording(canvas: HTMLCanvasElement, options: RecordingOptions): void;
  stopRecording(): Promise<Blob>;
  
  // 設定管理
  saveSettings(settings: AppSettings): void;
  loadSettings(): AppSettings;
}

interface RecordingOptions {
  format: 'webm' | 'mp4';
  quality: number;
  frameRate: number;
  audioBitRate?: number;
  videoBitRate?: number;
}

interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  animationSpeed: number;
  renderQuality: 'low' | 'medium' | 'high';
  enableSound: boolean;
  enableParticles: boolean;
}
```

## 4. 事件系統 API

### 4.1 事件發射器
```javascript
interface EventEmitter {
  // 事件監聽
  on(event: string, listener: Function): void;
  once(event: string, listener: Function): void;
  off(event: string, listener?: Function): void;
  
  // 事件發射
  emit(event: string, ...args: any[]): boolean;
  
  // 監聽器管理
  listeners(event: string): Function[];
  listenerCount(event: string): number;
  removeAllListeners(event?: string): void;
}

// 系統事件類型
enum SystemEvent {
  ALGORITHM_START = 'algorithm:start',
  ALGORITHM_STEP = 'algorithm:step',
  ALGORITHM_COMPLETE = 'algorithm:complete',
  ANIMATION_FRAME = 'animation:frame',
  PARTICLE_COLLISION = 'particle:collision',
  USER_INTERACTION = 'user:interaction',
  PERFORMANCE_WARNING = 'performance:warning',
  ERROR = 'error'
}
```

### 4.2 使用者互動 API
```javascript
interface InputHandler {
  // 滑鼠事件
  onMouseDown(callback: (event: MouseEvent) => void): void;
  onMouseMove(callback: (event: MouseEvent) => void): void;
  onMouseUp(callback: (event: MouseEvent) => void): void;
  onMouseWheel(callback: (event: WheelEvent) => void): void;
  
  // 鍵盤事件
  onKeyDown(callback: (event: KeyboardEvent) => void): void;
  onKeyUp(callback: (event: KeyboardEvent) => void): void;
  
  // 觸控事件
  onTouchStart(callback: (event: TouchEvent) => void): void;
  onTouchMove(callback: (event: TouchEvent) => void): void;
  onTouchEnd(callback: (event: TouchEvent) => void): void;
  
  // 手勢識別
  onPinch(callback: (scale: number) => void): void;
  onRotate(callback: (angle: number) => void): void;
  onSwipe(callback: (direction: SwipeDirection) => void): void;
}

enum SwipeDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}
```

## 5. 工具類型定義

### 5.1 數學類型
```javascript
interface Vector2 {
  x: number;
  y: number;
  
  add(other: Vector2): Vector2;
  subtract(other: Vector2): Vector2;
  multiply(scalar: number): Vector2;
  divide(scalar: number): Vector2;
  magnitude(): number;
  normalize(): Vector2;
  dot(other: Vector2): number;
  distance(other: Vector2): number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
  
  add(other: Vector3): Vector3;
  subtract(other: Vector3): Vector3;
  multiply(scalar: number): Vector3;
  divide(scalar: number): Vector3;
  magnitude(): number;
  normalize(): Vector3;
  dot(other: Vector3): number;
  cross(other: Vector3): Vector3;
  distance(other: Vector3): number;
}

interface Matrix4 {
  elements: Float32Array;
  
  identity(): Matrix4;
  transpose(): Matrix4;
  inverse(): Matrix4;
  multiply(other: Matrix4): Matrix4;
  translate(x: number, y: number, z: number): Matrix4;
  rotate(angle: number, axis: Vector3): Matrix4;
  scale(x: number, y: number, z: number): Matrix4;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
  
  toHex(): string;
  toRGB(): string;
  toRGBA(): string;
  toHSL(): { h: number; s: number; l: number };
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  
  contains(point: Vector2): boolean;
  intersects(other: Rectangle): boolean;
  union(other: Rectangle): Rectangle;
  intersection(other: Rectangle): Rectangle | null;
}
```

### 5.2 效能監控 API
```javascript
interface PerformanceMonitor {
  // FPS 監控
  startFPSMonitoring(): void;
  stopFPSMonitoring(): void;
  getCurrentFPS(): number;
  getAverageFPS(): number;
  
  // 記憶體監控
  getMemoryUsage(): MemoryUsage;
  
  // 渲染監控
  getDrawCalls(): number;
  getTriangleCount(): number;
  
  // 效能標記
  mark(name: string): void;
  measure(name: string, startMark: string, endMark: string): number;
  
  // 警告系統
  setFPSThreshold(threshold: number): void;
  setMemoryThreshold(threshold: number): void;
  onPerformanceWarning(callback: (warning: PerformanceWarning) => void): void;
}

interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  gpuMemoryUsage?: number;
}

interface PerformanceWarning {
  type: 'fps' | 'memory' | 'drawCalls';
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}
```

## 6. 錯誤處理

### 6.1 錯誤類型定義
```javascript
enum ErrorCode {
  WEBGL_NOT_SUPPORTED = 'WEBGL_NOT_SUPPORTED',
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  CANVAS_CONTEXT_ERROR = 'CANVAS_CONTEXT_ERROR',
  SHADER_COMPILATION_ERROR = 'SHADER_COMPILATION_ERROR',
  TEXTURE_LOADING_ERROR = 'TEXTURE_LOADING_ERROR',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  ALGORITHM_ERROR = 'ALGORITHM_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR'
}

interface ApplicationError extends Error {
  code: ErrorCode;
  details?: any;
  recoverable: boolean;
  
  toString(): string;
  toJSON(): object;
}

interface ErrorHandler {
  handleError(error: ApplicationError): void;
  registerErrorCallback(callback: (error: ApplicationError) => void): void;
  getErrorHistory(): ApplicationError[];
  clearErrorHistory(): void;
}
```

## 7. API 使用範例

### 7.1 排序演算法使用範例
```javascript
// 創建排序演算法實例
const bubbleSort = new BubbleSort();

// 設定資料
const data = [64, 34, 25, 12, 22, 11, 90];

// 設定視覺化模式
bubbleSort.setVisualizationMode(VisualizationMode.BAR_CHART);
bubbleSort.setSpeed(1.0);

// 執行排序
bubbleSort.on('step', (step) => {
  console.log(`Step ${step.step}: ${step.action}`);
  updateVisualization(step.array, step.indices);
});

bubbleSort.on('complete', (result) => {
  console.log('排序完成！', result.array);
});

await bubbleSort.sort(data);
```

### 7.2 粒子系統使用範例
```javascript
// 創建粒子系統
const particleSystem = new ParticleSystem();

// 配置系統參數
particleSystem.initialize({
  maxParticles: 1000,
  gravity: new Vector2(0, 9.8),
  bounds: new Rectangle(0, 0, 800, 600),
  collisionEnabled: true,
  renderMode: RenderMode.CIRCLE
});

// 添加粒子
for (let i = 0; i < 100; i++) {
  const particle = new Particle({
    id: `particle_${i}`,
    position: new Vector2(Math.random() * 800, Math.random() * 600),
    velocity: new Vector2(Math.random() * 10 - 5, Math.random() * 10 - 5),
    mass: 1.0,
    radius: 5,
    color: new Color(Math.random(), Math.random(), Math.random())
  });
  
  particleSystem.addParticle(particle);
}

// 渲染循環
function animate() {
  particleSystem.update(0.016); // 60 FPS
  particleSystem.render(renderer);
  requestAnimationFrame(animate);
}

animate();
```

---

*文件版本：1.0*  
*建立日期：2024年*  
*API 設計團隊：前端開發團隊*