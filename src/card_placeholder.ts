import Card from './card'
export default class CardPlaceHolder extends Card{
    constructor() {
        super(-1, -1);
        this.htmlElement.innerText = "";
    }
}