import Game from "./game";

export default class BroadcastHandler {
    handle(data: {[entry: string] : any}, game:Game) {
        if(data['func']=='playerJoin' && !Object.keys(game.players).includes(data['target_name'])) {
            game.createPlayer(data['target_name'], data['target_name']);
        }
    }
}