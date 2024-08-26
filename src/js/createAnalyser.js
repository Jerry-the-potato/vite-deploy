// AudioContext必須在用戶事件觸發後才建立，否則瀏覽器會讓audio會失效
export default function createAnalyser(audio){
    // 設定音訊
    const AudioContext = window.AudioContext || window.webkitAudioContext; //相容性
    const audioCtx = new AudioContext();
    // 創建節點
    const source = audioCtx.createMediaElementSource(audio);
    const gainNode = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    // 連接節點
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    // 對每個節點進行設定
    gainNode.gain.value = 1;
    analyser.fftSize = 1024;
    return analyser;
}