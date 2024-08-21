import MyWorker from "./worker?worker"

window.addEventListener("load", function () {
	const board_border = "black";
	const board_background = "black";
	const board = document.getElementById("canvasS1");
	const board_ctx = board.getContext("2d");
	const bitmapBoard = document.getElementById("bitmap");
	const bitmapBoard_ctx = bitmapBoard.getContext("bitmaprenderer");
	bitmapBoard.width = bitmapBoard.offsetWidth;
	bitmapBoard.height = bitmapBoard.offsetHeight;

	// worker介面
	const myWorker = new MyWorker();
	myWorker.addEventListener("message", function handleMessageFromWorker(msg) {
		switch(msg.data.name){
			case "drawImage":
				let bitmap = msg.data.bitmap;
				bitmapBoard_ctx.transferFromImageBitmap(msg.data.bitmap);
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
		"w": bitmapBoard.width,
		"h": bitmapBoard.height
	});

	// HTML介面
	window.addEventListener("resize", function(){
		myWorker.postMessage({
			"name": "setOffscreen",
			"w": bitmapBoard.width,
			"h": bitmapBoard.height
		});
	}, false);
	document.getElementById("pauseWorker").addEventListener("click", function(){
		if(this.innerText == "停止(右)"){
			myWorker.postMessage({"name": "cancelAnimation"});
			this.innerText = "開始(右)";
		}
		else{
			myWorker.postMessage({"name": "requestAnimation"});
			this.innerText = "停止(右)";
		}
	}, false);
	document.getElementById("pauseMain").addEventListener("click", function(){
		manager.cancelAnimationByName("renderS1");
		manager.cancelAnimationByName("updateS1");

		if(this.innerText == "停止(左)"){
			this.innerText = "開始(左)";
			return;
		}

		manager.requestAnimationByName("renderS1");
		manager.requestAnimationByName("updateS1");
		this.innerText = "停止(左)";
	}, false);

	const slide = document.getElementsByClassName("slideMenu")[0];
	const menu = document.getElementsByClassName("gamemenu")[0];
	slide.addEventListener("click", function(){
		const rectMenu = menu.getBoundingClientRect();
		const rectButton = slide.getBoundingClientRect();
		const height = rectButton.y - rectMenu.y;
		if(slide.innerText == "△"){
			menu.style.top = "-" + height + "px";
			slide.innerText = "▽";
		}
		else{
			menu.style.top = "1%";
			slide.innerText = "△";
		}
	}, false);

	const slide2 = document.getElementsByClassName("slideMenu")[1];
	const menu2 = document.getElementsByClassName("gamemenu")[1];
	slide2.addEventListener("click", function(){
		const rectMenu = menu2.getBoundingClientRect();
		const rectButton = slide2.getBoundingClientRect();
		const height = rectButton.y - rectMenu.y;
		if(slide2.innerText == "△"){
			menu2.style.top = "-" + height + "px";
			slide2.innerText = "▽";
		}
		else{
			menu2.style.top = "1%";
			slide2.innerText = "△";
		}
	}, false);


	// 繪圖系統-管理及方法
	let painter = new createPainter();
	function createPainter(){
		this.works = [];
		this.tree = [];
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
	let backup;
	// 繪圖系統-main
	{
		manager.addAnimationByName(function renderS1(){
			clearBoard();
			painter.tree.forEach(obj => {painter.draw(obj);});
			board_ctx.save();
			board_ctx.translate(-board.width * 0.25, 0);
			// backup = painter.works;
			painter.works.forEach(obj => {painter.draw(obj);});
			painter.works = [];
			board_ctx.restore();
		})

		function clearBoard() {
			// let color = "rgba(0,0,0, " + document.getElementById("speed").value * 0.025 + ")";
			board_ctx.fillStyle = board_background;
			// board_ctx.fillStyle = color;
			board_ctx.strokestyle = board_border;
			board_ctx.fillRect(0, 0, board.width, board.height);
			// board_ctx.strokeRect(0, 0, board.width, board.height);
		}
	}

	// section1 粒子系統
	{
		let transitionRadian = 0;
		let trasitionOmega = Math.PI / 10000;
		let data = [];
		let alpha = 0;
		let beta = 0;
		let gamma = 0;
		let delta = 0;
		let dlength = 0;
		let speed = 0;
		let mouseOn = false;
		let transform = true;


		let timeBefore = Date.now();
		const DELAY = new Array(100);
		DELAY.fill(17);

		// simulatior();
		function simulatior(){
			motion(data);
			addTexture(data);
			updateFps();
			// request.updateS1.ID = requestAnimationFrame(simulatior);
			const newID = requestAnimationFrame(simulatior);
			manager.setID("updateS1", newID);
		}
		manager.setMethod("updateS1", simulatior);
		// request.updateS1.method = simulatior;

		// UI子系統
		{
			document.getElementById("mouseOn").addEventListener("click", function(){
				if(this.innerText == "跟隨滑鼠"){
					mouseOn = true;
					this.innerText = "取消跟隨";
				}
				else{
					mouseOn = false;
					this.innerText = "跟隨滑鼠";
				}
			}, false);
			
			document.getElementById("transform").addEventListener("click", function(){
				if(this.innerText == "取消縮放"){
					transform = false;
					this.innerText = "加入縮放";
				}
				else{
					transform = true;
					this.innerText = "取消縮放";
				}
			}, false);

			getValue();
			function getValue(){
				alpha = document.getElementById("alpha-equation").value*0.1;
				beta = document.getElementById("beta-equation").value*0.1;
				gamma = document.getElementById("gamma-equation").value*0.1;
				delta = document.getElementById("delta-equation").value*0.1;
				
				dlength = parseFloat(document.getElementById("dlength").value)*0.01;
				speed = parseInt(document.getElementById("speed").value);
			}
			document.getElementsByClassName("gamemenu")[0].addEventListener("click", getValue, false);
		}

		{
			data = [];
			populate(data, 2000);
			function populate(data, n) {
				for (let i = 0; i < n; i++) {
					let mid = 0.5;
					let pow = 1;
					let max = 1 + Math.pow(mid, pow);
					let minus1 = Math.pow(getRandomFloat(mid, 1), pow);
					let minus2 = Math.pow(getRandomFloat(0, mid), pow);

					let obj = {
						"d": (max - minus1 - minus2) * board.width,  // distance
						"r": getRandomFloat(0, Math.PI * 2), // radian
						"fakeX": board.width/2,
						"fakeY": board.height/2,
						"x": board.width/2,
						"y": board.height/2,
						"vx": [],
						"vy": []
					};
					obj.x+= obj.d * Math.cos(obj.r);
					obj.y+= obj.d * Math.sin(obj.r);
					// 減去下面兩行會有很酷的效果
					obj.fakeX = obj.x;
					obj.fakeY = obj.y;
					data.push(obj);
				}

				function getRandomFloat(min, max) {
					return Math.random() * (max*100 - min*100 + 1)/100 + min;
				}
			}
		}

		function motion(list){
			// 沿著中心點旋轉
			for (let i = 0; i < list.length; i++) {
				let point = list[i];
				const rad = transitionRadian;
				const p1 = Math.cos(rad)*Math.sin(rad);
				const p2 = Math.sin(rad);
				const p3 = Math.sin(rad*2);
				let d = point.d / 2;
				if(transform) d = point.d / 3 * (0.05 + 0.95 * (1 - p3));
				let w1 = d * p1 * 0.1;
				let w2 = d * p2 * 0.1;
				point.r+= Math.PI / 1000;
				point.x-= point.fakeX;
				point.y-= point.fakeY;
				point.fakeX = board.width/2 + d * Math.cos(point.r + w2);//w1);
				point.fakeY = board.height/2 + d * Math.sin(point.r + w2);
				point.x+= point.fakeX;
				point.y+= point.fakeY;
			}

			// 物理引擎
			for (let i = 0; i < list.length; i++) {
				let p1 = list[i];
				let vx1 = 0;
				let vx2 = 0;
				let vy1 = 0;
				let vy2 = 0;
				for (let j = i + 1; j < list.length; j++) {
					let p2 = list[j];
					let d = getDistance(p1.x, p1.y, p2.x, p2.y);
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
				vx1+= (board.width*0.5 + GRAVITY/2 > p1.x) ? 1 : -1 * GRAVITY;
				vx1-= (board.width*0.5 - GRAVITY/2 < p1.x) ? 1 : -1 * GRAVITY;
				vy1+= (board.height/2 + GRAVITY/2 > p1.y) ? 1 : -1 * GRAVITY;
				vy1-= (board.height/2 - GRAVITY/2 < p1.y) ? 1 : -1 * GRAVITY;
				addVelocity(p1.vx, vx1);
				addVelocity(p1.vy, vy1);

			}
			function getDistance(x1, y1, x2, y2){
				let d = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
				return d;
			}
			// function getForce(n1, n2){
			// 	let one = (n2 > n1) ? 1 : -1;
			// 	let force;
			// 	if((n2 - n1) * one < 10) force = -one;
			// 	if((n2 - n1) * one < 30) force = one * ((n2 - n1) * one - 10) / 20;
			// 	if((n2 - n1) * one < 50) force = one * (50 - (n2 - n1) * one) / 20;
			// 	return force;
			// }
			function getForce(d){
				return force;
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

		// Lotka Volterra紋理子系統
		function addTexture(list) {
			for (let i = 0; i < list.length; i++) {
				let point = list[i];
				let x = point.x;
				let y = point.y;
				let ex = x / board.width;
				let ey = y / board.height;
				let dx = equation1(ex, ey) * board.width;
				let dy = equation2(ex, ey) * board.height;
				
				let blue = y/board.width * 255;
				let green = x/board.width * 255;
				let red = Math.sin(transitionRadian) * 255;
				let color = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
				
				let mypoint = {
					"name": "point",
					"ctx": board_ctx,
					"size": 2,
					"x": x,
					"y": y,
					"color": color
				}
				painter.works.push(mypoint);
				let myline = {
					"name": "line",
					"ctx": board_ctx,
					"size": 2,
					"x": x,
					"y": y,
					"x2": x + dlength * dx,
					"y2": y + dlength * dy,
					"color": color
				}
				painter.works.push(myline);
			}
			transitionRadian += trasitionOmega * speed;

			function equation1(x, y) {
				if(mouseOn){
					let ratio = (myMouse.pointY > 0.2) ? myMouse.pointY : 0.2;
					return alpha * x - (1 / ratio * alpha * x * y);
				}
				else return alpha * x - (beta * x * y);
			}

			function equation2(x, y) {
				if(mouseOn){
					let ratio = (myMouse.pointX > 0.2) ? myMouse.pointX : 0.2;
					return (1 / ratio * gamma * x * y) -  gamma * y;
				}
				else return (delta * x * y) -  gamma * y;
			}
		}

		// fps子系統
		function updateFps(){
			let duration = (Date.now() - timeBefore); // 秒數
			timeBefore = Date.now();
			DELAY.push(duration);
			DELAY.splice(0, 1);
			let sum = 0;
			let fps;
			for(let N = 0; N < DELAY.length; N++){
				sum = sum + DELAY[N];
			}
			fps = Math.round(1000 / (sum / DELAY.length));

			let angle = Math.PI * (Date.now() % 3000) / 1500;
			let size = (board.height + board.width) * 0.003;
			let x = board.width * 0.5// - size * 20;
			let y = board.height - size * 20 //* 0.9;
			let blue = y/board.width * 255;
			let green = x/board.width * 255;
			let red = Math.sin(transitionRadian) * 255;
			let transitionColor = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
			let backgroundColor = "rgb(" + Math.abs(red*0.3).toString() + "," + Math.abs(green*0.2).toString() + "," + Math.abs(blue*0.4).toString() + ")";

			let circle = {
				"name": "circle",
				"ctx": board_ctx,
				"r": size * 10,
				"x": x,
				"y": y,
				"color": backgroundColor
			}
			let crescent1 = {
				"name": "crescent",
				"ctx": board_ctx,
				"size": size,
				"a": 1,
				"b": 9,
				"angle": angle * 3,
				"x": x,
				"y": y,
				"color": transitionColor
			}
			let crescent2 = {
				"name": "crescent",
				"ctx": board_ctx,
				"size": size,
				"a": 1,
				"b": 8,
				"angle": angle * 2,
				"x": x,
				"y": y,
				"color": transitionColor
			}
			let crescent3 = {
				"name": "crescent",
				"ctx": board_ctx,
				"size": size,
				"a": 1,
				"b": 7,
				"angle": angle * 1,
				"x": x,
				"y": y,
				"color": transitionColor
			}
			let text1 = {
				"name": "text",
				"ctx": board_ctx,
				"text": "fps",
				"size": size * 4,
				"x": x,
				"y": y - size * 3,
				"color": transitionColor
			}
			let text2 = {
				"name": "text",
				"ctx": board_ctx,
				"text": fps,
				"size": size * 4,
				"x": x,
				"y": y + size * 3,
				"color": transitionColor
			}
			let text3 = {
				"name": "text",
				"ctx": board_ctx,
				"text": "Res: " + Math.round(board.width) + " x " + Math.round(board.height),
				"size": size * 4,
				"x": x,
				"y": y + size * 13,
				"color": transitionColor
			}
			painter.works.push(circle, crescent1, crescent2, crescent3, text1, text2, text3);
		}
	}
})