import CardPile from "./card-pile";

export default class Card {
    number1: number;
    number2: number;
    flip: boolean;
    reverse: boolean;
    htmlElement: HTMLDivElement;
    piled: boolean;
    selectable: boolean;
    selected: boolean;
    hoverable: boolean;
    pile: CardPile | null;
    click_callback: (param:any)=>void;
    constructor(n1: number, n2: number) {
      this.number1 = n1;
      this.number2 = n2;
      this.flip = true;
      this.reverse = false;
      this.piled = true;
      this.selectable = false;
      this.selected = false;
      this.hoverable = false;
      this.htmlElement = document.createElement('div');
      this.htmlElement.innerHTML = `
        <div class='card-3d-wrapper'>
          <div class='card-front'>
            <div class='number-box' style='top:0px; left:0px'>
              <div class='big-number number1'>
              </div>
              <div class='small-number number2'>
              </div>
            </div>
            <div class='number-box back' style="right: 0px; bottom: 0px">
              <div class='big-number number2'>
              </div>
              <div class='small-number number1'>
              </div>
            </div>
          </div>
          <div class='card-back'></div>
        </div>`;
      this.htmlElement.querySelectorAll<HTMLElement>('.number1').forEach(item=>{item.innerHTML=this.number1.toString();});
      this.htmlElement.querySelectorAll<HTMLElement>('.number2').forEach(item=>{item.innerHTML=this.number2.toString();});
      this.htmlElement.querySelector<HTMLElement>('.card-3d-wrapper')?.classList.add('card-flipped');
      this.htmlElement.classList.add('card');
      this.toggleSelected = this.toggleSelected.bind(this);
      this.click_callback = ()=>{};
      this.pile = null;
    }
    setFlip(flip: boolean) {
        if(this.flip != flip) {
            this.flip = flip;
            this.htmlElement.querySelector<HTMLElement>('.card-3d-wrapper')?.classList.toggle('card-flipped');
        }
    }
    setReverse(reverse: boolean) {
        if(this.reverse != reverse) {
            this.reverse = reverse;
            this.htmlElement.querySelector<HTMLElement>('.card-front')?.classList.toggle('card-reverse');
        }
    }
    setSelectable(selectable: boolean) {
      this.setSelected(false);
      if(this.selectable != selectable) {
          this.selectable = selectable;
          this.htmlElement.querySelector<HTMLElement>('.card-back')?.classList.toggle('card-selectable');
          this.htmlElement.querySelector<HTMLElement>('.card-front')?.classList.toggle('card-selectable');
      }
      if(this.selectable) {
          this.htmlElement.addEventListener('click', this.toggleSelected);
      }else{
          this.htmlElement.removeEventListener('click', this.toggleSelected);
      }
    }
    setSelected(selected: boolean) {
        if(this.selected != selected) {
            this.selected = selected;
            this.htmlElement.querySelector<HTMLElement>('.card-back')?.classList.toggle('card-selected');
            this.htmlElement.querySelector<HTMLElement>('.card-front')?.classList.toggle('card-selected');
            this.htmlElement.classList.toggle('card-selected');
        }

    }
    toggleSelected() {
        this.setSelected(!this.selected);
    }
    getHTMLElement() {
      return this.htmlElement;
    }
    setHoverable(hoverable: boolean) {
      if(this.hoverable!=hoverable){
        this.htmlElement.classList.toggle('card-hoverable');
        this.hoverable = hoverable;
      }
      if(this.hoverable){
        var hoverBox = document.createElement('div');
        hoverBox.classList.add('card-hover-box');
        this.htmlElement.appendChild(hoverBox);
      }else{
        var elem = this.htmlElement.querySelector<HTMLElement>('.card-hover-box')
        if(elem){
          this.htmlElement.removeChild(elem);
        }
      }
    }

    setClickCallback(callback: (param: any)=>void) {
      callback.bind(this);
      this.click_callback = callback;
      this.htmlElement.addEventListener('click', this.click_callback);
    }

    unsetClickCallback() {
      this.htmlElement.removeEventListener('click', this.click_callback);
      this.click_callback = ()=>{};
    }

    removeFromPile(){
      if(this.pile != null){
        this.pile.removeCard(this);
      }
    }

    getIndex() {
      if(this.pile==null){
        return -2;
      }
      return this.pile.cards.indexOf(this);
    }
  }