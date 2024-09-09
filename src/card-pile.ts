import Card from "./card";
import CardPlaceHolder from "./card_placeholder";

export default class CardPile {
    htmlElement: HTMLDivElement;
    pileElement: HTMLDivElement;
    cards: Array<Card>;
    reversed: boolean;
    insertIndex: number;
    cardsInserted: Array<Card>;
    constructor(){
        this.pileElement = document.createElement('div');
        this.pileElement.classList.add('player-pile');
        this.htmlElement = document.createElement('div');
        this.htmlElement.appendChild(this.pileElement);
        this.cards = [];
        this.reversed = false;
        this.reverseCards = this.reverseCards.bind(this);
        this.insertIndex = -1;
        this.cardsInserted = [];
    }
    getHTMLElement() {
        return this.htmlElement;
    }

    addCard(card: Card) {
        card.removeFromPile();
        this.cards.push(card);
        card.pile = this;
        this.pileElement.appendChild(card.getHTMLElement());
    }

    addCardAfter(cardToBeAdd: Card, cardBefore: Card){
        cardToBeAdd.removeFromPile();
        this.cards.splice(this.cards.indexOf(cardBefore)+1, 0, cardToBeAdd);
        cardToBeAdd.pile = this;
        this.pileElement.insertBefore(cardToBeAdd.getHTMLElement(), cardBefore.getHTMLElement().nextElementSibling);
    }

    addCardBefore(cardToBeAdd: Card, cardAfter: Card){
        cardToBeAdd.removeFromPile();
        this.cards.splice(this.cards.indexOf(cardAfter), 0, cardToBeAdd);
        cardToBeAdd.pile = this;
        this.pileElement.insertBefore(cardToBeAdd.getHTMLElement(), cardAfter.getHTMLElement());
    }

    removeCard(card: Card) {
        if(this.cards.indexOf(card)>-1){
            this.cards.splice(this.cards.indexOf(card), 1);
            try {
                this.pileElement.removeChild(card.getHTMLElement());
            }
            catch(e) {
                if (e instanceof(DOMException)) {
                    console.log("card not exists on this pile or already removed");
                }
                else{
                    throw e;
                }
            }
        }
    }

    removeAllCards() {
        this.cards.forEach((card)=>{
            card.pile = null;
            this.pileElement.removeChild(card.getHTMLElement());
        });
        this.cards = [];
    }

    reverseCards() {
        this.cards.forEach((card: Card)=>{card.setReverse(!card.reverse)});
        // this.cards.reverse();
        for (var i = 1; i < this.pileElement.childNodes.length; i++){
            this.pileElement.insertBefore(this.pileElement.childNodes[i], this.pileElement.firstChild);
        }
        this.reversed = !this.reversed;
    }

    setSelectable(selectable: boolean) {
        this.cards.forEach((card)=>{
            card.setSelected(false);
            card.setSelectable(selectable);
        });
    }

    setInsertable(insertable: boolean, cardToInsert?: Card) {
        this.insertIndex = -1;
        if(insertable){
            this.addCardBefore(new CardPlaceHolder(), this.cards[0]);
        }else{
            this.removeCard(this.cards[0]);
        }
        this.cards.forEach((card)=>{
            card.setHoverable(insertable);
        });
        if(insertable && cardToInsert){
            this.cardsInserted.push(cardToInsert);
            this.cards.forEach((card)=>{
                card.setClickCallback(()=>{
                    this.addCardAfter(cardToInsert, card);
                    this.insertIndex = this.cards.indexOf(cardToInsert) - 1;
                });
            });
        }
        else{
            this.cardsInserted = [];
            this.cards.forEach((card)=>{
                card.unsetClickCallback();
            })
        }
    }

    getSelectedCards(): Array<Card> {
        var cardList: Array<Card> = [];
        this.cards.forEach((card)=>{
            if(card.selected){
                cardList.push(card);
            }
        })
        return cardList;
    }
}