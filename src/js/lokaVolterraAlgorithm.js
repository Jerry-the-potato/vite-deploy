import createPainter from "./createPainter";
import myMouse from "./myMouse";
function clear(ctx) {
	ctx.canvas.width*= 1;
}

// 粒子引力和動畫演算法
export default function lokaVolterraAlgorithm(){
	const painter = new createPainter();
	
	this.alpha = 5;
	this.beta = 10;
	this.gamma = 5;
	this.delta = 10;
	this.dlength = 0.01;

	this.speed = 10;
    this.useMouse = false;
	this.isTransform = false;
	this.isGravity = true;

	this.motionType = "default";

    this.updateData = (data) => {
        this.useMouse = data.useMouse;
        this.isTransform = data.isTransform;
        this.isGravity = data.isGravity;
        this.alpha = data.alpha;
        this.beta = data.beta;
        this.gamma = data.gamma;
        this.delta = data.delta;
        this.dlength = data.dlength * 0.001;
        this.speed = data.speed;
    }
	this.reset = (width, height) => {
		this.transitionRadian = 0;
		this.trasitionOmega = Math.PI / 10000;

		const len = 2000;
		this.data = [];
		for (let i = 0; i < len; i++) {
			const point = {
				"d": Math.sqrt(Math.random()) * width / 2, // distance
				"r": Math.random() * 2 * Math.PI, // radian
				"vx": new Array(60).fill(0),
				"vy": new Array(60).fill(0)
			};
			point.x = width / 2 + point.d * Math.cos(point.r);
			point.y = height / 2 + point.d * Math.sin(point.r);
			point.fakeX = point.x;
			point.fakeY = point.y;
			// 使用下面兩行會有很酷的效果
			// point.fakeX = width / 2;
			// point.fakeY = height / 2;
			this.data.push(point);
		}
	}
	this.render = (ctx, offset) => {
		clear(ctx);
		ctx.save();
		ctx.translate(ctx.canvas.width * offset, 0);
		painter.render();
		ctx.restore();
	}
	this.update = (ctx, width, height) => {
		this.transitionRadian += this.trasitionOmega * this.speed;
		this.motion(width, height);
		this.addTexture(width, height, ctx);
		this.updateFps(width, height, ctx);
	}

	this.motion = (width, height) => {
		// 沿著中心點旋轉
		this.data.forEach((point) => {
			const rad = this.transitionRadian;
			const period1 = Math.cos(rad) * Math.sin(rad);
			const period2 = Math.sin(rad);
			const period3 = Math.sin(rad*2);

			const scaleFactor = this.isTransform ? 0.1 + 1.4 * (1 - period3) : 1; 
    		const d = point.d / 3 * scaleFactor;

			const angular1 = d * period1 * 0.1;
			const angular2 = d * period2 * 0.1;

			point.r+= Math.PI / 100;
			
			let newX;
			let newY;
			switch(this.motionType){
				case "plate":
					newX = width / 2 + d * Math.cos(point.r + period1);
        			newY = height / 2 + d * Math.sin(point.r + period2);
				break;
				case "hourglass":
					newX = width / 2 + d * Math.cos(point.r + period1) * Math.sin(point.r + period1);
        			newY = height / 2 + d * Math.sin(point.r + period1);
				break;
				case "cookie":
					newX = width / 2 + d * Math.cos(point.r + period1) * Math.sin(point.r + period1);
        			newY = height / 2 + d * Math.sin(point.r + period2);
				break;
				case "taro":
				default:
					newX = width / 2 + d * Math.cos(point.r + angular1);
					newY = height / 2 + d * Math.sin(point.r + angular2);
				break;
			}
			
			point.x += newX - point.fakeX;
			point.y += newY - point.fakeY;
			
			point.fakeX = newX;
			point.fakeY = newY;
		})
		
		// 物理引擎
		if(!this.isGravity) return;

		for (let i = 0; i < this.data.length; i++) {
			const p1 = this.data[i];
			let vx = 0, vy = 0;
			for (let j = i + 1; j < this.data.length; j++) {
				break;
				const p2 = this.data[j];
				const d = getDistance(p1.x, p1.y, p2.x, p2.y);
				const MAXD = 0;
				if(d < MAXD){
					let force;
					if((d) < MAXD * 0.1) force = -1;
					if((d) < MAXD * 0.55) force = 1 * ((d)- MAXD * 0.1) / (MAXD * 0.45);
					if((d) < MAXD) force = 1 * (MAXD - (d)) / (MAXD * 0.45);
					const directionX = (p2.x > p1.x) ? 1 : -1;
					const directionY = (p2.y > p1.y) ? 1 : -1;
					vx+= directionX * force;
					p2.vx[0]-= directionX * force;
					vy+= directionY * force;
					p2.vy[0]-= directionY * force;
				}
			}
			p1.x+= caluVelocity(p1.vx);
			p1.y+= caluVelocity(p1.vy);

			const GRAVITY = 10;
			const GAP = 50;
			vx+= (width * 0.5 + GAP > p1.x) ? 1 : -1 * GRAVITY;
			vx-= (width * 0.5 - GAP < p1.x) ? 1 : -1 * GRAVITY;
			vy+= (height * 0.5 + GAP > p1.y) ? 1 : -1 * GRAVITY;
			vy-= (height * 0.5 - GAP < p1.y) ? 1 : -1 * GRAVITY;
			
			addVelocity(p1.vx, vx);
			addVelocity(p1.vy, vy);
		}
		function getDistance(x1, y1, x2, y2){
			const distance = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
			return distance;
		}
		function addVelocity(arr, v){
			arr.unshift(v); // 在開頭插入 v
			arr.pop();   // 刪除尾端元素
		}
		function caluVelocity(arr) {
			const avg = arr.reduce((sum, value) => sum + value, 0) / arr.length;
			return avg;
		}
	}
	// Lotka Volterra紋理
	this.addTexture = (width, height, ctx) => {
		this.data.forEach((point) => {
			const x = point.x;
			const y = point.y;
			const ex = x / width;
			const ey = y / height;
			const dx = this.equation1(ex, ey, height) * width;
			const dy = this.equation2(ex, ey, width) * height;
			
			const x2 = x + this.dlength * dx;
			const y2 = y + this.dlength * dy;
			
			const blue = Math.abs( y / width * 255 );
			const green = Math.abs( x / width * 255 );
			const red = Math.abs( Math.sin(this.transitionRadian) * 255 );
			const color = `rgb(${red}, ${green}, ${blue})`;
			
			const mypoint = { name: "point", size: 2, ctx, x, y, color };
			const myline = { name: "line", size: 2, ctx, x, y, color, x2, y2 };
			painter.addTask(0, myline, mypoint);
		});
	}
	
	this.equation1 = (x, y, height) => {
		if(this.useMouse){
			const ratio = (myMouse.pointY / height > 0.2) ? myMouse.pointY / height : 0.2;
			// console.log(ratio);
			return this.alpha * x - (1 / ratio * this.alpha * x * y);
		}
		return this.alpha * x - this.beta * x * y;
	}
	this.equation2 = (x, y, width) => {
		if(this.useMouse){
			const ratio = (myMouse.pointX / width > 0.2) ? myMouse.pointX / width : 0.2;
			return (1 / ratio * this.gamma * x * y) -  this.gamma * y;
		}
		return this.delta * x * y -  this.gamma * y;
	}

	this.timeBefore = Date.now();
	const delay = new Array(100);
	delay.fill(16);
	// fps子系統
	this.updateFps = (width, height, ctx) => {
		const duration = (Date.now() - this.timeBefore); // 秒數
		this.timeBefore = Date.now();
		delay.push(duration);
		const throwAway = delay.shift();
		const sum = delay.reduce((total, current) => {
			return total + current;
		}, 0)
		const fps = Math.round(1000 / (sum / delay.length));

		const angle = Math.PI * (Date.now() % 3000) / 1500;
		const size = (height + width) * 0.003;
		const x = width * 0.5// - size * 20;
		const y = height - size * 20 //* 0.9;
		const blue = y/width * 255;
		const green = x/width * 255;
		const red = Math.sin(this.transitionRadian) * 255;
		const transitionColor = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
		const backgroundColor = "rgb(" + Math.abs(red*0.3).toString() + "," + Math.abs(green*0.2).toString() + "," + Math.abs(blue*0.4).toString() + ")";

		const circle = {
			"name": "circle",
			"ctx": ctx,
			"r": size * 10,
			"x": x,
			"y": y,
			"color": backgroundColor
		}
		const crescent1 = {
			"name": "crescent",
			"ctx": ctx,
			"size": size,
			"a": 1,
			"b": 9,
			"angle": angle * 3,
			"x": x,
			"y": y,
			"color": transitionColor
		}
		const crescent2 = {
			"name": "crescent",
			"ctx": ctx,
			"size": size,
			"a": 1,
			"b": 8,
			"angle": angle * 2,
			"x": x,
			"y": y,
			"color": transitionColor
		}
		const crescent3 = {
			"name": "crescent",
			"ctx": ctx,
			"size": size,
			"a": 1,
			"b": 7,
			"angle": angle * 1,
			"x": x,
			"y": y,
			"color": transitionColor
		}
		const text1 = {
			"name": "text",
			"ctx": ctx,
			"text": "fps",
			"size": size * 4,
			"x": x,
			"y": y - size * 3,
			"color": transitionColor
		}
		const text2 = {
			"name": "text",
			"ctx": ctx,
			"text": fps,
			"size": size * 4,
			"x": x,
			"y": y + size * 3,
			"color": transitionColor
		}
		const text3 = {
			"name": "text",
			"ctx": ctx,
			"text": "Res: " + Math.round(width) + " x " + Math.round(height),
			"size": size * 4,
			"x": x,
			"y": y + size * 13,
			"color": transitionColor
		}
		painter.addTask(1, circle, crescent1, crescent2, crescent3, text1, text2, text3);
	}
	return this;
}