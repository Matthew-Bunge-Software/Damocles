const COLORS = {
    RED: "red",
    BLUE: "blue",
    GREEN: "green",
    BLACK: "black",
    GOLD: "gold"
};

var IDS = new Set();

const NAMES = ["one", "two", "three", "four", "five", "six", "seven"];

const HEPINDEX = NAMES.map(name => name + "hep");

var gold = COLORS.GOLD;
var generate = "G";
var blue = COLORS.BLUE;
var red = COLORS.RED;
var green = COLORS.GREEN;
var gold = COLORS.GOLD;
var black = COLORS.BLACK;
var combust = "C";
var oracle = "O";
var reflex = "R";
var conquer = "A";
var haste = "H";
var one = "1";
var two = "2";
var three = "3";

class Card extends React.Component {
    constructor(props) {
        super(props);
        const spaces = Array(7).fill(null);
        if (props.card.one != null) { spaces[0] = props.card.one; }
        if (props.card.two != null) { spaces[1] = props.card.two; }
        if (props.card.three != null) { spaces[2] = props.card.three; }
        if (props.card.four != null) { spaces[3] = props.card.four; }
        if (props.card.five != null) { spaces[4] = props.card.five; }
        if (props.card.six != null) { spaces[5] = props.card.six; }
        if (props.card.seven != null) { spaces[6] = props.card.seven; }
        this.state = {
            spaces: spaces,
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

function MyHand(props) {
    return <div className="hand">
        {props.cards}
        <button disabled={(props.gameState === "setup") || !props.myTurn} onClick={() => props.playClicked()} className={"playbutton"}>{"Play Tiles"}</button>
    </div>;
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
        >
            {}
        </button>
    ));
    return <ul className="board">{listBoard}</ul>;
}

function Lobby(props) {
    return <button onClick={props.onClick}>{"Start Game"}</button>;
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
            cards: cards
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
    }
    
    handlePlayClick() {
        let number = this.state.selectedNumberCard;
        let action = this.state.selectedActionCard;
        let spaceState = this.props.spaces.slice();
        let tempPlayed = [];
        let cardsToRemove = this.state.rawCards.slice();
        if (number != null && action != null) {
            if (this.isActive(spaceState, number) && this.isActive(spaceState, action) && (action.type != "A" && action.type != "R" && action.type != "H")) {
                let j = 0;
                while (j < cardsToRemove.length) {
                    if (cardsToRemove[j] === number || cardsToRemove[j] === action) {
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
                    if (cardsToRemove[j] === action) {
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
            pid: this.props.pid
        });
    }

    handleCardClick(i) {
        let selectCards = this.props.selectCards.slice();
        let played = this.props.played.slice();
        let cardType = i.type;
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
                    socket.emit('boardChange', {newSpaces: newSpaces, newCounts: newCounts});
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
                    socket.emit('boardChange', {newSpaces: newSpaces, newCounts: newCounts});
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
                    socket.emit('boardChange', {newSpaces: newSpaces, newCounts: this.props.colorCounts});
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
        return (selectCards.map((name, index) => {
            let active = this.isActive(newState, name) ? "active" : "";
            let selected = (this.state.selectedActionCard === name || this.state.selectedNumberCard === name) ? "selectedCard" : "";
            return (<Card key={name.ID} onClick={(i) => this.handleCardClick(i)} selected={selected} display={active} card={name} />);
        }));
    }

    isActive(newState, name) {
        let active = true;
        let rotation = newState.slice();
        for (var j = 0; j < 7; j++) {
            active = true;
            for (var i = 0; i < 7; i++) {
                if (name[NAMES[i]] !== rotation[i] && name[NAMES[i]] != null) {
                    active = false;
                    break;
                }
            }
            if (active) {
                break;
            }
            let temp = rotation[0];
            for (var i = 0; i < 6; i++) {
                rotation[i] = rotation[i + 1];
            }
            rotation[6] = temp;
        }
        return active;
    }

    render() {
        let allPlayed = this.props.allPlayed.slice();
        allPlayed.splice(this.props.pid - 1, 1);
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
            myTurn={this.props.pid === this.props.currentPlayer}
            gameState={this.props.gameState}
            allPlayed={allPlayed}
        />;
        let lobby = <Lobby
            onClick={() => this.startGame()}
        />;
        let showMe = this.props.gameState === "lobby" ? lobby : display;
        return (showMe);
    }
}

var socket = io.connect('https://damoclesgame.herokuapp.com:3000');
socket.on('initialize', function(data) {
    let localData = Object.assign({}, data);
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
        console.log(localData);
        renderGame(localData, socket);
    });
    socket.on('cardPlayed', function(data) {
        Object.assign(localData, data);
        renderGame(localData, socket);
    });
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
        played={data.played[data.pid - 1]}
        allPlayed={data.played}

        />, document.getElementById("root"));
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