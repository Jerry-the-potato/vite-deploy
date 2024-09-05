import vertexShaderSource from '../shader/vertex.glsl?raw'
import fragmentShaderSourceRect from '../shader/fragmentRect.glsl?raw'
import fragmentShaderSourceCircle from '../shader/fragmentCircle.glsl?raw'
import fragmentShaderSourcePoint from '../shader/fragmentPoint.glsl?raw'
import fragmentShaderSourceJuila from '../shader/fragmentJulia.glsl?raw'
import fragmentShaderSourceManderbrot from '../shader/fragmentManderbrot.glsl?raw'

import myMouse from './myMouse'

import { Path, PathConfig } from './path'
import Averager from './averager';

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const isSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (isSuccess) {
        return shader;
    }
    console.warn("source: " + source);
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}


// 粒子系統事件管理員
const createGLSL = function(){

    const frame = new Averager(60);
    this.timestamp = Date.now();
    this.complex = new Path(0, 0);
    this.zoom = new Path(250, 0);
    this.offset = new Path(0, 0);
    this.setCanvas = (canvas) => {
        const gl = canvas.getContext('webgl2', { antialias: true });
        this.gl = gl;

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShaderRect = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceRect);
        const fragmentShaderCircle = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCircle);
        const fragmentShaderPoint = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourcePoint);
        const fragmentShaderJuila = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceJuila);
        const fragmentShaderManderbrot = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceManderbrot);

        this.programRect = createProgram(gl, vertexShader, fragmentShaderRect);
        this.programCircle = createProgram(gl, vertexShader, fragmentShaderCircle);
        this.programPoint = createProgram(gl, vertexShader, fragmentShaderPoint);
        this.programJulia = createProgram(gl, vertexShader, fragmentShaderJuila);
        this.programManderbrot = createProgram(gl, vertexShader, fragmentShaderManderbrot);
        this.programName = "Manderbrot";

        this.points = new Array(1000).fill({}).map(() => {
            const theta = Math.random() * 2 * Math.PI;
            const r = Math.max(Math.random(), Math.random()) * this.gl.canvas.width / 2 ;
            const x = this.gl.canvas.width / 2 + r * Math.cos(theta);
            const y = this.gl.canvas.height / 2 + r * Math.sin(theta);
            return {'x': x, 'y': y};
        });
	}
    

    this.updateData = (data) => {
        PathConfig.resetLeap(0, 0, 0);
        PathConfig.resetPath(0.2, 0, 0.8);
        this.useMouse = data.useMouse;
        const frames = 30;
        this.complex.NewTarget(data.real / 50, data.imaginary / 50, 60);
        // offset 暫時乘以 zoom 以保持動畫流暢性，渲染時會除回去
        this.zoom.NewTarget(data.zoom, 0, frames);
        this.offset.NewTarget(data.offsetX / 50 * data.zoom, data.offsetY / 50 * data.zoom, frames);
        this.programName = this["program" + data.name] ? data.name : "Manderbrot";
    }
    this.fillJulia = (real, imaginary, zoom, offsetX, offsetY) => {
        const program = this["program" + this.programName];
        this.gl.useProgram(program);

        const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniform2f(this.gl.getUniformLocation(program, "u_resolution"), this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform2f(this.gl.getUniformLocation(program, "u_c"), real, imaginary);
        this.gl.uniform1f(this.gl.getUniformLocation(program, "u_zoom"), zoom);
        this.gl.uniform2f(this.gl.getUniformLocation(program, "u_offset"), offsetX, offsetY);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            this.gl.canvas.width, 0,
            0, this.gl.canvas.height,
            this.gl.canvas.width, 0,
            0, this.gl.canvas.height,
            this.gl.canvas.width, this.gl.canvas.height,
        ]), this.gl.STATIC_DRAW);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    this.fillPoint = (points, radius) => {
        this.gl.useProgram(this.programPoint);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        const positionAttributeLocation = this.gl.getAttribLocation(this.programPoint, "a_position");
        const resolutionUniformLocation = this.gl.getUniformLocation(this.programPoint, "u_resolution");
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
        const radiusUniformLocation = this.gl.getUniformLocation(this.programPoint, "u_radius");
        this.gl.uniform1f(radiusUniformLocation, radius);
        const srcData = new Float32Array(points.length * 2);
        points.forEach((point, index) => {
            srcData[index * 2] = point.x;
            srcData[index * 2 + 1] = point.y;
        });
        this.gl.bufferData(this.gl.ARRAY_BUFFER, srcData, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.POINTS, 0, points.length);
    }
    this.fillRect = (x, y, width, height, color) => {
        this.gl.useProgram(this.programRect);

        const positionAttributeLocation = this.gl.getAttribLocation(this.programRect, "a_position");
        const resolutionUniformLocation = this.gl.getUniformLocation(this.programRect, "u_resolution");
        const colorUniformLocation = this.gl.getUniformLocation(this.programRect, "u_color");
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        setRectangle(this.gl, x, y, width, height);
    
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        const size = 2;          // 2 components per iteration
        const type = this.gl.FLOAT;   // the data is 32bit floats
        const normalize = true; // don't normalize the data
        const stride = 8;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform4f(colorUniformLocation, color[0], color[1], color[2], color[3]);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        function setRectangle(gl, x, y, width, height) {
            const x1 = x;
            const y1 = y;
            const x2 = x + width;
            const y2 = y + height;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2,
            ]), gl.STATIC_DRAW);
        }
    }
    this.fillCircle = () => {
        this.gl.useProgram(this.programCircle);
    
        const positionAttributeLocation = this.gl.getAttribLocation(this.programCircle, "a_position");
        const resolutionUniformLocation = this.gl.getUniformLocation(this.programCircle, "u_resolution");
        const colorUniformLocation = this.gl.getUniformLocation(this.programCircle, "u_color");
        const centerUniformLocation = this.gl.getUniformLocation(this.programCircle, "u_center");
        const radiusUniformLocation = this.gl.getUniformLocation(this.programCircle, "u_radius");
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            this.gl.canvas.width, 0,
            0, this.gl.canvas.height,
            this.gl.canvas.width, 0,
            0, this.gl.canvas.height,
            this.gl.canvas.width, this.gl.canvas.height,
        ]), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform2f(centerUniformLocation, 0.5, 0.5);
        this.gl.uniform1f(radiusUniformLocation, 0.2);
        this.gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    this.update = () => {
        
    }
    this.render = () => {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const real = this.useMouse ? (myMouse.pointX - this.gl.canvas.width / 2) / this.zoom.pointX : this.complex.pointX;
        const imaginary = this.useMouse ? -1 * (myMouse.pointY - this.gl.canvas.height / 2) / this.zoom.pointX : this.complex.pointY;
        
        this.fillJulia(real, imaginary, this.zoom.pointX, this.offset.pointX / this.zoom.pointX, this.offset.pointY / this.zoom.pointX);
        // this.fillRect(0, 0, this.gl.canvas.width, this.gl.canvas.height, [Math.random(), Math.random(), Math.random(), 1]);
        // this.fillCircle();
        // this.fillPoint(this.points, 8.0);

        frame.updateValue(Date.now() - this.timestamp);
        this.timestamp = Date.now();
        // console.log(Math.floor(1000 / frame.getAverage()));
    }
    this.dispose = () => {
        if (this.gl) {
            this.gl.getExtension('WEBGL_lose_context').loseContext();
            this.gl = null;
        }
        if (this.canvas) {
            this.canvas = null;
        }
    }
	return this;
}
const myGLSL = new createGLSL();
export default myGLSL;