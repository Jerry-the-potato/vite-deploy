import MyWorker from "./worker?worker"
import lokaVolterraAlgorithm from "./lokaVolterraAlgorithm";


// 粒子系統事件管理員
const createLokaVolterra = function(){
	this.setCanvas = (canvas, bitmap) => {
		this.algorithm = new lokaVolterraAlgorithm();
		this.myWorker = new MyWorker();
		this.algorithm.reset(canvas.width, canvas.height);
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.bitmap = bitmap;
		// const bitmapCtx = this.bitmap.getContext("bitmaprenderer");
		this.offscreen = bitmap.transferControlToOffscreen();
		this.myWorker.postMessage({
			"name": "transferControlToOffscreen",
			"canvas": this.offscreen,
		}, [this.offscreen]);
	}
	this.cleanup = () => {
		this.algorithm = null;
		this.canvas = null;
		this.ctx = null;
		this.bitmap = null;
		this.offscreen = null;
		this.myWorker.terminate();
		this.myWorker = null;
	}
	this.resize = () => {
		this.myWorker.postMessage({
			"name": "setOffscreen",
			"w": this.canvas.width,
			"h": this.canvas.height
		});
	}
	this.pauseWorker = (isPause) => {
		this.myWorker.postMessage({"name": isPause ? "requestAnimation" : "cancelAnimation"});
	}
	this.changeType = (name) => {
		this.algorithm.motionType = name;
	}
	this.render = () => {
		this.algorithm.render(this.ctx, -0.25);
	}
	this.update = () => {
		this.algorithm.update(this.ctx, this.canvas.width, this.canvas.height);
	}
	return this;
}
const lokaVolterra = new createLokaVolterra();
export default lokaVolterra;