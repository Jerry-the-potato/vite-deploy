import * as THREE from 'three';
import * as dat from 'dat.gui';

let gui = new dat.GUI();
window.gui = gui;
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let renderer = new THREE.WebGLRenderer({alpha: true});
let board = renderer.domElement;

camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
setScreen();
window.addEventListener("resize", setScreen, false);
function setScreen(){
    // 已透過css的aspect-ratio預先設定game-box長寬比和canvas布局
    let box = document.getElementById("gameBox");
    box.style.maxHeight = Math.floor(window.innerHeight - 40) + "px";
    box.style.maxWidth = Math.floor(window.innerWidth - 40) + "px";
    let w = box.clientWidth;
    let h = box.clientHeight;
    renderer.setSize(w, h);
	camera.aspect = w/h;
	camera.updateProjectionMatrix();
}
document.getElementById("S2").appendChild( renderer.domElement );

const directionalLight = new THREE.DirectionalLight( 0x0000ff, 1 );
scene.add( directionalLight );

// Buffer 自定義紋理貼圖
const pG = new THREE.BufferGeometry;
pG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
function getPointsMaterial(size = 1, map = null){
	let material = new THREE.PointsMaterial({
		size,
		map,
		color: 0xffffff,
		transparent: true
	});
	// if(map) material.map = map;
	return material;
}
function makePM(size, map){
	const pM = new THREE.Points(pG, getPointsMaterial(size, map));
	return pM;
}

function makeBall(radius = 15, w = 32, h = 16, size = 0.005, color = 0xffff00){
    const geometry = new THREE.SphereGeometry( radius, w, h ); 
    // const material = new THREE.MeshBasicMaterial( { color } ); 
    // const sphere = new THREE.Mesh( geometry, material );
    let material = new THREE.PointsMaterial( { size ,color } );
    let sphere = new THREE.Points( geometry, material );
	// sphere.scale(scale,scale);
    return sphere;
}
function makeCone(color = 0xffaadd){
    const geometry = new THREE.ConeGeometry( 1, 2, 16 ); 
    const material = new THREE.MeshBasicMaterial( {color} );
    const cone = new THREE.Mesh(geometry, material );
    return cone;
}
function makeCube(color = 0xAABBCC){
    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    let material = new THREE.PointsMaterial({
		size: 0.5 ,
		color,
		map: leaf,
		transparent: true
	 } );
    let cube = new THREE.Points( geometry, material );
    return cube;
}
function makeParticle(x,y,z,color = 0xAABBCC){
    let geometry = new THREE.BufferGeometry(x,y,z);
	// geometry.setAttribute('position')
    let material = new THREE.PointsMaterial( { color } );
    let particle = new THREE.Points( geometry, material );
    return particle;
}
window.THREE = THREE;
window.scene = scene;
window.camera = camera;
window.renderer = renderer;

const clock = new THREE.Clock();
window.clock = clock;
clock.fps = 0;
function animate() {
	// clock.fps = 1 / clock.getDelta();
	frame.updateValue(clock.getDelta());
	frame.getFPS();
	
	// tree.updatePosition();

	renderer.render( scene, camera );
	request.renderS2.ID = requestAnimationFrame(animate);
}
request.renderS2.method = animate;

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
window.frame = new Averager(120);
const UI = gui.addFolder('UI');
UI.open();
UI.add(frame, 'fps',0, 120, 0.1).listen().name("FPS");

let radius = 200;

// 粒子系統
{
	let mouseOn = false;
	let transform = true;
    // simulatior();
	function simulatior(){
		data.forEach(particle => {
			particle.setMotion("auto");
			particle.setTexture();
		});
		request.updateS2.ID = requestAnimationFrame(simulatior);
	}
	request.updateS2.method = simulatior;

	// 初始化粒子
	const Particle = function(maxDistance = 200){
		// 平均散布演算法
		let mid = 1;
		let pow = 2;
		let max = 1 + Math.pow(mid, pow);
		let minus1 = Math.pow(getRandomFloat(mid, 1), pow);
		let minus2 = Math.pow(getRandomFloat(0, mid), pow);
		function getRandomFloat(min, max) {
			return Math.random() * (max*100 - min*100 + 1)/100 + min;
		}

		// 建構式
		this.transitionRadian = 0;
		this.trasitionOmega = Math.PI / 10000;
		this.speed = 20;
		this.distance = (max - minus1 - minus2) * maxDistance;
		this.radian = getRandomFloat(0, Math.PI * 2);
		this.x = this.distance * Math.cos(this.radian);
		this.y = this.distance * Math.sin(this.radian);
		this.mesh = new makePM(maxDistance / 300);
		// this.fakeX = 0;
		// this.fakeY = 0;
		this.fakeX = this.x;
		this.fakeY = this.y;

		// 動畫
		this.setMotion = function(type = "auto"){
			// 沿著中心點旋轉
			const rad = this.transitionRadian;
			const f1 = Math.cos(rad)*Math.sin(rad);
			const f2 = Math.sin(rad);
			const f3 = Math.sin(rad*2);
			let d = this.distance/2;
			if(transform) d = this.distance / 3 * (0.25 + 0.75 * (1 - f3));
			let w1 = d * f1 * 0.1;
			let w2 = d * f2 * 0.1;

			this.radian+= Math.PI / 1000;
			this.x-= this.fakeX;
			this.y-= this.fakeY;
			this.fakeX = d * Math.cos(this.radian + w1);
			this.fakeY = d * Math.sin(this.radian + w2);
			this.x+= this.fakeX;
			this.y+= this.fakeY;
			this.z = Math.sqrt(maxDistance*maxDistance - this.x*this.x -this.y*this.y);
			// this.z = d * (Math.cos(this.radian + w2) * Math.sin(this.radian + w1));
			this.mesh.position.set(this.x, this.y, this.z);
		}
		this.setTexture = function(){
			let blue = (this.y + maxDistance)/maxDistance/2;
			let green = (this.x + maxDistance)/maxDistance/2;
			let red = Math.sin(this.transitionRadian);
			this.mesh.material.color.setRGB(red, green, blue);

			let ex = this.x / board.width;
			let ey = this.y / board.height;
			let alpha = 0.5;
			let beta = 1;
			let gamma = 0.5;
			let delta = 1;
			let dlength = 0.1;
			let dx = equation1(ex, ey) * board.width;
			let dy = equation2(ex, ey) * board.height;

            // particles[i].mesh.position.x = x * 0.1;
            // particles[i].mesh.position.y = y * 0.1;
            // particles[i].mesh.rotation.x = x * 0.01 + transitionRadian;
            // particles[i].mesh.rotation.y = y * 0.01 + transitionRadian;
			
			this.transitionRadian += this.trasitionOmega * this.speed;

			function equation1(x, y){
				if(mouseOn){
					let ratio = (myMouse.pointY > 0.2) ? myMouse.pointY : 0.2;
					return alpha * x - (1 / ratio * alpha * x * y);
				}
				else return alpha * x - (beta * x * y);
			}

			function equation2(x, y){
				if(mouseOn){
					let ratio = (myMouse.pointX > 0.2) ? myMouse.pointX : 0.2;
					return (1 / ratio * gamma * x * y) -  gamma * y;
				}
				else return (delta * x * y) -  gamma * y;
			}
		}
	}
    camera.position.set(0,0,radius*2);
	window.data = new Array(5000).fill().map(() => {return new Particle(radius)});
	window.dG = new THREE.Group();
	scene.add(dG);
	data.forEach(particle => dG.add(particle.mesh));
	dG.add(makeBall(radius, 30, 15, radius/500));
	const LP = gui.addFolder('Lokva Paticle');
	LP.open();
	LP.add(dG.position, 'x', -radius, radius, 0.01).name("position X");
	LP.add(dG.position, 'y', -radius, radius, 0.01).name("position Y");
	LP.add(dG.position, 'z', -radius, radius, 0.01).name("position Z");
	LP.add(dG.rotation, 'x', -Math.PI, Math.PI, 0.01).name("rotation X");
	LP.add(dG.rotation, 'y', -Math.PI, Math.PI, 0.01).name("rotation Y");
	LP.add(dG.rotation, 'z', -Math.PI, Math.PI, 0.01).name("rotation Z");
	
	
}

// Binary Tree

let images = {
	'leaf1': {'url':'assets/leaf2Side.png'},
	'leaf2': {'url':'assets/leaf3Side.png'},
	'leaf3': {'url':'assets/leaf4Side.png'}
}

const getAllUrl = (images) => {
	let url = [];
	for(let key in images){
		url.push(images[key].url);
	}
	return url;
}
let url = getAllUrl(images);

const getTexture = (url) => {
	return new Promise((res) =>{
		new THREE.TextureLoader().load(url, res)
	}).then((texture) => {
		// texture.center = new THREE.Vector2(0.5, 0.5);
		// texture.rotation = Math.PI / 4 * 3;
		return texture;
	})
}
Promise.all([getTexture(url[0]), getTexture(url[1]), getTexture(url[2])]).then(imageList => {
	function rotate3D(vector, roll, pitch, yaw) {
		let cosa = Math.cos(yaw);
		let sina = Math.sin(yaw);
	
		let cosb = Math.cos(pitch);
		let sinb = Math.sin(pitch);
	
		let cosc = Math.cos(roll);
		let sinc = Math.sin(roll);
	
		let Axx = cosa*cosb;
		let Axy = cosa*sinb*sinc - sina*cosc;
		let Axz = cosa*sinb*cosc + sina*sinc;
	
		let Ayx = sina*cosb;
		let Ayy = sina*sinb*sinc + cosa*cosc;
		let Ayz = sina*sinb*cosc - cosa*sinc;
	
		let Azx = -sinb;
		let Azy = cosb*sinc;
		let Azz = cosb*cosc;
	
		let px = vector.x;
		let py = vector.y;
		let pz = vector.z;
	
		vector.x = Axx*px + Axy*py + Axz*pz;
		vector.y = Ayx*px + Ayy*py + Ayz*pz;
		vector.z = Azx*px + Azy*py + Azz*pz;
		return vector;
		// for (let i = 0; i < vector.length; i++) {
		// 	let px = vector[i].x;
		// 	let py = vector[i].y;
		// 	let pz = vector[i].z;
	
		// 	vector[i].x = Axx*px + Axy*py + Axz*pz;
		// 	vector[i].y = Ayx*px + Ayy*py + Ayz*pz;
		// 	vector[i].z = Azx*px + Azy*py + Azz*pz;
		// }
	}
	class TreeNode{
		#pos = new THREE.Vector3();
		#vec = new THREE.Vector3(0, 0, 0);
		#rot;
		#size;
		// #desize;
		#father;
		#child = [];
		constructor(pos, rot, size, father, isLast){
			this.#pos = pos;
			this.#vec.y = size;
			this.#rot = rot;
			this.#size = size;
			this.#father = father;
			if(this.#father){
				const material = new THREE.LineBasicMaterial( { color: 0x703220 } );
				let p = new THREE.Vector3(pos.x, pos.y, pos.z);
				let fp = this.#father.#pos;
				let p2 = new THREE.Vector3(fp.x, fp.y, fp.z);
				const geometry = new THREE.BufferGeometry().setFromPoints([p, p2]);
				const line = new THREE.Line( geometry, material );
				this.mesh = line;
				treeGroup.add(this.mesh);
				if(isLast){
					for(let N = 0; N < 5; N++){
						let leafMesh = makePM(5, imageList[Math.floor(Math.random()*3)]);
						let dp = p2.clone().sub(p);
						let lp = p.clone().add(dp.multiplyScalar(N/10));
						leafMesh.position.set(lp.x,lp.y,lp.z);
						this.mesh.add(leafMesh);
					}
				}
			}
		}
		forEachChild(callback){
			this.getFlatNodes().forEach((node, index, array) => {
				callback(node, index, array);
			});
		}
		updatePosition(){
			this.forEachChild((node) => {
				if(node.#father){
					let pos = node.#pos;
					let fpos = node.#father.#pos;
					let p = new THREE.Vector3(pos.x, pos.y, pos.z);
					let p2 = new THREE.Vector3(fpos.x, fpos.y, fpos.z);
					if(node.mesh.type == 'line') node.mesh.geometry.setFromPoints([p, p2]);
					// if(node.mesh)node.mesh.position.set(p.x, p.y, p.z);
				}
			});
		}
		addChildNode(birth, angle, generation, mutation, root){
			if(generation > 0)
				for(let N = 0; N < birth; N++){
					let tValue = (N + Math.random()) / birth;
					// tValue = 1;
					// let p = {'x': this.#pos.x + tValue * this.#size * Math.cos(this.#rot),
					// 		'y': this.#pos.y + tValue * this.#size * Math.sin(this.#rot),
					// 		'z': 0}
					let r = this.#rot + (N+1) / birth * (angle - 2 * angle * Math.random());
					let s = this.#size * (generation - Math.random()) / generation;
					let roll = 0;
					let pitch = 0;
					let yaw = this.#rot;
					let v = this.#vec;
					p = new THREE.Vector3(this.#pos.x, this.#pos.y, this.#pos.z);
					p.add(rotate3D(v.clone(), roll, pitch, yaw));
					this.#child[N] = new TreeNode(p, r, s, this, generation < 2 ? true : false);

					let getMutation = () => {return ((mutation > Math.random()) ? 1 : 0) + ((mutation > Math.random()) ? -1 : 0)}
					let b = birth + getMutation();
					let a = angle + Math.PI * 0.1 * getMutation();
					let g = (generation - 1) + birth - b;
					let m = mutation + getMutation() * Math.random();
					this.#child[N].addChildNode(b, a, g, m, root);
				}
		}
		getChildNodes(){
			let child = this.#child ?? [];
			let childNodes = [this];
			for(let N = 0; N < child.length; N++){
				childNodes.push(child[N].getChildNodes());
			}
			return childNodes;
		}
		getFlatNodes(){
			return this.getChildNodes().flat(Infinity);
		}
		getFather(){
			return this.#father;
		}
		getSibling(){
			return this.#father.#child;
		}
		getSize(){return this.#size;}
		getPosition(){return this.#pos;}
		getRotation(){return this.#rot;}
	}
	let x = 0, y = -radius, z = 0;
	let p = {x, y, z};
	let r = 0;
	let g = 4;
	let s = radius / (g-1);
	const treeGroup = new THREE.Group();
	// dG.add(treeGroup);
	window.tree = new TreeNode(p, r, s);
	tree.addChildNode(4, 0.3 * Math.PI, 5, 0.1);
	const BT = gui.addFolder('Binary Tree');
	BT.add(treeGroup.position, 'x', -radius, radius, 0.01).name("position X");
	BT.add(treeGroup.position, 'y', -radius, radius, 0.01).name("position Y");
	BT.add(treeGroup.position, 'z', -radius, radius, 0.01).name("position Z");
	BT.add(treeGroup.rotation, 'x', -Math.PI, Math.PI, 0.01).name("rotation X");
	BT.add(treeGroup.rotation, 'y', -Math.PI, Math.PI, 0.01).name("rotation Y");
	BT.add(treeGroup.rotation, 'z', -Math.PI, Math.PI, 0.01).name("rotation Z");
})