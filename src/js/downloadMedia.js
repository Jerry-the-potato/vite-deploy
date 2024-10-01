export default function downloadMedia(data){
    // Gather chunks of video data into a blob and create an object URL
    const blob = new Blob(data, {type: "video/webm" });
    const recording_url = URL.createObjectURL(blob);
    // Attach the object URL to an <a> element, setting the download file name
    const a = document.createElement('a');
    a.href = recording_url;
    a.download = "video.webm";
    // a.style = "display: none;";
    // document.body.appendChild(a);
    // Trigger the file download
    a.click();
    // setTimeout(() => {
    //     // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
    //     URL.revokeObjectURL(recording_url);
    //     document.body.removeChild(a);
    // }, 0);
}

// 常見的檔案格式
// 視訊格式：

// MP4 (video/mp4)：廣泛支援的視訊格式。
// WebM (video/webm)：通常用於網頁的高效視訊格式。
// AVI (video/x-msvideo)：舊式視訊格式，但在一些場合下仍會使用。
// 音訊格式：

// MP3 (audio/mpeg)：流行的音訊格式。
// WAV (audio/wav)：無損音訊格式。
// OGG (audio/ogg)：支援多種編碼的音訊格式。
// 圖像格式：

// JPEG (image/jpeg)：常用的圖像格式。
// PNG (image/png)：支持透明度的圖像格式。
// GIF (image/gif)：支持簡單動畫的圖像格式。