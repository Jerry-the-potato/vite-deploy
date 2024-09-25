import {PathConfig} from './path.js';
import ParticleSystem from './particleSystem.js';
import Averager from "./averager";

// 粒子系統事件管理員
const createPhysic = function(){
    const frame = new Averager(60);
	this.setCanvas = (canvas, pElement) => {
        this.system = new ParticleSystem(canvas.width/2, canvas.height/2);
        this.system.sort.setLog(pElement);
        this.ctx = canvas.getContext("2d");
        this.ctx.lineCap = 'butt';
        this.ctx.textAlign = 'center';
	}
    this.cleanup = () => {
        this.system = null;
        this.ctx = null;
    }
    this.update = () => {this.system.update();}
    this.render = () => {this.system.render(this.ctx);}
    this.start = (ID, path) => {
        if(!this.system.sort[ID]){
            console.warn("invalid function name. Button id " + ID + " is not any of sortFunctions");
            return;
        }
        this.setPath(path);
        this.system.sort.start(ID, this.system.columns);
    }
    this.cancel = () => {
        this.system.sort.isSorting = false;
    }
    this.stepByStep = () => {
        this.system.sort.isSorting = true;
        this.system.sort.isStoping = true;
    }
    this.setPath = (path) => {
        // const ID = e.target.id;
        // PathConfig[ID] = e.target.value;
        Object.assign(PathConfig, path);
        PathConfig.resetPath(-1, 0, 2);
    }
	return this;
}
const physic = new createPhysic();
export default physic;