import CardPile from "./card-pile";

export default class Player extends CardPile {
    points: number;
    name: string;
    ready: boolean;
    titleElement: HTMLElement;
    turn: boolean;
    constructor(name: string){
        super();
        this.name = name;
        this.turn = false;
        this.htmlElement = document.createElement('div');
        this.htmlElement.innerHTML = `
        <h2 class="player-name"></h2> has <h2 class="player-points-title"><p class="player-points"></p> pts</h2>
        <div class="player-pile">
        </div>
        `;
        var pile = this.htmlElement.querySelector<HTMLDivElement>('.player-pile');
        this.pileElement = pile?pile:document.createElement('div');
        var playernameElement = this.htmlElement.querySelector<HTMLElement>('.player-name');
        this.points = 0;
        this.ready = false;
        if(playernameElement) {
            playernameElement.innerHTML = this.name;
        }
        this.titleElement = playernameElement?playernameElement:document.createElement('div');
        var pointElement = this.htmlElement.querySelector<HTMLElement>('.player-points');
        if(pointElement){
            pointElement.innerHTML = this.points.toString();
        }
    }
    setPoints(points: number) {
        this.points = points;
        var pointElement = this.htmlElement.querySelector<HTMLElement>('.player-points');
        if(pointElement){
            pointElement.innerHTML = this.points.toString();
        }
    }
    setReady(ready: boolean) {
        if(this.ready != ready) {
            this.ready = ready;
            this.htmlElement.querySelector<HTMLElement>('.player-pile')?.classList.toggle('player-pile-ready');
        }
    }
    setTurn(turn: boolean) {
        if(turn!=this.turn){
            this.titleElement.classList.toggle('player-pile-turn');
            this.turn = turn;
        }
    }
}