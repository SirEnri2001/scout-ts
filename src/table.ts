import CardPile from "./card-pile";

export default class Table extends CardPile {
    constructor(){
        super();
        this.htmlElement = document.createElement('div');
        this.htmlElement.innerHTML = `
        <h2 class="player-name">Table</h2>
        <div class="player-pile">
        </div>
        `;
        var pile = this.htmlElement.querySelector<HTMLDivElement>('.player-pile');
        this.pileElement = pile?pile:document.createElement('div');
    }
}