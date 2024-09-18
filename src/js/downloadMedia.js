export default function downloadMedia(data){
    // Gather chunks of video data into a blob and create an object URL
    const blob = new Blob(data, {type: "video/mp4" });
    const recording_url = URL.createObjectURL(blob);
    // Attach the object URL to an <a> element, setting the download file name
    const a = document.createElement('a');
    a.href = recording_url;
    a.download = "video.mp4";
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