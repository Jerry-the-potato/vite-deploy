import MyWorker from "./worker?worker"
import lokaVolterraAlgorithm from "./lokaVolterraAlgorithm";

// 粒子系統事件管理員
const createLokaVolterra = function(){
	const myWorker = new MyWorker();
	this.algorithm = new lokaVolterraAlgorithm();
	this.setCanvas = (canvas, bitmap) => {
		this.algorithm.reset(canvas.width, canvas.height);
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.bitmap = bitmap;
		// const bitmapCtx = this.bitmap.getContext("bitmaprenderer");

		const offscreen = bitmap.transferControlToOffscreen();
		myWorker.postMessage({
			"name": "transferControlToOffscreen",
			"canvas": offscreen,
		}, [offscreen]);
		// worker介面
		// myWorker.addEventListener("message", function handleMessageFromWorker(msg) {
		// 	switch(msg.data.name){
		// 		case "drawImage":
		// 			bitmapCtx.transferFromImageBitmap(msg.data.bitmap);
		// 		break;
		// 		case "error":
		// 			// console.log(msg.data);
		// 		break;
		// 		default:
		// 		console.log("invalid message received!");
		// 	}
		// });
		// myWorker.postMessage({
		// 	"name": "createOffscreenCanvas",
		// 	"w": bitmap.width,
		// 	"h": bitmap.height
		// });
		window.addEventListener("resize", function(){
			myWorker.postMessage({
				"name": "setOffscreen",
				"w": canvas.width,
				"h": canvas.height
			});
		}, false);
	}
	this.pauseWorker = (isPause) => {
		myWorker.postMessage({"name": isPause ? "requestAnimation" : "cancelAnimation"});
	}
	// 用了bind之後 function.name 會變成 bound renderS1，要特別注意
	this.render = function(){
		this.algorithm.render(this.ctx);
	}.bind(this)
	this.update = function(){
		this.algorithm.update(this.ctx, this.canvas.width, this.canvas.height);
	}.bind(this)
	return this;
}
const lokaVolterra = new createLokaVolterra();
export default lokaVolterra;