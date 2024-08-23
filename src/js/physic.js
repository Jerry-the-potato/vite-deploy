import {Path, PathConfig} from './path.js';

window.addEventListener("load", function () {
    const canvas_border = "black";
    const canvas_background = "black";
    const canvas = document.getElementById("canvasS3");
    const ctx = canvas.getContext("2d");
    ctx.lineCap = 'butt';
    ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle';
    class SortAlgorithmIterable{
        constructor(){
            this.sortFunction = undefined;
            this.isSorting = false;
            this.secondColumns = [];
        }
        start(name, columns){
            this.sortFunction = this[name + "Maker"](columns);
            this.timesEveryFrame = Math.ceil(columns.length/25);
            this.columns = columns;
            this.isSorting = true;
        }
        update(){
            if(!this.isSorting) return;

            this.times = this.timesEveryFrame;
            while(this.times--){
                const isStoping = this.sortFunction.next().value;
                if(isStoping === true){
                    [this.isStoping, this.times] = [true, 0];
                    const message = this.sortFunction.name + " is done.";
                    this.send(message);
                }
            }
            if(this.isStoping){
                this.isSorting = false;
                this.isStoping = false;
            }
        };

        // 迭代生成
        * bubbleSortMaker(columns) {
            const len = columns.length;
            for (let i = 0; i < len - 1; i++) {
                for (let j = 0; j < len - 1 - i; j++) {
                    const a = columns[j];
                    const b = columns[j + 1];
                    if (a.height > b.height) SortAlgorithm.swapColumn(a, b, 30);
                    yield false;
                }
            }
            yield true;
        }
        * quickSortMaker(columns, left = 0, right = columns.length - 1) {
            yield false;
            if (left >= right) return;
            const pivotIndex = yield* SortAlgorithm.partition(columns, left, right);
            yield* this.quickSortMaker(columns, left, pivotIndex - 1);
            yield* this.quickSortMaker(columns, pivotIndex + 1, right);
            if(left == 0 && right == columns.length - 1) yield true;
        }

        static* partition(columns, left, right) {
            const pivot = columns[right];
            let i = left;
            for (let j = left; j < right; j++) {
                yield false;
                if (columns[j].height < pivot.height) {
                    SortAlgorithm.swapColumn(columns[i], columns[j], 30);
                    i++;
                }
            }
            SortAlgorithm.swapColumn(columns[i], columns[right], 30);
            return i;
        }

    }
    class SortAlgorithm{
        constructor(){
            this.sortFunction = function(){};
            this.isSorting = false;
            this.secondColumns = [];
        }
        start(name, columns){
            this.send(name + " is processing");
            this.sortFunction = this[name];
            this.timesEveryFrame = Math.ceil(columns.length/25);
            this.columns = columns;
            this.secondColumns = [];
            this.isSorting = true;
            
            this[name + "Setting"](columns);
        }
        update(columns){
            if(!this.isSorting) return;

            this.times = this.timesEveryFrame;
            while(this.times--){
                const isStoping = this.sortFunction(columns);
                if(isStoping === true){
                    [this.isStoping, this.times] = [true, 0];
                    const message = this.sortFunction.name + " is done.";
                    this.send(message);
                }
            }

            if(this.isStoping){
                this.isSorting = false;
                this.isStoping = false;
            }
        };
        send(message){
            const log = document.getElementById("sortLog").childNodes[0];
            log.innerText = message;
        }
        // 記得要用 entries 製作迭代物件，改寫程式碼
        static swapColumn(a, b, frame){
            [a.path.pointX, b.path.pointX] = [b.path.pointX, a.path.pointX];
            [a.path.pointY, b.path.pointY] = [b.path.pointY, a.path.pointY];
            a.path.NewTarget(a.x, a.y, frame);
            b.path.NewTarget(b.x, b.y, frame);
            [a.height, b.height] = [b.height, a.height];
        }
        bubbleSortSetting(columns){
            this.i = 0;
            this.j = 0;
        }
        // 備份
        // bubbleSort(columns){
        //     const len = columns.length;
        //     const i = this.i;
        //     const j = this.j;
        //     if (i < len - 1) {
        //         if (j < len - 1 - i) {
        //             const a = columns[j];
        //             const b = columns[j + 1];
        //             if (a.height > b.height) SortAlgorithm.swapColumn(a, b, 30);
        //             this.j++;
        //         }
        //         else{
        //             this.j = 0;
        //             this.i++;
        //         }
        //     }
        //     else return true;
        // }
        bubbleSort(columns){
            const len = columns.length;
            const i = this.i;
            const j = this.j;
            if (i == len - 1) return true;
            if (j == len - 1 - i) {
                this.j = 0;
                this.i++;
                return false;
            }
            const a = columns[j];
            const b = columns[j + 1];
            if (a.height > b.height) SortAlgorithm.swapColumn(a, b, 30);
            this.j++;
        }

        selectionSortSetting(){
            this.i = 0;
            this.j = 1;
            this.minIndex = 0;
        }
        // selectionSort(columns){
            
        //     const len = columns.length;
        //     const i = this.i;
        //     const j = this.j;
        //     if (i == len - 1) return true;
        //     if (j < len) {
        //         if (columns[this.minIndex].height > columns[j].height){
        //             this.minIndex = j;
        //         }
        //         this.j++;
        //     }
        //     else{
        //         if(i != this.minIndex){
        //             const a = columns[i];
        //             const b = columns[this.minIndex];
        //             const frame = 60;
        //             SortAlgorithm.swapColumn(a, b, frame);
        //         }

        //         this.i++;
        //         this.minIndex = this.i;
        //         this.j = this.i + 1;
        //     }
        // }
        selectionSort(columns){
            const len = columns.length;
            const i = this.i;
            const j = this.j;
            const min = this.minIndex;
            if (i == len - 1) return true;
            if (j == len) {
                this.i++;
                this.minIndex = this.i;
                this.j = this.i + 1;
                if(i == this.minIndex) return false;
                const a = columns[i];
                const b = columns[min];
                const frame = 60;
                SortAlgorithm.swapColumn(a, b, frame);
                return false;
            }
            if (columns[this.minIndex].height > columns[j].height) this.minIndex = j;
            this.j++;
        }
        insertionSortSetting(columns){
            this.i = 1;
            this.key = columns[1].height;
            this.j = 0;
        }
        insertionSort(columns){
            const len = columns.length;
            const i = this.i;
            const j = this.j;
            if (i < len) {
                if (j >= 0 && columns[j].height > columns[j + 1].height) {
                    const a = columns[j + 1];
                    const b = columns[j];
                    const frame = 30 + Math.ceil((this.timesEveryFrame - this.times) * 20 / this.timesEveryFrame);
                    SortAlgorithm.swapColumn(a, b, frame);
                    this.j--;
                }
                else{
                    
                    this.i++;
                    if(this.i >= len) return true;
                    this.j = this.i - 1;
                }
            }
            else return true
        }
        quickSortSetting(columns){
            this.stack = [{'left': 0, 'right': columns.length - 1}];
            this.partitionPhase = "0.SetPivot";
            this.pivot = Math.floor(columns.length - 1);
            this.j = 0;
        }
        quickSort(columns){
            // 第零步 把pivot移到右邊
            // 第一步 輸入left, right - 1
            // 第二步 找到leftBound
            // 第三步 找到rightBound
            // 第四步 循環 > 交換並輸入leftBound, rightBound
            // 第四步 跳出循環 > 定位pivot
            const len = this.stack.length;
            const {left, right} = this.stack[len - 1];
            const pivot = this.pivot;
            const frame = 60;
            switch(this.partitionPhase){
                case "0.SetPivot":
                    const a = columns[Math.floor((left + right) / 2)];
                    const b = columns[right];
                    SortAlgorithm.swapColumn(a, b, frame);
                    this.leftBound = left;
                    this.rightBound = right - 1;
                    this.pivot = right;
                    this.partitionPhase = "1.FindLeftBound";
                    this.j = 0;
                    break;
                case "1.FindLeftBound":
                    if(columns[this.leftBound + this.j].height >= columns[pivot].height){
                        this.leftBound = this.leftBound + this.j;
                        this.partitionPhase = "2.FindRightBound";
                        this.j = 0;
                        break;
                    }
                    this.j++;
                    break;
                case "2.FindRightBound":
                    if(columns[pivot].height >= columns[this.rightBound - this.j].height || this.rightBound - this.j <= this.leftBound){
                        this.rightBound = this.rightBound - this.j;
                        this.partitionPhase = "3.SwapBoth";
                        break;
                    }
                    this.j++;
                    break;
                case "3.SwapBoth":
                    if(this.leftBound < this.rightBound){
                        const a = columns[this.leftBound];
                        const b = columns[this.rightBound];
                        SortAlgorithm.swapColumn(a, b, frame);
                        this.partitionPhase = "1.FindLeftBound"
                        this.j = 0;
                        this.leftBound++;
                        this.rightBound--;
                    }
                    else{
                        const a = columns[this.leftBound];
                        const b = columns[pivot];
                        SortAlgorithm.swapColumn(a, b, frame);
                        this.partitionPhase = "4.EndPartition";
                        this.pivot = this.leftBound;
                    }
                    break;
                case "4.EndPartition":
                    this.stack.pop();
                    if(left < pivot - 1) this.stack.push({'left': left, 'right': pivot - 1});
                    if(pivot + 1 < right) this.stack.push({'left': pivot + 1, 'right': right});
                    if(this.stack.length == 0) return true;
                    this.partitionPhase = "0.SetPivot";
                    break;
                default:
            }
        }
        mergeSortSetting(columns){
            this.stack = [[], []];
            this.stack[0][0] = {'left': 0, 'right': columns.length - 1};
            this.mergePhase = "0.Split";
            this.i = 0;
            this.j = 0;
        }
        mergeSort(columns) {
            const len0 = this.stack[0].length;
            const len1 = this.stack[1].length;
            const {min, mid, max} = this.stack[1][len1 - 1] ? this.stack[1][len1 - 1] : {};
            const i = this.i;
            const j = mid - min + this.j;
            const col = this.secondColumns.slice(min, max + 1);
            const frame = Math.min(30 + Math.floor((max - j + mid - i)/(len0 + len1)), 90);
            // const frame = Math.floor((max - j + mid - i)/(len/256));
            switch(this.mergePhase){
                case "0.Split":
                    if(len0 == 0){
                        this.mergePhase = "1.Copy";
                        this.timesEveryFrame = 1;
                        this.secondColumns = JSON.parse(JSON.stringify(columns.slice(0, columns.length + 1)));
                        this.secondColumns.forEach((column, index) => {
                            column.path = new Path(column.x, column.y);
                            column.path.NewTarget(column.x, column.y - canvas.height*0.4, 20);
                            column.width/=3;
                        })
                        return;
                    }
                    const { left, right } = this.stack[0][len0 - 1];
                    const middle = Math.ceil((left + right) / 2);
                    this.stack[0].pop();
                    if(left != right){
                        this.stack[0].push({'left': left, 'right': middle - 1});
                        this.stack[0].push({'left': middle, 'right': right});
                        this.stack[1].push({'min': left, 'mid': middle, 'max': right});
                    }
                    break;
                case "1.Copy":
                    if(len1 == 0){
                        return true;
                    }
                    col.forEach((column, index) => {
                        column.height = columns[min + index].height;
                        column.width = columns[min + index].width/2;
                        column.path.NewTarget(column.x, column.y - canvas.height*0.4, 20);
                    })
                    this.mergePhase = "2.Merge";
                    break;
                case "2.Merge":
                    if(col[i].height > col[j].height){
                        const a = col[j];
                        const b = columns[min + this.i + this.j];
                        SortAlgorithm.swapColumn(a, b, frame);
                        a.height = 0;
                        this.j++;
                        if(this.j > max - mid){
                            this.mergePhase = "3.MergeLeft";
                        }
                    }
                    else{
                        const a = col[i];
                        const b = columns[min + this.i + this.j];
                        SortAlgorithm.swapColumn(a, b, frame);
                        a.height = 0;
                        this.i++;
                        if(this.i > mid - min){
                            this.i--;
                            this.j++;
                        }
                        if(this.i >= mid - min){
                            this.mergePhase = "4.MergeRight";
                        }
                    }
                    break;
                case "3.MergeLeft":
                    if(i >= mid - min){
                        this.i = 0;
                        this.j = 0;
                        this.stack[1].pop();
                        if(this.stack[1].length == 0){
                            this.isStoping = true;
                            return
                        }
                        this.mergePhase = "1.Copy";
                        col.forEach((column, index) => {
                            column.height = columns[min + index].height;
                            column.path.NewTarget(column.x, column.y - canvas.height*0.4, 20);
                            column.width/=3;
                        })
                    }
                    else{
                        const a = col[i];
                        const b = columns[min + this.i + this.j];
                        SortAlgorithm.swapColumn(a, b, frame);
                        a.height = 0;
                        this.i++;
                    }
                    
                    break;
                case "4.MergeRight":
                    if(j > max - min){
                        this.i = 0;
                        this.j = 0;
                        this.stack[1].pop();
                        if(this.stack[1].length == 0){
                            this.isStoping = true;
                            return
                        }
                        this.mergePhase = "1.Copy";
                        col.forEach((column, index) => {
                            column.height = columns[min + index].height;
                            column.path.NewTarget(column.x, column.y - 400, 20);
                            column.width/=3;
                        })
                    }
                    else{
                        const a = col[j];
                        const b = columns[min + this.i + this.j];
                        SortAlgorithm.swapColumn(a, b, frame);
                        a.height = 0;
                        this.j++;
                    }
                    break;
            }
        }
        static heapify(columns, len, i){
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < len && columns[left].height > columns[largest].height) {
                largest = left;
            }
            if (right < len && columns[right].height > columns[largest].height) {
                largest = right;
            }
            if (largest !== i) {
                const a = columns[i];
                const b = columns[largest];
                SortAlgorithm.swapColumn(a, b, 60);
                return largest;
            }
            return -1;
        }
        heapSortSetting(columns){
            this.i = Math.floor(columns.length / 2) - 1;
            this.j = this.i;
            this.heapPhase = "1.build";
        }
        heapSort(columns){
            const len = columns.length;
            const i = this.i;
            const j = this.j;
            switch(this.heapPhase){
                case "1.build":
                    this.j = SortAlgorithm.heapify(columns, len, j);
                    if(this.j == -1){
                        this.i--;
                        this.j = this.i;
                        if(this.i < 0){
                            this.i = len - 1;
                            this.j = 0;
                            this.heapPhase = "2.swap";
                        }
                    }
                    break;
                case "2.swap":
                    const a = columns[0];
                    const b = columns[i];
                    SortAlgorithm.swapColumn(a, b, 60);
                    this.heapPhase = "3.sort";
                    break;
                case "3.sort":
                    this.j = SortAlgorithm.heapify(columns, i, j);
                    if(this.j == -1){
                        this.j = 0;
                        this.i--;
                        this.heapPhase = "2.swap";
                        if(this.i < 0) return true;
                    }
                    break;

            }
        }
        shellSortSetting(columns){
            this.gap = Math.floor(columns.length / 2);
            this.i = this.gap;
            this.j = this.i;
        }
        shellSort(columns){
            const len = columns.length;
            const gap = this.gap;
            const i = this.i;
            const j = this.j;
            if(gap > 0){
                if(i < len){
                    if (j >= gap && columns[j - gap].height > columns[j].height) {
                        const a = columns[j];
                        const b = columns[j - gap];
                        ParticleSystem.swapColumn(a, b, 60);
                        this.j-= gap;
                    }
                    else{
                        this.i++;
                        this.j = this.i;
                    }
                }
                else{
                    this.gap = Math.floor(gap / 2);
                    this.i = this.gap;
                    this.j = this.i;
                }
            }
            else return;
        }
        countingSortSetting(columns){
            const heights = columns.map((column)=>{return column.height})
            this.maxValue = Math.max(...heights);
            // this.maxValue = columns.reduce((max, column) => {
            //     return column.height > max ? column.height : max;
            // }, columns[0].height);
            this.count = new Array(Math.floor(this.maxValue)).fill(0);
            this.secondColumns = new Array(columns.length);
            this.i = 0;
            this.countingPhase = "1.count";
        }
        countingSort(columns) {
            const len = columns.length;
            const i = this.i;
            switch(this.countingPhase){
                case "1.count":
                    this.count[Math.round(columns[i].height)]++;
                    this.i++;
                    if(this.i >= len){
                        this.i = 1;
                        this.countingPhase = "2.sum";
                    }
                    break;
                case "2.sum":
                    this.count[i] += this.count[i - 1];
                    this.i++;
                    if(this.i > this.maxValue){
                        this.i = len - 1
                        this.countingPhase = "3.build"
                        this.timesEveryFrame = 1;
                    }
                    break;
                case "3.build":
                    const index = this.count[Math.round(columns[i].height) - 1]; // 如果有兩個以上會出錯
                    this.secondColumns[index] = JSON.parse(JSON.stringify(columns[i]));
                    this.secondColumns[index].y = columns[i].y - canvas.height*0.4;
                    this.secondColumns[index].width/=2
                    this.secondColumns[index].path = new Path(columns[i].x, columns[i].y);
                    this.secondColumns[index].path.NewTarget(columns[index].x, columns[i].y - 400, 60 + Math.round(i/len * 60));
                    this.count[columns[i]]--;
                    this.i--;
                    if(this.i < 0){
                        this.i = 0;
                        this.countingPhase = "4.output";
                    }
                    break;
                case "4.output":
                    const a = this.secondColumns[i];
                    const b = columns[i];
                    SortAlgorithm.swapColumn(a, b, 30 + Math.round(i/len * 60));
                    a.height = 0;
                    this.i++;
                    if(this.i >= len)return true;
                    break;
            }
        }
        randomSortSetting(){
            this.i = 0;
            this.j = 0;
            this.timesEveryFrame = 1;
        }
        randomSort(columns){
            const len = columns.length;
            const i = this.i;
            const j = this.j;
            if (i >= len) return true;
            if (j >= len){
                this.i = this.i * this.i + 1;
                this.j = i;
                return false;
            }
            const a = columns[j];
            const b = columns[(j*j+1) % len];
            SortAlgorithm.swapColumn(a, b, 60 - this.timesEveryFrame * 2);
            this.j = this.i + this.j + 1;
        }
        instantRandomSortSetting(){
            this.i = 0;
            this.j = 0;
            this.timesEveryFrame = 30;
        }
        instantRandomSort(columns){
            return this.randomSort(columns);
        }
    }

    class ParticleSystem{
        constructor(x = canvas.width/2, y = canvas.height/2){
            this.sort = new SortAlgorithm();

            this.x = x;
            this.y = y;
            this.slow = 0.999;
            this.friction = 0.997;
            this.isSorting = false;
            this.isStoping = false;
            this.i = 0;
            this.j = 0;
            this.sortFunction = function nothingHere(){};
            // this.status = {'i': 0, 'j': 0, 'isSorting': false, 'sortFunction': function nothingHere(){}, 'isStoping': false};
            this.maxValue = canvas.height*0.4;
            const length = Math.floor(x - 200);
            const width = Math.max(Math.floor(x*2/length), 0.5);
            this.columns = new Array(length).fill().map((v,i) => {
                return this.createColumn(x - width * length/2 + width * i, y * 1.8, width, ((i+1)/length) * this.maxValue);
            });
            this.secondColumns = [];
            this.walls = new Array(5).fill().map((v,i) => {
                return this.createWall("arc", x, y-x/2, canvas.width/2/25 * (1+i*i), 3, 0 + Math.PI/16*(4-i), Math.PI/16*(12+i), Math.PI / 15 * i, canvas.width/2/25)
            });
            // this.walls = [this.createWall("arc", x, y, canvas.width/3)]
            const ballLen = Math.min(length*2, 500);
            const ballSize = 2 + Math.floor(width/3);
            this.balls = new Array(ballLen).fill().map((v,i) => {
                const r = Math.pow(Math.random(), 0.6) * canvas.width/4;
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
        isCollide(target, wall){
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

            // 計算速度的變化
            const vx = (ball.vx - anotherBall.vx) / 2;
            const vy = (ball.vy - anotherBall.vy) / 2;
            const averageVx = (ball.vx + anotherBall.vx) / 2;
            const averageVy = (ball.vy + anotherBall.vy) / 2;

            // 計算碰撞後的新速度
            const angle = Math.atan((ball.y - y) / (ball.x - x));
            const vectorT = -vx * Math.sin(angle) + vy * Math.cos(angle);
            const vectorN = -1 * (vx * Math.cos(angle) + vy * Math.sin(angle));
            const relativeX = -vectorT * Math.sin(angle) + vectorN * Math.cos(angle);
            const relativeY = vectorT * Math.cos(angle) + vectorN * Math.sin(angle);

            // 更新球的速度
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
            // 檢測球體是否與柱子碰撞
            const columnTop = column.path.pointY - column.height;
            const columnBottom = column.path.pointY;
            const columnLeft = column.path.pointX - column.width / 2;
            const columnRight = column.path.pointX + column.width / 2;
            
            if (ball.x + ball.r > columnLeft && ball.x - ball.r < columnRight &&
                ball.y + ball.r > columnTop && ball.y - ball.r < columnBottom) {
                
                // 計算球體與柱子邊界的重疊量
                const overlapX = Math.min(ball.x + ball.r - columnLeft, columnRight - ball.x + ball.r);
                const overlapY = Math.min(ball.y + ball.r - columnTop, columnBottom - ball.y + ball.r);
                
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

        static swapColumn(a, b, frame){
            [a.path.pointX, b.path.pointX] = [b.path.pointX, a.path.pointX];
            [a.path.pointY, b.path.pointY] = [b.path.pointY, a.path.pointY];
            a.path.NewTarget(a.x, a.y, frame);
            b.path.NewTarget(b.x, b.y, frame);
            [a.height, b.height] = [b.height, a.height];
        }
        update(){
            const log = document.getElementById("sortLog").childNodes[0];
            this.texts.log.text = log.innerText;
            this.columns.forEach((column) => {
                if(column.path != undefined){
                    if(column.path.__proto__.constructor.name == "Path"){
                        column.path.NextFrame();
                    }
                }
            })
            this.sort.secondColumns.forEach((column, index) => {
                if(column.path == undefined) return;
                const funcitonName = column.path.__proto__.constructor.name;
                if(funcitonName != "Path") return console.warn("the path of columns[ " + index + " ] was never constructed by Path");
                column.path.NextFrame();
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
                this.balls.forEach((anotherBall, index2) => {
                    if (ball == anotherBall) return;
                    const dist = this.getDist(ball, anotherBall);
                    if (dist < ball.r + anotherBall.r) {
                        this.handleBallCollision(ball, anotherBall, dist);
                    }
                });

                // 檢測與牆壁的碰撞
                this.walls.forEach((wall) => {
                    const dist = this.isCollide(ball, wall);
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
        draw(){
            this.walls.forEach((wall) => {
                ctx.beginPath();
                ctx.arc(wall.x, wall.y, wall.length, wall.startAngle, wall.endAngle, false);
                ctx.strokeStyle = 'rgba(40, 60, 80, 1)';
                ctx.lineWidth = wall.thick * 2;
                ctx.stroke();
            });
            function drawColumn(column){
                ctx.beginPath();
                // ctx.moveTo(column.x, column.y);
                // ctx.lineTo(column.x, column.y - column.height);
                ctx.moveTo(column.path.pointX, column.path.pointY);
                ctx.lineTo(column.path.pointX, column.path.pointY - column.height);
                const c = column.height / canvas.height * 2;
                // const r = 100 + c * (202 - 100);
                // const g = 50 + c * (254 - 50);
                // const b = 225 + c * (127 - 225);
                const r = 246 + c * (195 - 246);
                const g = 211 + c * (160 - 211);
                const b = 101 + c * (133 - 101);
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
    const system = new ParticleSystem();

    const buttons = document.getElementById("sortAlgorithm").getElementsByTagName("button");
    Object.keys(buttons).forEach((key) => {
        const button = buttons[key];
        button.addEventListener("click", function(){
            const name = system.sort.sortFunction.name;
            if(button.id == "cancelSort"){
                system.sort.isSorting = false;
                system.sort.send(name + " is interrupted!");
                return;
            }
            if(button.id == "stepByStep"){
                system.sort.isSorting = true;
                system.sort.isStoping = true;
                system.sort.send(name + " is proceeding step by step. Click again!");
                return;
            }
            if(!system.sort[button.id]) return;
            system.sort.start(button.id, system.columns);
        }, false);
    });

    // 互動

    // 設定不同演算法的初始值
    {

    }

    // 設定動畫路徑
    document.getElementById("pathConfig").addEventListener("click", function(){
        const linear = this.childNodes[1].value;
        const easein = this.childNodes[3].value;
        const easeout = this.childNodes[5].value;
        PathConfig.setLeap(linear, easein, easeout);
    })

    // 繪圖系統-main
    {
        manager.addAnimationCallback(function renderS3(){
            clearBoard();
            system.sort.update(system.columns);
            system.update();
            system.draw();
            frame.updateValue(clock.getDelta());
            frame.getFPS();
        })

        function clearBoard() {
            ctx.fillStyle = canvas_background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    // fps計算器
    class Averager{
        constructor(length){
            this.length = length;
            this.value = new Array(length).fill(0.0167);
            this.index = 0;
            this.average = 0.0167;
            this.fps = 60;
        }
        updateValue(value){
            this.value[this.index] = value;
            this.index = (++this.index >= this.length) ? 0 : this.index;
            // same as below:
            // 	this.index++;
            // 	if(this.index >= this.length) this.index = 0;
            // concept:
            // 	i = (++i > 99) ? 0 : i
        }
        getAverage(){
            this.average = 1 / this.length * this.value.reduce((sum, value) => {
                return sum + value;
            })
            return this.average;
        }
        getFPS(){
            this.fps = 1 / this.getAverage();
            return this.fps;
        }
    }
    const frame = new Averager(60);
})