import {Path} from './path.js';
import * as THREE from 'three'
import { SortAlgorithm, SortAlgorithmIterable } from './sortAlgorithm.js';

export default class ParticleSystem3D{
    #transitionRadian = 0;
    #trasitionOmega = Math.PI / 300;
    constructor(){
        this.sort = new SortAlgorithm();
        this.mesh = new THREE.Group();
        this.slow = 0.999;
        this.friction = 0.997;
        this.maxValue = 865*0.4;
        const length = 256, width = 2, height = 1;
        this.columns = this.createColumn(length, width, height);
        this.mesh.add(this.columns.mesh);
        this.walls = [];
        this.balls = [];

        const x = 500, y = 500, z = 500;
        this.rects = [
            // 底部邊界 (xy 平面，z = 0)
            {'left': 0, 'top': 0, 'right': x, 'bottom': y, 'front': 0, 'back': 0},
            
            // 頂部邊界 (xy 平面，z = z)
            {'left': 0, 'top': 0, 'right': x, 'bottom': y, 'front': z, 'back': z},
        
            // 左側邊界 (yz 平面，x = 0)
            {'left': 0, 'top': 0, 'right': 0, 'bottom': y, 'front': 0, 'back': z},
        
            // 右側邊界 (yz 平面，x = x)
            {'left': x, 'top': 0, 'right': x, 'bottom': y, 'front': 0, 'back': z},
        
            // 前側邊界 (xz 平面，y = 0)
            {'left': 0, 'top': 0, 'right': x, 'bottom': 0, 'front': 0, 'back': z},
        
            // 後側邊界 (xz 平面，y = y)
            {'left': 0, 'top': y, 'right': x, 'bottom': y, 'front': 0, 'back': z}
        ];
    }
    getMesh(){
        return this.mesh;
    }
    getSortData(){
        return this.columns.geometryData;
    }
    getVector(N, width, height, depth){
        // if(height < 1) continue;
        const vector = new Float32Array(24 * 3);
        
        let idx = 0;
        const push = (x, y, z) => {
            vector[idx++] = x;
            vector[idx++] = y;
            vector[idx++] = z;
        }
        const push1 = () => { push(width * N    , 0     , depth) };
        const push2 = () => { push(width * (N+1), 0     , depth) };
        const push3 = () => { push(width * (N+1), height, depth) };
        const push4 = () => { push(width * N    , height, depth) };
        const push5 = () => { push(width * N    , 0     , 0) };
        const push6 = () => { push(width * N    , height, 0) };
        const push7 = () => { push(width * (N+1), height, 0) };
        const push8 = () => { push(width * (N+1), 0     , 0) };
        // 正面
        push1();
        push2();
        push3();
        push4(); 
        
        // 背面
        push5();
        push6();
        push7();
        push8(); 

        // 左面
        push1();
        push4();
        push6();
        push5();
        
        // 右面
        push2();
        push8();
        push7();
        push3();
        
        // 上面
        push3();
        push7();
        push6();
        push4(); 
        
        // 下面
        push1();
        push5();
        push8();
        push2(); 
        
        return vector;
    }
    getPosition(data, width = 2, depth = 2){
        const vectors = new Array(data.length);
        for(let N = 0; N < data.length; N++){
            const height = data[N];
            vectors[N] = this.getVector(N, width, height, depth);  // 將填充完的 vector 插入 vectors 陣列
        }
        return vectors;
    }
    getVertices(vector, totalFace = 6, totalPoint = 4){
        const totalFrament = totalPoint - 2;
        const verticesCount = vector.length * totalFace * totalFrament * 3 * 3;  // 每個立方體 108 個頂點數據 (6 面 * 2 三角形/面 * 3 頂點/三角形 * 3 座標/頂點)
        const vertices = new Float32Array(verticesCount);
        let index = 0;
        for(let M = 0; M < vector.length; M++){
            // 每個立方體有 6 個面，每個面有 4 個頂點 (共 24 個頂點)
            for(let face = 0; face < totalFace; face++){
                const baseIndex = face * totalPoint * 3;  // 每個面的起始索引
                for(let N = 0; N < 3 * totalFrament; N+=3){
                    vertices[index++] = vector[M][baseIndex];      // 第 0 點的 x
                    vertices[index++] = vector[M][baseIndex + 1];  // 第 0 點的 y
                    vertices[index++] = vector[M][baseIndex + 2];  // 第 0 點的 z

                    vertices[index++] = vector[M][baseIndex + 3 + N];  // 第 N+1 點的 x
                    vertices[index++] = vector[M][baseIndex + 4 + N];  // 第 N+1 點的 y
                    vertices[index++] = vector[M][baseIndex + 5 + N];  // 第 N+1 點的 z

                    vertices[index++] = vector[M][baseIndex + 6 + N];  // 第 N+2 點的 x
                    vertices[index++] = vector[M][baseIndex + 7 + N];  // 第 N+2 點的 y
                    vertices[index++] = vector[M][baseIndex + 8 + N];  // 第 N+2 點的 z
                }
            }
        }
        return vertices;
    }
    getColorVertices(data, vertices){
        // data.length * 36 * 3
        const colorVertices = new Float32Array(vertices.length);
        let colorIndex = 0;
        const width = 2;
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            
            const tran = Math.sin(this.#transitionRadian);
            // 計算每個立方體的顏色
            const r = 0.200 + value / 255 * (0.816 - 0.200);
            const g = 0.329 + value / 255 * (0.590 - 0.329) * tran;
            const b = 0.584 + value / 255 * (0.949 - 0.584);

            // 為每個立方體的 36 個頂點賦予相同的顏色
            for (let j = 0; j < 36; j++) {
                // 立方體的左側 18 個頂點
                const x = vertices[i * 36 * 3 + j * 3];
                const y = vertices[i * 36 * 3 + j * 3 + 1];
                const z = vertices[i * 36 * 3 + j * 3 + 2];
                const isLeft = (x == i * width);
                const isTop = (y == value);
                const t = isLeft ? 1 : 0;
                const t2 = isTop ? 1 : 0;

                const R = r + (t + t2) / 2 * (0.816 - r);
                const G = g + (t + t2) / 2 * (0.590 - g) * tran;
                const B = b + (t + t2) / 2 * (0.949 - b);

                colorVertices[colorIndex++] = B;  // B
                colorVertices[colorIndex++] = R;  // R
                colorVertices[colorIndex++] = G;  // G
            }
        }
        return colorVertices;
    }

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
    getColumnVerticesByAngle(centerX, centerY, z, r, depth, height, startAngle, endAngle) {
        const vertices = new Float32Array(36 * 3);
        let idx = 0;
        const push = (x, y, z) => {
            vertices[idx++] = x;
            vertices[idx++] = z;
            vertices[idx++] = y;
        }
        const getXY = (radius, angle) => {
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return [x, y];
        }
        const [x1, y1] = getXY(r - depth, startAngle);
        const [x2, y2] = getXY(r - depth, endAngle);
        const [x3, y3] = getXY(r, endAngle);
        const [x4, y4] = getXY(r, startAngle);

        const addPoint = {};
        addPoint[1] = () => { push(x1, y1, z + height) }; // 上面左側
        addPoint[2] = () => { push(x2, y2, z + height) }; // 上面右側
        addPoint[3] = () => { push(x3, y3, z + height) }; // 上面右側外側
        addPoint[4] = () => { push(x4, y4, z + height) }; // 上面左側外側
        addPoint[5] = () => { push(x1, y1, z) }; // 下面左側
        addPoint[6] = () => { push(x4, y4, z) }; // 下面左側外側
        addPoint[7] = () => { push(x3, y3, z) }; // 下面右側外側
        addPoint[8] = () => { push(x2, y2, z) }; // 下面右側

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

        const r2 = 0.816;
        const g2 = 0.590 * tran;
        const b2 = 0.949;

        const addColor = {};
        addColor[1] = () => { pushBRG(b2, r2, g2) }; // 上面左側
        addColor[2] = () => { pushBRG(b1, r1, g1) }; // 上面右側
        addColor[3] = () => { pushBRG(b2, r2, g2) }; // 上面右側外側
        addColor[4] = () => { pushBRG(b2, r2, g2) }; // 上面左側外側
        addColor[5] = () => { pushBRG(b2, r2, g2) }; // 下面左側
        addColor[6] = () => { pushBRG(b2, r2, g2) }; // 下面左側外側
        addColor[7] = () => { pushBRG(b1, r1, g1) }; // 下面右側外側
        addColor[8] = () => { pushBRG(b1, r1, g1) }; // 下面右側

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

        return [vertices, colorVertices]; // 返回圓餅切片－長方體的 36 個頂點坐標
    }
    createColumn(length, width, unitHeight){
        
        const data = new Array(length).fill().map((v, index) => { return index * unitHeight });
        
        const vector = this.getPosition(data, width, 10);
        const vertices = this.getVertices(vector);
        const colorVertices = this.getColorVertices(data, vertices);

        const attribute = new THREE.BufferAttribute(vertices, 3);
        const colorAttribute = new THREE.BufferAttribute(colorVertices, 3);

        const column = {};
        column.geometry = new THREE.BufferGeometry();
        column.geometry.setAttribute('position', attribute);
        column.geometry.setAttribute('color', colorAttribute);
        
        const material = new THREE.MeshBasicMaterial({ 'vertexColors': true });
        column.mesh = new THREE.Mesh( column.geometry, material ); 

        column.update = (index, height, x, y) => {
            const cubeVertexCount = 36;  // 每個立方體的頂點數量
            const vertexIndex = index * cubeVertexCount * 3; // 乘以 3 是因為每個頂點有 x, y, z


            const vertices = column.geometry.attributes.position.array;
            const color = column.geometry.attributes.color.array;
            // const height = column.geometryData[index].height;
            const startAngle = (index / length) * Math.PI * 2;
            const endAngle = ((index + 1) / length) * Math.PI * 2;
            const [newVertices, colorVertices] = this.getColumnVerticesByAngle(x, y, 0, 100, 30, height, startAngle, endAngle);
            // const newVertices = this.getColumnVertices(x, 0, y, width, height, 10);
            // const colorVertices = this.getColorVertices([height], newVertices);

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
            // const x = index * width;
            const radius = 150;
            const angle = (index / length) * Math.PI * 2;  
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const height = data[index];
            const path = new Path(x, y);
            const geometryData = {x, y, height, path};
            column.update(index, height, x, y);

            // 初始化內部變數
            let _pointX = path.pointX;
            let _pointY = path.pointY;
            let isUpdating = false;
            Object.defineProperty(path, 'pointX', {
                get() {
                    return _pointX;
                },
                set(newX) {
                    if (_pointX !== newX) {
                        _pointX = newX;
                        if (isUpdating) return; // 如果正在更新，則直接返回
                        isUpdating = true; // 設置為正在更新
                        requestAnimationFrame(() => {
                            column.update(index, height, _pointX, _pointY);
                            isUpdating = false; // 更新結束
                        });
                    }
                }
            });
            Object.defineProperty(path, 'pointY', {
                get() {
                    return _pointY;
                },
                set(newY) {
                    if (_pointY !== newY) {
                        _pointY = newY;
                        if (isUpdating) return; // 如果正在更新，則直接返回
                        isUpdating = true; // 設置為正在更新
                        requestAnimationFrame(() => {
                            column.update(index, height, _pointX, _pointY);
                            isUpdating = false; // 更新結束
                        });
                    }
                }
            });
            
            return geometryData;
        });
        return column;
    }
    
    getDist(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); // 包含 z 軸的距離計算
    }
    
    getCollide(target, wall) {
        if (wall.type === "arcBall") {
            const dist = this.getDist(target, wall); // 使用 getDist 計算距離
            const outerBound = wall.length + wall.thick;
            const innerBound = wall.length - wall.thick;
    
            // 確認目標是否在牆的厚度範圍內
            return (dist + target.r >= innerBound && dist <= outerBound) ? dist : 0; 
        }
        return 0;
    }
    handleBallCollision(ball, anotherBall, dist) {
        const x = (ball.x + anotherBall.x) / 2;
        const y = (ball.y + anotherBall.y) / 2;
        const z = (ball.z + anotherBall.z) / 2;
    
        // 更新球的位置以避免重疊
        ball.x = x + (ball.x - x) / (dist / 2) * ball.r;
        ball.y = y + (ball.y - y) / (dist / 2) * ball.r;
        ball.z = z + (ball.z - z) / (dist / 2) * ball.r;
        anotherBall.x = x + (anotherBall.x - x) / (dist / 2) * anotherBall.r;
        anotherBall.y = y + (anotherBall.y - y) / (dist / 2) * anotherBall.r;
        anotherBall.z = z + (anotherBall.z - z) / (dist / 2) * anotherBall.r;
    
        // 相對速度
        const vx = (ball.vx - anotherBall.vx) / 2;
        const vy = (ball.vy - anotherBall.vy) / 2;
        const vz = (ball.vz - anotherBall.vz) / 2;
    
        // 計算碰撞後的相對速度
        const angleXY = Math.atan2(ball.y - y, ball.x - x);
        const angleXZ = Math.atan2(ball.z - z, ball.x - x);
        
        // 計算沿著碰撞角度的法線和切線速度分量
        const vectorTXY = -vx * Math.sin(angleXY) + vy * Math.cos(angleXY);
        const vectorNXY = -1 * (vx * Math.cos(angleXY) + vy * Math.sin(angleXY));
    
        const vectorTXZ = -vx * Math.sin(angleXZ) + vz * Math.cos(angleXZ);
        const vectorNXZ = -1 * (vx * Math.cos(angleXZ) + vz * Math.sin(angleXZ));
    
        // 更新速度分量（X、Y、Z）
        const relativeVX = -vectorTXY * Math.sin(angleXY) + vectorNXY * Math.cos(angleXY);
        const relativeVY = vectorTXY * Math.cos(angleXY) + vectorNXY * Math.sin(angleXY);
    
        const relativeVZ = vectorTXZ * Math.cos(angleXZ) + vectorNXZ * Math.sin(angleXZ);
    
        const averageVx = (ball.vx + anotherBall.vx) / 2;
        const averageVy = (ball.vy + anotherBall.vy) / 2;
        const averageVz = (ball.vz + anotherBall.vz) / 2;
    
        ball.vx = (averageVx + relativeVX) * this.friction;
        ball.vy = (averageVy + relativeVY) * this.friction;
        ball.vz = (averageVz + relativeVZ) * this.friction;
    
        anotherBall.vx = (averageVx - relativeVX) * this.friction;
        anotherBall.vy = (averageVy - relativeVY) * this.friction;
        anotherBall.vz = (averageVz - relativeVZ) * this.friction;
    }
    handleWallCollision(ball, wall, dist) {
        // 計算牆壁圓周上距離球體最近的點
        const x = wall.x + (ball.x - wall.x) / dist * wall.length;
        const y = wall.y + (ball.y - wall.y) / dist * wall.length;
        const z = wall.z + (ball.z - wall.z) / dist * wall.length;
    
        // 計算碰撞點的角度 (XY 平面和 XZ 平面)
        const angleXY = Math.atan2(y - wall.y, x - wall.x);
        const angleXZ = Math.atan2(z - wall.z, x - wall.x);
    
        // 更新球體的位置，確保球體不會穿過牆壁
        const isInside = dist <= wall.length ? 1 : -1;
        ball.x = x + (ball.x - x) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
        ball.y = y + (ball.y - y) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
        ball.z = z + (ball.z - z) / (wall.length - dist) * (ball.r + wall.thick) * isInside;
    
        // 計算反彈角度
        const vectorTXY = -ball.vx * Math.sin(angleXY) + ball.vy * Math.cos(angleXY);
        const vectorNXY = -1 * (ball.vx * Math.cos(angleXY) + ball.vy * Math.sin(angleXY));
    
        const vectorTXZ = -ball.vx * Math.sin(angleXZ) + ball.vz * Math.cos(angleXZ);
        const vectorNXZ = -1 * (ball.vx * Math.cos(angleXZ) + ball.vz * Math.sin(angleXZ));
    
        // 更新球體的速度
        ball.vx = (-vectorTXY * Math.sin(angleXY) + vectorNXY * Math.cos(angleXY)) * this.friction;
        ball.vy = (vectorTXY * Math.cos(angleXY) + vectorNXY * Math.sin(angleXY)) * this.friction;
        ball.vz = (vectorTXZ * Math.cos(angleXZ) + vectorNXZ * Math.sin(angleXZ)) * this.friction;
    }
    handleColumnCollision(ball, column) {
        const columnTop = column.path.pointY - column.height;
        const columnBottom = column.path.pointY;
        const columnLeft = column.path.pointX - column.width / 2;
        const columnRight = column.path.pointX + column.width / 2;
        const columnFront = column.path.pointZ - column.depth / 2; // Z 軸前
        const columnBack = column.path.pointZ + column.depth / 2;  // Z 軸後
    
        // 計算球體與柱子邊界的重疊量
        const overlapX = Math.min(ball.x + ball.r - columnLeft, columnRight - ball.x + ball.r);
        const overlapY = Math.min(ball.y + ball.r - columnTop, columnBottom - ball.y + ball.r);
        const overlapZ = Math.min(ball.z + ball.r - columnFront, columnBack - ball.z + ball.r);
        
        // 重疊量小於 0 表示沒有碰撞
        if (overlapX < 0 || overlapY < 0 || overlapZ < 0) return;
    
        // 確定碰撞位置並計算反彈
        if (overlapX < overlapY && overlapX < overlapZ) {
            // 碰撞發生在左右兩側
            ball.vx = -ball.vx * this.friction;
            if (ball.x < column.path.pointX) {
                ball.x = columnLeft - ball.r;
            } else {
                ball.x = columnRight + ball.r;
            }
        } else if (overlapY < overlapX && overlapY < overlapZ) {
            // 碰撞發生在上下兩側
            ball.vy = -ball.vy * this.friction;
            if (ball.y < column.path.pointY) {
                ball.y = columnTop - ball.r;
            } else {
                ball.y = columnBottom + ball.r;
            }
        } else {
            // 碰撞發生在前後兩側 (Z 軸)
            ball.vz = -ball.vz * this.friction;
            if (ball.z < column.path.pointZ) {
                ball.z = columnFront - ball.r;
            } else {
                ball.z = columnBack + ball.r;
            }
        }
    }
    handleRectCollision(ball, rect) {
        if (ball.x + ball.r > rect.left && ball.x - ball.r < rect.right &&
            ball.y + ball.r > rect.top && ball.y - ball.r < rect.bottom &&
            ball.z + ball.r > rect.front && ball.z - ball.r < rect.back) {
            
            // 計算球體與長方體邊界的重疊量
            const overlapX = Math.min(ball.x + ball.r - rect.left, rect.right - ball.x + ball.r);
            const overlapY = Math.min(ball.y + ball.r - rect.top, rect.bottom - ball.y + ball.r);
            const overlapZ = Math.min(ball.z + ball.r - rect.front, rect.back - ball.z + ball.r);
            
            // 確定碰撞位置並計算反彈
            if (overlapX < overlapY && overlapX < overlapZ) {
                // 碰撞發生在左右兩側
                ball.vx = -ball.vx * this.friction;
                if (ball.x < (rect.left + rect.right) / 2) {
                    ball.x = rect.left - ball.r;
                } else {
                    ball.x = rect.right + ball.r;
                }
            } else if (overlapY < overlapX && overlapY < overlapZ) {
                // 碰撞發生在上下兩側
                ball.vy = -ball.vy * this.friction;
                if (ball.y < (rect.top + rect.bottom) / 2) {
                    ball.y = rect.top - ball.r;
                } else {
                    ball.y = rect.bottom + ball.r;
                }
            } else {
                // 碰撞發生在前後兩側 (Z 軸)
                ball.vz = -ball.vz * this.friction;
                if (ball.z < (rect.front + rect.back) / 2) {
                    ball.z = rect.front - ball.r;
                } else {
                    ball.z = rect.back + ball.r;
                }
            }
        }
    }
    
    update(){
        this.#transitionRadian+= this.#trasitionOmega;
        this.sort.update(this.columns.geometryData);

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
            this.balls.forEach((anotherBall) => {
                if (ball == anotherBall) return;
                const dist = this.getDist(ball, anotherBall);
                if (dist < ball.r + anotherBall.r) {
                    this.handleBallCollision(ball, anotherBall, dist);
                }
            });

            // 檢測與牆壁的碰撞
            this.walls.forEach((wall) => {
                const dist = this.getCollide(ball, wall);
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
}