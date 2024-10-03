import {Path} from './path.js';
import { SortAlgorithm, SortAlgorithmIterable } from './sortAlgorithm.js';

export default class ParticleSystem{
    constructor(width, height){
        this.sort = new SortAlgorithmIterable();
        const x = width / 2;
        const y = height / 2;
        this.x = x;
        this.y = y;
        this.slow = 0.999;
        this.friction = 0.997;
        this.i = 0;
        this.j = 0;
        this.maxValue = 865*0.4;
        const length = Math.floor((x - 200) / 2);
        const thick = Math.max(Math.floor(x * 2 / length), 0.5);
        this.columns = new Array(length).fill().map((v,i) => {
            return this.createColumn(x - thick * length/2 + thick * i, y * 1.8, thick, ((i+1)/length) * this.maxValue);
        });
        this.secondColumns = [];
        this.walls = new Array(5).fill().map((v,i) => {
            return this.createWall("arc", x, y-x/2, 865/2/25 * (1+i*i), 3, 0 + Math.PI/16*(4-i), Math.PI/16*(12+i), Math.PI / 15 * i, 865/2/25)
        });
        // this.walls = [this.createWall("arc", x, y, 865/3)]
        const ballLen = Math.min(length * 2, 500);
        const ballSize = 1 + Math.floor(thick / 3);
        this.balls = new Array(ballLen).fill().map(() => {
            const r = Math.pow(Math.random(), 0.6) * 865/4;
            const theta = Math.random() * 2 * Math.PI;
            return this.createBall(x + r * Math.cos(theta), 0.5 * y + r * Math.sin(theta), ballSize);
        });
        this.rects = [
            {'left': 0, 'top': 0, 'right': x*2, 'bottom': 10},
            {'left': 0, 'top': y * 2 - 10, 'right': x*2, 'bottom': y * 2},
            {'left': 0, 'top': 0, 'right': 10, 'bottom': y * 2},
            {'left': x * 2 - 10, 'top': 0, 'right': x*2, 'bottom': y * 2}
        ]
        const fontpx = Math.floor(this.x / 15);
        this.texts = {'log': {'text': "Welcome to Sorting Algorithm animation", 'fontpx': fontpx, 'x': this.x, 'y': this.y * 2 - fontpx * 1},};
    }
    createColumn(x, y, width, height){
        const path = new Path(x, y);
        const column = {x, y, width, height, path};
        return column;
    }
    createWall(type = "arc", centerX, centerY, length, thick = 5, startAngle = 0, endAngle = 2 * Math.PI, period = 0, swing){
        if(!swing) swing = length/20;
        const x = centerX;
        const y = centerY;
        const wall = {type, centerX, centerY, x, y, thick, length, startAngle, endAngle, period, swing}
        return wall;
    }
    createBall(x = this.x, y = this.y, r = 3){
        const vx = Math.random()*100 - 50;
        const vy = Math.random()*100 - 50;
        const ax = 0;
        const ay = 9.8 * 10;
        const ball = {x, y, r, vx, vy, ax, ay}
        return ball;
    }
    getDist(a, b){
        const x = a.x - b.x;
        const y = a.y - b.y;
        const dist = Math.sqrt(x*x + y*y);
        return dist;
    }
    getCollide(target, wall){
        if(wall.type == "arc"){
            const x = target.x - wall.x;
            const y = target.y - wall.y;
            const dist = Math.sqrt(x*x + y*y);
            return (dist + target.r >= wall.length - wall.thick && dist < wall.length + wall.thick) ? dist : 0; 
        }
        return 0;
    }
    handleBallCollision(ball, anotherBall, dist){
        const x = (ball.x + anotherBall.x) / 2;
        const y = (ball.y + anotherBall.y) / 2;

        // 更新球的位置以避免重疊
        ball.x = x + (ball.x - x) / (dist / 2) * ball.r;
        ball.y = y + (ball.y - y) / (dist / 2) * ball.r;
        anotherBall.x = x + (anotherBall.x - x) / (dist / 2) * anotherBall.r;
        anotherBall.y = y + (anotherBall.y - y) / (dist / 2) * anotherBall.r;

        // 相對速度
        const vx = (ball.vx - anotherBall.vx) / 2;
        const vy = (ball.vy - anotherBall.vy) / 2;

        // 計算碰撞後的相對速度
        const angle = Math.atan((ball.y - y) / (ball.x - x));
        const vectorT = -vx * Math.sin(angle) + vy * Math.cos(angle);
        const vectorN = -1 * (vx * Math.cos(angle) + vy * Math.sin(angle));
        const relativeX = -vectorT * Math.sin(angle) + vectorN * Math.cos(angle);
        const relativeY = vectorT * Math.cos(angle) + vectorN * Math.sin(angle);

        // 更新球的速度
        const averageVx = (ball.vx + anotherBall.vx) / 2;
        const averageVy = (ball.vy + anotherBall.vy) / 2;
        ball.vx = (averageVx + relativeX) * this.friction;
        ball.vy = (averageVy + relativeY) * this.friction;
        anotherBall.vx = (averageVx - relativeX) * this.friction;
        anotherBall.vy = (averageVy - relativeY) * this.friction;
    }
    handleWallCollision(ball, wall, dist) {
        // 計算牆壁圓周上距離球體最近的點
        const x = wall.x + (ball.x - wall.x) / dist * wall.length;
        const y = wall.y + (ball.y - wall.y) / dist * wall.length;
    
        // 計算碰撞點的角度
        const atan = Math.atan((y - wall.y) / (x - wall.x)); // 第一第四象限
        const theta = atan > 0 ? atan : atan + Math.PI; // 第三第四象限
        const quadrant = y > wall.y ? theta : theta + Math.PI; // 一二三四象限
    
        // 判斷碰撞點是否在牆壁的弧形範圍內
        if (quadrant > wall.endAngle || quadrant < wall.startAngle) return;
    
        // 確定球體是否在牆壁內部或外部
        const isInside = dist <= wall.length ? 1 : -1;
    
        // 更新球體的位置，確保球體不會穿過牆壁
        ball.x = x + (ball.x - x) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
        ball.y = y + (ball.y - y) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
    
        // 計算反彈角度
        const angle = Math.atan((ball.y - y) / (ball.x - x));
        const vectorT = -ball.vx * Math.sin(angle) + ball.vy * Math.cos(angle);
        const vectorN = -1 * (ball.vx * Math.cos(angle) + ball.vy * Math.sin(angle));
    
        // 更新球體的速度，使其在碰撞後反彈
        ball.vx = (-vectorT * Math.sin(angle) + vectorN * Math.cos(angle)) * this.friction;
        ball.vy = (vectorT * Math.cos(angle) + vectorN * Math.sin(angle)) * this.friction;
    }
    handleColumnCollision(ball, column) {
        const columnTop = column.path.pointY - column.height;
        const columnBottom = column.path.pointY;
        const columnLeft = column.path.pointX - column.width / 2;
        const columnRight = column.path.pointX + column.width / 2;

        // 計算球體與柱子邊界的重疊量
        const overlapX = Math.min(ball.x + ball.r - columnLeft, columnRight - ball.x + ball.r);
        const overlapY = Math.min(ball.y + ball.r - columnTop, columnBottom - ball.y + ball.r);
        
        // 重疊量小於 0 表示沒有碰撞
        if(overlapX < 0 || overlapY < 0) return;

        // 確定碰撞位置並計算反彈
        if (overlapX < overlapY) {
            // 碰撞發生在左右兩側
            ball.vx = -ball.vx * this.friction;
            if (ball.x < column.path.pointX) {
                ball.x = columnLeft - ball.r;
            } else {
                ball.x = columnRight + ball.r;
            }
        } else {
            // 碰撞發生在上下兩側
            ball.vy = -ball.vy * this.friction;
            if (ball.y < column.path.pointY) {
                ball.y = columnTop - ball.r;
            } else {
                ball.y = columnBottom + ball.r;
            }
        }
    }
    handleRectCollision(ball, rect){
        if (ball.x + ball.r > rect.left && ball.x - ball.r < rect.right &&
            ball.y + ball.r > rect.top && ball.y - ball.r < rect.bottom) {
            
            // 計算球體與柱子邊界的重疊量
            const overlapX = Math.min(ball.x + ball.r - rect.left, rect.right - ball.x + ball.r);
            const overlapY = Math.min(ball.y + ball.r - rect.top, rect.bottom - ball.y + ball.r);
            
            // 確定碰撞位置並計算反彈
            if (overlapX < overlapY) {
                // 碰撞發生在左右兩側
                ball.vx = -ball.vx * this.friction;
                if (ball.x < (rect.left + rect.right) / 2) {
                    ball.x = rect.left - ball.r;
                } else {
                    ball.x = rect.right + ball.r;
                }
            } else {
                // 碰撞發生在上下兩側
                ball.vy = -ball.vy * this.friction;
                if (ball.y < (rect.top + rect.bottom) / 2) {
                    ball.y = rect.top - ball.r;
                } else {
                    ball.y = rect.bottom + ball.r;
                }
            }
        }
    }
    update(){
        this.sort.update(this.columns, this.secondColumns);
        this.texts.log.text = this.sort.log.innerText;
        this.columns.forEach((column) => {
            if(column.path != undefined){
                if(column.path.__proto__.constructor.name == "Path"){
                    // column.path.NextFrame();
                }
            }
        })
        this.sort.secondColumns.forEach((column, index) => {
            if(column.path == undefined) return;
            const funcitonName = column.path.__proto__.constructor.name;
            if(funcitonName != "Path") return console.warn("the path of columns[ " + index + " ] was never constructed by Path");
            // column.path.NextFrame();
        })

        this.walls.forEach((wall) =>{
            wall.period+= 0.25 *  2 * Math.PI / 60;
            wall.x = wall.centerX + wall.swing * Math.cos(wall.period);
            wall.y = wall.centerY + wall.swing * Math.sin(wall.period);
        });
        this.balls.forEach((ball) => {
            ball.x = (ball.x + ball.vx / 60);
            ball.y = (ball.y + ball.vy / 60);
            ball.vx = (ball.vx + ball.ax / 60) * this.slow;
            ball.vy = (ball.vy + ball.ay / 60) * this.slow;
            // 檢測與其他球體的碰撞
            this.balls.forEach((anotherBall) => {
                if (ball == anotherBall) return;
                const dist = this.getDist(ball, anotherBall);
                if (dist < ball.r + anotherBall.r) {
                    this.handleBallCollision(ball, anotherBall, dist);
                }
            });

            // 檢測與牆壁的碰撞
            this.walls.forEach((wall) => {
                const dist = this.getCollide(ball, wall);
                if (dist > 0) {
                    this.handleWallCollision(ball, wall, dist);
                }
            });

            // 檢測與柱子的碰撞
            this.columns.forEach((column) => {
                this.handleColumnCollision(ball, column);
            });
            this.sort.secondColumns.forEach((column) => {
                this.handleColumnCollision(ball, column);
            });
            
            //檢測與矩形的碰撞
            this.rects.forEach((rect) => {
                this.handleRectCollision(ball, rect);
            })
        });
    }
    render(ctx){
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.walls.forEach((wall) => {
            ctx.beginPath();
            ctx.arc(wall.x, wall.y, wall.length, wall.startAngle, wall.endAngle, false);
            ctx.strokeStyle = 'rgba(40, 60, 80, 1)';
            ctx.lineWidth = wall.thick * 2;
            ctx.stroke();
        });
        function mix(x, from, to){
            return from + x * (to - from);
        }
        function drawColumn(column){
            ctx.beginPath();
            // ctx.moveTo(column.x, column.y);
            // ctx.lineTo(column.x, column.y - column.height);
            ctx.moveTo(column.path.pointX, column.path.pointY);
            ctx.lineTo(column.path.pointX, column.path.pointY - column.height);
            const c = column.height / 865 * 2;
            // const r = 100 + c * (202 - 100);
            // const g = 50 + c * (254 - 50);
            // const b = 225 + c * (127 - 225);
            // const r = 246 + c * (195 - 246);
            // const g = 211 + c * (160 - 211);
            // const b = 101 + c * (133 - 101);
            const t = 1 - column.path.timer / column.path.period * 0.5;
            const r = mix(t, 255, mix(c, 246, 195));
            const g = mix(t, 100, mix(c, 211, 160));
            const b = mix(t, 100, mix(c, 71, 133));
            ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')';
            ctx.lineWidth = column.width;
            ctx.stroke();
        }
        this.columns.forEach((column) => {
            drawColumn(column);
        })
        if(this.sort.secondColumns)
        this.sort.secondColumns.forEach((column) => {
            drawColumn(column);
        })
        this.balls.forEach((ball) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, false);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
        });
        Object.keys(this.texts).forEach((key) => {
            const text = this.texts[key];
            ctx.beginPath();
            ctx.fillStyle = "#FFFFFF";
            ctx.font = text.fontpx + 'px IBM Plex Sans'//, 'Noto Sans TC';
            ctx.fillText(text.text, text.x, text.y);
        })
    }
}