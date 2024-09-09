import Card from "./card";
import Player from "./player";
import Table from "./table";

export default class Game {
    players: {[id: string] : Player};
    cards: {[id: string] : Card};
    canvas: HTMLElement;
    table: Table;
    constructor(canvas: HTMLElement) {
        this.players = {};
        this.cards = {};
        this.canvas = canvas;
        this.table = new Table();
        this.canvas.appendChild(this.table.getHTMLElement());
    }

    createPlayer(id: string, name: string) {
        this.players[id] = new Player(name);
        this.canvas.appendChild(this.players[id].getHTMLElement());
    }

    deletePlayer(id: string) {
        if (Object.keys(this.players).includes(id)) {
            this.canvas.removeChild(this.players[id].getHTMLElement());
            delete this.players[id];
        }
        else{
            console.error("No such player exists: "+id);
        }
    }

    existsPlayer(id: string) {
        return Object.keys(this.players).includes(id);
    }
}