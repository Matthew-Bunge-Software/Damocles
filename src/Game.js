const gameStates = require("./gameStates.js");
import Card from "./Card.js";
import ChatBox from "./ChatBox.js";
import Display from "./Display.js";
import Waiting from "./Waiting.js";

class Game extends React.Component {
    constructor(props) {
        super(props);
        let selectCards = props.selectCards;
        let cards = selectCards.map((name) => { return (<Card key={name.ID} onClick={(i) => this.handleCardClick(i)} display={""} card={name} />) });
        this.state = {
            playedRaw: props.played,
            played: [],
            selectedColor: null,
            isSwap: false,
            index: null,
            rawCards: selectCards,
            cards: cards,
            selectedActionCard: null,
            selectedNumberCard: null,
            playedThisTurn: []
        };
    }

    componentDidMount() {
        this.props.socket.on('boardChange', () => {
            this.setState({
                cards: this.updateActiveCards(this.props.spaces, this.props.selectCards),
                played: this.updateActiveCards(this.props.spaces, this.props.played)
            });
        });
        this.props.socket.on('cardPlayed', () => {
            this.setState({
                cards: this.updateActiveCards(this.props.spaces, this.props.selectCards),
                played: this.updateActiveCards(this.props.spaces, this.props.played)
            });
        });
        this.props.socket.on('cardUpdate', () => {
            this.setState({
                cards: this.updateActiveCards(this.props.spaces, this.props.selectCards),
                played: this.updateActiveCards(this.props.spaces, this.props.played)
            });
        });
        this.props.socket.on('discardphase', () => {
           this.setState({
               queuedForDiscard: Array(this.props.discardCount).fill(null)
           }) 
        });
    }
    
    handleDiscardClick() {
        let cardsToRemove = this.props.selectCards.slice();
        let cardsToDiscard = this.state.queuedForDiscard.slice();
        let j = 0;
        if (!cardsToDiscard.includes(null)) {
            while (j < cardsToRemove.length) {
                let matched = false;
                for (let k = 0; k < cardsToDiscard.length; k++) {
                    if (this.cardsEqual(cardsToRemove[j], cardsToDiscard[k])) {
                        cardsToRemove.splice(j, 1);
                        cardsToDiscard.splice(k, 1);
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    j++;
                }
            }
            if (this.props.processCode === null) {
                this.props.socket.emit('discardPresetup', {
                    newHand: cardsToRemove,
                    user: this.props.getCookie(),
                    id: this.props.id

                });
            } else {
                this.props.socket.emit('discardNormalHand', {
                    hand: cardsToRemove,
                    id: this.props.id
                });
            }
        }
    }

    cardIsNumber(cardType) {
        return cardType === "1" || cardType === "2" || cardType === "3";
    }

    handlePlayClick() {
        let number = this.state.selectedNumberCard;
        let action = this.state.selectedActionCard;
        let spaceState = this.props.spaces.slice();
        let tempPlayed = [];
        let oldPlayed = [];
        let playedToRecycle = this.props.played.slice();
        let cardsToRemove = this.props.selectCards.slice();
        let reflexused = false;
        let playedThisTurn = this.state.playedThisTurn.slice();
        for (let i = 0; i < playedThisTurn.length; i++) {
            if (this.cardsEqual(playedThisTurn[i].action, action) && this.cardsEqual(playedThisTurn[i].number, number)) {
                return false;
            }
        }
        if (this.stateIsHaste(this.props.gameState)) { //Only haste can be played
            if (this.validHasteSelected(number, action)) {
                if (this.isActive(spaceState, action)) {
                    let j = 0;
                    // Search Hand
                    while (j < cardsToRemove.length) {
                        if (this.cardsEqual(cardsToRemove[j], number) || this.cardsEqual(cardsToRemove[j], action)) {
                            tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                        } else {
                            j++;
                        }
                    }
                    j = 0;
                    // Search Played
                    while (j < playedToRecycle.length) {
                        if (this.cardsEqual(playedToRecycle[j], number) || this.cardsEqual(playedToRecycle[j], action)) {
                            oldPlayed.push(playedToRecycle[j]);
                        }
                        j++;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else { // Anything can be played
            //TODO: Make haste playable but have it not do anything
            if (number != null && action != null) {
                if (this.isActive(spaceState, number) && this.isActive(spaceState, action) && (action.type != "A" && action.type != "R" && action.type != "H")) {
                    let j = 0;
                    while (j < cardsToRemove.length) {
                        if (this.cardsEqual(cardsToRemove[j], number) || this.cardsEqual(cardsToRemove[j], action)) {
                            tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                        } else {
                            j++;
                        }
                    }
                    j = 0;
                    while (j < playedToRecycle.length) {
                        if (this.cardsEqual(playedToRecycle[j], number) || this.cardsEqual(playedToRecycle[j], action)) {
                            oldPlayed.push(playedToRecycle[j]);
                        }
                        j++;
                    }
                } else if (this.props.gameState === gameStates.reflexed && 
                            (this.isActiveReflexed(spaceState, number) && this.isActive(spaceState, action) ||
                            this.isActive(spaceState, number) && this.isActiveReflexed(spaceState, action)) &&
                            (action.type != "A" && action.type != "R" && action.type != "H")) {
                    let j = 0;
                    reflexused = true;
                    while (j < cardsToRemove.length) {
                        if (this.cardsEqual(cardsToRemove[j], number) || this.cardsEqual(cardsToRemove[j], action)) {
                            tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                        } else {
                            j++;
                        }
                    }
                    if (cardsToRemove.length === this.props.selectCards.length) {
                        return false;
                    }
                    j = 0;
                    while (j < playedToRecycle.length) {
                        if (this.cardsEqual(playedToRecycle[j], number) || this.cardsEqual(playedToRecycle[j], action)) {
                            oldPlayed.push(playedToRecycle[j]);
                        }
                        j++;
                    }
                } else {
                    return false;
                }
            } else if (action != null) {
                if (this.isActive(spaceState, action) && (action.type === "A" || action.type === "R")) {
                    let j = 0;
                    while (j < cardsToRemove.length) {
                        if (this.cardsEqual(cardsToRemove[j], action)) {
                            tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                        } else {
                            j++;
                        }
                    }
                    j = 0;
                    while (j < playedToRecycle.length) {
                        if (this.cardsEqual(playedToRecycle[j], action)) {
                            oldPlayed.push(playedToRecycle[j]);
                        }
                        j++;
                    }
                } else if (this.props.gameState === gameStates.reflexed && this.isActiveReflexed(spaceState, action) && (action.type === "A" || action.type === "R")) {
                    let j = 0;
                    reflexused = true;
                    while (j < cardsToRemove.length) {
                        if (this.cardsEqual(cardsToRemove[j], action)) {
                            tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                        } else {
                            j++;
                        }
                    }
                    if (cardsToRemove.length === this.props.selectCards.length) {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        playedThisTurn.push({
            action: action,
            number: number
        });
        this.setState({
            selectedNumberCard: null,
            selectedActionCard: null,
            playedThisTurn: playedThisTurn
        });
        this.props.socket.emit('cardPlayed', {
            newPlayed: tempPlayed,
            oldPlayed: oldPlayed,
            rest: cardsToRemove,
            pid: this.props.pid,
            id: this.props.id,
            reflexused: reflexused
        });
    }

    handleCardClick(i) {
        let selectCards = this.props.selectCards.slice();
        let played = this.props.played.slice();
        let cardType = i.type;
        let accessable = this.props.processCode === null ? selectCards.length : this.props.processCode;
        let selectCardsIndex = -1;
        for (let j = 0; j < selectCards.length; j++) {
            if (this.cardsEqual(i, selectCards[j])) {
                selectCardsIndex = j;
                break;
            }
        }
        if (this.discardValid(this.props.gameState, this.props.pid === this.props.currentPlayer)) {
            let tempDiscard = this.state.queuedForDiscard.slice();
            if (selectCardsIndex >= selectCards.length - accessable) {
                let found = false;
                for (let j = 0; j < tempDiscard.length; j++) {
                    if (this.cardsEqual(tempDiscard[j], i)) {
                        tempDiscard[j] = null;
                        found = true;
                        break;
                    }
                }
                if (!found && tempDiscard.includes(null)) {
                    for (let j = 0; j < tempDiscard.length; j++) {
                        if (tempDiscard[j] === null) {
                            tempDiscard[j] = i;
                            break;
                        }
                    }
                }
                this.setState({
                    queuedForDiscard: tempDiscard,
                    cards: selectCards.map((name) => {
                        let selected = "";
                        for (let j = 0; j < tempDiscard.length; j++) {
                            if (this.cardsEqual(tempDiscard[j], name)) {
                                selected = "selectedCard";
                                break;
                            }
                        }
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={""} card={name} />);
                    }),
                })
            }
        } else {
            if (this.cardIsNumber(cardType)) {
                let newSelected = (i === this.state.selectedNumberCard) ? null : i;
                this.setState({
                    selectedNumberCard: newSelected,
                    cards: selectCards.map((name) => {
                        let active = "";
                        if (this.isActive(this.props.spaces, name)) {
                            active = "active";
                        } else if ((this.props.gameState === gameStates.reflexed && this.props.currentPlayer === this.props.pid) && this.isActiveReflexed(this.props.spaces, name)) {
                            active = "activeReflexed";
                        }
                        let selected = (this.cardsEqual(name, newSelected) || this.cardsEqual(name, this.state.selectedActionCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    }),
                    played: played.map((name) => {
                        let active = this.isActive(this.props.spaces, name) ? "active" : "";
                        let selected = (this.cardsEqual(name, newSelected) || this.cardsEqual(name, this.state.selectedActionCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    })
                });
            } else {
                let newSelected = (i === this.state.selectedActionCard) ? null : i;
                this.setState({
                    selectedActionCard: newSelected,
                    cards: selectCards.map((name) => {
                        let active = "";
                        if (this.isActive(this.props.spaces, name)) {
                            active = "active";
                        } else if ((this.props.gameState === gameStates.reflexed && this.props.currentPlayer === this.props.pid) && this.isActiveReflexed(this.props.spaces, name)) {
                            active = "activeReflexed";
                        }
                        let selected = (this.cardsEqual(name, newSelected) || this.cardsEqual(name, this.state.selectedNumberCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    }),
                    played: played.map((name) => {
                        let active = this.isActive(this.props.spaces, name) ? "active" : "";
                        let selected = (this.cardsEqual(name, newSelected) || this.cardsEqual(name, this.state.selectedNumberCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    })
                })
            }
        }
    }

    handleSelectorClick(i) {
        if (this.props.currentPlayer === this.props.pid) {
            if (i.count > 0) {
                this.setState({
                    selectedColor: i.color,
                    isSwap: false,
                    index: null,
                });
            }
        }
    }

    handleBoardClick(i, index) {
        const prevState = this.state;
        if (this.props.currentPlayer === this.props.pid) {
            if (this.props.gameState === "setup") {
                if (prevState.selectedColor != null && this.props.spaces[index] === null) {
                    // swap with stack
                    let newSpaces = this.props.spaces.slice();
                    newSpaces[index] = prevState.selectedColor;
                    let newCounts = this.props.colorCounts.slice();
                    let setupcomplete = true;
                    for (var j = 0; j < 7; j++) {
                        if (newSpaces[j] === null) {
                            setupcomplete = false;
                            break;
                        }
                    }
                    for (var j = 0; j < newCounts.length; j++) {
                        if (newCounts[j].color === prevState.selectedColor) {
                            newCounts[j].count--;
                        }
                        if (
                            this.props.spaces[index] != null &&
                            this.props.spaces[index] === newCounts[j].color
                        ) {
                            newCounts[j].count++;
                        }
                    }
                    this.props.socket.emit('boardChange', {newSpaces: newSpaces, newCounts: newCounts, id: this.props.id });
                    this.setState({
                        selectedColor: null,
                        isSwap: false,
                        index: null,
                        gameState: setupcomplete ? "" : "setup"
                    });
                }
            } else if (this.props.gameState === gameStates.hasted || this.props.gameState === gameStates.swapBoard) {
                if (prevState.index === index) {
                    //Selecting already selected deselects
                    this.setState({
                        selectedColor: null,
                        isSwap: false,
                        index: null
                    });
                } else if (prevState.selectedColor != null) {
                    // swap with stack
                    let newSpaces = this.props.spaces.slice();
                    newSpaces[index] = prevState.selectedColor;
                    let newCounts = this.props.colorCounts.slice();
                    for (var j = 0; j < newCounts.length; j++) {
                        if (newCounts[j].color === prevState.selectedColor) {
                            newCounts[j].count--;
                        }
                        if (
                            this.props.spaces[index] != null &&
                            this.props.spaces[index] === newCounts[j].color
                        ) {
                            newCounts[j].count++;
                        }
                    }
                    let emitCheck = this.props.gameState === gameStates.hasted ? 'bonusswap' : 'boardChange';
                    this.props.socket.emit(emitCheck, {newSpaces: newSpaces, newCounts: newCounts, id: this.props.id});
                    this.setState({
                        selectedColor: null,
                        isSwap: false,
                        index: null,
                    });
                } else if (prevState.isSwap) {
                    //Swapping with active thing
                    let newSpaces = this.props.spaces.slice();
                    let temp = newSpaces[index];
                    newSpaces[index] = newSpaces[prevState.index];
                    newSpaces[prevState.index] = temp;
                    let emitCheck = this.props.gameState === gameStates.hasted ? 'bonusswap' : 'boardChange';
                    this.props.socket.emit(emitCheck, {newSpaces: newSpaces, newCounts: this.props.colorCounts, id: this.props.id});
                    this.setState({
                        selectColor: null,
                        isSwap: false,
                        index: null,
                    });
                } else {
                    //Selecting for swap
                    this.setState({
                        selectColor: null,
                        isSwap: true,
                        index: index
                    });
                }
            }
        }
    }

    updateActiveCards(newState, selectCards) {
        return (selectCards.map((name) => {
            let active = "";
            if (this.isActive(newState, name)) {
                active = "active";
            } else if ((this.props.gameState === gameStates.reflexed && this.props.currentPlayer === this.props.pid) && this.isActiveReflexed(newState, name)) {
                active = "activeReflexed";
            }
            let selected = (this.cardsEqual(this.state.selectedActionCard, name) || this.cardsEqual(this.state.selectedNumberCard, name)) ? "selectedCard" : "";
            return (<Card key={name.ID} onClick={(i) => this.handleCardClick(i)} selected={selected} display={active} card={name} />);
        }));
    }

    isActive(newState, name) {
        if (name.spaces != null && newState != null) {
            let rotation = newState.slice();
            let nameSpaces = name.spaces.slice();
            return this.arraysAreRotations(nameSpaces, rotation);
        }
        return false;
    }

    isActiveReflexed(newState, name) {
        let rotation = this.purgeNull(newState);
        let nameSpaces = this.purgeNull(name.spaces);
        return this.arraysAreRotations(nameSpaces, rotation);
    }

    discardValid(gameState, myTurn) {
        return gameState === gameStates.initialDiscard || (gameState === gameStates.discardNormal && myTurn);
    }

    stateIsHaste(gameState) {
        return gameState === gameStates.hasteCheck;
    }

    validHasteSelected(number, action) {
        return number === null && action != null && action.type === "H";
    }

    arraysAreRotations(cardSpaces, boardSpaces) {
        let active = true;
        for (let j = 0; j < boardSpaces.length; j++) {
            active = false;
            let k = 0;
            for (let i = 0; i < boardSpaces.length; i++) {
                if (cardSpaces[k] === null || cardSpaces[k] === boardSpaces[i]) {
                    k++;
                    if (k === cardSpaces.length) {
                        active = true;
                        break;
                    }
                }
            }
            //Match found
            if (active) {
                break;
            }
            //Rotates board
            let temp = boardSpaces[0];
            for (let i = 0; i < boardSpaces.length; i++) {
                boardSpaces[i] = boardSpaces[i + 1];
            }
            boardSpaces[boardSpaces.length - 1] = temp;
        }
        return active;
    }

    purgeNull(name) {
        let purged = name.slice();
        let j = 0;
        while (j < purged.length) {
            if (purged[j] === null) {
                purged.splice(j, 1);
            } else {
                j++;
            }
        }
        return purged;
    }

    abandonRoom() {
        this.props.socket.emit("abandonRoom", {
            id: this.props.id,
            user: this.props.getCookie()
        });
    }

    nextTurn() {
        if (this.props.gameState === 'playCards' || this.props.gameState === gameStates.reflexed) {
            this.setState({
                playedThisTurn: []
            })
        }
        this.props.socket.emit('nextPhase', { 
            id: this.props.id 
        });
    }

    modifyPoints() {
        let points = this.props.points.slice();
        let played = this.props.allPlayed.slice();
        for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < played[i].length; j++) {
                points[i] += played[i][j].points;
            }
        }
        return points;
    }

    cardsEqual(a, b) {
        return ((a === null && b === null) || a != null && b != null && a.one === b.one &&
            a.two === b.two &&
            a.three === b.three &&
            a.four === b.four &&
            a.five === b.five &&
            a.six === b.six &&
            a.seven === b.seven &&
            a.type === b.type &&
            a.id === b.id
        );
    }

    render() {
        let allPlayed = this.props.allPlayed.slice();
        for (let i = 0; i < allPlayed.length; i++) {
            allPlayed[i] = this.updateActiveCards(this.props.spaces, allPlayed[i]);
        }
        let display = <Display
            spaces={this.props.spaces} //[]
            colorCounts={this.props.colorCounts} //[]
            selectorClick={i => this.handleSelectorClick(i)} //function
            boardClick={(i, j) => this.handleBoardClick(i, j)} //function
            cards={this.state.cards} //[<Cards>]
            played={this.state.played}//[<Cards>]
            playClicked={() => this.handlePlayClick()} //function
            discardCount={this.props.discardCount}
            discardClicked={() => this.handleDiscardClick()}
            myTurn={this.props.pid === this.props.currentPlayer}
            gameState={this.props.gameState}
            allPlayed={allPlayed}
            pid={this.props.pid}
            players={this.props.players}
            points={this.modifyPoints()}
            id={this.props.id}
            nextTurn={() => this.nextTurn()}
            discardValid={(i, j) => this.discardValid(i, j)}
        />;
        let waiting = <Waiting id={this.props.id} 
                               players={this.props.players}
                               getCookie={this.props.getCookie}
                               socket={this.props.socket}
                        />;
        let showMe = this.props.gameState === gameStates.preGameLobby ? waiting : display;
        return (<div id={"game"}>
                    <button id={"backbutton"} type={'button'} onClick={() => this.abandonRoom()}>{"Back"}</button>
                    {showMe}
                    <ChatBox id={this.props.id} 
                            chat={this.props.chat}
                            socket={this.props.socket}
                            getCookie={this.props.getCookie}
                    />
                </div>);
    }
}

export default Game;