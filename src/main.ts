import './style.css'
import Game from './game.ts'
import Card from './card.ts'
import ServerRPC from './server_rpc.ts'
import BroadcastDelegator from './broadcast_delegator.ts'

function parseCardString(pokesString: string): Array<Card> {
  if(pokesString==','){
    return [];
  }
  var cardArray: Array<Card> = [];
  var number1s: Array<string> = pokesString.split(',')[0].split(' ');
  var number2s: Array<string> = pokesString.split(',')[1].split(' ');
  for (var i = 0; i < number1s.length; i++) {
    var n1 = parseInt(number1s[i]=='T'?'10': number1s[i]);
    var n2 = parseInt(number2s[i]=='T'?'10': number2s[i]);
    var card = new Card(n1, n2);
    card.setFlip(false);
    cardArray.push(card);
  }
  return cardArray;
}

function initializeBroadcastDelegator(broadcast: BroadcastDelegator) {
  broadcast.addHandler("playerJoin", (data)=>{
    if(!Object.keys(game.players).includes(data['target_name'])) {
      game.createPlayer(data['target_name'], data['target_name']);
    }
  });
  broadcast.addHandler("playerReady", (data)=>{
    if(!Object.keys(game.players).includes(data['target_name'])) {
      game.createPlayer(data['target_name'], data['target_name']);
    }
    game.players[data['target_name']].setReady(true);
  });
  broadcast.addHandler("gameInit", ()=>{});
  broadcast.addHandler("receivePokes", (data)=>{
    parseCardString(data['pokes']).forEach((card)=>{
      game.players[data['name']].addCard(card);
      card.setFlip(false);
    });
    reverseBtn?.addEventListener('click', game.players[data['name']].reverseCards);
    confirmBtn?.addEventListener('click', choosePokeOrder);
  });
  broadcast.addHandler("gameStart", ()=>{
  });
  broadcast.addHandler("gameAction", (data)=>{
    game.table.removeAllCards();
    parseCardString(data['table']).forEach((card)=>{
      game.table.addCard(card);
      card.setFlip(false);
    });
    Object.values(game.players).forEach((player)=>{
      player.setTurn(false);
    });
    game.players[data['target_name']].setTurn(true);
    if(data['target_name']==name){
      game.players[name].setSelectable(true);
      game.table.setSelectable(true);
      placeCardsBtn?.addEventListener('click', playCards);
    }else{
      game.players[name].setSelectable(false);
      game.table.setSelectable(false);
      placeCardsBtn?.removeEventListener('click', playCards);
    }
  })
}

function login() {
  server_rpc.request('login').then(()=>{
    game.createPlayer(name, name);
    return server_rpc.request('getGids');
  }).then((data)=>{
    data['message'].forEach((gid: string)=>{
      var option = document.createElement("option");
      option.innerHTML = gid;
      document.querySelector<HTMLSelectElement>('#gids-dropdown')?.add(option);
    });
  })
}

function createGame() {
  server_rpc.request('playerJoin', {"gid":""}).then((data)=>{
    server_rpc.addRequestEntry("gid", data['message']);
    var gidElement = document.querySelector<HTMLElement>('#current-gid');
    if(gidElement){
      gidElement.innerHTML = data['message'];
    }
  });
}

function joinGame() {
  var gid = document.querySelector<HTMLSelectElement>('#gids-dropdown')?.selectedOptions[0].innerText;
  server_rpc.addRequestEntry("gid", gid);
  server_rpc.request('playerJoin').then((data)=>{
    var gidElement = document.querySelector<HTMLElement>('#current-gid');
    if(gidElement){
      gidElement.innerHTML = data['message'];
    }
    return server_rpc.request('getGamePlayers')
  }).then((data)=>{
    data['message'].forEach((playername: string) => {
      if(playername!=name){
        game.createPlayer(playername, playername);
      }
    });
    
  });
}

function ready() {
  server_rpc.request('playerReady').then(()=>{
    game.players[name].setReady(true);
  })
}

function choosePokeOrder() {
  server_rpc.request('choosePokeOrder',{'reverse':game.players[name].reversed?1:0}).then(()=>{
    confirmBtn?.removeEventListener('click', choosePokeOrder);
  })
}

function playCards() {
  var begin_index = game.players[name].cards.length;
  var end_index = 0;
  for(var i = 0;i<game.players[name].cards.length;i++){
    if(!game.players[name].cards[i].selected){
      continue;
    }
    begin_index = Math.min(begin_index, i);
    end_index = Math.max(end_index, i+1);
  }

  server_rpc.request('show', {"b_index": begin_index, "e_index": end_index}).then(()=>{
    for(var i=begin_index;i<end_index;i++){
      game.players[name].pileElement.removeChild(game.players[name].cards[i].getHTMLElement());
    }
    game.players[name].cards.splice(begin_index, end_index-begin_index);
  }).catch(()=>{
    alert("Cannot play cards, please retry")
  })
}

function takeCard(reversed: boolean) {
  console.log(game.table.cards);
  var cardsSelectedInTable = game.table.getSelectedCards();
  if(cardsSelectedInTable.length!=1
    || (cardsSelectedInTable[0].getIndex()!=0 
    && cardsSelectedInTable[0].getIndex()!=game.table.cards.length-1)){
    alert("You should select either top or bottom card from table");
    return;
  }
  var cardSelected = cardsSelectedInTable[0];
  if(reversed) {
    cardSelected.setReverse(true);
  }
  game.players[name].setSelectable(false);
  game.players[name].setInsertable(true, cardSelected);
}

function confirmTake(place:boolean) {
  var rpc_func = place?'scoutAndShow':'scout';
  if(place){
    game.players[name].setSelectable(true);
  }else{
    game.players[name].setSelectable(false);
  }
  server_rpc.request(rpc_func, 
    {'insert_to': game.players[name].insertIndex, 
    'reverse': game.players[name].cardsInserted[0].reverse?1:0,
    'index':selectedIndex}).then(()=>{
      game.players[name].setInsertable(false);
      selectedIndex = -1;
    });
  
  
}

var websocket = new WebSocket('ws://localhost:8001');
var name = self.crypto.randomUUID().substring(0, 5);
var canvas = document.querySelector<HTMLElement>('#canvas');
var selectedIndex = -1;
if (canvas){
  var game = new Game(canvas);
  var broadcastDelegator = new BroadcastDelegator();
  initializeBroadcastDelegator(broadcastDelegator);
  var server_rpc = new ServerRPC(websocket, broadcastDelegator);
  server_rpc.addRequestEntry("name", name);
}

const confirmBtn = document.querySelector<HTMLButtonElement>('#confirm');
const reverseBtn = document.querySelector<HTMLButtonElement>('#reverse-my-cards');
const placeCardsBtn = document.querySelector<HTMLButtonElement>("#place-card");
document.querySelector('#login')?.addEventListener('click', login);
document.querySelector('#create-game')?.addEventListener('click', createGame);
document.querySelector('#join-game')?.addEventListener('click', joinGame);
document.querySelector('#ready')?.addEventListener('click', ready);
document.querySelector('#take-card')?.addEventListener('click', ()=>{takeCard(false)});
document.querySelector('#take-card-reversed')?.addEventListener('click', ()=>{takeCard(true)});
document.querySelector('#confirm-take')?.addEventListener('click', ()=>{confirmTake(false)});
document.querySelector('#confirm-take-and-place')?.addEventListener('click', ()=>{confirmTake(true)});