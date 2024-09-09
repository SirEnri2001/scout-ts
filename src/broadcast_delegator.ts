interface BroadcastBody {
    [entry: string] : any
}

export default class BroadcastDelegator {
    handler: {[func: string]: (data: BroadcastBody)=>any}
    constructor(){
        this.handler = {};

    }

    addHandler(func: string, callable: (data: BroadcastBody)=>any) {
        this.handler[func] = callable;
    }

    execute(data: BroadcastBody) : any {
        if(!Object.keys(data).includes('func')) {
            console.error("Received a broadcast with no function specified");
            console.log("Broadcast body:")
            console.log(data);
            console.log(typeof data)
            throw Error("Received a broadcast with no function specified");
        }
        if(!Object.keys(this.handler).includes(data['func'])) {
            console.error("Broadcast caller's function not defined/implemented");
            console.log("Broadcast body:")
            console.log(data)
            console.log(typeof data)
            throw Error("Broadcast caller's function not defined/implemented");
        }
        return this.handler[data['func']](data);
    }
}