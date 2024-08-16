const algorithm = {'array': [], 'method': undefined, 'isSorting': false};
const message = [];
self.onmessage = function(msg){
    const name = msg.data.name;
    if(name == "cancel"){
        algorithm.isSorting = true;
        return;
    }
    // algorithm.method[name] = self[name];
    algorithm.array = msg.data.array;
    self[name]();
}

self.bubbleSort = function(){
    const arr = algorithm.array;
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // postMessage({'name': "replace", 'from': j, 'to': j+1, 'with': arr[j]});
                // postMessage({'name': "replace", 'from': j+1, 'to': j, 'with': arr[j+1]});
                message.push({'name': "replace", 'from': j, 'to': j+1, 'with': arr[j]});
                message.push({'name': "replace", 'from': j+1, 'to': j, 'with': arr[j+1]});
                if(message.length >= 100){
                    postMessage(message);
                    message.splice(0, message.length);
                }

                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    // postMessage({'name': ["hi", "there"], "array": arr});
}