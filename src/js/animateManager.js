const managerMaker = function(){
    this.subject = [];
    this.globalKey = "dev";
    this.lastRequestName = [];
    this.request = {};

    // 根據 ID 取得請求
    this.getRequestById = (id) => {
        if(typeof isSomethingHappended !== "undefined") return null;
        // some magic here and BOOM!!
        // ... may be more conplicated
        const req = Object.keys(this.request).filter(key => key.includes(id) || key.includes(this.globalKey));
        return req;
    }
    this.updateRequestAnimation = (id) => {
        // 停止舊的動畫
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

    // 建立動畫
    this.createAnimation = (name, callback) => {
        const animate = () => {
            callback();
            this.request[name].ID = requestAnimationFrame(animate);
        };
        this.request[name] = {
            method: animate,
            isPause: false,
        };
    }
    // 驗證名稱是否有效
    this.nameValidation = (name) => {
        const isValid = Object.keys(this.subject).some(ID => name.includes(ID));
        if(!isValid) console.warn("naming issue: " + name + " should include one of following letters: " + this.subject);
    }
    // 註冊動畫回調
    this.registerAnimationCallback = (name, callback) => {
        this.createAnimation(name, callback);
        this.nameValidation(name);
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
        if (!element.id) return console.warn("Element must have an ID");
        this.subject[element.id] = element;
        this.io.unobserve(element) // avoid observing one element mutiple time
        this.io.observe(element);
    }
    this.removeSubjectID = (id) => {
        if (!this.subject[id]) return console.warn("Element ID not found");
        const element = this.subject[id];
        this.io.unobserve(element);
        delete this.subject[id];
    }
    
    // 暫停動畫(外部方法)
    this.publicPauseAnimation = (name) => {
        if(!this.request[name]) return;
        cancelAnimationFrame(this.request[name].ID);
        this.request[name].isPause = true;
    }
    // 恢復動畫(外部方法)
    this.publicResumeAnimation = (name) => {
        if(!this.request[name]) return;
        this.request[name].isPause = false;
        cancelAnimationFrame(this.request[name].ID);
        this.request[name].ID = requestAnimationFrame(this.request[name].method);
    }
    this.publicListAllAnimations = () => {
        return Object.keys(this.request);
    };
    this.publicListLastAnimations = () => {
        return this.lastRequestName;
    };
    return this;
}
const manager = new managerMaker();
export default manager;