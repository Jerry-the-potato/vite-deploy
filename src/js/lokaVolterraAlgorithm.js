import createPainter from "./createPainter";

function clearBoard(ctx) {
	// let color = "rgba(0,0,0, " + document.getElementById("speed").value * 0.025 + ")";
	ctx.fillStyle = 'black';
	// this.ctx.fillStyle = color;
	// ctx.strokestyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// this.ctx.strokeRect(0, 0, width, height);
}

// 粒子引力和動畫演算法
export default function lokaVolterraAlgorithm(){
	const painter = new createPainter();
	
	this.transitionRadian = 0;
	this.trasitionOmega = Math.PI / 10000;

	this.alpha = 5;
	this.beta = 10;
	this.gamma = 5;
	this.delta = 10;
	this.dlength = 0.01;

	this.speed = 1;
    this.mouse = {};
    this.useMouse = false;
	this.isTransform = true;

    this.updateData = (data) => {
        this.useMouse = data.useMouse;
        this.isTransform = data.isTransform;
        this.alpha = data.alpha;
        this.beta = data.beta;
        this.gamma = data.gamma;
        this.delta = data.delta;
        this.dlength = data.dlength * 0.001;
        this.speed = data.speed;
    }

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
			const d = this.isTransform ? (point.d / 2) : (point.d / 3 * (0.05 + 0.95 * (1 - p3)));
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
		if(this.useMouse){
			const ratio = (this.mouse.pointY > 0.2) ? this.mouse.pointY : 0.2;
			return this.alpha * x - (1 / ratio * this.alpha * x * y);
		}
		return this.alpha * x - (this.beta * x * y);
	}
	this.equation2 = (x, y) => {
		if(this.useMouse){
			const ratio = (this.mouse.pointX > 0.2) ? this.mouse.pointX : 0.2;
			return (1 / ratio * this.gamma * x * y) -  this.gamma * y;
		}
		return (this.delta * x * y) -  this.gamma * y;
	}
	return this;

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