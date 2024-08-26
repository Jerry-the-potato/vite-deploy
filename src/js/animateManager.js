const managerMaker = function(){
    this.validId = ["S1", "S2", "S3"];
    this.lastId = "";
    this.lastRequestName = [];
    this.request = {};
    this.getRequestById = (id) => {
        if(typeof isSomethingHappended !== "undefined") return null;
        // some magic here and BOOM!!
        // ... may be more conplicated
        const req = [];
        for(let key in this.request){
            if(key.includes(id)) req.push(key);
        }
        return req;
    }
    this.updateRequestAnimation = (id) => {
        const names = this.getRequestById(id);
        if(names === null) return;
        
        this.lastId = id;
        this.lastRequestName.forEach(name => {
            cancelAnimationFrame(this.request[name].ID);
        })
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
        const valid = this.validId.some(ID => name.includes(ID));
        if(!valid) console.warn("naming issue: " + name + " should include one of following letters: " + this.validId);
    }
    this.registerAnimationCallback = (name, callback) => {
        this.request[name] = this.request[name] || {};
        this.request[name].method = function animate(){
            callback();
            this.request[name].ID = requestAnimationFrame(animate.bind(this));
        }.bind(this)
        const valid = this.validId.some(ID => name.includes(ID));
        if(!valid) console.warn("naming issue: " + name + " should include one of following letters: " + this.validId);
    }
    this.addIntersectionObserver = () => {
        this.io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // 實測大約0.01 ~ 0.05
                // console.log(entry.target.id + ": " + entry.intersectionRatio);
                if(entry.intersectionRatio === 0) return;
                manager.updateRequestAnimation(entry.target.id);
            });
        });
    }
    this.addSubjectElements = (elements) => {
        elements.forEach((el) => {
            this.io.unobserve(el) // avoid observing one element mutiple time
            this.io.observe(el);
        });
    }
    return this;
}
const manager = new managerMaker();
export default manager;