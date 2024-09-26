// 畫筆建構式-管理繪圖方法
export default function createPainter(){
	this.renderTask = {};
	this.addTask = (priority = 0, ...tasks) => {
		this.renderTask[priority] = this.renderTask[priority] || [];
		this.renderTask[priority].push(...tasks);
	}
	this.render = () => {
		// 取得所有 priority 並排序
		Object.keys(this.renderTask)
			.sort((a, b) => a - b)
			.forEach(priority => {
				// 取出對應 priority 下的所有任務並渲染
				this.renderTask[priority].forEach(task => {
					this.drawTask(task);
				});
			});
		// 刪除任務
		this.renderTask = {};
	}
	this.drawTask = (task) => {
		if(!task.ctx) return;
		
		// 繪圖上下文
		const { ctx } = task;

		// 座標類別
		const { x, y, x2, y2 } = task;

		// 形狀類別
		const { r, a, b, angle } = task;

		// 文本類別
		const { text, size } = task;

		// 顏色類別
		const { color } = task;
			
		switch(task.name){
			case "circle": drawCircle(); break;
			case "point": drawPoint(); break;
			case "line": drawLine(); break;
			case "crescent": drawCrescent(); break;
			case "text": drawText(); break;
			default: console.warn(`未定義的繪圖形狀: ${task.name}`);
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
			const c = Math.sqrt(a * a + b * b);
			const aTan = Math.atan(a / b);
			const dx = Math.cos(angle + Math.PI / 2) * a * size;
			const dy = Math.sin(angle + Math.PI / 2) * a * size;
			ctx.beginPath();
			ctx.arc(x, y, b * size, angle, Math.PI + angle, true);
			ctx.arc(x + dx, y + dy, c * size, Math.PI + angle + aTan, angle - aTan, false); // 順時針 縮小 +-
			ctx.fillStyle = color;
			ctx.fill(); 
		}
		function drawText(){
			ctx.font = size + "px Comic Sans MS";
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.fillStyle = color;
			ctx.fillText(text, Math.round(x), Math.round(y));
		}
	}
}