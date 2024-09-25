import lokaVolterraAlgorithm from "./lokaVolterraAlgorithm";
// 控制介面
self.onmessage = function handleMessageFromMain(msg) {
    switch(msg.data.name){
        case "transferControlToOffscreen":
			canvas = msg.data.canvas;
			ctx = canvas.getContext('2d');
			algorithm.reset(canvas.width, canvas.height);
			break;
		case "setOffscreen":
            canvas.width = msg.data.w;
            canvas.height = msg.data.h;
			break;
		case "cancelAnimation":
			cancelAnimationFrame(requestID);
			requestID = undefined;
			break;
		case "requestAnimation":
			if(requestID) self.postMessage({"name": "error", "message": "requestAnimation existed"});
			else requestID = requestAnimationFrame(main);
    }
};

let requestID = undefined;
let canvas;
let ctx;
const algorithm = new lokaVolterraAlgorithm();

// 繪圖系統-main
function main() {
	algorithm.render(ctx, 0.25);
	algorithm.update(ctx, canvas.width, canvas.height);
	requestID = requestAnimationFrame(main);
}