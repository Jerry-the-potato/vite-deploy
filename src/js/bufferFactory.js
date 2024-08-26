import * as THREE from 'three'

export default class BufferFactory{
    #geometry;
    #vertices = new Float32Array(new Array(6 * 2 * 1000).fill(0).map(()=>0.4 + Math.random() * 0.6));
    #positionIndex = 0;
    #material;
    #factorys;
    #transitionRadian = 0;
    #trasitionOmega = Math.PI / 300;
    #timestamp = Date.now();
    #rotation = new THREE.Vector3(0,0,0);
    constructor(){
        this.#geometry = new THREE.BufferGeometry();
        const attribute = new THREE.BufferAttribute(this.#vertices, 3);
        attribute.setUsage( THREE.DynamicDrawUsage );
        this.#geometry.setAttribute('position', attribute);
        this.#geometry.setAttribute('color', attribute);
        window.fac = this.#factorys;
        this.#material = new THREE.MeshBasicMaterial({
            vertexColors: true,
        });
        this.mesh = new THREE.Mesh( this.#geometry, this.#material );
        this.#factorys = new Array(180).fill(0).map(()=>this.createFactory())
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
    transformData(dataArray){
        const factory = this.#factorys[0];
        const vector = this.getPosition(dataArray);
        factory.vertices = new Float32Array(this.getVertices(vector));
        factory.attribute = new THREE.BufferAttribute(factory.vertices, 3)
        factory.geometry.setAttribute('position', factory.attribute);

        const colorVertices = new Float32Array(
            dataArray.reduce(
                (vertices, data) => vertices.concat(...new Array(6*2*3).fill(0).map((index) => {
                    const r = 0.200 + data/255*(0.816 - 0.200);
                    const g = 0.329 + data/255*(0.590 - 0.329) * Math.sin(this.#transitionRadian);
                    const b = 0.584 + data/255*(0.949 - 0.584);
                    return [b, r, g] // 測試出來是這個順序
            })), [])
        );
        const colorAttribute = new THREE.BufferAttribute(colorVertices, 3)
        factory.geometry.setAttribute('color', colorAttribute);

        this.#factorys.splice(0, 1);
        this.#factorys.push(factory);
    }
    updataFactorys(){
        const len = this.#factorys.length;
        this.#factorys.forEach((factory, index)=>{
            factory.mesh.position.set(0,0,1 * (index - len));
        })
    }
    setPosition(position){
        this.#geometry.setAttribute('position', 
            new THREE.BufferAttribute(new Float32Array(position), 3));
    }
    addPosition(position){
        position.forEach(vertice => {
            this.#vertices[this.#positionIndex] = vertice
            this.#positionIndex++;
            if(this.#positionIndex >= this.#vertices.length){
                this.#positionIndex = 0;
            }
        });
        this.#geometry.attributes.position.needsUpdate = "true";
        window.index = this.#positionIndex
        const attribute = new THREE.BufferAttribute(this.#vertices, 3);
        attribute.setUsage( THREE.DynamicDrawUsage );
        this.#geometry.setAttribute('position', attribute);
        // const array = this.#geometry.attributes.position.array || [];
        // const pos = new Float32Array([...position, ...array]);
        // this.#geometry.setAttribute('position', 
        //     new THREE.BufferAttribute(pos, 3));
    }
    setColor(color){
        this.#geometry.setAttribute('color',
            new THREE.BufferAttribute(new Float32Array(color), 3));
    }
    addColor(color){
        const array = this.#geometry.attributes.color.array || [];
        const col = new Float32Array([...color, ...array]);
        this.#geometry.setAttribute('color',
            new THREE.BufferAttribute(new Float32Array(col), 3));
    }
    getBuffer(vector3, euler, translate){
        const vertices = [];
        for(let N=0; N < vector3.length; N++){
            if(euler) vector3[N].applyEuler(euler);
            if(translate) vector3[N].add(translate);
            vertices.push(...vector3[N])
        }
        return vertices;
    }
    getSphereVertices(vector3){
        const vertices = [];
        // for(let N = 0; N < vector3[0].length-2; N++){
        //     vertices.push(...vector3[0][0]);
        //     vertices.push(...vector3[0][N+1]);
        //     vertices.push(...vector3[0][N+2]);
        // }
        for(let M = 0; M < vector3.length-1;M++){
            const fragment = vector3[M].length;
            for(let N = 0; N < fragment-1; N++){
                vertices.push(...vector3[M][N]);
                vertices.push(...vector3[M+1][N]);
                vertices.push(...vector3[M+1][N+1]);
                
                vertices.push(...vector3[M][N]);
                vertices.push(...vector3[M+1][N+1]);
                vertices.push(...vector3[M][N+1]);
            }
            vertices.push(...vector3[M][fragment-1]);
            vertices.push(...vector3[M+1][fragment-1]);
            vertices.push(...vector3[M+1][0]);
            
            vertices.push(...vector3[M][fragment-1]);
            vertices.push(...vector3[M+1][0]);
            vertices.push(...vector3[M][0]);
        }
        // const fragmentXY = vector3.length;
        // for(let N = 0; N < vector3[fragmentXY-1].length-2; N++){
        //     const fragment = vector3[fragmentXY-1].length;
        //     vertices.push(...vector3[fragmentXY-1][0]);
        //     vertices.push(...vector3[fragmentXY-1][N+1]);
        //     vertices.push(...vector3[fragmentXY-1][N+2]);
        // }
        return vertices;
    }
    getSpherePosition(width=100, height=100){
        const vertices = new Array();
        const colorVertices = new Array();
        
        if(typeof Cube_WhichMakeSense !== "undefined"){
            const euler = [
                new THREE.Euler( 0, 0, 0, 'XYZ' ),
                new THREE.Euler( 0, Math.PI/2, 0, 'XYZ' ),
                new THREE.Euler( 0, Math.PI, 0, 'XYZ' ),
                new THREE.Euler( 0, -Math.PI/2, 0, 'XYZ' ),
                new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' ),
                new THREE.Euler( -Math.PI/2, 0, 0, 'XYZ' ),
            ];
            const translate = [
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(width,0,0),
                new THREE.Vector3(width,0,-width),
                new THREE.Vector3(0,0,-width),
                new THREE.Vector3(0,0,-width),
                new THREE.Vector3(0,width,0),
            ];
            for(let N=0;N<6;N++){
                const vectors = [];
                vectors[0] = new THREE.Vector3(0,0,0);
                vectors[1] = new THREE.Vector3(width,0,0);
                vectors[2] = new THREE.Vector3(width,height,0);
                vectors[3] = new THREE.Vector3(0,0,0);
                vectors[4] = new THREE.Vector3(width,height,0);
                vectors[5] = new THREE.Vector3(0,height,0);

                vertices.push(...this.getBuffer(vectors, euler[N], translate[N]));


                let colors = [];
                // colors[0] = new THREE.Vector3(N/4,0.5,0.5);
                // colors[1] = new THREE.Vector3(0.5,N/4,0.5);
                // colors[2] = new THREE.Vector3(0.5,0.5,N/4);
                // colorVertices.push(...this.getVertices(colors, euler));
                colors = [
                        N/4,0.5,0.5,
                        0.2,N/8+0.5,0.5,
                        0.2,0.5,N/8+0.5
                ];
                colorVertices.push(...colors);
            }
        }
        colorVertices.push(vertices.map(value => 0.2 + Math.abs(value/100)));
        
        const vectors = [];
        const fragment = 20;
        for(let M=0;M<=fragment*2;M++){
            vectors[M] = [];
            const radius = 100;
            const z = Math.sqrt(Math.abs(radius * radius * (M / fragment - 1))) * ((M > fragment) ? -1 : 1);
            for(let N=0;N<fragment;N++){
                const length = Math.sqrt(radius*radius - z*z);
                const x = length * Math.cos(2*Math.PI/fragment * (N+0.5));
                const y = length * Math.sin(2*Math.PI/fragment * (N+0.5));
                vectors[M].push(new THREE.Vector3(x,y,z));
            }
        }
        const v = this.getSphereVertices(vectors);

        vertices.push(...v);
        colorVertices.push(...v.map(value => 0.2 + Math.abs(value/100) + Math.random()*0.5));

        const position = new Float32Array([...vertices]);
        this.setPosition(position);
        const color = new Float32Array([...colorVertices]);
        this.setColor(color);
        // myarray = new Float32Array() ;
        // myarray.push = function(){
        //     const push = this.push;
        //     myarray = new Float32Array([...myarray, ...arguments]);
        //     myarray.push = push;
        // };
    }
    getMusicData(data){
        // const data = new Array(32).fill(0).map((v,i) => Math.random()*1);
        const vector = this.getPosition(data);
        const vertices = this.getVertices(vector);
        const colorVertices = vertices.map((value, index) =>{
            if(index % 3 == 2) return 0.2 + value/50;
            return 0.2 + Math.random() * 0.5;
        });
        // this.setPosition(vertices);
        // this.setColor(colorVertices);
        window.buffer = this.#geometry.attributes.position.array.length / 3;
    }
    getPosition(data){
        const t = 0//(Date.now() - this.#timestamp)/100;
        const vectors = [];
        const width = 2;
        const depth = 1;
        // camera.position.set(16,30,depth * (t+120));
        for(let N=0; N<data.length; N++){
            const height = data[N] / 3;
            // if(height < 1) continue;
            const vector = [];
            const push1 = () => vector.push(new THREE.Vector3(width*N,0,depth * (t+1)));
            const push2 = () => vector.push(new THREE.Vector3(width*(N+1),0,depth * (t+1)));
            const push3 = () => vector.push(new THREE.Vector3(width*(N+1),height,depth * (t+1)));
            const push4 = () => vector.push(new THREE.Vector3(width*N,height,depth * (t+1)));
            const push5 = () => vector.push(new THREE.Vector3(width*N,0,depth * t));
            const push6 = () => vector.push(new THREE.Vector3(width*N,height,depth * t));
            const push7 = () => vector.push(new THREE.Vector3(width*(N+1),height,depth * t));
            const push8 = () => vector.push(new THREE.Vector3(width*(N+1),0,depth * t));
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
            vectors.push(vector);
        }
        return vectors;
    }
    getVertices(vector){
        const vertices = [];
        for(let M = 0; M < vector.length;M++){
            for(let face = 0; face < 6; face++){
                for(let N = face*4; N < face*4+2; N++){
                    vertices.push(...vector[M][face*4]);
                    vertices.push(...vector[M][N+1]);
                    vertices.push(...vector[M][N+2]);
                }
            }
        }
        // console.log(vector.length, vertices.length);
        return vertices;
    }
    update(){
        this.#transitionRadian+= this.#trasitionOmega;
        this.updataFactorys();
        // const t = (Date.now() - this.#timestamp)/100;
        // if(t > 90) return;

        // this.getMusicData();
        // this.mesh.rotation.x+= 0.005;
        // this.mesh.rotation.y+= 0.02;
        // this.mesh.rotation.z+= 0.001;

        // const position = new Float32Array(900);
        // for(let N=0; N<300;N++){
        //     position[N*3] = N * Math.cos(N/10*this.n);
        //     position[N*3+1] = N * Math.sin(N/10*this.n);
        //     position[N*3+2] = 0;
        // }
        // this.#geometry.setAttribute('position', new THREE.BufferAttribute(position, 3)); //Float32Array
        // this.n+= 0.002 * value.n/5;
    }
}