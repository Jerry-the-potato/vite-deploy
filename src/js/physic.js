import {PathConfig} from './path.js';
import ParticleSystem from './particleSystem.js';
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
    }
    getAverage(){
        this.average = 1 / this.length * this.value.reduce((sum, value) => {
            return sum + value;
        }, 0)
        return this.average;
    }
    getFPS(){
        this.fps = 1 / this.getAverage();
        return this.fps;
    }
}

// 粒子系統事件管理員
const createPhysic = function(){
    const frame = new Averager(60);
    this.update = () => {this.system.update();}
    this.render = () => {
        this.system.getRender(this.ctx);
        // frame.updateValue(clock.getDelta());
        // frame.getFPS();
    }
	this.setCanvas = (canvas, log) => {
        this.system = new ParticleSystem(canvas.width/2, canvas.height/2);
        this.system.sort.log = log;
        this.ctx = canvas.getContext("2d");
        this.ctx.lineCap = 'butt';
        this.ctx.textAlign = 'center';
	}
    this.start = (e) => {
        const ID = e.target.id;
        if(!this.system.sort[ID]){
            console.warn("invalid function name. Button id " + ID + " is not any of sortFunctions");
            return;
        }
        this.system.sort.start(ID, this.system.columns);
    }
    this.cancel = () => {
        this.system.sort.isSorting = false;
        this.system.sort.send(name + " is interrupted!");
    }
    this.stepByStep = () => {
        this.system.sort.isSorting = true;
        this.system.sort.isStoping = true;
        this.system.sort.send(name + " is proceeding step by step. Click again!");
    }
    this.setPath = (e) => {
        const ID = e.target.id;
        PathConfig[ID] = e.target.value;
    }
	return this;
}
const physic = new createPhysic();
export default physic;