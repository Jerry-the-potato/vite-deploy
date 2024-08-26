// fps計算器
export default class Averager{
    constructor(length = 60){
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