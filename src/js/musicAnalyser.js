import * as THREE from 'three';
import BufferFactory from './bufferFactory';
import { makeBall, makeParticleMaterial } from './customGeometry';
import createAnalyser from './createAnalyser';
import Averager from './averager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Three 事件管理員
const createMusicAnalyser = function(){
    const frame = new Averager(60);
    const clock = new THREE.Clock();
    this.firstTime = true;
    this.getAnalyser = (e) => {
        const audio = e.target;
        if(this.firstTime) this.analyser = createAnalyser(audio);
        this.firstTime = false;
    }
    this.setCanvas = (canvas) => {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({"alpha": true, "canvas": canvas});
        // this.renderer.setClearColor(0x000000, 0);
        // 設置鏡頭
        this.camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
        const radius = 512;
        this.camera.position.set(radius/4, radius/3, radius/3);
        // this.camera.rotation.set(0, 0, 0);

        // 添加控制和座標軸
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(radius/4, 0, -radius/3);
        this.axis = new THREE.AxesHelper(300);
        this.scene.add(this.axis);

        // 添加群組到場景
        this.buff = new BufferFactory();
        this.ball = makeBall(radius, 60, 30, radius/500);
        // this.ball.rotation.set(-1,0,0);
        this.group1 = new THREE.Group();
        this.group1.add(this.buff.mesh, this.ball);
        this.scene.add(this.group1);
    }
    this.cleanup = () => {
        this.firstTime = true;

        // 移除場景中的對象
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    // 釋放幾何體和材質
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        // 處理單個材質
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
            });

            // 移除場景中的所有子對象
            while (this.scene.children.length > 0) {
                const child = this.scene.children[0];
                this.scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else if (child.material) {
                    child.material.dispose();
                }
            }
        }

        // 釋放渲染器
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.buff = null;
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.axis = null;
        this.analyser = null;
    }
    this.resize = () => {
        const [w, h] = [this.canvas.width, this.canvas.height];
        this.renderer.setSize(w, h);
        this.camera.aspect = w/h;
        this.camera.updateProjectionMatrix();
    }
    this.update = () => {
        if(this.analyser){
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);
            const count = this.analyser.frequencyBinCount;
            // const data = [...dataArray].splice(0, count / 2);
            const data = new Uint8Array(bufferLength / 2)
            for (let i = 0; i < bufferLength / 2; i++) {
                data[i] = dataArray[i];
            }
            this.buff.transformData(data);
        }
        this.controls.update();
        this.buff.update();
        frame.updateValue(clock.getDelta());
        window.fps = frame.getFPS();
    }
    this.render = () =>{
        this.renderer.render( this.scene, this.camera );
    }
	return this;
}
const musicAnalyser = new createMusicAnalyser();
export default musicAnalyser;