const managerMaker = function(){
    this.validId = ["S1", "S2", "S3"];
    this.lastId = "";
    this.lastRequests = [];
    this.request = {};
    this.getRequestsById = (id) => {
        if(typeof isSomethingHappended !== "undefined") return null;
        // some magic here and BOOM!!
        // ... may be more conplicated
        const req = [];
        for(let key in this.request){
            if(key.includes(id)) req.push(this.request[key])
        }
        return req;
    }
    this.updateRequestAnimation = (id) => {
        const newRequests = this.getRequestsById(id);
        if(newRequests === null) return;
        
        this.lastId = id;
        this.lastRequests.forEach(request => {
            cancelAnimationFrame(request.ID);
        })
        this.lastRequests = newRequests;
        
        newRequests.forEach(request => {
            if(typeof request === "undefined") return console.warn("invalid request");
            if(typeof request.method === "undefined") return console.warn("invalid requestMethod");
            request.ID = requestAnimationFrame(request.method);
        })
        
    }
    this.setMethod = (name, method) => {
        this.request[name] = this.request[name] || {};
        this.request[name].method = method;
        // setRequst(request);
        if(name.includes(this.lastId)) this.updateRequestAnimation(this.lastId);
    }
    this.setID = (name, id) => {
        this.request[name] = this.request[name] || {};
        this.request[name].ID = id;
        // setRequst(request);
    }
    this.cancelAnimationByName = (name) => {
        cancelAnimationFrame(this.request[name].ID);
    }
    this.requestAnimationByName = (name) => {
        this.request[name].ID = requestAnimationFrame(this.request[name].method);
    }
    this.addAnimationByName = (callback) => {
        const name = callback.name || Math.abs(Math.random() * 100);
        this.request[name] = this.request[name] || {};
        this.request[name].method = function animate(){
            callback();
            this.request[name].ID = requestAnimationFrame(animate.bind(this));
        }.bind(this)

        // let valid = false;
        // for(const ID of this.validId){
        //     if(name.includes(ID)){
        //         valid = true;
        //         break;
        //     }
        // }
        const valid = this.validId.some(ID => name.includes(ID));
        if(!valid) console.warn("naming issue: " + name + " should include one of following letters: " + this.validId);
    }
    return this;
}
// window.managerRef = useRef(new managerMaker());
// useEffect(() => {
    // const manager = managerRef.current;
const manager = new managerMaker();
window.addEventListener('load', function(){
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // 實測大約0.01 ~ 0.05
            // console.log(entry.target.id + ": " + entry.intersectionRatio);
            if(entry.intersectionRatio === 0) return;
            manager.updateRequestAnimation(entry.target.id);
        });
    });
    const sectionElList = document.querySelectorAll(".section");
    sectionElList.forEach((el) => {
        io.unobserve(el) // avoid observing one element mutiple time
        io.observe(el);
    });
}, false);
console.log("animate");