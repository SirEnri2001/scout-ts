import Game from "./game";

export default class ServerEvent {
    game: Game;
    websocket: WebSocket;
    constructor(game: Game, websocket: WebSocket) {
        this.game = game;
        this.websocket = websocket;
    }
    playerJoin() {

    }

    playerLeave() {

    }

    playerReady() {

    }

    playerUnready() {

    }

    gameInit() {

    }

    gameStart() {

    }

    gameAction() {

    }

    win() {

    }

    terminate() {

    }

    playerConfirm() {

    }
}