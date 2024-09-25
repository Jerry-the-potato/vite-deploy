var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function() {
  "use strict";
  function createPainter() {
    this.works = [];
    this.draw = function(obj) {
      let ctx2 = obj.ctx;
      let x = obj.x;
      let y = obj.y;
      let r = obj.r;
      let x2 = obj.x2;
      let y2 = obj.y2;
      let text = obj.text;
      let size = obj.size;
      let color = obj.color;
      let a = obj.a;
      let b = obj.b;
      let angle = obj.angle;
      if (ctx2)
        switch (obj.name) {
          case "circle":
            drawCircle();
            break;
          case "point":
            drawPoint();
            break;
          case "line":
            drawLine();
            break;
          case "crescent":
            drawCrescent();
            break;
          case "text":
            drawText();
        }
      function drawCircle() {
        if (x + y + r == "NaN") {
          console.warn("drawCircle failed: missing parameter");
          return;
        }
        ctx2.beginPath();
        ctx2.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx2.fillStyle = color;
        ctx2.fill();
      }
      function drawPoint() {
        if (x + y + size == "NaN") {
          console.warn("drawPoint failed: missing parameter");
          return;
        }
        ctx2.fillStyle = color;
        ctx2.fillRect(x - size / 2, y - size / 2, size, size);
      }
      function drawLine() {
        if (x + y + x2 + y2 == "NaN") {
          console.warn("drawLine failed: missing parameter");
          return;
        }
        ctx2.beginPath();
        ctx2.moveTo(x, y);
        ctx2.lineTo(x2, y2);
        ctx2.strokeStyle = color;
        ctx2.lineWidth = size ? size : 1;
        ctx2.stroke();
      }
      function drawCrescent() {
        if (x + y + a + b + angle + size == "NaN") {
          console.warn("drawCrescent failed: missing parameter");
          return;
        }
        let c = Math.sqrt(a * a + b * b);
        let aTan = Math.atan(a / b);
        let dx = Math.cos(angle + Math.PI / 2) * a * size;
        let dy = Math.sin(angle + Math.PI / 2) * a * size;
        ctx2.beginPath();
        ctx2.arc(x, y, b * size, angle, Math.PI + angle, true);
        ctx2.arc(x + dx, y + dy, c * size, Math.PI + angle + aTan, angle - aTan, false);
        ctx2.fillStyle = color;
        ctx2.fill();
      }
      function drawText() {
        x = Math.round(x);
        y = Math.round(y);
        ctx2.font = size + "px Comic Sans MS";
        ctx2.textBaseline = "middle";
        ctx2.textAlign = "center";
        ctx2.fillStyle = color;
        ctx2.fillText(text, x, y);
      }
    };
  }
  const _PathConfig = class _PathConfig {
    static resetPath(linear = 1, easein = 0, easeout = 0) {
      if (linear + easein + easeout != 1) console.warn("PathConfig.resetPath: sum of parameter is recommend to be 1");
      _PathConfig.linear = linear;
      _PathConfig.easein = easein;
      _PathConfig.easeout = easeout;
    }
    static resetLeap(linear = 0, easein = 0, easeout = 0) {
      _PathConfig.leapLinear = linear;
      _PathConfig.leapEasein = easein;
      _PathConfig.leapEaseout = easeout;
    }
    getPath() {
      return [_PathConfig.linear, _PathConfig.easein, _PathConfig.easeout];
    }
    getLeap() {
      return [_PathConfig.leapLinear, _PathConfig.leapEasein, _PathConfig.leapEaseout];
    }
  };
  __publicField(_PathConfig, "linear", -1);
  __publicField(_PathConfig, "easein", 0);
  __publicField(_PathConfig, "easeout", 2);
  __publicField(_PathConfig, "leapLinear", 0);
  __publicField(_PathConfig, "leapEasein", -2);
  __publicField(_PathConfig, "leapEaseout", 2);
  let PathConfig = _PathConfig;
  class Path extends PathConfig {
    constructor(x = 0, y = 0) {
      super();
      __publicField(this, "NewTarget", function(targetX, targetY, frames) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.originX = this.pointX;
        this.originY = this.pointY;
        this.timer = frames >= 10 ? frames : 0;
        this.period = frames >= 10 ? frames : 1;
        cancelAnimationFrame(this.ID);
        this.ID = requestAnimationFrame(this.NextFrame);
      });
      __publicField(this, "ResetTo", function(x = x, y = y) {
        this.pointX = x;
        this.pointY = y;
        this.timer = 0;
      });
      __publicField(this, "NextFrame", (function() {
        if (this.timer <= 0) {
          this.pointX = this.targetX;
          this.pointY = this.targetY;
          return;
        }
        this.timer--;
        const dX = this.targetX - this.originX;
        const dY = this.targetY - this.originY;
        const t = this.timer;
        const p = this.period;
        const linear = 1 / p;
        const easeout = Math.pow((t + 1) / p, 2) - Math.pow(t / p, 2);
        const easein = Math.pow(1 - (t - 1) / p, 2) - Math.pow(1 - t / p, 2);
        const [a, b, c] = this.getPath();
        const [d, e, f] = this.getLeap();
        this.pointX += (a * linear + b * easein + c * easeout) * dX;
        this.pointY += (a * linear + b * easein + c * easeout) * dY + (d * linear + e * easein + f * easeout) * (-dX / 5 + 10 * -dX / Math.abs(dX == 0 ? 1 : dX));
        this.ID = requestAnimationFrame(this.NextFrame);
      }).bind(this));
      this.pointX = x;
      this.pointY = y;
      this.originX = x;
      this.originY = y;
      this.targetX = x;
      this.targetY = y;
      this.period = 90;
      this.timer = 0;
      this.ID = 0;
    }
    getPath() {
      return super.getPath();
    }
    getLeap() {
      return super.getLeap();
    }
  }
  const myMouse = new Path();
  function clearBoard(ctx2) {
    ctx2.canvas.width *= 1;
  }
  function lokaVolterraAlgorithm() {
    const painter = new createPainter();
    this.alpha = 5;
    this.beta = 10;
    this.gamma = 5;
    this.delta = 10;
    this.dlength = 0.01;
    this.speed = 10;
    this.useMouse = false;
    this.isTransform = false;
    this.isGravity = true;
    this.motionType = "default";
    this.updateData = (data) => {
      this.useMouse = data.useMouse;
      this.isTransform = data.isTransform;
      this.isGravity = data.isGravity;
      this.alpha = data.alpha;
      this.beta = data.beta;
      this.gamma = data.gamma;
      this.delta = data.delta;
      this.dlength = data.dlength * 1e-3;
      this.speed = data.speed;
    };
    this.reset = (width, height) => {
      this.transitionRadian = 0;
      this.trasitionOmega = Math.PI / 1e4;
      const len = 2e3;
      this.data = [];
      for (let i = 0; i < len; i++) {
        const point = {
          "d": Math.sqrt(Math.random()) * width / 2,
          // distance
          "r": Math.random() * 2 * Math.PI,
          // radian
          "fakeX": width / 2,
          "fakeY": height / 2,
          "vx": [],
          "vy": []
        };
        point.x = width / 2 + point.d * Math.cos(point.r);
        point.y = height / 2 + point.d * Math.sin(point.r);
        point.fakeX = point.x;
        point.fakeY = point.y;
        this.data.push(point);
      }
    };
    this.render = (ctx2, offset) => {
      clearBoard(ctx2);
      ctx2.save();
      ctx2.translate(ctx2.canvas.width * offset, 0);
      painter.works.forEach((point) => {
        painter.draw(point);
      });
      painter.works = [];
      ctx2.restore();
    };
    this.update = (ctx2, width, height) => {
      this.transitionRadian += this.trasitionOmega * this.speed;
      this.motion(width, height);
      this.addTexture(width, height, ctx2);
      this.updateFps(width, height, ctx2);
    };
    this.motion = (width, height) => {
      this.data.forEach((point) => {
        const rad = this.transitionRadian;
        const period1 = Math.cos(rad) * Math.sin(rad);
        const period2 = Math.sin(rad);
        const period3 = Math.sin(rad * 2);
        const scaleFactor = this.isTransform ? 0.1 + 1.4 * (1 - period3) : 1;
        const d = point.d / 3 * scaleFactor;
        const angular1 = d * period1 * 0.1;
        const angular2 = d * period2 * 0.1;
        point.r += Math.PI / 100;
        let newX;
        let newY;
        switch (this.motionType) {
          case "plate":
            newX = width / 2 + d * Math.cos(point.r + period1);
            newY = height / 2 + d * Math.sin(point.r + period2);
            break;
          case "hourglass":
            newX = width / 2 + d * Math.cos(point.r + period1) * Math.sin(point.r + period1);
            newY = height / 2 + d * Math.sin(point.r + period1);
            break;
          case "cookie":
            newX = width / 2 + d * Math.cos(point.r + period1) * Math.sin(point.r + period1);
            newY = height / 2 + d * Math.sin(point.r + period2);
            break;
          case "taro":
          default:
            newX = width / 2 + d * Math.cos(point.r + angular1);
            newY = height / 2 + d * Math.sin(point.r + angular2);
            break;
        }
        point.x += newX - point.fakeX;
        point.y += newY - point.fakeY;
        point.fakeX = newX;
        point.fakeY = newY;
      });
      if (!this.isGravity) return;
      for (let i = 0; i < this.data.length; i++) {
        const p1 = this.data[i];
        let vx1 = 0;
        let vx2 = 0;
        let vy1 = 0;
        let vy2 = 0;
        for (let j = i + 1; j < this.data.length; j++) {
          const p2 = this.data[j];
          const d = getDistance(p1.x, p1.y, p2.x, p2.y);
          const MAXD = 0;
          if (d < MAXD) {
            let force;
            if (d < MAXD * 0.1) force = -1;
            if (d < MAXD * 0.55) force = 1 * (d - MAXD * 0.1) / (MAXD * 0.45);
            if (d < MAXD) force = 1 * (MAXD - d) / (MAXD * 0.45);
            vx1 += p2.x > p1.x ? 1 : -1 * force;
            vx2 += p1.x > p2.x ? 1 : -1 * force;
            vy1 += p2.y > p1.y ? 1 : -1 * force;
            vy2 += p1.y > p2.y ? 1 : -1 * force;
          }
        }
        p1.x += caluVelocity(p1.vx);
        p1.y += caluVelocity(p1.vy);
        const GRAVITY = 100;
        vx1 += width * 0.5 + GRAVITY / 2 > p1.x ? 1 : -1 * GRAVITY;
        vx1 -= width * 0.5 - GRAVITY / 2 < p1.x ? 1 : -1 * GRAVITY;
        vy1 += height / 2 + GRAVITY / 2 > p1.y ? 1 : -1 * GRAVITY;
        vy1 -= height / 2 - GRAVITY / 2 < p1.y ? 1 : -1 * GRAVITY;
        addVelocity(p1.vx, vx1);
        addVelocity(p1.vy, vy1);
      }
      function getDistance(x1, y1, x2, y2) {
        const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        return distance;
      }
      function addVelocity(a, v) {
        a.splice(1, 0, v);
        a.splice(60, 1);
      }
      function caluVelocity(a) {
        let sum = 0;
        a.forEach((value) => {
          sum += value / a.length / 20;
        });
        return sum;
      }
    };
    this.addTexture = (width, height, ctx2) => {
      for (let i = 0; i < this.data.length; i++) {
        const point = this.data[i];
        const x = point.x;
        const y = point.y;
        const ex = x / width;
        const ey = y / height;
        const dx = this.equation1(ex, ey, height) * width;
        const dy = this.equation2(ex, ey, width) * height;
        const blue = y / width * 255;
        const green = x / width * 255;
        const red = Math.sin(this.transitionRadian) * 255;
        const color = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
        const mypoint = {
          "name": "point",
          "ctx": ctx2,
          "size": 2,
          "x": x,
          "y": y,
          "color": color
        };
        painter.works.push(mypoint);
        const myline = {
          "name": "line",
          "ctx": ctx2,
          "size": 2,
          "x": x,
          "y": y,
          "x2": x + this.dlength * dx,
          "y2": y + this.dlength * dy,
          "color": color
        };
        painter.works.push(myline);
      }
    };
    this.equation1 = (x, y, height) => {
      if (this.useMouse) {
        const ratio = myMouse.pointY / height > 0.2 ? myMouse.pointY / height : 0.2;
        return this.alpha * x - 1 / ratio * this.alpha * x * y;
      }
      return this.alpha * x - this.beta * x * y;
    };
    this.equation2 = (x, y, width) => {
      if (this.useMouse) {
        const ratio = myMouse.pointX / width > 0.2 ? myMouse.pointX / width : 0.2;
        return 1 / ratio * this.gamma * x * y - this.gamma * y;
      }
      return this.delta * x * y - this.gamma * y;
    };
    this.timeBefore = Date.now();
    const delay = new Array(100);
    delay.fill(16);
    this.updateFps = (width, height, ctx2) => {
      const duration = Date.now() - this.timeBefore;
      this.timeBefore = Date.now();
      delay.push(duration);
      delay.shift();
      const sum = delay.reduce((total, current) => {
        return total + current;
      }, 0);
      const fps = Math.round(1e3 / (sum / delay.length));
      const angle = Math.PI * (Date.now() % 3e3) / 1500;
      const size = (height + width) * 3e-3;
      const x = width * 0.5;
      const y = height - size * 20;
      const blue = y / width * 255;
      const green = x / width * 255;
      const red = Math.sin(this.transitionRadian) * 255;
      const transitionColor = "rgb(" + Math.abs(red).toString() + "," + Math.abs(green).toString() + "," + Math.abs(blue).toString() + ")";
      const backgroundColor = "rgb(" + Math.abs(red * 0.3).toString() + "," + Math.abs(green * 0.2).toString() + "," + Math.abs(blue * 0.4).toString() + ")";
      const circle = {
        "name": "circle",
        "ctx": ctx2,
        "r": size * 10,
        "x": x,
        "y": y,
        "color": backgroundColor
      };
      const crescent1 = {
        "name": "crescent",
        "ctx": ctx2,
        "size": size,
        "a": 1,
        "b": 9,
        "angle": angle * 3,
        "x": x,
        "y": y,
        "color": transitionColor
      };
      const crescent2 = {
        "name": "crescent",
        "ctx": ctx2,
        "size": size,
        "a": 1,
        "b": 8,
        "angle": angle * 2,
        "x": x,
        "y": y,
        "color": transitionColor
      };
      const crescent3 = {
        "name": "crescent",
        "ctx": ctx2,
        "size": size,
        "a": 1,
        "b": 7,
        "angle": angle * 1,
        "x": x,
        "y": y,
        "color": transitionColor
      };
      const text1 = {
        "name": "text",
        "ctx": ctx2,
        "text": "fps",
        "size": size * 4,
        "x": x,
        "y": y - size * 3,
        "color": transitionColor
      };
      const text2 = {
        "name": "text",
        "ctx": ctx2,
        "text": fps,
        "size": size * 4,
        "x": x,
        "y": y + size * 3,
        "color": transitionColor
      };
      const text3 = {
        "name": "text",
        "ctx": ctx2,
        "text": "Res: " + Math.round(width) + " x " + Math.round(height),
        "size": size * 4,
        "x": x,
        "y": y + size * 13,
        "color": transitionColor
      };
      painter.works.push(circle, crescent1, crescent2, crescent3, text1, text2, text3);
    };
    return this;
  }
  self.onmessage = function handleMessageFromMain(msg) {
    switch (msg.data.name) {
      case "transferControlToOffscreen":
        canvas = msg.data.canvas;
        ctx = canvas.getContext("2d");
        algorithm.reset(canvas.width, canvas.height);
        break;
      case "setOffscreen":
        canvas.width = msg.data.w;
        canvas.height = msg.data.h;
        break;
      case "cancelAnimation":
        cancelAnimationFrame(requestID);
        requestID = void 0;
        break;
      case "requestAnimation":
        if (requestID) self.postMessage({ "name": "error", "message": "requestAnimation existed" });
        else requestID = requestAnimationFrame(main);
    }
  };
  let requestID = void 0;
  let canvas;
  let ctx;
  const algorithm = new lokaVolterraAlgorithm();
  function main() {
    algorithm.render(ctx, 0.25);
    algorithm.update(ctx, canvas.width, canvas.height);
    requestID = requestAnimationFrame(main);
  }
})();
//# sourceMappingURL=worker-Dzj0rZlo.js.map
