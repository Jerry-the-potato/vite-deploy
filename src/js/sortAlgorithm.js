import { Path } from "./path";

export class SortAlgorithmIterable{
    constructor(){
        this.secondColumns = [];
        this.sortFunction = undefined;
        this.isSorting = false;
        this.log = document.createElement("div");
    }
    setLog(element){
        this.log = element;
    }
    send(message){
        this.log.innerText = message;
    }
    setStepByStep(){
        this.isSorting = true;
        this.isStoping = true;
    }
    start(name, columns){
        this.secondColumns = []; // 清空上次排序
        this.send(name + " is processing");
        this.sortFunction = this[name + "Maker"](columns);
        this.name = name;
        this.timesEveryFrame = Math.ceil(columns.length/50);
        this.isSorting = true;
    }
    update(){
        if(!this.isSorting) return;

        this.times = this.timesEveryFrame;
        while(this.times--){
            const isStoping = this.sortFunction.next().value;
            if(isStoping === true){
                [this.isStoping, this.times] = [true, 0];
                const message = this.name + " is done.";
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
    * selectionSortMaker(columns) {
        const len = columns.length;
        for (let i = 0; i < len; i++) {
            let minIndex = i;
            for (let j = i + 1; j < len; j++) {
                const min = columns[minIndex].height;
                const next = columns[j].height;
                if (next < min) minIndex = j;
                yield false;
            }
            if(minIndex == i) continue;
            const a = columns[i];
            const b = columns[minIndex];
            SortAlgorithm.swapColumn(a, b, 30);
        }
        yield true;
    }
    * insertionSortMaker(columns) {
        const len = columns.length;
        for (let i = 1; i < len; i++) {
            let key = columns[i].height;
            let j = i - 1;
            while (j >= 0 && columns[j].height > key) {
                const a = columns[j + 1];
                const b = columns[j];
                SortAlgorithm.swapColumn(a, b, 30);
                yield false;
                j--;
            }
        }
        yield true;
    }
    * shellSortMaker(columns) {
        const len = columns.length;
        let gap = Math.floor(len / 2);

        while (gap > 0) {
            for (let i = gap; i < len; i++) {
                let j = i;
                while (j >= gap && columns[j - gap].height > columns[j].height) {
                    const a = columns[j];
                    const b = columns[j - gap];
                    SortAlgorithm.swapColumn(a, b, 60);
                    yield false;
                    j -= gap;
                }
            }
            gap = Math.floor(gap / 2);
        }
        yield true;
    }
    * quickSortMaker(columns, left = 0, right = columns.length - 1) {
        if (left >= right) return;
        const pivotIndex = yield* SortAlgorithmIterable.partition(columns, left, right);
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

    * mergeSortMaker(columns, left = 0, right = columns.length - 1) {
        if (left >= right) return;
        const mid = Math.ceil((left + right) / 2);
        yield* this.mergeSortMaker(columns, left, mid - 1);
        yield* this.mergeSortMaker(columns, mid, right);
        yield* this.mergeMaker(columns, left, mid, right);
        if(left == 0 && right == columns.length - 1) yield true;
    }

    * mergeMaker(columns, left, mid, right) {
        this.secondColumns = JSON.parse(JSON.stringify(columns.slice(left, right + 1)));
        const heights = this.secondColumns.map((column)=>{return column.height});
        const max = Math.max(...heights);
        // 為每個 column 添加 path 
        this.secondColumns.forEach((column) => {
            column.path = new Path(column.x, column.y);
            column.path.NewTarget(column.x, column.y - max, 20);
            column.width /= 2; 
        });

        let i = 0; // 左半部分的索引
        let j = mid - left; // 右半部分的索引
        let k = left; // 合併後的索引

        // 合併兩個部分
        while (i <= mid - 1 - left && j <= right - left) {
            yield false;
            if (this.secondColumns[i].height <= this.secondColumns[j].height) {
                var b = this.secondColumns[i];
                i++;
            } else {
                var b = this.secondColumns[j];
                j++;
            }
            const a = columns[k];
            SortAlgorithm.swapColumn(a, b, 30);
            b.height = 0;
            k++;
        }

        // 如果左邊有剩餘，繼續合併
        while (i <= mid - 1 - left) {
            yield false;
            const a = columns[k];
            const b = this.secondColumns[i];
            SortAlgorithm.swapColumn(a, b, 30);
            b.height = 0;
            i++;
            k++;
        }

        // 如果右邊有剩餘，繼續合併
        while (j <= right - left) {
            yield false;
            const a = columns[k];
            const b = this.secondColumns[j];
            SortAlgorithm.swapColumn(a, b, 30);
            b.height = 0;
            j++;
            k++;
        }
    }

    * heapSortMaker(columns) {
        const n = columns.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* this.heapify(columns, n, i);
        }
        for (let i = n - 1; i > 0; i--) {
            const a = columns[0];
            const b = columns[i];
            SortAlgorithm.swapColumn(a, b, 60);
            yield* this.heapify(columns, i, 0);
        }
        yield true;
    }
    
    * heapify(columns, n, i) {
        yield false;
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        if (left < n && columns[left].height > columns[largest].height) largest = left;
        if (right < n && columns[right].height > columns[largest].height) largest = right;
        if (largest !== i) {
            const a = columns[largest];
            const b = columns[i];
            SortAlgorithm.swapColumn(a, b, 60);
            yield* this.heapify(columns, n, largest);
        }
    }

    * randomSortMaker(columns, frames = 60, TEF = 1){
        this.timesEveryFrame = TEF;
        const len = columns.length;
        for(let i = 0; i < len; i = i * i + 1){
            for(let j = 0; j < len; j = i + j + 1){
                const a = columns[j];
                const b = columns[(j*j+1) % len];
                SortAlgorithm.swapColumn(a, b, frames);
                yield false;
            }
        }
        yield true;
    }
    * instantRandomSortMaker(columns){
        this.timesEveryFrame = 30;
        yield* this.randomSortMaker(columns, 30, 30);
    }
}
export class SortAlgorithm{
    constructor(){
        this.secondColumns = [];
        this.sortFunction = function(){};
        this.isSorting = false;
        this.log = document.createElement("div");
    }
    setLog(element){
        this.log = element;
    }
    setStepByStep(){
        this.isSorting = true;
        this.isStoping = true;
    }
    start(name, columns){
        this.secondColumns = []; // 清空上次排序
        this.send(name + " is processing");
        this.sortFunction = this[name];
        this.timesEveryFrame = Math.ceil(columns.length/50);
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
    }
    send(message){
        this.log.innerText = message;
    }
    // 記得要用 entries 製作迭代物件，改寫程式碼
    static swapColumn(a, b, frame){
        [a.path.pointX, b.path.pointX] = [b.path.pointX, a.path.pointX];
        [a.path.pointY, b.path.pointY] = [b.path.pointY, a.path.pointY];
        [a.height, b.height] = [b.height, a.height];
        a.path.NewTarget(a.x, a.y, frame);
        b.path.NewTarget(b.x, b.y, frame);
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
        const minIndex = this.minIndex;
        if (i == len - 1) return true;
        if (j == len) {
            this.i++;
            this.minIndex = this.i;
            this.j = this.i + 1;
            if(i == minIndex) return false;
            const a = columns[i];
            const b = columns[minIndex];
            const frame = 60;
            SortAlgorithm.swapColumn(a, b, frame);
            return false;
        }
        const min = columns[minIndex].height;
        const next = columns[j].height;
        if (next < min) this.minIndex = j;
        this.j++;
    }
    insertionSortSetting(columns){
        this.i = 1;
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
                SortAlgorithm.swapColumn(a, b, 30);
                this.j--;
            } else{
                this.i++;
                this.j = this.i - 1;
            }
        } else return true;
    }
    quickSortSetting(columns){
        this.stack = [{'left': 0, 'right': columns.length - 1}];
        this.partitionPhase = "0.SetPivot";
        this.pivot = columns.length - 1;
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
        const heights = columns.map((column)=>{return column.height});
        this.height = Math.max(...heights);
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
                    this.secondColumns.forEach((column) => {
                        column.path = new Path(column.x, column.y);
                        column.path.NewTarget(column.x, column.y - this.height, 20);
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
                    column.path.NewTarget(column.x, column.y - this.height, 20);
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
                    if(this.i > mid - 1 - min){
                        this.mergePhase = "4.MergeRight";
                    }
                }
                break;
            case "3.MergeLeft":
                if(i > mid - 1 - min){
                    this.i = 0;
                    this.j = 0;
                    this.stack[1].pop();
                    this.mergePhase = "1.Copy";
                    // col.forEach((column, index) => {
                    //     column.height = columns[min + index].height;
                    //     column.path.NewTarget(column.x, column.y - this.height, 20);
                    //     column.width/=3;
                    // })
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
                    this.mergePhase = "1.Copy";
                    // col.forEach((column, index) => {
                    //     column.height = columns[min + index].height;
                    //     column.path.NewTarget(column.x, column.y - this.height, 20);
                    //     column.width/=3;
                    // })
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
                const a = columns[j];
                const b = columns[j - gap];
                if (j >= gap && b.height > a.height) {
                    const a = columns[j];
                    const b = columns[j - gap];
                    SortAlgorithm.swapColumn(a, b, 60);
                    this.j-= gap;
                } else{
                    this.i++;
                    this.j = this.i;
                }
            } else{
                this.gap = Math.floor(gap / 2);
                this.i = this.gap;
                this.j = this.i;
            }
        } else return;
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
                this.secondColumns[index].y = columns[i].y - this.height;
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
    randomSort(columns, frames = 60){
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
        SortAlgorithm.swapColumn(a, b, frames);
        this.j = this.i + this.j + 1;
    }
    instantRandomSortSetting(){
        this.i = 0;
        this.j = 0;
        this.timesEveryFrame = 30;
    }
    instantRandomSort(columns){
        return this.randomSort(columns, 30);
    }
}