import {system} from "./physic";
class SortAlgorithm{
    constructor(p){
        this.elementP = p;
        this.sortFunction = undefined;
        this.isSorting = false;
        this.array = [];
        this.columns = [];
    }
    start(name, columns){
        this.sortFunction = this[name];
        this.timesEveryFrame = Math.ceil(columns.length/25);
        this.columns = columns;
        this.array = columns.map(column => {
            return column.height;
        })
        this.isSorting = true;
        
        this[name + "Setting"]();
        this.update(this);
    }
    update(){
        if(!this.isSorting) return;

        let times = this.timesEveryFrame;
        while(times--){
            const isStoping = this.sortFunction();
            if(isStoping) [this.isStoping, times] = [true, 0];
        }

        if(this.isStoping){
            this.isSorting = false;
            this.isStoping = false;
            const message = this.sortFunction.name + " is done.";
            this.send(message);
        }

        requestAnimationFrame(() => {this.update()});
    };
    send(message){
        this.elementP.innerText = message;
    }
    swapColumn(a, b, frame){
        console.log("swap");
        [a.path.pointX, b.path.pointX] = [b.path.pointX, a.path.pointX];
        [a.path.pointY, b.path.pointY] = [b.path.pointY, a.path.pointY];
        a.path.NewTarget(a.x, a.y, frame);
        b.path.NewTarget(b.x, b.y, frame);
        [a.height, b.height] = [b.height, a.height];
    }
    bubbleSortSetting(){
        this.i = 0;
        this.j = 0;
    }
    bubbleSort(){
        
        const len = this.columns.length;
        const i = this.i;
        const j = this.j;
        if (i < len - 1) {
            if (j < len - 1 - i) {
                const a = this.columns[j];
                const b = this.columns[j + 1];
                if (a.height > b.height){
                    const frame = 30 + Math.ceil((this.timesEveryFrame - this.times) * 20 / this.timesEveryFrame);
                    this.swapColumn(a, b, 60);
                }
                this.j++;
            }
            else{
                this.j = 0;
                this.i++;
            }
        }
        else{
            return true;
        }
    }
    selectionSortSetting(){
        this.i = 0;
        this.j = 1;
        this.minIndex = 0;
    }
    selectionSort(){
        
        const len = this.columns.length;
        const i = this.i;
        const j = this.j;
        if (i < len - 1) {
            if (j < len) {
                if (this.columns[this.minIndex].height > this.columns[j].height){
                    this.minIndex = j;
                }
                this.j++;
            }
            else{
                if(i != this.minIndex){
                    const a = this.columns[i];
                    const b = this.columns[this.minIndex];
                    const frame = 60;
                    this.swapColumn(a, b, frame);
                }

                this.i++;
                this.minIndex = this.i;
                this.j = this.i + 1;
            }
        }
        else{
            return true;
        }
    }
    insertionSortSetting(){
        this.i = 1;
        this.key = this.columns[1].height;
        this.j = 0;
    }
    insertionSort(){
        
        const len = this.columns.length;
        const i = this.i;
        const j = this.j;
        if (i < len) {
            const frame = 30;
            if (j >= 0 && this.columns[j].height > this.columns[j + 1].height) {
                const a = this.columns[j + 1];
                const b = this.columns[j];
                // a.path.ResetTo(b.path.po
                this.swapColumn(a, b, frame);
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
    quickSortSetting(){
        this.stack = [{'left': 0, 'right': this.columns.length - 1}];
        this.partitionPhase = "0.SetPivot";
        this.pivot = Math.floor(this.columns.length - 1);
        this.j = 0;
    }
    quickSort(){
        
        const len = this.stack.length;
        const {left, right} = this.stack[len - 1];
        const pivot = this.pivot;
        switch(this.partitionPhase){
            case "0.SetPivot":
                const a = this.columns[Math.floor((left + right) / 2)];
                const b = this.columns[right];
                this.swapColumn(a, b, 60);
                this.leftBound = left;
                this.rightBound = right - 1;
                this.pivot = right;
                this.partitionPhase = "1.FindLeftBound";
                this.j = 0;
                break;
            case "1.FindLeftBound":
                if(this.columns[this.leftBound + this.j].height >= this.columns[pivot].height){
                    this.leftBound = this.leftBound + this.j;
                    this.partitionPhase = "2.FindRightBound";
                    this.j = 0;
                    break;
                }
                this.j++;
                break;
            case "2.FindRightBound":
                if(this.columns[pivot].height >= this.columns[this.rightBound - this.j].height || this.rightBound - this.j <= this.leftBound){
                    this.rightBound = this.rightBound - this.j;
                    this.partitionPhase = "3.SwapBoth";
                    break;
                }
                this.j++;
                break;
            case "3.SwapBoth":
                if(this.leftBound < this.rightBound){
                    const a = this.columns[this.leftBound];
                    const b = this.columns[this.rightBound];
                    this.swapColumn(a, b, 60);
                    this.partitionPhase = "1.FindLeftBound"
                    this.j = 0;
                    this.leftBound++;
                    this.rightBound--;
                }
                else{
                    const a = this.columns[this.leftBound];
                    const b = this.columns[pivot];
                    this.swapColumn(a, b, 60);
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
}
const p = document.getElementById("sortLog").childNodes[0];
const sort = new SortAlgorithm(p);
const buttons = document.getElementById("sortAlgorithm").getElementsByTagName("button");
Object.keys(buttons).forEach((key) => {
    const button = buttons[key];
    button.addEventListener("click", function(){
        if(!sort[button.id]) return;
        sort.start(button.id, system.columns);
    }, false);
});