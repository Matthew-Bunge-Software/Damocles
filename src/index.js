

const NAMES = ["one", "two", "three", "four", "five", "six", "seven"];

const HEPINDEX = NAMES.map(name => name + "hep");

class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spaces: props.card.spaces,
            card: props.card,
        }
    }

    rotateDisplay(event) {
        let temp = this.state.spaces.slice();
        if (event.keyCode === 81) {
            let hold = temp[0];
            for (var i = 0; i < 6; i++) {
                temp[i] = temp[i + 1];
            }
            temp[6] = hold;
        } else if (event.keyCode === 69) {
            let hold = temp[6];
            for (var i = 6; i > 0; i--) {
                temp[i] = temp[i - 1];
            }
            temp[0] = hold;
        }
        this.setState({
            spaces: temp
        })
    }

    render() {
        let newSpaces = this.state.spaces.map((color, index) => <li key={index} className={"dot small " + color + " " + HEPINDEX[index]}>{}</li>);
        newSpaces.push(<li key={7} className="cardType">{this.props.card.type}</li>);
        return (<div onKeyDown={(e) => this.rotateDisplay(e)}
            tabIndex="0"
            className="cardRotateContainer">
            <ul onClick={() => this.props.onClick(this.state.card)}
                className={"card " + this.props.display + " " + this.props.selected}
            >  {newSpaces} </ul></div>);
    }
}

function Header(props) {
    let myTurn = props.myTurn ? "My turn" : "Not my turn";
    return <p>{myTurn}</p>
}

function OtherHands(props) {
    return <div className="otherHands">
        {props.played}
    </div>;
}

function PlayedTiles(props) {
    return <div className="playedtiles">{props.played}</div>;
}

class MyHand extends React.Component {
    renderButton() {
        if (this.props.gameState === 'discardphase') {
            return <button onClick={() => this.props.discardClicked()} className={"playbutton"}>{"DiscardTiles"}</button>
        } else {
            return <button disabled={(this.props.gameState === "setup") || !this.props.myTurn} onClick={() => this.props.playClicked()} className={"playbutton"}>{"Play Tiles"}</button>
        }
    }

    render() {
        return <div className="hand">
            {this.props.cards}
            {this.renderButton()}
        </div>;
    }
}

function Community(props) {
    const basin = props.colorCounts;
    const listBasin = basin.map(color => (
        <button
            className={"dot " + color.color}
            key={color.color}
            onClick={() => props.onClick(color)}
        >
            {color.count}
        </button>
    ));
    return <ul>{listBasin}</ul>;
}

function Board(props) {
    const spaces = props.spaces;
    const listBoard = spaces.map((color, index) => (
        <button
            className={"dot " + color + " " + HEPINDEX[index]}
            key={index}
            onClick={() => props.onClick(color, index)}
        >{}</button>
    ));
    return <ul className="board">{listBoard}</ul>;
}

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        }
    }

    updatePassword(e) {
        this.setState({
            password: e.target.value
        })
    }

    updateUsername(e) {
        this.setState({
            username: e.target.value
        });
    }
    
    render() {
        return <div className={"Login"}>
            <form id="login">
                <label htmlFor={"uname"}><b>{"Username"}</b></label>
                <input type={"text"} id={"uname"} placeholder={"Enter Username"} onChange={(e) => this.updateUsername(e)}></input>
                <label htmlFor={"passw"}><b>{"Password"}</b></label>
                <input type={"text"} id={"passw"} placeholder={"Enter Password"} onChange={(e) => this.updatePassword(e)}></input>
                <button onClick={() => this.props.onClick(this.state.username, this.state.password)} type={"button"}>{"Login"}</button>
            </form>
        </div>;
    }
}

class Waiting extends React.Component {
    userReady() {
        socket.emit("userreadied", {
            user: getCookie(),
            id: this.props.id
        });
    }

    buttonStatus() {
        let player = this.props.players.slice();
        let user = getCookie();
        for (let i = 0; i < player.length; i++) {
            if (player[i].name === user) {
                return player[i].ready;
            }
        }
    }

    renderPlayers() {
        let player = this.props.players.slice();
        player = player.map(player => { 
            let active = player.ready ? "readied" : "notreadied";
            return <li index={player.name} className={"pregameListItem " + active}>{player.name}</li>
        });
        return <ul>{player}</ul>
    }

    render() {
        return (
            <div className={"Waiting"}>
                {this.renderPlayers()}
                <button disabled={this.buttonStatus()} onClick={() => this.userReady()} type={"button"}>{"Ready"}</button>
            </div>);
    }
}

class Display extends React.Component {
    renderSelector() {
        return (
            <Community
                onClick={i => this.props.selectorClick(i)}
                colorCounts={this.props.colorCounts}
            />
        );
    }

    renderOtherHands() {
        let hands = [];
        for (let i = 0; i < this.props.allPlayed.length; i++) {
            hands.push(<OtherHands played={this.props.allPlayed[i]}/>);
        }
        return hands;
    }

    render() {
        return (
            <div className="display">
                {this.renderOtherHands()}
                <Header myTurn={this.props.myTurn}/>
                {this.renderSelector()}
                <Board
                    onClick={(i, j) => this.props.boardClick(i, j)}
                    spaces={this.props.spaces}
                />
                <PlayedTiles played={this.props.played} />
                <MyHand playClicked={() => this.props.playClicked()} 
                        discardClicked={() => this.props.discardClicked()}
                        cards={this.props.cards} 
                        myTurn={this.props.myTurn}
                        gameState={this.props.gameState}
                />
            </div>
        );
    }
}

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
                    if (cardsEqual(cardsToRemove[j], cardsToDiscard[k])) {
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
                socket.emit('discardPresetup', {
                    newHand: cardsToRemove,
                    user: getCookie(),
                    id: this.props.id

                });
            } else {
                socket.emit('discardNormalHand', {
                    hand:cardsToRemove,
                    id: this.props.id
                });
            }
        }
    }

    handlePlayClick() {
        let number = this.state.selectedNumberCard;
        let action = this.state.selectedActionCard;
        let spaceState = this.props.spaces.slice();
        let tempPlayed = [];
        let cardsToRemove = this.props.selectCards.slice();
        if (number != null && action != null) {
            if (this.isActive(spaceState, number) && this.isActive(spaceState, action) && (action.type != "A" && action.type != "R" && action.type != "H")) {
                let j = 0;
                while (j < cardsToRemove.length) {
                    if (cardsEqual(cardsToRemove[j], number) || cardsEqual(cardsToRemove[j], action)) {
                        tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                    } else {
                        j++;
                    }
                }
            }
        } else if (action != null) {
            if (this.isActive(spaceState, action) && (action.type === "A" || action.type === "R" || action.type === "H")) {
                let j = 0;
                while (j < cardsToRemove.length) {
                    if (cardsEqual(cardsToRemove[j], action)) {
                        tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                    } else {
                        j++;
                    }
                }
            }
        }
        this.setState({
            selectedNumberCard: null,
            selectedActionCard: null,
        });
        socket.emit('cardPlayed', {
            newPlayed: tempPlayed,
            rest: cardsToRemove,
            pid: this.props.pid,
            id: this.props.id
        });
    }

    handleCardClick(i) {
        let selectCards = this.props.selectCards.slice();
        let played = this.props.played.slice();
        let cardType = i.type;
        let accessable = this.props.processCode === null ? selectCards.length : this.props.processCode;
        let selectCardsIndex = -1;
        for (let j = 0; j < selectCards.length; j++) {
            if (cardsEqual(i, selectCards[j])) {
                selectCardsIndex = j;
                break;
            }
        }
        if (this.props.gameState === 'discardphase') {
            let tempDiscard = this.state.queuedForDiscard.slice();
            if (selectCardsIndex >= selectCards.length - accessable) {
                let found = false;
                for (let j = 0; j < tempDiscard.length; j++) {
                    if (cardsEqual(tempDiscard[j], i)) {
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
                            if (cardsEqual(tempDiscard[j], name)) {
                                selected = "selectedCard";
                                break;
                            }
                        }
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={""} card={name} />);
                    }),
                })
            }
        } else {
            if (cardType === "1" || cardType === "2" || cardType === "3") {
                let newSelected = (i === this.state.selectedNumberCard) ? null : i;
                this.setState({
                    selectedNumberCard: newSelected,
                    cards: selectCards.map((name) => {
                        let active = this.isActive(this.props.spaces, name) ? "active" : "";
                        let selected = (cardsEqual(name, newSelected) || cardsEqual(name, this.state.selectedActionCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    }),
                    played: played.map((name) => {
                        let active = this.isActive(this.props.spaces, name) ? "active" : "";
                        let selected = (cardsEqual(name, newSelected) || cardsEqual(name, this.state.selectedActionCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    })
                });
            } else {
                let newSelected = (i === this.state.selectedActionCard) ? null : i;
                this.setState({
                    selectedActionCard: newSelected,
                    cards: selectCards.map((name) => {
                        let active = this.isActive(this.props.spaces, name) ? "active" : "";
                        let selected = (cardsEqual(name, newSelected) || cardsEqual(name, this.state.selectedNumberCard)) ? "selectedCard" : "";
                        return (<Card key={name.ID} selected={selected} onClick={(i) => this.handleCardClick(i)} display={active} card={name} />);
                    }),
                    played: played.map((name) => {
                        let active = this.isActive(this.props.spaces, name) ? "active" : "";
                        let selected = (cardsEqual(name, newSelected) || cardsEqual(name, this.state.selectedNumberCard)) ? "selectedCard" : "";
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
                    socket.emit('boardChange', {newSpaces: newSpaces, newCounts: newCounts, id: this.props.id });
                    this.setState({
                        selectedColor: null,
                        isSwap: false,
                        index: null,
                        gameState: setupcomplete ? "" : "setup"
                    });
                }
            } else {
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
                    let emitCheck = this.props.gameState === 'bonusswap' ? 'bonusswap' : 'boardChange';
                    socket.emit(emitCheck, {newSpaces: newSpaces, newCounts: newCounts, id: this.props.id});
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
                    let emitCheck = this.props.gameState === 'bonusswap' ? 'bonusswap' : 'boardChange';
                    socket.emit(emitCheck, {newSpaces: newSpaces, newCounts: this.props.colorCounts, id: this.props.id});
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
            } else if (this.props.gameState === "reflexed" && this.isActiveReflexed(newState, name)) {
                active = "activeReflexed";
            }
            let selected = (this.state.selectedActionCard === name || this.state.selectedNumberCard === name) ? "selectedCard" : "";
            return (<Card key={name.ID} onClick={(i) => this.handleCardClick(i)} selected={selected} display={active} card={name} />);
        }));
    }

    isActive(newState, name) {
        let rotation = newState.slice();
        let nameSpaces = name.spaces.slice();
        return this.arraysAreRotations(nameSpaces, rotation);
    }

    isActiveReflexed(newState, name) {
        let rotation = this.purgeNull(newState);
        let nameSpaces = this.purgeNull(name.spaces);
        return this.arraysAreRotations(nameSpaces, rotation);
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

    render() {
        let allPlayed = this.props.allPlayed.slice();
        allPlayed.splice(this.props.pid, 1);
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
            discardClicked={() => this.handleDiscardClick()}
            myTurn={this.props.pid === this.props.currentPlayer}
            gameState={this.props.gameState}
            allPlayed={allPlayed}
        />;
        let waiting = <Waiting id={this.props.id} players={this.props.players}/>;
        let showMe = this.props.gameState === "prestart" ? waiting : display;
        return (showMe);
    }
}

//var connectTo = 'https://damoclesgame.herokuapp.com';
var connectTo = 'http://localhost:3000';
var socket = io.connect(connectTo);

    let currentCookie = getCookie();
    let localData = {};
    if (currentCookie != "") {
        console.log(currentCookie);
        socket.emit('refreshCookie', currentCookie);
    } else {
        renderLogin(localData, socket);
    }
    socket.on('standby', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('boardChange', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('setupphase', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('cardUpdate', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('discardphase', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('cardPlayed', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('bonusswap', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('reflexed', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('cookify', function(data) {
        document.cookie = data.cookie;
        Object.assign(localData, data);
        renderLobby(localData, socket);
    });
    socket.on('newroom', function(data) {
        Object.assign(localData, data);
        renderLobby(localData, socket);
    });
    socket.on('userjoined', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
    socket.on('userready', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });

function renderGame(data, socket) {
    ReactDOM.render(<Game   spaces={data.spaces} 
        colorCounts={data.colorCounts}
        selectCards={data.selectCards}
        gameState={data.gameState}
        pid={data.pid}
        currentPlayer={data.currentPlayer}
        socket={socket}
        played={data.played[data.pid]}
        allPlayed={data.played}
        discardCount={data.discardCount}
        processCode={data.processCode}
        players={data.players}
        id={data.id}

        />, document.getElementById("root"));
}

function renderLobby(data, socket) {
    ReactDOM.render(<Lobby
        available={data.availableGames}
    />, document.getElementById("root"));
}

function renderLogin() {
    ReactDOM.render(<Login
            onClick={(user, pass) => logMeIn(user, pass)}
        />, document.getElementById("root"));
}

function logMeIn(user, pass) {
    socket.emit("login", {
        username: user,
        password: pass
    });
}

function cardsEqual(a, b) {
    return (a != null && b != null && a.one === b.one &&
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

function getCookie() {
    var name = "Damocles=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(",");
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

class Lobby extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        available: [],
        selected: 2,
        name: null
      }
    }
    
    selectChange(e) {
      this.setState({
        selected: e.target.value
      });
    }
    
    nameChange(e) {
      this.setState({
        name: e.target.value
      });
    }
    
    createNewValues() {
        let name = this.state.name;
        if (name != null) {
            socket.emit("roomcreated", {
                name: name,
                players: this.state.selected,
                creator: getCookie()
            });
        }
    }

    joinRoom(id) {
        socket.emit('roomjoined', {
            user: getCookie(),
            id: id
        });
    }

    renderAvailable() {
        let lobbies = [];
        let games = this.props.available.slice();
        for (let i = 0; i < games.length; i++) {
            lobbies.push(<li 
                id={games[i].id}
                class={"lobbylist"}
                onDoubleClick={(e) => this.joinRoom(e.target.id)}
            >{games[i].name}</li>);
        }
        return (<div className="browser"><label>{"Currently Available Rooms"}</label><ul>{lobbies}</ul></div>
        );
    }
    
    render() {
      return (<div id="lobby">
                <div id={"newroomlabeldiv"}>
                    <label id={"newroomlabel"}>{"New Room Name"}</label>
                    <input id={"newroominput"}onInput={(e) => this.nameChange(e)}type="text"></input>
                </div>
                <div id={"newroommaxplayerdiv"}>
                    <label id={"maxplayer"}>{"MAX PLAYERS"}</label>
                    <select id={"playeroptions"} onChange={(e) => this.selectChange(e)} id="max_val">
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>
                <button id={"newroombutton"}type="button" onClick={() => this.createNewValues()}>{"New Instance"}</button>
            {this.renderAvailable()}
            </div> 
          );
    }
}
