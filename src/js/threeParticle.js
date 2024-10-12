import * as THREE from 'three';
import Averager from './averager';
import ParticleSystem3D from './particleSystem3D';
import { makeBall } from './customGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PathConfig } from './path';

// Three 事件管理員
const createThreeParticle = function(){
    const frame = new Averager(60);
    const clock = new THREE.Clock();
    this.setCanvas = (canvas) => {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({"alpha": true, "canvas": canvas});
        // 設置鏡頭
        this.camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
        const radius = 800;
        this.camera.position.set(radius * 0.0, radius * 0.4, radius * 0.4);

        // 光
        // const light = new THREE.AmbientLight( 0xffffff );
        // this.scene.add( light );

        // 添加控制和座標軸
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, radius * 0.1, -radius * 0.);
        this.controls.autoRotate = true;  // 啟用自動旋轉
        this.controls.autoRotateSpeed = 2;  // 設置旋轉速度

        window.c = this.controls;
        // this.axis = new THREE.AxesHelper(300);
        // this.scene.add(this.axis);

        // 添加群組到場景
        this.system = new ParticleSystem3D();
        const mesh = this.system.getMesh();
        const ball = makeBall(radius, 60, 30, radius/500);
        const group = new THREE.Group();
        group.add(ball, mesh);
        this.scene.add(group);
    }
    this.cleanup = () => {
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
        
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.axis = null;
    }
    this.resize = () => {
        const [w, h] = [this.canvas.width, this.canvas.height];
        this.renderer.setSize(w, h);
        this.camera.aspect = w/h;
        this.camera.updateProjectionMatrix();
    }
    this.start = (ID) => {
        PathConfig.resetPath(0.5, 0, 0.5);
        if(!this.system.sort[ID] && !this.system.sort[ID + "Maker"]){
            console.warn("invalid function name. Button id " + ID + " is not any of sortFunctions");
            return;
        }
        this.system.sort.start(ID, this.system.getSortData());
    }
    this.update = () => {
        this.controls.update();
        this.system.update();
        frame.updateValue(clock.getDelta());
        window.fps = frame.getFPS();
    }
    this.render = () =>{
        this.renderer.render( this.scene, this.camera );
    }
	return this;
}
const threeParticle = new createThreeParticle();
export default threeParticle;