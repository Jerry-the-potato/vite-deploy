const managerMaker = function(){
    this.subject = [];
    this.globalKey = "dev";
    this.lastId = "";
    this.lastRequestName = [];
    this.request = {};
    // 過度包裝反而不好用，而且命名後難以追蹤、註銷動畫
    // this.setupAnimation = (subjectElement, callbacks) => {
    //     this.addSubjectElement(subjectElement);
    //     const ID = subjectElement.id;
    //     callbacks.forEach((callback) => {
    //         const name = callback.name || "#" + Object.keys(this.request).length;
    //         this.registerAnimationCallback(ID + "_" + name, callback);
    //     });
    // }
    this.getRequestById = (id) => {
        if(typeof isSomethingHappended !== "undefined") return null;
        // some magic here and BOOM!!
        // ... may be more conplicated
        const req = [];
        for(let key in this.request){
            if(key.includes(id) || key.includes(this.globalKey)) req.push(key);
        }
        return req;
    }
    this.cancelRequestAnimation = () => {
        
    }
    this.updateRequestAnimation = (id) => {
        // 停止舊的動畫
        this.lastId = id;
        this.lastRequestName.forEach(name => {
            if(!this.request[name]) return;
            cancelAnimationFrame(this.request[name].ID);
        })
        // 開始新的動畫
        const names = this.getRequestById(id);
        if(names === null) return;
        this.lastRequestName = names;
        
        names.forEach(name => {
            if(typeof this.request[name] === "undefined") return console.warn("invalid request");
            if(typeof this.request[name].method === "undefined") return console.warn("invalid requestMethod");
            if(this.request[name].isPause) return;
            this.request[name].ID = requestAnimationFrame(this.request[name].method);
        })
    }
    this.pauseAnimationByName = (name) => {
        cancelAnimationFrame(this.request[name].ID);
        this.request[name].isPause = true;
    }
    this.resumeAnimationByName = (name) => {
        this.request[name].isPause = false;
        cancelAnimationFrame(this.request[name].ID);
        this.request[name].ID = requestAnimationFrame(this.request[name].method);
    }
    this.addAnimationCallback = (callback) => {
        const string = callback.name || "#" + Math.random();
        // 有空白判定為 bound name，只取後面的函式名稱
        const name = string.match(" ") ? string.split(" ")[1] : string;
        this.request[name] = this.request[name] || {};
        this.request[name].method = function animate(){
            callback();
            this.request[name].ID = requestAnimationFrame(animate.bind(this));
        }.bind(this)
        const isValid = Object.keys(this.subject).some(ID => name.includes(ID));
        if(!isValid) console.warn("naming issue: " + name + " should include one of following letters: " + this.subject);
    }
    this.registerAnimationCallback = (name, callback) => {
        this.request[name] = this.request[name] || {};
        this.request[name].method = function animate(){
            callback();
            this.request[name].ID = requestAnimationFrame(animate.bind(this));
        }.bind(this)
        const isValid = Object.keys(this.subject).some(ID => name.includes(ID));
        if(!isValid) console.warn("naming issue: " + name + " should include one of following letters: " + this.subject);
    }
    this.unregisterAnimationCallback = (name) => {
        cancelAnimationFrame(this.request[name].ID);
        this.request[name].method = null;
        delete this.request[name];
    }
    this.io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // 實測大約0.01 ~ 0.05
            // console.log(entry.target.id + ": " + entry.intersectionRatio);
            if(entry.intersectionRatio === 0) return;
            this.updateRequestAnimation(entry.target.id);
        });
    });
    this.addSubjectElement = (element) => {
        // elements.forEach((el) => {
        //     this.validId.push(el.id);
        //     this.io.unobserve(el)
        //     this.io.observe(el);
        // });
        this.subject[element.id] = element;
        this.io.unobserve(element) // avoid observing one element mutiple time
        this.io.observe(element);
    }
    this.removeSubjectID = (id) => {
        const element = this.subject[id];
        this.io.unobserve(element);
        delete this.subject[id];
    }
    return this;
}
const manager = new managerMaker();
export default manager;