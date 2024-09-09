import BroadcastDelegator from "./broadcast_delegator";

interface Request {[entry: string]: any};
interface Response {[entry: string]: any};

export default class ServerRPC {
    websocket: WebSocket;
    seq: number;
    socket_results: {[seq: number]: Response};
    default_request: Request;
    constructor(websocket: WebSocket, broadcast_delegator: BroadcastDelegator) {
        this.websocket  = websocket;
        this.seq = 0;
        this.socket_results = [];
        this.default_request = {};
        this.websocket.addEventListener("message", (event) => {
            var json = JSON.parse(event.data);
            if(typeof json == 'string') {
                json = JSON.parse(json);
            }
            console.log(json);
            if(json['seq']==-1 || typeof json['seq']=='undefined'){
                broadcast_delegator.execute(json);
            }
            else{
                this.socket_results[json['seq']]=json;
            }
        });
        this.websocket.addEventListener("close", ()=>{
            console.error("Server socket closed, please refresh page or contact maintainer");
        });
    }

    addRequestEntry(entry: string, value: any) {
        this.default_request[entry] = value;
    }

    removeRequestEntry(entry: string) {
        delete this.default_request[entry];
    }

    async request(rpc_name: string, object?: Request): Promise<Response> {
        var seq = this.getSeq()
        var json: Request = {
            "func": rpc_name,
            "seq": seq
        };
        Object.keys(this.default_request).forEach((key)=>{
            json[key] = this.default_request[key];
        });
        if(object) {
            Object.keys(object).forEach((key)=>{
                json[key] = object[key];
            });
        }
        this.websocket.send(JSON.stringify(json));
        return new Promise((resolve, reject) => {
            this.result(seq).then((resp: Response)=>{
                if(resp['code']==0){
                    resolve(resp);
                }else{
                    reject(resp);
                }
            });
        });
    }
    
    is_ready(seq: number) {
        return !(typeof this.socket_results[seq]=='undefined');
    }

    async result(seq:number): Promise<Response>  {
        var timeout = 100;
        while(!this.is_ready(seq)){
            await new Promise(r => setTimeout(r, 100));
            timeout--;
            if (timeout<0){
                throw new Error("Server no response");
            }
        }
        var resp: Response = this.socket_results[seq];
        delete this.socket_results[seq];
        return resp;
    }

    getSeq() {
        return this.seq++;
    }
}