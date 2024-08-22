import MyWorker from "./worker?worker"

// 繪圖系統-管理及方法
function createPainter(){
	this.works = [];
	this.pixelX = window.innerWidth;
	this.pixelY = window.innerWidth;
	this.setPixel = function(w, h){
		this.pixelX = w;
		this.pixelY = h;
	}
	this.draw = function(obj){ // 透過 painter.draw 呼叫其私有函式
		let ctx = obj.ctx;
		let w = this.pixelX;
		let h = this.pixelY;
		let x = obj.x;
		let y = obj.y;
		let r = obj.r;
		let x2 = obj.x2;
		let y2 = obj.y2;
		let text = obj.text;
		let size = obj.size;
		let color = obj.color;
		
		let a = obj.a;
		let b = obj.b;
		let angle = obj.angle;
		if(ctx)
			switch(obj.name){
				case "circle": drawCircle();
				break;
				case "point": drawPoint();
				break;
				case "line": drawLine();
				break;
				case "crescent": drawCrescent();
				break;
				case "text": drawText();
			}
		function drawCircle() {
			if(x + y + r == "NaN"){
				console.warn("drawCircle failed: missing parameter");
				return;
			}
			ctx.beginPath();
			ctx.arc(x, y, r, 0, 2 * Math.PI, false);
			ctx.fillStyle = color;
			ctx.fill();
		}
		
		function drawPoint() {
			if(x + y + size == "NaN"){
				console.warn("drawPoint failed: missing parameter");
				return;
			}
			ctx.fillStyle = color;
			ctx.fillRect(x - size/2, y - size/2, size, size);
		}
		
		function drawLine() {
			if(x + y + x2 + y2 == "NaN"){
				console.warn("drawLine failed: missing parameter");
				return;
			}
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x2, y2);
			ctx.strokeStyle = color;
			ctx.lineWidth = (size)?size:1;
			ctx.stroke();
		}

		function drawCrescent(){
			if(x + y + a + b + angle + size == "NaN"){
				console.warn("drawCrescent failed: missing parameter");
				return;
			}
			let c = Math.sqrt(a * a + b * b);
			let aTan = Math.atan(a / b);
			let dx = Math.cos(angle + Math.PI / 2) * a * size;
			let dy = Math.sin(angle + Math.PI / 2) * a * size;
			ctx.beginPath();
			ctx.arc(x, y, b * size, angle, Math.PI + angle, true);
			ctx.arc(x + dx, y + dy, c * size, Math.PI + angle + aTan, angle - aTan, false); // 順時針 縮小 +-
			ctx.fillStyle = color;
			ctx.fill(); 
		}
		function drawText(){
			x = Math.round(x);
			y = Math.round(y);
			ctx.font = size + "px Comic Sans MS";
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.fillStyle = color;
			ctx.fillText(text, x, y);
		}
	}
}
function clearBoard(ctx) {
	// let color = "rgba(0,0,0, " + document.getElementById("speed").value * 0.025 + ")";
	ctx.fillStyle = 'black';
	// this.ctx.fillStyle = color;
	// ctx.strokestyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// this.ctx.strokeRect(0, 0, width, height);
}
	// }

// 粒子引力和動畫演算法
const lokaVolterraAlgorithm = function(){
	const painter = new createPainter();
	
	this.transitionRadian = 0;
	this.trasitionOmega = Math.PI / 10000;

	this.alpha = 0.5;
	this.beta = 1;
	this.gamma = 0.5;
	this.delta = 1;
	this.dlength = 0.1;

	this.speed = 1;
	this.mouseOn = false;
	this.transform = true;

	this.timeBefore = Date.now();
	const DELAY = new Array(100);
	DELAY.fill(17);
	this.render = (ctx) => {
		clearBoard(ctx);
		ctx.save();
		ctx.translate(-ctx.canvas.width * 0.25, 0);
		painter.works.forEach(obj => {painter.draw(obj);});
		painter.works = [];
		ctx.restore();
	}
	this.update = (ctx, width, height) => {
		this.transitionRadian += this.trasitionOmega * this.speed;
		this.motion(width, height);
		this.addTexture(width, height, ctx);
		// updateFps();
	}
	this.reset = (width, height) => {
		const len = 2000;
		this.data = [];
		for (let i = 0; i < len; i++) {
			const mid = 0.5;
			const pow = 1;
			const max = 1 + Math.pow(mid, pow);
			const minus1 = Math.pow(getRandomFloat(mid, 1), pow);
			const minus2 = Math.pow(getRandomFloat(0, mid), pow);

			const obj = {
				"d": (max - minus1 - minus2) * width,  // distance
				"r": getRandomFloat(0, Math.PI * 2), // radian
				"fakeX": width/2,
				"fakeY": height/2,
				"x": width/2,
				"y": height/2,
				"vx": [],
				"vy": []
			};
			obj.x+= obj.d * Math.cos(obj.r);
			obj.y+= obj.d * Math.sin(obj.r);
			// 減去下面兩行會有很酷的效果
			obj.fakeX = obj.x;
			obj.fakeY = obj.y;
			this.data.push(obj);
		}

		function getRandomFloat(min, max) {
			return Math.random() * (max*100 - min*100 + 1)/100 + min;
		}
	}

	this.motion = (width, height) => {
		const list = this.data;
		// 沿著中心點旋轉
		for (let i = 0; i < list.length; i++) {
			const point = list[i];
			const rad = this.transitionRadian;
			const p1 = Math.cos(rad)*Math.sin(rad);
			const p2 = Math.sin(rad);
			const p3 = Math.sin(rad*2);
			const d = this.transform ? (point.d / 2) : (point.d / 3 * (0.05 + 0.95 * (1 - p3)));
			const w1 = d * p1 * 0.1;
			const w2 = d * p2 * 0.1;
			point.r+= Math.PI / 1000;
			point.x-= point.fakeX;
			point.y-= point.fakeY;
			point.fakeX = width/2 + d * Math.cos(point.r + w2);//w1);
			point.fakeY = height/2 + d * Math.sin(point.r + w2);
			point.x+= point.fakeX;
			point.y+= point.fakeY;
		}

		// 物理引擎
		for (let i = 0; i < list.length; i++) {
			const p1 = list[i];
			let vx1 = 0;
			let vx2 = 0;
			let vy1 = 0;
			let vy2 = 0;
			for (let j = i + 1; j < list.length; j++) {
				const p2 = list[j];
				const d = getDistance(p1.x, p1.y, p2.x, p2.y);
				const MAXD = 0;
				if(d < MAXD){
					let force;
					if((d) < MAXD * 0.1) force = -1;
					if((d) < MAXD * 0.55) force = 1 * ((d)- MAXD * 0.1) / (MAXD * 0.45);
					if((d) < MAXD) force = 1 * (MAXD - (d)) / (MAXD * 0.45);

					vx1+= (p2.x > p1.x) ? 1 : -1 * force;
					vx2+= (p1.x > p2.x) ? 1 : -1 * force;
					vy1+= (p2.y > p1.y) ? 1 : -1 * force;
					vy2+= (p1.y > p2.y) ? 1 : -1 * force;
				}
			}
			p1.x+= caluVelocity(p1.vx);
			p1.y+= caluVelocity(p1.vy);
			const GRAVITY = 100;
			vx1+= (width*0.5 + GRAVITY/2 > p1.x) ? 1 : -1 * GRAVITY;
			vx1-= (width*0.5 - GRAVITY/2 < p1.x) ? 1 : -1 * GRAVITY;
			vy1+= (height/2 + GRAVITY/2 > p1.y) ? 1 : -1 * GRAVITY;
			vy1-= (height/2 - GRAVITY/2 < p1.y) ? 1 : -1 * GRAVITY;
			addVelocity(p1.vx, vx1);
			addVelocity(p1.vy, vy1);
		}
		function getDistance(x1, y1, x2, y2){
			const distance = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
			return distance;
		}
		function addVelocity(a, v){
			a.splice(1, 0, v);
			a.splice(60, 1);
		}
		function caluVelocity(a){
			let sum = 0;
			a.forEach(value => {sum+= value/a.length /20;})
			return sum
		}
	}
	// Lotka Volterra紋理
	this.addTexture = (width, height, ctx) => {
		const list = this.data;
		for (let i = 0; i < list.length; i++) {
			const point = list[i];
			const x = point.x;
			const y = point.y;
			const ex = x / width;
			const ey = y / height;
			const dx = this.equation1(ex, ey) * width;
			const dy = this.equation2(ex, ey) * height;
			
			const blue = y/width * 255;
			const green = x/width * 255;
			const red = Math.sin(this.transitionRadian) * 255;
			const color = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
			
			const mypoint = {
				"name": "point",
				"ctx": ctx,
				"size": 2,
				"x": x,
				"y": y,
				"color": color
			}
			painter.works.push(mypoint);
			const myline = {
				"name": "line",
				"ctx": ctx,
				"size": 2,
				"x": x,
				"y": y,
				"x2": x + this.dlength * dx,
				"y2": y + this.dlength * dy,
				"color": color
			}
			painter.works.push(myline);
		}
	}
	
	this.equation1 = (x, y) => {
		// if(mouseOn){
		// 	const ratio = (myMouse.pointY > 0.2) ? myMouse.pointY : 0.2;
		// 	return alpha * x - (1 / ratio * alpha * x * y);
		// }
		return this.alpha * x - (this.beta * x * y);
	}
	this.equation2 = (x, y) => {
		// if(mouseOn){
		// 	const ratio = (myMouse.pointX > 0.2) ? myMouse.pointX : 0.2;
		// 	return (1 / ratio * gamma * x * y) -  gamma * y;
		// }
		return (this.delta * x * y) -  this.gamma * y;
	}
	return this;
		// UI子系統
		// {
		// 	document.getElementById("mouseOn").addEventListener("click", function(){
		// 		if(this.innerText == "跟隨滑鼠"){
		// 			mouseOn = true;
		// 			this.innerText = "取消跟隨";
		// 		}
		// 		else{
		// 			mouseOn = false;
		// 			this.innerText = "跟隨滑鼠";
		// 		}
		// 	}, false);
			
		// 	document.getElementById("transform").addEventListener("click", function(){
		// 		if(this.innerText == "取消縮放"){
		// 			transform = false;
		// 			this.innerText = "加入縮放";
		// 		}
		// 		else{
		// 			transform = true;
		// 			this.innerText = "取消縮放";
		// 		}
		// 	}, false);

		// 	getValue();
		// 	function getValue(){
		// 		alpha = document.getElementById("alpha-equation").value*0.1;
		// 		beta = document.getElementById("beta-equation").value*0.1;
		// 		gamma = document.getElementById("gamma-equation").value*0.1;
		// 		delta = document.getElementById("delta-equation").value*0.1;
				
		// 		dlength = parseFloat(document.getElementById("dlength").value)*0.01;
		// 		speed = parseInt(document.getElementById("speed").value);
		// 	}
		// 	document.getElementsByClassName("gamemenu")[0].addEventListener("click", getValue, false);
		// }

		// fps子系統
		// function updateFps(){
		// 	let duration = (Date.now() - timeBefore); // 秒數
		// 	timeBefore = Date.now();
		// 	DELAY.push(duration);
		// 	DELAY.splice(0, 1);
		// 	let sum = 0;
		// 	let fps;
		// 	for(let N = 0; N < DELAY.length; N++){
		// 		sum = sum + DELAY[N];
		// 	}
		// 	fps = Math.round(1000 / (sum / DELAY.length));

		// 	let angle = Math.PI * (Date.now() % 3000) / 1500;
		// 	let size = (height + width) * 0.003;
		// 	let x = width * 0.5// - size * 20;
		// 	let y = height - size * 20 //* 0.9;
		// 	let blue = y/width * 255;
		// 	let green = x/width * 255;
		// 	let red = Math.sin(transitionRadian) * 255;
		// 	let transitionColor = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
		// 	let backgroundColor = "rgb(" + Math.abs(red*0.3).toString() + "," + Math.abs(green*0.2).toString() + "," + Math.abs(blue*0.4).toString() + ")";

		// 	let circle = {
		// 		"name": "circle",
		// 		"ctx": this.ctx,
		// 		"r": size * 10,
		// 		"x": x,
		// 		"y": y,
		// 		"color": backgroundColor
		// 	}
		// 	let crescent1 = {
		// 		"name": "crescent",
		// 		"ctx": this.ctx,
		// 		"size": size,
		// 		"a": 1,
		// 		"b": 9,
		// 		"angle": angle * 3,
		// 		"x": x,
		// 		"y": y,
		// 		"color": transitionColor
		// 	}
		// 	let crescent2 = {
		// 		"name": "crescent",
		// 		"ctx": this.ctx,
		// 		"size": size,
		// 		"a": 1,
		// 		"b": 8,
		// 		"angle": angle * 2,
		// 		"x": x,
		// 		"y": y,
		// 		"color": transitionColor
		// 	}
		// 	let crescent3 = {
		// 		"name": "crescent",
		// 		"ctx": this.ctx,
		// 		"size": size,
		// 		"a": 1,
		// 		"b": 7,
		// 		"angle": angle * 1,
		// 		"x": x,
		// 		"y": y,
		// 		"color": transitionColor
		// 	}
		// 	let text1 = {
		// 		"name": "text",
		// 		"ctx": this.ctx,
		// 		"text": "fps",
		// 		"size": size * 4,
		// 		"x": x,
		// 		"y": y - size * 3,
		// 		"color": transitionColor
		// 	}
		// 	let text2 = {
		// 		"name": "text",
		// 		"ctx": this.ctx,
		// 		"text": fps,
		// 		"size": size * 4,
		// 		"x": x,
		// 		"y": y + size * 3,
		// 		"color": transitionColor
		// 	}
		// 	let text3 = {
		// 		"name": "text",
		// 		"ctx": this.ctx,
		// 		"text": "Res: " + Math.round(width) + " x " + Math.round(height),
		// 		"size": size * 4,
		// 		"x": x,
		// 		"y": y + size * 13,
		// 		"color": transitionColor
		// 	}
		// 	painter.works.push(circle, crescent1, crescent2, crescent3, text1, text2, text3);
		// }
}

// 粒子系統函式管理員
const createLokaVolterra = function(){
	const myWorker = new MyWorker();
	const algorithm = new lokaVolterraAlgorithm();
	const temp = {};
	this.setCanvas = (canvas, bitmap) => {
		algorithm.reset(canvas.width, canvas.height);
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.bitmap = bitmap;
		const bitmapCtx = this.bitmap.getContext("bitmaprenderer");
		this.bitmap.width = this.bitmap.offsetWidth;
		this.bitmap.height = this.bitmap.offsetHeight;

		// worker介面
		myWorker.addEventListener("message", function handleMessageFromWorker(msg) {
			switch(msg.data.name){
				case "drawImage":
					bitmapCtx.transferFromImageBitmap(msg.data.bitmap);
				break;
				case "error":
					// console.log(msg.data);
				break;
				default:
				console.log("invalid message received!");
			}
		});
		myWorker.postMessage({
			"name": "createOffscreenCanvas",
			"w": bitmap.width,
			"h": bitmap.height
		});
		window.addEventListener("resize", function(){
			myWorker.postMessage({
				"name": "setOffscreen",
				"w": bitmap.width,
				"h": bitmap.height
			});
		}, false);
	}
	this.pauseWorker = (isPause) => {
		myWorker.postMessage({"name": isPause ? "requestAnimation" : "cancelAnimation"});
	}
	this.render = function renderS1(){
		algorithm.render(this.ctx);
	}.bind(this)
	this.updateS1 = function updateS1(){
		algorithm.update(this.ctx, this.canvas.width, this.canvas.height);
	}.bind(this)
	// 用了bind之後 function.name 會變成 bound renderS1，要特別注意
	return this;
}
	
const lokaVolterra = new createLokaVolterra();
export default lokaVolterra;