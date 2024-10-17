import {Path} from './path.js';
import * as THREE from 'three'
import * as CANNON from 'cannon';
import { SortAlgorithm, SortAlgorithmIterable } from './sortAlgorithm.js';

export default class ParticleSystem3D{
    #transitionRadian = 0;
    #trasitionOmega = Math.PI / 300;
    constructor(){
        this.sort = new SortAlgorithm();
        this.mesh = new THREE.Group();
        this.initCannon();

        const length = 64, maxHeight = 255, radius = 150, depth = 10;
        this.column = this.createColumn(length, maxHeight, radius, depth);
        this.mesh.add(this.column.mesh);

        // this.walls = [];
        // this.balls = [];

        // const x = 500, y = 500, z = 500;
        // this.rects = [
        //     // 底部邊界 (xy 平面，z = 0)
        //     {'left': 0, 'top': 0, 'right': x, 'bottom': y, 'front': 0, 'back': 0},
            
        //     // 頂部邊界 (xy 平面，z = z)
        //     {'left': 0, 'top': 0, 'right': x, 'bottom': y, 'front': z, 'back': z},
        
        //     // 左側邊界 (yz 平面，x = 0)
        //     {'left': 0, 'top': 0, 'right': 0, 'bottom': y, 'front': 0, 'back': z},
        
        //     // 右側邊界 (yz 平面，x = x)
        //     {'left': x, 'top': 0, 'right': x, 'bottom': y, 'front': 0, 'back': z},
        
        //     // 前側邊界 (xz 平面，y = 0)
        //     {'left': 0, 'top': 0, 'right': x, 'bottom': 0, 'front': 0, 'back': z},
        
        //     // 後側邊界 (xz 平面，y = y)
        //     {'left': 0, 'top': y, 'right': x, 'bottom': y, 'front': 0, 'back': z}
        // ];
    }
    createFloor(size, position){
        const floorGeometry = new THREE.PlaneGeometry(size, size); // 設定地板大小
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x75cdff, // 白色
            transparent: true,
            opacity: 0.3,
            metalness: 0.5, // 增加金屬感
            roughness: 0.1 // 調整粗糙度
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.copy(position || new THREE.Vector3(0, 0, 0));
        floor.rotation.x = -Math.PI / 2; // 使地板平行於地面
        this.mesh.add(floor);
        return floor;
    }
    initCannon(){
        // 初始化 Cannon.js 物理世界
        this.world = new CANNON.World();;
        this.world.gravity.set(0, -9.82 * 10, 0);

        this.groundMaterial = new CANNON.Material();
        this.sphereMaterial = new CANNON.Material();

        // this.groundMaterial.friction = 0; // 無摩擦
        // this.groundMaterial.restitution = 1; // 完全彈性
        // this.sphereMaterial.friction = 0;
        // this.sphereMaterial.restitution = 1;

        const contactMaterial = new CANNON.ContactMaterial(this.sphereMaterial, this.groundMaterial, {
            friction: 0.1, // 低摩擦
            restitution: 0.95, // 彈性
        });
        this.world.addContactMaterial(contactMaterial);

        const groundBody = new CANNON.Body({
            mass: 0, // 靜態物體
            material: this.groundMaterial,
            shape: new CANNON.Plane(),
            collisionFilterGroup: 2, // 所屬組為 2
            collisionFilterMask: 1,  // 只與其他組碰撞，不與同一組的物體碰撞
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);
        this.createFloor(10000);

        this.spheres = [];
        for (let i = 0; i < 200; i++) {
            const r = 100 * Math.sqrt(Math.random()); // 隨機半徑
            const theta = Math.random() * 2 * Math.PI; // 隨機極角
            const phi = Math.acos(2 * Math.random() - 1); // 隨機方位角

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = 100 + r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            const radius = 5;
            // const x = (i - 100 + Math.random() - 0.5) * radius ;
            // const y = (i - 100 + Math.random() - 0.5) * radius ;
            // const z = (20 * Math.random() + 10) * radius ;
            const position = new THREE.Vector3(x, y, z);
            this.spheres.push(this.createSphere(radius, position));
        }
    }
    createSphere(radius, position) {
        // Three.js 球體
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x5ba6d2, 
            emissive: 0xd581d2,
            roughness: 0.5,
            metalness: 0.3
        });
        const sphereMesh = new THREE.Mesh(geometry, material);
        sphereMesh.position.copy(position);
        this.mesh.add(sphereMesh);

        // Cannon.js 球體
        const sphereBody = new CANNON.Body({
            mass: 1, // 動態物體
            shape: new CANNON.Sphere(radius),
            material: this.sphereMaterial,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            collisionFilterGroup: 1, // 所屬組為 2
            collisionFilterMask: 2 | 1,
        });
        this.world.addBody(sphereBody);
        
        return { mesh: sphereMesh, body: sphereBody };
    }
    getMesh(){
        return this.mesh;
    }
    getSortData(){
        return this.column.geometryData;
    }
    setParameter = (id, value) => {
        const {length, maxHeight} = this.column;
        switch(id){
            case "length":
                this.expandVertices(this.column, value, maxHeight);
                break;
            case "maxHeight":
                this.expandVertices(this.column, length, value);
                break;
            default :
                this.column[id] = value;
                this.expandVertices(this.column, length, maxHeight);
                // const {radius} = this.column;
                // column.geometryData.forEach((data, index) =>{
                //     data.x = 
                //     this.column.updateVertices(index);
                // })
                // for(let N = 0; N < this.column.length; N++){
                //     this.column.updateVertices(N);
                // }
        }
    }
    expandVertices(column, newLength, newMaxHeight){
        const {length, radius, maxHeight} = column;
        const vertices = column.geometry.attributes.position.array;
        const color = column.geometry.attributes.color.array;
        const len = vertices.length;

        const newVertices = new Float32Array(newLength * 36 * 3);
        const colorVertices = new Float32Array(newLength * 36 * 3);
        for(let N = 0; N < newLength * 36 * 3 && N < len; N ++){
            newVertices[N] = vertices[N];
            colorVertices[N] = color[N];
        }

        const attribute = new THREE.BufferAttribute(newVertices, 3);
        const colorAttribute = new THREE.BufferAttribute(colorVertices, 3);
        column.geometry.setAttribute('position', attribute);
        column.geometry.setAttribute('color', colorAttribute);

        column.length = newLength;
        column.maxHeight = newMaxHeight;
        // 2. 更新原有的幾何資料和頂點
        for(let N = 0; N < length; N++){
            if(N >= newLength){
                // 如果變短，刪除多餘的幾何資料
                column.geometryData.pop();
                continue;
            }
            const data = column.geometryData[N];
            const angle = (N / newLength) * Math.PI * 2; 
            data.x = radius * Math.cos(angle);
            data.y = radius * Math.sin(angle);
            data.height = data.height * length / newLength;
            if(data.height > maxHeight) data.height = maxHeight;
            data.height*= newMaxHeight / maxHeight;
            data.path.ResetTo(data.x, data.y);
            // data.path.NewTarget(data.x, data.y, 30);
            column.updateVertices(N);
        }
        // 如果新長度較長，迭代建立新的幾何資料
        for(let N = length; N < newLength; N++){
            column.geometryData[N] = this.createGeometryData(column, N);
            const data = column.geometryData[N];
            data.path.ResetTo(data.x, data.y);
            // data.path.NewTarget(data.x, data.y, 30);
            column.updateVertices(N);
        }
    }
    // 建立 3D 實體和幾何體
    createColumn(length, maxHeight, radius, depth){

        const column = {length, maxHeight, radius, depth};
        Object.defineProperty(column, 'unitHeight', {
            get() {
                return column.maxHeight / column.length;
            }
        }); 

        const attribute = new THREE.BufferAttribute(new Float32Array(length * 36 * 3), 3);
        const colorAttribute = new THREE.BufferAttribute(new Float32Array(length * 36 * 3), 3);
        column.geometry = new THREE.BufferGeometry();
        column.geometry.setAttribute('position', attribute);
        column.geometry.setAttribute('color', colorAttribute);
        
        const material = new THREE.MeshBasicMaterial({ 'vertexColors': true });
        column.mesh = new THREE.Mesh( column.geometry, material ); 

        // column.body = new Array(length).fill().map(() =>{
        //     const body = new CANNON.Body({
        //         mass: 0, // 靜態物體
        //         material: this.groundMaterial,
        //         collisionFilterGroup: 2, // 所屬組為 1
        //         collisionFilterMask: 1,  // 只與其他組碰撞，不與同一組的物體碰撞
        //     })
        //     this.world.addBody(body);
        //     return body;
        // });
        // column.box = new Array(length).fill().map(() =>{
        //     const geometry = new THREE.BoxGeometry(10, 100, 10);
        //     console.log(geometry);
        //     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        //     const box = new THREE.Mesh(geometry, material);
        //     this.mesh.add(box)
        //     return box;
        // });

        // column.body = new CANNON.Body({
        //     mass: 0, // 靜態物體
        //     material: this.groundMaterial,
        //     collisionFilterGroup: 2, // 所屬組為 1
        //     collisionFilterMask: 1,  // 只與其他組碰撞，不與同一組的物體碰撞
        // });
        // this.world.add(column.body);

        column.updateVertices = (index) => {
            const startAngle = (index / column.length) * Math.PI * 2;
            const endAngle = ((index + 1) / column.length) * Math.PI * 2;
            const height = column.geometryData[index].height;
            const path = column.geometryData[index].path;
            const {pointX, pointY, z, timer, period} = path;
            const x = pointX - z * Math.cos(startAngle);
            const y = pointY - z * Math.sin(startAngle);
            
            const transition = 1 - timer / period;
            const [newVertices, colorVertices, shape] = this.getColumnVerticesByAngle(
                x, y, z * 0.1, 
                column.radius, column.depth, 
                height, column.unitHeight, 
                startAngle, endAngle, transition
            );
            // const w = column.depth;
            // const h = height;
            // const d = 2 * Math.PI * column.radius / column.length;
            // const newBoxShape = new CANNON.Box(new CANNON.Vec3(w, h, d));
            // column.body[index].shape = [];
            // column.body[index].addShape(newBoxShape);
            // column.body[index].position.set(x , z * 0.1 + h / 2, y);
            // column.body[index].quaternion.setFromEuler(0, -startAngle + Math.PI / 2, 0);

            // const geometry = new THREE.BoxGeometry(w, h, d);
            // column.box[index].geometry.dispose();
            // column.box[index].geometry = geometry;
            // column.box[index].position.copy(column.body[index].position);
            // column.box[index].quaternion.copy(column.body[index].quaternion);

            // column.body.shape = [];
            // column.body.addShape(shape);

            const cubeVertexCount = 36;
            const vertexIndex = index * cubeVertexCount * 3; 

            const vertices = column.geometry.attributes.position.array;
            const color = column.geometry.attributes.color.array;
            for(let N = 0; N < cubeVertexCount * 3; N ++){
                vertices[vertexIndex + N] = newVertices[N];
            }
            for(let N = 0; N < cubeVertexCount * 3; N ++){
                color[vertexIndex + N] = colorVertices[N];
            }

            column.geometry.attributes.position.needsUpdate = true;
            column.geometry.attributes.color.needsUpdate = true;
        }

        column.geometryData = new Array(length).fill().map((v, index) => {
            return this.createGeometryData(column, index);
        });
        column.geometryData.forEach((data, index) => {
            column.updateVertices(index);
        })

        return column;
    }
    createGeometryData(column, index){
        const {length, radius, unitHeight} = column;
        // const x = index * width;
        const angle = (index / length) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const height = (index + 1) * unitHeight;
        const path = new Path(x, y);
        const geometryData = {x, y, height, path};

        // 初始化內部變數
        let _timer = path.timer;
        Object.defineProperty(path, 'timer', {
            get() {
                return _timer;
            },
            set(newT) {
                _timer = newT;
                column.updateVertices(index);
            }
        });
        // let _pointX = path.pointX;
        // let _pointY = path.pointY;
        // let isUpdating = false;
        // Object.defineProperty(path, 'pointX', {
        //     get() {
        //         return _pointX;
        //     },
        //     set(newX) {
        //         if (_pointX !== newX) {
        //             _pointX = newX;
        //             if (isUpdating) return; // 如果正在更新，則直接返回
        //             isUpdating = true; // 設置為正在更新
        //             requestAnimationFrame(() => {
        //                 column.updateVertices(index);
        //                 isUpdating = false; // 更新結束
        //             });
        //         }
        //     }
        // });
        // Object.defineProperty(path, 'pointY', {
        //     get() {
        //         return _pointY;
        //     },
        //     set(newY) {
        //         if (_pointY !== newY) {
        //             _pointY = newY;
        //             if (isUpdating) return; // 如果正在更新，則直接返回
        //             isUpdating = true; // 設置為正在更新
        //             requestAnimationFrame(() => {
        //                 column.updateVertices(index);
        //                 isUpdating = false; // 更新結束
        //             });
        //         }
        //     }
        // });

        return geometryData;
    }
    // 幾何體頂點計算
    // getVector(N, width, height, depth){
    //     // if(height < 1) continue;
    //     const vector = new Float32Array(24 * 3);
        
    //     let idx = 0;
    //     const push = (x, y, z) => {
    //         vector[idx++] = x;
    //         vector[idx++] = y;
    //         vector[idx++] = z;
    //     }
    //     const push1 = () => { push(width * N    , 0     , depth) };
    //     const push2 = () => { push(width * (N+1), 0     , depth) };
    //     const push3 = () => { push(width * (N+1), height, depth) };
    //     const push4 = () => { push(width * N    , height, depth) };
    //     const push5 = () => { push(width * N    , 0     , 0) };
    //     const push6 = () => { push(width * N    , height, 0) };
    //     const push7 = () => { push(width * (N+1), height, 0) };
    //     const push8 = () => { push(width * (N+1), 0     , 0) };
    //     // 正面
    //     push1();
    //     push2();
    //     push3();
    //     push4(); 
        
    //     // 背面
    //     push5();
    //     push6();
    //     push7();
    //     push8(); 

    //     // 左面
    //     push1();
    //     push4();
    //     push6();
    //     push5();
        
    //     // 右面
    //     push2();
    //     push8();
    //     push7();
    //     push3();
        
    //     // 上面
    //     push3();
    //     push7();
    //     push6();
    //     push4(); 
        
    //     // 下面
    //     push1();
    //     push5();
    //     push8();
    //     push2(); 
        
    //     return vector;
    // }
    // getPosition(data, width = 2, depth = 2){
    //     const vectors = new Array(data.length);
    //     for(let N = 0; N < data.length; N++){
    //         const height = data[N];
    //         vectors[N] = this.getVector(N, width, height, depth);  // 將填充完的 vector 插入 vectors 陣列
    //     }
    //     return vectors;
    // }
    // getVertices(vector, totalFace = 6, totalPoint = 4){
    //     const totalFrament = totalPoint - 2;
    //     const verticesCount = vector.length * totalFace * totalFrament * 3 * 3;  // 每個立方體 108 個頂點數據 (6 面 * 2 三角形/面 * 3 頂點/三角形 * 3 座標/頂點)
    //     const vertices = new Float32Array(verticesCount);
    //     let index = 0;
    //     for(let M = 0; M < vector.length; M++){
    //         // 每個立方體有 6 個面，每個面有 4 個頂點 (共 24 個頂點)
    //         for(let face = 0; face < totalFace; face++){
    //             const baseIndex = face * totalPoint * 3;  // 每個面的起始索引
    //             for(let N = 0; N < 3 * totalFrament; N+=3){
    //                 vertices[index++] = vector[M][baseIndex];      // 第 0 點的 x
    //                 vertices[index++] = vector[M][baseIndex + 1];  // 第 0 點的 y
    //                 vertices[index++] = vector[M][baseIndex + 2];  // 第 0 點的 z

    //                 vertices[index++] = vector[M][baseIndex + 3 + N];  // 第 N+1 點的 x
    //                 vertices[index++] = vector[M][baseIndex + 4 + N];  // 第 N+1 點的 y
    //                 vertices[index++] = vector[M][baseIndex + 5 + N];  // 第 N+1 點的 z

    //                 vertices[index++] = vector[M][baseIndex + 6 + N];  // 第 N+2 點的 x
    //                 vertices[index++] = vector[M][baseIndex + 7 + N];  // 第 N+2 點的 y
    //                 vertices[index++] = vector[M][baseIndex + 8 + N];  // 第 N+2 點的 z
    //             }
    //         }
    //     }
    //     return vertices;
    // }
    // getColorVertices(data, vertices){
    //     // data.length * 36 * 3
    //     const colorVertices = new Float32Array(vertices.length);
    //     let colorIndex = 0;
    //     const width = 2;
    //     for (let i = 0; i < data.length; i++) {
    //         const value = data[i];
            
    //         const tran = Math.sin(this.#transitionRadian);
    //         // 計算每個立方體的顏色
    //         const r = 0.200 + value / 255 * (0.816 - 0.200);
    //         const g = 0.329 + value / 255 * (0.590 - 0.329) * tran;
    //         const b = 0.584 + value / 255 * (0.949 - 0.584);

    //         // 為每個立方體的 36 個頂點賦予相同的顏色
    //         for (let j = 0; j < 36; j++) {
    //             // 立方體的左側 18 個頂點
    //             const x = vertices[i * 36 * 3 + j * 3];
    //             const y = vertices[i * 36 * 3 + j * 3 + 1];
    //             const z = vertices[i * 36 * 3 + j * 3 + 2];
    //             const isLeft = (x == i * width);
    //             const isTop = (y == value);
    //             const t = isLeft ? 1 : 0;
    //             const t2 = isTop ? 1 : 0;

    //             const R = r + (t + t2) / 2 * (0.816 - r);
    //             const G = g + (t + t2) / 2 * (0.590 - g) * tran;
    //             const B = b + (t + t2) / 2 * (0.949 - b);

    //             colorVertices[colorIndex++] = B;  // B
    //             colorVertices[colorIndex++] = R;  // R
    //             colorVertices[colorIndex++] = G;  // G
    //         }
    //     }
    //     return colorVertices;
    // }

    getColumnAttribute(){
        const totalVertices = length * 36; // 每個長方體有 36 個頂點
        const attribute = new THREE.BufferAttribute(new Float32Array(totalVertices), 3);
    
        for (let i = 0; i < length; i++) {
            const height = i + 1; // 高度從 1 開始遞增
            // 計算長方體的頂點
            const vertexIndex = i * 36;
    
            // 定義長方體的八個頂點
            const x = i * width; // 根據索引排列長方體
            const y = 0;
            const z = 0;
    
            // 八個頂點
            const vertices = [
                // 前面
                x,         y,         z,
                x + width, y,         z,
                x + width, y + height, z,
                x,         y + height, z,
                // 後面
                x,         y,         z + depth,
                x + width, y,         z + depth,
                x + width, y + height, z + depth,
                x,         y + height, z + depth,
            ];
    
            // 將長方體的頂點資料填入 attribute 中
            attribute.array.set(vertices, vertexIndex);
        }
    
        return attribute;
    }
    getColumnVertices(x, y, z, width, height, depth){
        const vertices = new Float32Array(36 * 3);
        let idx = 0;
        const push = (x, y, z) => {
            vertices[idx++] = x;
            vertices[idx++] = y;
            vertices[idx++] = z;
        }
        const addPoint = {};
        addPoint[1] = () => { push(x + 0    , y + 0     , z + depth) };
        addPoint[2] = () => { push(x + width, y + 0     , z + depth) };
        addPoint[3] = () => { push(x + width, y + height, z + depth) };
        addPoint[4] = () => { push(x + 0    , y + height, z + depth) };
        addPoint[5] = () => { push(x + 0    , y + 0     , z + 0) };
        addPoint[6] = () => { push(x + 0    , y + height, z + 0) };
        addPoint[7] = () => { push(x + width, y + height, z + 0) };
        addPoint[8] = () => { push(x + width, y + 0     , z + 0) };

        const indices = new Uint8Array([
            // 前面
            1, 2, 3,
            1, 3, 4,
            // 後面
            5, 6, 7,
            5, 7, 8,
            // 左面
            1, 4, 6,
            1, 6, 5,
            // 右面
            2, 8, 7,
            2, 7, 3,
            // 上面
            3, 7, 6,
            3, 6, 4,
            // 下面
            1, 5, 8,
            1, 8, 2
        ]);
        indices.forEach((point) => { addPoint[point]() })

        return vertices; // 返回長方體的 36 個頂點坐標
    }
    getColumnVerticesByAngle(centerX, centerZ, y, r, depth, height, unitHeight, startAngle, endAngle, transition) {
        const vertices = new Float32Array(36 * 3);
        let idx = 0;
        const push = (x, z, y) => {
            vertices[idx++] = x;
            vertices[idx++] = y;
            vertices[idx++] = z;
        }
        const getXY = (radius, angle) => {
            const x = centerX + radius * Math.cos(angle) - r * Math.cos(startAngle);
            const z = centerZ + radius * Math.sin(angle) - r * Math.sin(startAngle);
            return [x, z];
        }
        const [x1, z1] = getXY(r - depth, startAngle);
        const [x2, z2] = getXY(r - depth, endAngle);
        const [x3, z3] = getXY(r, endAngle);
        const [x4, z4] = getXY(r, startAngle);

        const addPoint = {};
        const h = unitHeight / 2; 
        addPoint[1] = () => { push(x1, z1, y + height - h + 10) }; // 上面左側
        addPoint[2] = () => { push(x2, z2, y + height + h + 10) }; // 上面右側
        addPoint[3] = () => { push(x3, z3, y + height + h) }; // 上面右側外側
        addPoint[4] = () => { push(x4, z4, y + height - h) }; // 上面左側外側
        addPoint[5] = () => { push(x1, z1, y) }; // 下面左側
        addPoint[6] = () => { push(x4, z4, y) }; // 下面左側外側
        addPoint[7] = () => { push(x3, z3, y) }; // 下面右側外側
        addPoint[8] = () => { push(x2, z2, y) }; // 下面右側

        let idx2 = 0;
        const colorVertices = new Float32Array(36 * 3);
        const pushBRG = (x, y, z) => {
            colorVertices[idx2++] = x;
            colorVertices[idx2++] = y;
            colorVertices[idx2++] = z;
        }
        const tran = Math.sin(this.#transitionRadian);
        // 計算每個立方體的顏色
        const r1 = 0.200 + height / 255 * (0.816 - 0.200);
        const g1 = 0.329 + height / 255 * (0.590 - 0.329) * tran;
        const b1 = 0.584 + height / 255 * (0.949 - 0.584);

        const r2 = 0.200 + transition * (0.816 - 0.200);
        const g2 = 0.329 + transition * (0.590 - 0.329);
        const b2 = 0.584 + transition * (0.949 - 0.584);

        const addColor = {};
        addColor[1] = () => { pushBRG(b2, r2, g2) }; // 上面左側
        addColor[2] = () => { pushBRG(b1, r1, g1) }; // 上面右側
        addColor[3] = () => { pushBRG(b1, r1, g1) }; // 上面右側外側
        addColor[4] = () => { pushBRG(b1, r1, g1) }; // 上面左側外側
        addColor[5] = () => { pushBRG(b2, r2, g2) }; // 下面左側
        addColor[6] = () => { pushBRG(b2, r2, g2) }; // 下面左側外側
        addColor[7] = () => { pushBRG(b1, r1, g1) }; // 下面右側外側
        addColor[8] = () => { pushBRG(b2, r2, g2) }; // 下面右側

        const indices = new Uint8Array([
            // 前面
            1, 2, 3,
            1, 3, 4,
            // 後面
            5, 6, 7,
            5, 7, 8,
            // 左面
            1, 4, 6,
            1, 6, 5,
            // 右面
            2, 8, 7,
            2, 7, 3,
            // 上面
            3, 7, 6,
            3, 6, 4,
            // 下面
            1, 5, 8,
            1, 8, 2
        ]);
        indices.forEach((point) => {
            addPoint[point]();
            addColor[point]();
        })
        
        // const cannonVertices = [
        //     new CANNON.Vec3(0, 0, 0),
        //     new CANNON.Vec3(x1, y + height - h + 10, z1), // 上面左側
        //     new CANNON.Vec3(x2, y + height + h + 10, z2), // 上面右側
        //     new CANNON.Vec3(x3, y + height + h, z3), // 上面右側外側
        //     new CANNON.Vec3(x4, y + height - h, z4), // 上面左側外側
        //     new CANNON.Vec3(x1, y, z1), // 下面左側
        //     new CANNON.Vec3(x4, y, z4), // 下面左側外側
        //     new CANNON.Vec3(x3, y, z3), // 下面右側外側
        //     new CANNON.Vec3(x2, y, z2), // 下面右側
        // ]
        // const faces = [
        //     [1,2,3,4],
        //     [5, 6, 7, 8],
        //     [1,4,6,5],
        //     [2,8,7,3],
        //     [3, 7, 6, 4],
        //     [1,5,8,2]
        // ];
        // const shape = new CANNON.ConvexPolyhedron(
        //     cannonVertices, 
        //     faces
        // );

        // 返回圓餅切片－長方體的 36 個頂點坐標、頂點顏色
        return [vertices, colorVertices];
    }
    

    // // 物理
    // getDist(a, b) {
    //     return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); // 包含 z 軸的距離計算
    // }
    
    // getCollide(target, wall) {
    //     if (wall.type === "arcBall") {
    //         const dist = this.getDist(target, wall); // 使用 getDist 計算距離
    //         const outerBound = wall.length + wall.thick;
    //         const innerBound = wall.length - wall.thick;
    
    //         // 確認目標是否在牆的厚度範圍內
    //         return (dist + target.r >= innerBound && dist <= outerBound) ? dist : 0; 
    //     }
    //     return 0;
    // }
    // handleBallCollision(ball, anotherBall, dist) {
    //     const x = (ball.x + anotherBall.x) / 2;
    //     const y = (ball.y + anotherBall.y) / 2;
    //     const z = (ball.z + anotherBall.z) / 2;
    
    //     // 更新球的位置以避免重疊
    //     ball.x = x + (ball.x - x) / (dist / 2) * ball.r;
    //     ball.y = y + (ball.y - y) / (dist / 2) * ball.r;
    //     ball.z = z + (ball.z - z) / (dist / 2) * ball.r;
    //     anotherBall.x = x + (anotherBall.x - x) / (dist / 2) * anotherBall.r;
    //     anotherBall.y = y + (anotherBall.y - y) / (dist / 2) * anotherBall.r;
    //     anotherBall.z = z + (anotherBall.z - z) / (dist / 2) * anotherBall.r;
    
    //     // 相對速度
    //     const vx = (ball.vx - anotherBall.vx) / 2;
    //     const vy = (ball.vy - anotherBall.vy) / 2;
    //     const vz = (ball.vz - anotherBall.vz) / 2;
    
    //     // 計算碰撞後的相對速度
    //     const angleXY = Math.atan2(ball.y - y, ball.x - x);
    //     const angleXZ = Math.atan2(ball.z - z, ball.x - x);
        
    //     // 計算沿著碰撞角度的法線和切線速度分量
    //     const vectorTXY = -vx * Math.sin(angleXY) + vy * Math.cos(angleXY);
    //     const vectorNXY = -1 * (vx * Math.cos(angleXY) + vy * Math.sin(angleXY));
    
    //     const vectorTXZ = -vx * Math.sin(angleXZ) + vz * Math.cos(angleXZ);
    //     const vectorNXZ = -1 * (vx * Math.cos(angleXZ) + vz * Math.sin(angleXZ));
    
    //     // 更新速度分量（X、Y、Z）
    //     const relativeVX = -vectorTXY * Math.sin(angleXY) + vectorNXY * Math.cos(angleXY);
    //     const relativeVY = vectorTXY * Math.cos(angleXY) + vectorNXY * Math.sin(angleXY);
    
    //     const relativeVZ = vectorTXZ * Math.cos(angleXZ) + vectorNXZ * Math.sin(angleXZ);
    
    //     const averageVx = (ball.vx + anotherBall.vx) / 2;
    //     const averageVy = (ball.vy + anotherBall.vy) / 2;
    //     const averageVz = (ball.vz + anotherBall.vz) / 2;
    
    //     ball.vx = (averageVx + relativeVX) * this.friction;
    //     ball.vy = (averageVy + relativeVY) * this.friction;
    //     ball.vz = (averageVz + relativeVZ) * this.friction;
    
    //     anotherBall.vx = (averageVx - relativeVX) * this.friction;
    //     anotherBall.vy = (averageVy - relativeVY) * this.friction;
    //     anotherBall.vz = (averageVz - relativeVZ) * this.friction;
    // }
    // handleWallCollision(ball, wall, dist) {
    //     // 計算牆壁圓周上距離球體最近的點
    //     const x = wall.x + (ball.x - wall.x) / dist * wall.length;
    //     const y = wall.y + (ball.y - wall.y) / dist * wall.length;
    //     const z = wall.z + (ball.z - wall.z) / dist * wall.length;
    
    //     // 計算碰撞點的角度 (XY 平面和 XZ 平面)
    //     const angleXY = Math.atan2(y - wall.y, x - wall.x);
    //     const angleXZ = Math.atan2(z - wall.z, x - wall.x);
    
    //     // 更新球體的位置，確保球體不會穿過牆壁
    //     const isInside = dist <= wall.length ? 1 : -1;
    //     ball.x = x + (ball.x - x) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
    //     ball.y = y + (ball.y - y) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
    //     ball.z = z + (ball.z - z) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
    
    //     // 計算反彈角度
    //     const vectorTXY = -ball.vx * Math.sin(angleXY) + ball.vy * Math.cos(angleXY);
    //     const vectorNXY = -1 * (ball.vx * Math.cos(angleXY) + ball.vy * Math.sin(angleXY));
    
    //     const vectorTXZ = -ball.vx * Math.sin(angleXZ) + ball.vz * Math.cos(angleXZ);
    //     const vectorNXZ = -1 * (ball.vx * Math.cos(angleXZ) + ball.vz * Math.sin(angleXZ));
    
    //     // 更新球體的速度
    //     ball.vx = (-vectorTXY * Math.sin(angleXY) + vectorNXY * Math.cos(angleXY)) * this.friction;
    //     ball.vy = (vectorTXY * Math.cos(angleXY) + vectorNXY * Math.sin(angleXY)) * this.friction;
    //     ball.vz = (vectorTXZ * Math.cos(angleXZ) + vectorNXZ * Math.sin(angleXZ)) * this.friction;
    // }
    // handleColumnCollision(ball, column) {
    //     const columnTop = column.path.pointY - column.height;
    //     const columnBottom = column.path.pointY;
    //     const columnLeft = column.path.pointX - column.width / 2;
    //     const columnRight = column.path.pointX + column.width / 2;
    //     const columnFront = column.path.pointZ - column.depth / 2; // Z 軸前
    //     const columnBack = column.path.pointZ + column.depth / 2;  // Z 軸後
    
    //     // 計算球體與柱子邊界的重疊量
    //     const overlapX = Math.min(ball.x + ball.r - columnLeft, columnRight - ball.x + ball.r);
    //     const overlapY = Math.min(ball.y + ball.r - columnTop, columnBottom - ball.y + ball.r);
    //     const overlapZ = Math.min(ball.z + ball.r - columnFront, columnBack - ball.z + ball.r);
        
    //     // 重疊量小於 0 表示沒有碰撞
    //     if (overlapX < 0 || overlapY < 0 || overlapZ < 0) return;
    
    //     // 確定碰撞位置並計算反彈
    //     if (overlapX < overlapY && overlapX < overlapZ) {
    //         // 碰撞發生在左右兩側
    //         ball.vx = -ball.vx * this.friction;
    //         if (ball.x < column.path.pointX) {
    //             ball.x = columnLeft - ball.r;
    //         } else {
    //             ball.x = columnRight + ball.r;
    //         }
    //     } else if (overlapY < overlapX && overlapY < overlapZ) {
    //         // 碰撞發生在上下兩側
    //         ball.vy = -ball.vy * this.friction;
    //         if (ball.y < column.path.pointY) {
    //             ball.y = columnTop - ball.r;
    //         } else {
    //             ball.y = columnBottom + ball.r;
    //         }
    //     } else {
    //         // 碰撞發生在前後兩側 (Z 軸)
    //         ball.vz = -ball.vz * this.friction;
    //         if (ball.z < column.path.pointZ) {
    //             ball.z = columnFront - ball.r;
    //         } else {
    //             ball.z = columnBack + ball.r;
    //         }
    //     }
    // }
    // handleRectCollision(ball, rect) {
    //     if (ball.x + ball.r > rect.left && ball.x - ball.r < rect.right &&
    //         ball.y + ball.r > rect.top && ball.y - ball.r < rect.bottom &&
    //         ball.z + ball.r > rect.front && ball.z - ball.r < rect.back) {
            
    //         // 計算球體與長方體邊界的重疊量
    //         const overlapX = Math.min(ball.x + ball.r - rect.left, rect.right - ball.x + ball.r);
    //         const overlapY = Math.min(ball.y + ball.r - rect.top, rect.bottom - ball.y + ball.r);
    //         const overlapZ = Math.min(ball.z + ball.r - rect.front, rect.back - ball.z + ball.r);
            
    //         // 確定碰撞位置並計算反彈
    //         if (overlapX < overlapY && overlapX < overlapZ) {
    //             // 碰撞發生在左右兩側
    //             ball.vx = -ball.vx * this.friction;
    //             if (ball.x < (rect.left + rect.right) / 2) {
    //                 ball.x = rect.left - ball.r;
    //             } else {
    //                 ball.x = rect.right + ball.r;
    //             }
    //         } else if (overlapY < overlapX && overlapY < overlapZ) {
    //             // 碰撞發生在上下兩側
    //             ball.vy = -ball.vy * this.friction;
    //             if (ball.y < (rect.top + rect.bottom) / 2) {
    //                 ball.y = rect.top - ball.r;
    //             } else {
    //                 ball.y = rect.bottom + ball.r;
    //             }
    //         } else {
    //             // 碰撞發生在前後兩側 (Z 軸)
    //             ball.vz = -ball.vz * this.friction;
    //             if (ball.z < (rect.front + rect.back) / 2) {
    //                 ball.z = rect.front - ball.r;
    //             } else {
    //                 ball.z = rect.back + ball.r;
    //             }
    //         }
    //     }
    // }
    
    update(){
        this.#transitionRadian+= this.#trasitionOmega;
        this.sort.update(this.column.geometryData);

        this.world.step(1 / 60);

        // 同步 Three.js Mesh 與 Cannon.js Body
        this.spheres.forEach(({ mesh, body }) => {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        });
        // this.updateCannon();

        // this.walls.forEach((wall) =>{
        //     wall.period+= 0.25 *  2 * Math.PI / 60;
        //     wall.x = wall.centerX + wall.swing * Math.cos(wall.period);
        //     wall.y = wall.centerY + wall.swing * Math.sin(wall.period);
        // });
        // this.balls.forEach((ball) => {
        //     ball.x = (ball.x + ball.vx / 60);
        //     ball.y = (ball.y + ball.vy / 60);
        //     ball.vx = (ball.vx + ball.ax / 60) * this.slow;
        //     ball.vy = (ball.vy + ball.ay / 60) * this.slow;
        //     // 檢測與其他球體的碰撞
        //     this.balls.forEach((anotherBall) => {
        //         if (ball == anotherBall) return;
        //         const dist = this.getDist(ball, anotherBall);
        //         if (dist < ball.r + anotherBall.r) {
        //             this.handleBallCollision(ball, anotherBall, dist);
        //         }
        //     });

        //     // 檢測與牆壁的碰撞
        //     this.walls.forEach((wall) => {
        //         const dist = this.getCollide(ball, wall);
        //         if (dist > 0) {
        //             this.handleWallCollision(ball, wall, dist);
        //         }
        //     });

        //     // 檢測與柱子的碰撞
        //     this.columns.forEach((column) => {
        //         this.handleColumnCollision(ball, column);
        //     });
        //     this.sort.secondColumns.forEach((column) => {
        //         this.handleColumnCollision(ball, column);
        //     });
            
        //     //檢測與矩形的碰撞
        //     this.rects.forEach((rect) => {
        //         this.handleRectCollision(ball, rect);
        //     })
        // });
    }
    updateCannon(){
        const pos = this.column.geometry.attributes.position;
        const vertices = [];
        const faces = [];
        for (let i = 0; i < pos.array.length; i++) {
            const x = pos.array[i * 3];
            const y = pos.array[i * 3 + 1];
            const z = pos.array[i * 3 + 2];
            vertices[i] = new CANNON.Vec3(x, y, z);
        }
        for (let i = 0; i < pos.count / 3; i++) {
            faces[i] = [i * 3, i * 3 + 2, i * 3 + 1];
        }
        // 凸多面體
        const shape = new CANNON.ConvexPolyhedron( vertices, faces );
        this.column.body.shape = [];
        this.column.body.add(shape);
    }
}