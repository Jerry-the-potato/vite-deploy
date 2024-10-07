import * as THREE from 'three'

export default class BufferFactory{
    #geometry;
    #vertices = new Float32Array(new Array(6 * 2 * 1000).fill(0).map(()=>0.4 + Math.random() * 0.6));
    #positionIndex = 0;
    #material;
    #factorys;
    #transitionRadian = 0;
    #trasitionOmega = Math.PI / 300;
    constructor(){
        this.#geometry = new THREE.BufferGeometry();
        const attribute = new THREE.BufferAttribute(this.#vertices, 3);
        attribute.setUsage( THREE.DynamicDrawUsage );
        this.#geometry.setAttribute('position', attribute);
        this.#geometry.setAttribute('color', attribute);
        this.#material = new THREE.MeshBasicMaterial({
            vertexColors: true,
        });
        this.mesh = new THREE.Group();
        this.#factorys = new Array(180 * 3).fill(0).map(()=>this.createFactory())
        this.n = 0.5;
        // this.update();
        // this.getSpherePosition();
    }
    createFactory(){
        const factory = {
            'vertices': new Float32Array(),
            'attribute': new THREE.BufferAttribute(new Float32Array(),3),
            'geometry': new THREE.BufferGeometry(),
            'mesh': null
        };
        factory.mesh = new THREE.Mesh( factory.geometry, this.#material )
        this.mesh.add(factory.mesh);
        return factory;
    }
    transformData(data){
        const factory = this.#factorys[0];
        const vector = this.getPosition(data);
        factory.vertices = this.getVertices(vector);
        factory.attribute = new THREE.BufferAttribute(factory.vertices, 3);
        factory.geometry.setAttribute('position', factory.attribute);

        factory.geometry.computeBoundingBox();
        // factory.boxHelper = new THREE.Box3Helper(factory.geometry.boundingBox, 0xcccc77);
        // this.mesh.add(factory.boxHelper);

        factory.colorVertices = this.getColorVertices(data, factory.vertices);
        const colorAttribute = new THREE.BufferAttribute(factory.colorVertices, 3)
        factory.geometry.setAttribute('color', colorAttribute);

        this.#factorys.splice(0, 1);
        this.#factorys.push(factory);
    }
    updateFactorys(){
        const len = this.#factorys.length;
        this.#factorys.forEach((factory, index)=>{
            factory.mesh.position.set(0,0,1 * (index - len));
            factory.geometry.computeBoundingBox();
            factory.geometry.boundingBox.translate(factory.mesh.position);
        })
    }
    // setPosition(position){
    //     this.#geometry.setAttribute('position', 
    //         new THREE.BufferAttribute(new Float32Array(position), 3));
    // }
    // addPosition(position){
    //     position.forEach(vertice => {
    //         this.#vertices[this.#positionIndex] = vertice
    //         this.#positionIndex++;
    //         if(this.#positionIndex >= this.#vertices.length){
    //             this.#positionIndex = 0;
    //         }
    //     });
    //     this.#geometry.attributes.position.needsUpdate = "true";
    //     const attribute = new THREE.BufferAttribute(this.#vertices, 3);
    //     attribute.setUsage( THREE.DynamicDrawUsage );
    //     this.#geometry.setAttribute('position', attribute);
    //     // const array = this.#geometry.attributes.position.array || [];
    //     // const pos = new Float32Array([...position, ...array]);
    //     // this.#geometry.setAttribute('position', 
    //     //     new THREE.BufferAttribute(pos, 3));
    // }
    // setColor(color){
    //     this.#geometry.setAttribute('color',
    //         new THREE.BufferAttribute(new Float32Array(color), 3));
    // }
    // addColor(color){
    //     const array = this.#geometry.attributes.color.array || [];
    //     const col = new Float32Array([...color, ...array]);
    //     this.#geometry.setAttribute('color',
    //         new THREE.BufferAttribute(new Float32Array(col), 3));
    // }
    // getBuffer(vector3, euler, translate){
    //     const vertices = [];
    //     for(let N=0; N < vector3.length; N++){
    //         if(euler) vector3[N].applyEuler(euler);
    //         if(translate) vector3[N].add(translate);
    //         vertices.push(...vector3[N])
    //     }
    //     return vertices;
    // }
    // getSphereVertices(vector3){
    //     const vertices = [];
    //     // for(let N = 0; N < vector3[0].length-2; N++){
    //     //     vertices.push(...vector3[0][0]);
    //     //     vertices.push(...vector3[0][N+1]);
    //     //     vertices.push(...vector3[0][N+2]);
    //     // }
    //     for(let M = 0; M < vector3.length-1;M++){
    //         const fragment = vector3[M].length;
    //         for(let N = 0; N < fragment-1; N++){
    //             vertices.push(...vector3[M][N]);
    //             vertices.push(...vector3[M+1][N]);
    //             vertices.push(...vector3[M+1][N+1]);
                
    //             vertices.push(...vector3[M][N]);
    //             vertices.push(...vector3[M+1][N+1]);
    //             vertices.push(...vector3[M][N+1]);
    //         }
    //         vertices.push(...vector3[M][fragment-1]);
    //         vertices.push(...vector3[M+1][fragment-1]);
    //         vertices.push(...vector3[M+1][0]);
            
    //         vertices.push(...vector3[M][fragment-1]);
    //         vertices.push(...vector3[M+1][0]);
    //         vertices.push(...vector3[M][0]);
    //     }
    //     // const fragmentXY = vector3.length;
    //     // for(let N = 0; N < vector3[fragmentXY-1].length-2; N++){
    //     //     const fragment = vector3[fragmentXY-1].length;
    //     //     vertices.push(...vector3[fragmentXY-1][0]);
    //     //     vertices.push(...vector3[fragmentXY-1][N+1]);
    //     //     vertices.push(...vector3[fragmentXY-1][N+2]);
    //     // }
    //     return vertices;
    // }
    // getSpherePosition(width=100, height=100){
    //     const vertices = new Array();
    //     const colorVertices = new Array();
        
    //     if(typeof Cube_WhichMakeSense !== "undefined"){
    //         const euler = [
    //             new THREE.Euler( 0, 0, 0, 'XYZ' ),
    //             new THREE.Euler( 0, Math.PI/2, 0, 'XYZ' ),
    //             new THREE.Euler( 0, Math.PI, 0, 'XYZ' ),
    //             new THREE.Euler( 0, -Math.PI/2, 0, 'XYZ' ),
    //             new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' ),
    //             new THREE.Euler( -Math.PI/2, 0, 0, 'XYZ' ),
    //         ];
    //         const translate = [
    //             new THREE.Vector3(0,0,0),
    //             new THREE.Vector3(width,0,0),
    //             new THREE.Vector3(width,0,-width),
    //             new THREE.Vector3(0,0,-width),
    //             new THREE.Vector3(0,0,-width),
    //             new THREE.Vector3(0,width,0),
    //         ];
    //         for(let N=0;N<6;N++){
    //             const vectors = [];
    //             vectors[0] = new THREE.Vector3(0,0,0);
    //             vectors[1] = new THREE.Vector3(width,0,0);
    //             vectors[2] = new THREE.Vector3(width,height,0);
    //             vectors[3] = new THREE.Vector3(0,0,0);
    //             vectors[4] = new THREE.Vector3(width,height,0);
    //             vectors[5] = new THREE.Vector3(0,height,0);

    //             vertices.push(...this.getBuffer(vectors, euler[N], translate[N]));


    //             let colors = [];
    //             // colors[0] = new THREE.Vector3(N/4,0.5,0.5);
    //             // colors[1] = new THREE.Vector3(0.5,N/4,0.5);
    //             // colors[2] = new THREE.Vector3(0.5,0.5,N/4);
    //             // colorVertices.push(...this.getVertices(colors, euler));
    //             colors = [
    //                     N/4,0.5,0.5,
    //                     0.2,N/8+0.5,0.5,
    //                     0.2,0.5,N/8+0.5
    //             ];
    //             colorVertices.push(...colors);
    //         }
    //     }
    //     colorVertices.push(vertices.map(value => 0.2 + Math.abs(value/100)));
        
    //     const vectors = [];
    //     const fragment = 20;
    //     for(let M=0;M<=fragment*2;M++){
    //         vectors[M] = [];
    //         const radius = 100;
    //         const z = Math.sqrt(Math.abs(radius * radius * (M / fragment - 1))) * ((M > fragment) ? -1 : 1);
    //         for(let N=0;N<fragment;N++){
    //             const length = Math.sqrt(radius*radius - z*z);
    //             const x = length * Math.cos(2*Math.PI/fragment * (N+0.5));
    //             const y = length * Math.sin(2*Math.PI/fragment * (N+0.5));
    //             vectors[M].push(new THREE.Vector3(x,y,z));
    //         }
    //     }
    //     const v = this.getSphereVertices(vectors);

    //     vertices.push(...v);
    //     colorVertices.push(...v.map(value => 0.2 + Math.abs(value/100) + Math.random()*0.5));

    //     const position = new Float32Array([...vertices]);
    //     this.setPosition(position);
    //     const color = new Float32Array([...colorVertices]);
    //     this.setColor(color);
    //     // myarray = new Float32Array() ;
    //     // myarray.push = function(){
    //     //     const push = this.push;
    //     //     myarray = new Float32Array([...myarray, ...arguments]);
    //     //     myarray.push = push;
    //     // };
    // }
    // getMusicData(data){
    //     // const data = new Array(32).fill(0).map((v,i) => Math.random()*1);
    //     const vector = this.getPosition(data);
    //     const vertices = this.getVertices(vector);
    //     const colorVertices = vertices.map((value, index) =>{
    //         if(index % 3 == 2) return 0.2 + value/50;
    //         return 0.2 + Math.random() * 0.5;
    //     });
    //     // this.setPosition(vertices);
    //     // this.setColor(colorVertices);
    // }
    getPosition(data){
        const t = 0//(Date.now() - this.#timestamp)/100;
        const vectors = new Array(data.length);
        const width = 2;
        const depth = 1;
        // camera.position.set(16,30,depth * (t+120));
        for(let N=0; N<data.length; N++){
            const height = data[N] / 3;
            // if(height < 1) continue;
            const vector = new Float32Array(24 * 3);
            // const push1 = () => { return new THREE.Vector3(width*N,0,depth * (t+1)) };
            // const push2 = () => { return new THREE.Vector3(width*(N+1),0,depth * (t+1)) };
            // const push3 = () => { return new THREE.Vector3(width*(N+1),height,depth * (t+1)) };
            // const push4 = () => { return new THREE.Vector3(width*N,height,depth * (t+1)) };
            // const push5 = () => { return new THREE.Vector3(width*N,0,depth * t) };
            // const push6 = () => { return new THREE.Vector3(width*N,height,depth * t) };
            // const push7 = () => { return new THREE.Vector3(width*(N+1),height,depth * t) };
            // const push8 = () => { return new THREE.Vector3(width*(N+1),0,depth * t) };
            // 正面
            // vector[0] = new THREE.Vector3(width * N, 0, depth * (t+1));
            // vector[1] = new THREE.Vector3(width * (N+1), 0, depth * (t+1));
            // vector[2] = new THREE.Vector3(width * (N+1), height, depth * (t+1));
            // vector[3] = new THREE.Vector3(width * N, height, depth * (t+1));

            // // 背面
            // vector[4] = new THREE.Vector3(width * N, 0, depth * t);
            // vector[5] = new THREE.Vector3(width * N, height, depth * t);
            // vector[6] = new THREE.Vector3(width * (N+1), height, depth * t);
            // vector[7] = new THREE.Vector3(width * (N+1), 0, depth * t);

            // // 左面
            // vector[8] = new THREE.Vector3(width * N, 0, depth * (t+1));
            // vector[9] = new THREE.Vector3(width * N, height, depth * (t+1));
            // vector[10] = new THREE.Vector3(width * N, height, depth * t);
            // vector[11] = new THREE.Vector3(width * N, 0, depth * t);

            // // 右面
            // vector[12] = new THREE.Vector3(width * (N+1), 0, depth * (t+1));
            // vector[13] = new THREE.Vector3(width * (N+1), 0, depth * t);
            // vector[14] = new THREE.Vector3(width * (N+1), height, depth * t);
            // vector[15] = new THREE.Vector3(width * (N+1), height, depth * (t+1));

            // // 上面
            // vector[16] = new THREE.Vector3(width * (N+1), height, depth * (t+1));
            // vector[17] = new THREE.Vector3(width * (N+1), height, depth * t);
            // vector[18] = new THREE.Vector3(width * N, height, depth * t);
            // vector[19] = new THREE.Vector3(width * N, height, depth * (t+1));

            // // 下面
            // vector[20] = new THREE.Vector3(width * N, 0, depth * (t+1));
            // vector[21] = new THREE.Vector3(width * N, 0, depth * t);
            // vector[22] = new THREE.Vector3(width * (N+1), 0, depth * t);
            // vector[23] = new THREE.Vector3(width * (N+1), 0, depth * (t+1));

            let idx = 0;
            vector[idx++] = width * N;        vector[idx++] = 0;        vector[idx++] = depth * (t+1);
            vector[idx++] = width * (N+1);    vector[idx++] = 0;        vector[idx++] = depth * (t+1);
            vector[idx++] = width * (N+1);    vector[idx++] = height;   vector[idx++] = depth * (t+1);
            vector[idx++] = width * N;        vector[idx++] = height;   vector[idx++] = depth * (t+1);
    
            // 背面
            vector[idx++] = width * N;        vector[idx++] = 0;        vector[idx++] = depth * t;
            vector[idx++] = width * N;        vector[idx++] = height;   vector[idx++] = depth * t;
            vector[idx++] = width * (N+1);    vector[idx++] = height;   vector[idx++] = depth * t;
            vector[idx++] = width * (N+1);    vector[idx++] = 0;        vector[idx++] = depth * t;
    
            // 左面
            vector[idx++] = width * N;        vector[idx++] = 0;        vector[idx++] = depth * (t+1);
            vector[idx++] = width * N;        vector[idx++] = height;   vector[idx++] = depth * (t+1);
            vector[idx++] = width * N;        vector[idx++] = height;   vector[idx++] = depth * t;
            vector[idx++] = width * N;        vector[idx++] = 0;        vector[idx++] = depth * t;
    
            // 右面
            vector[idx++] = width * (N+1);    vector[idx++] = 0;        vector[idx++] = depth * (t+1);
            vector[idx++] = width * (N+1);    vector[idx++] = 0;        vector[idx++] = depth * t;
            vector[idx++] = width * (N+1);    vector[idx++] = height;   vector[idx++] = depth * t;
            vector[idx++] = width * (N+1);    vector[idx++] = height;   vector[idx++] = depth * (t+1);
    
            // 上面
            vector[idx++] = width * (N+1);    vector[idx++] = height;   vector[idx++] = depth * (t+1);
            vector[idx++] = width * (N+1);    vector[idx++] = height;   vector[idx++] = depth * t;
            vector[idx++] = width * N;        vector[idx++] = height;   vector[idx++] = depth * t;
            vector[idx++] = width * N;        vector[idx++] = height;   vector[idx++] = depth * (t+1);
    
            // 下面
            vector[idx++] = width * N;        vector[idx++] = 0;        vector[idx++] = depth * (t+1);
            vector[idx++] = width * N;        vector[idx++] = 0;        vector[idx++] = depth * t;
            vector[idx++] = width * (N+1);    vector[idx++] = 0;        vector[idx++] = depth * t;
            vector[idx++] = width * (N+1);    vector[idx++] = 0;        vector[idx++] = depth * (t+1);

            vectors[N] = vector;  // 將填充完的 vector 插入 vectors 陣列
        }
        return vectors;
    }
    getVertices(vector){
        const verticesCount = vector.length * 36;  // 每個立方體 36 個頂點 (6 面 * 2 三角形/面 * 3 頂點/三角形)
        const vertices = new Float32Array(verticesCount);
        let index = 0;
        for(let M = 0; M < vector.length;M++){
            // 每個立方體有 6 個面，每個面有 4 個頂點 (共 24 個頂點)
            for(let face = 0; face < 6; face++){
                const baseIndex = face * 4 * 3;  // 每個面的起始索引

                // 第一個三角形 (點 0, 點 1, 點 2)
                vertices[index++] = vector[M][baseIndex];  // 第 0 點的 x
                vertices[index++] = vector[M][baseIndex + 1];  // 第 0 點的 y
                vertices[index++] = vector[M][baseIndex + 2];  // 第 0 點的 z
    
                vertices[index++] = vector[M][baseIndex + 3];  // 第 1 點的 x
                vertices[index++] = vector[M][baseIndex + 4];  // 第 1 點的 y
                vertices[index++] = vector[M][baseIndex + 5];  // 第 1 點的 z
    
                vertices[index++] = vector[M][baseIndex + 6];  // 第 2 點的 x
                vertices[index++] = vector[M][baseIndex + 7];  // 第 2 點的 y
                vertices[index++] = vector[M][baseIndex + 8];  // 第 2 點的 z
    
                // 第二個三角形 (點 0, 點 2, 點 3)
                vertices[index++] = vector[M][baseIndex];  // 第 0 點的 x
                vertices[index++] = vector[M][baseIndex + 1];  // 第 0 點的 y
                vertices[index++] = vector[M][baseIndex + 2];  // 第 0 點的 z
    
                vertices[index++] = vector[M][baseIndex + 6];  // 第 2 點的 x
                vertices[index++] = vector[M][baseIndex + 7];  // 第 2 點的 y
                vertices[index++] = vector[M][baseIndex + 8];  // 第 2 點的 z
    
                vertices[index++] = vector[M][baseIndex + 9];  // 第 3 點的 x
                vertices[index++] = vector[M][baseIndex + 10];  // 第 3 點的 y
                vertices[index++] = vector[M][baseIndex + 11];  // 第 3 點的 z
            }
        }
        // console.log(vector.length, vertices.length);
        return vertices;
    }
    getColorVertices(data, vertices){
        const colorVertices = new Float32Array(data.length * 36 * 3);  // 為每個立方體 36 個頂點的顏色分配空間
        let colorIndex = 0;
        const width = 2;
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            
            // 計算每個立方體的顏色
            const r = 0.200 + value / 255 * (0.816 - 0.200);
            const g = 0.329 + value / 255 * (0.590 - 0.329) * Math.sin(this.#transitionRadian);
            const b = 0.584 + value / 255 * (0.949 - 0.584);
        
            // 為每個立方體的 36 個頂點賦予相同的顏色
            for (let j = 0; j < 36; j++) {
                const isLeft = (vertices[i * 36 * 3 + j * 3] == i * width);  // 立方體的上面 18 個頂點
                const t = isLeft ? 1 : 0;

                const R = r + t * (0.816 - r);
                const G = g + t * (0.590 - g);
                const B = b + t * (0.949 - b);

                colorVertices[colorIndex++] = B;  // B
                colorVertices[colorIndex++] = R;  // R
                colorVertices[colorIndex++] = G;  // G
            }
        }
        return colorVertices;
    }
    update(){
        this.#transitionRadian+= this.#trasitionOmega;
        this.updateFactorys();
    }
}