// 畫筆建構式-管理繪圖方法
export default function createPainter(){
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