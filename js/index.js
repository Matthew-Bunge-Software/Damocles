"use strict";var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var NAMES = ["one", "two", "three", "four", "five", "six", "seven"];

var HEPINDEX = NAMES.map(function (name) {return name + "hep";});var

ChatBox = function (_React$Component) {_inherits(ChatBox, _React$Component);
    function ChatBox(props) {_classCallCheck(this, ChatBox);var _this = _possibleConstructorReturn(this, (ChatBox.__proto__ || Object.getPrototypeOf(ChatBox)).call(this,
        props));
        _this.state = {
            current: "" };return _this;

    }_createClass(ChatBox, [{ key: "renderChat", value: function renderChat()
        {
            var chats = [];
            for (var i = 0; i < this.props.chat.length; i++) {
                chats.push(React.createElement("p", null, this.props.chat[i].user + ": " + this.props.chat[i].message));
            }
            return chats;
        } }, { key: "addMessage", value: function addMessage()

        {
            socket.emit("sendChat", {
                user: getCookie(),
                id: this.props.id,
                message: this.state.current });

            $("#message").val("");
            this.setState({
                current: "" });

        } }, { key: "updateInput", value: function updateInput(

        e) {
            this.setState({
                current: e.target.value });

        } }, { key: "render", value: function render()

        {var _this2 = this;
            return React.createElement("div", { id: "Chat" },
                React.createElement("div", { id: "chatBox" },
                    this.renderChat()),

                React.createElement("input", { id: "message", type: "text", onChange: function onChange(e) {return _this2.updateInput(e);} }),
                React.createElement("button", { onClick: function onClick() {return _this2.addMessage();} }, "Send"));

        } }]);return ChatBox;}(React.Component);var


Card = function (_React$Component2) {_inherits(Card, _React$Component2);
    function Card(props) {_classCallCheck(this, Card);var _this3 = _possibleConstructorReturn(this, (Card.__proto__ || Object.getPrototypeOf(Card)).call(this,
        props));
        _this3.state = {
            spaces: props.card.spaces,
            card: props.card };return _this3;

    }_createClass(Card, [{ key: "rotateDisplay", value: function rotateDisplay(

        event) {
            var temp = this.state.spaces.slice();
            if (event.keyCode === 81) {
                var hold = temp[0];
                for (var i = 0; i < 6; i++) {
                    temp[i] = temp[i + 1];
                }
                temp[6] = hold;
            } else if (event.keyCode === 69) {
                var _hold = temp[6];
                for (var i = 6; i > 0; i--) {
                    temp[i] = temp[i - 1];
                }
                temp[0] = _hold;
            }
            this.setState({
                spaces: temp });

        } }, { key: "render", value: function render()

        {var _this4 = this;
            var newSpaces = this.state.spaces.map(function (color, index) {return React.createElement("li", { key: index, className: "dot small " + color + " " + HEPINDEX[index] });});
            newSpaces.push(React.createElement("li", { key: 7, className: "cardType" }, this.props.card.type));
            return React.createElement("div", { onKeyDown: function onKeyDown(e) {return _this4.rotateDisplay(e);},
                    tabIndex: "0",
                    className: "cardRotateContainer" },
                React.createElement("ul", { onClick: function onClick() {return _this4.props.onClick(_this4.state.card);},
                        className: "card " + this.props.display + " " + this.props.selected }, "  ",
                    newSpaces, " "));
        } }]);return Card;}(React.Component);


function Header(props) {
    var myTurn = props.myTurn ? "My turn" : "Not my turn";
    return React.createElement("p", null, myTurn);
}var

OtherHands = function (_React$Component3) {_inherits(OtherHands, _React$Component3);function OtherHands() {_classCallCheck(this, OtherHands);return _possibleConstructorReturn(this, (OtherHands.__proto__ || Object.getPrototypeOf(OtherHands)).apply(this, arguments));}_createClass(OtherHands, [{ key: "renderSingleHands", value: function renderSingleHands()
        {
            var returnMe = [];
            for (var i = 0; i < this.props.players.length; i++) {
                if (i != this.props.pid) {
                    returnMe.push(React.createElement("div", { className: "otherHands" },
                        React.createElement("label", null, this.props.players[i].name + ": " + this.props.points[i] + " Points"),
                        React.createElement("div", { className: "otherHandsPlayed" },
                            this.props.played[i])));


                }
            }
            return returnMe;
        } }, { key: "render", value: function render()
        {
            return React.createElement("div", { className: "otherHands" },
                this.renderSingleHands());

        } }]);return OtherHands;}(React.Component);


function PlayedTiles(props) {
    return React.createElement("div", { className: "playedtiles" }, props.played);
}var

MyHand = function (_React$Component4) {_inherits(MyHand, _React$Component4);function MyHand() {_classCallCheck(this, MyHand);return _possibleConstructorReturn(this, (MyHand.__proto__ || Object.getPrototypeOf(MyHand)).apply(this, arguments));}_createClass(MyHand, [{ key: "renderButton", value: function renderButton()
        {var _this7 = this;
            if (this.props.gameState === 'discardphase' || this.props.gameState === 'discardNormal' && this.props.myTurn) {
                return React.createElement("button", { onClick: function onClick() {return _this7.props.discardClicked();}, className: "playbutton" }, "DiscardTiles");
            } else {
                return React.createElement("button", { disabled: this.props.gameState === "setup" || !this.props.myTurn, onClick: function onClick() {return _this7.props.playClicked();}, className: "playbutton" }, "Play Tiles");
            }
        } }, { key: "renderDiscard", value: function renderDiscard()

        {var _this8 = this;
            return React.createElement("button", { disabled: !this.props.myTurn || this.props.gameState === "setup" || this.props.gameState === "discardphase", onClick: function onClick() {return _this8.props.nextTurn();} }, "Finish Turn");
        } }, { key: "render", value: function render()

        {
            return React.createElement("div", { className: "hand" },
                this.props.cards,
                this.renderButton(),
                this.renderDiscard());

        } }]);return MyHand;}(React.Component);


function Community(props) {
    var basin = props.colorCounts;
    var listBasin = basin.map(function (color) {return (
            React.createElement("button", {
                    className: "dot " + color.color,
                    key: color.color,
                    onClick: function onClick() {return props.onClick(color);} },

                color.count));});


    return React.createElement("ul", null, listBasin);
}

function Board(props) {
    var spaces = props.spaces;
    var listBoard = spaces.map(function (color, index) {return (
            React.createElement("button", {
                className: "dot " + color + " " + HEPINDEX[index],
                key: index,
                onClick: function onClick() {return props.onClick(color, index);} }));});


    return React.createElement("ul", { className: "board" }, listBoard);
}var

Login = function (_React$Component5) {_inherits(Login, _React$Component5);

    function Login(props) {_classCallCheck(this, Login);var _this9 = _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).call(this,
        props));
        _this9.state = {
            username: "",
            password: "" };return _this9;

    }_createClass(Login, [{ key: "updatePassword", value: function updatePassword(

        e) {
            this.setState({
                password: e.target.value });

        } }, { key: "updateUsername", value: function updateUsername(

        e) {
            this.setState({
                username: e.target.value });

        } }, { key: "render", value: function render()

        {var _this10 = this;
            //<label htmlFor={"passw"}><b>{"Password"}</b></label>
            //<input type={"password"} id={"passw"} placeholder={"Enter Password"} onChange={(e) => this.updatePassword(e)}></input>
            return React.createElement("div", { className: "Login" },
                React.createElement("form", { id: "login" },
                    React.createElement("label", { htmlFor: "uname" }, React.createElement("b", null, "Username")),
                    React.createElement("input", { type: "text", id: "uname", placeholder: "Enter Username", onChange: function onChange(e) {return _this10.updateUsername(e);} }),
                    React.createElement("button", { onClick: function onClick() {return _this10.props.onClick(_this10.state.username, _this10.state.password);}, type: "button" }, "Login")));


        } }]);return Login;}(React.Component);var


Waiting = function (_React$Component6) {_inherits(Waiting, _React$Component6);function Waiting() {_classCallCheck(this, Waiting);return _possibleConstructorReturn(this, (Waiting.__proto__ || Object.getPrototypeOf(Waiting)).apply(this, arguments));}_createClass(Waiting, [{ key: "userReady", value: function userReady()
        {
            socket.emit("userreadied", {
                user: getCookie(),
                id: this.props.id });

        } }, { key: "buttonStatus", value: function buttonStatus()

        {
            var player = this.props.players.slice();
            var user = getCookie();
            for (var i = 0; i < player.length; i++) {
                if (player[i].name === user) {
                    return player[i].ready;
                }
            }
        } }, { key: "renderPlayers", value: function renderPlayers()

        {
            var player = this.props.players.slice();
            player = player.map(function (player) {
                var active = player.ready ? "readied" : "notreadied";
                return React.createElement("li", { index: player.name, className: "pregameListItem " + active }, player.name);
            });
            return React.createElement("ul", null, player);
        } }, { key: "render", value: function render()

        {var _this12 = this;
            return (
                React.createElement("div", { className: "Waiting" },
                    this.renderPlayers(),
                    React.createElement("button", { disabled: this.buttonStatus(), onClick: function onClick() {return _this12.userReady();}, type: "button" }, "Ready")));

        } }]);return Waiting;}(React.Component);var


Display = function (_React$Component7) {_inherits(Display, _React$Component7);function Display() {_classCallCheck(this, Display);return _possibleConstructorReturn(this, (Display.__proto__ || Object.getPrototypeOf(Display)).apply(this, arguments));}_createClass(Display, [{ key: "renderSelector", value: function renderSelector()
        {var _this14 = this;
            return (
                React.createElement(Community, {
                    onClick: function onClick(i) {return _this14.props.selectorClick(i);},
                    colorCounts: this.props.colorCounts }));


        } }, { key: "renderOtherHands", value: function renderOtherHands()

        {
            var hands = [];
            hands.push(React.createElement(OtherHands, { pid: this.props.pid, points: this.props.points, players: this.props.players, played: this.props.allPlayed }));
            return hands;
        } }, { key: "render", value: function render()

        {var _this15 = this;
            return (
                React.createElement("div", { className: "display" },
                    this.renderOtherHands(),
                    React.createElement(Header, { myTurn: this.props.myTurn }),
                    this.renderSelector(),
                    React.createElement(Board, {
                        onClick: function onClick(i, j) {return _this15.props.boardClick(i, j);},
                        spaces: this.props.spaces }),

                    React.createElement(PlayedTiles, { played: this.props.played }),
                    React.createElement(MyHand, { playClicked: function playClicked() {return _this15.props.playClicked();},
                        discardClicked: function discardClicked() {return _this15.props.discardClicked();},
                        nextTurn: function nextTurn() {return _this15.props.nextTurn();},
                        cards: this.props.cards,
                        myTurn: this.props.myTurn,
                        gameState: this.props.gameState,
                        id: this.props.id })));



        } }]);return Display;}(React.Component);var


Game = function (_React$Component8) {_inherits(Game, _React$Component8);
    function Game(props) {_classCallCheck(this, Game);var _this16 = _possibleConstructorReturn(this, (Game.__proto__ || Object.getPrototypeOf(Game)).call(this,
        props));
        var selectCards = props.selectCards;
        var cards = selectCards.map(function (name) {return React.createElement(Card, { key: name.ID, onClick: function onClick(i) {return _this16.handleCardClick(i);}, display: "", card: name });});
        _this16.state = {
            playedRaw: props.played,
            played: [],
            selectedColor: null,
            isSwap: false,
            index: null,
            rawCards: selectCards,
            cards: cards,
            selectedActionCard: null,
            selectedNumberCard: null,
            playedThisTurn: [] };return _this16;

    }_createClass(Game, [{ key: "componentDidMount", value: function componentDidMount()

        {var _this17 = this;
            this.props.socket.on('boardChange', function () {
                _this17.setState({
                    cards: _this17.updateActiveCards(_this17.props.spaces, _this17.props.selectCards),
                    played: _this17.updateActiveCards(_this17.props.spaces, _this17.props.played) });

            });
            this.props.socket.on('cardPlayed', function () {
                _this17.setState({
                    cards: _this17.updateActiveCards(_this17.props.spaces, _this17.props.selectCards),
                    played: _this17.updateActiveCards(_this17.props.spaces, _this17.props.played) });

            });
            this.props.socket.on('cardUpdate', function () {
                _this17.setState({
                    cards: _this17.updateActiveCards(_this17.props.spaces, _this17.props.selectCards),
                    played: _this17.updateActiveCards(_this17.props.spaces, _this17.props.played) });

            });
            this.props.socket.on('discardphase', function () {
                _this17.setState({
                    queuedForDiscard: Array(_this17.props.discardCount).fill(null) });

            });
        } }, { key: "handleDiscardClick", value: function handleDiscardClick()

        {
            var cardsToRemove = this.props.selectCards.slice();
            var cardsToDiscard = this.state.queuedForDiscard.slice();
            var j = 0;
            if (!cardsToDiscard.includes(null)) {
                while (j < cardsToRemove.length) {
                    var matched = false;
                    for (var k = 0; k < cardsToDiscard.length; k++) {
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
                        id: this.props.id });


                } else {
                    socket.emit('discardNormalHand', {
                        hand: cardsToRemove,
                        id: this.props.id });

                }
            }
        } }, { key: "handlePlayClick", value: function handlePlayClick()

        {
            var number = this.state.selectedNumberCard;
            var action = this.state.selectedActionCard;
            var spaceState = this.props.spaces.slice();
            var tempPlayed = [];
            var oldPlayed = [];
            var playedToRecycle = this.props.played.slice();
            var cardsToRemove = this.props.selectCards.slice();
            var reflexused = false;
            var playedThisTurn = this.state.playedThisTurn.slice();
            for (var i = 0; i < playedThisTurn.length; i++) {
                if (cardsEqual(playedThisTurn[i].action, action) && cardsEqual(playedThisTurn[i].number, number)) {
                    return false;
                }
            }
            if (this.props.gameState === "hasteCheck") {//Only haste can be played
                if (number === null && action != null && action.type === "H") {
                    if (this.isActive(spaceState, action)) {
                        var j = 0;
                        // Search Hand
                        while (j < cardsToRemove.length) {
                            if (cardsEqual(cardsToRemove[j], number) || cardsEqual(cardsToRemove[j], action)) {
                                tempPlayed.push(cardsToRemove.splice(j, 1)[0]);
                            } else {
                                j++;
                            }
                        }
                        j = 0;
                        // Search Played
                        while (j < playedToRecycle.length) {
                            if (cardsEqual(playedToRecycle[j], number) || cardsEqual(playedToRecycle[j], action)) {
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
            } else {// Anything can be played
                //TODO: Make haste playable but have it not do anything
                if (number != null && action != null) {
                    if (this.isActive(spaceState, number) && this.isActive(spaceState, action) && action.type != "A" && action.type != "R" && action.type != "H") {
                        var _j = 0;
                        while (_j < cardsToRemove.length) {
                            if (cardsEqual(cardsToRemove[_j], number) || cardsEqual(cardsToRemove[_j], action)) {
                                tempPlayed.push(cardsToRemove.splice(_j, 1)[0]);
                            } else {
                                _j++;
                            }
                        }
                        _j = 0;
                        while (_j < playedToRecycle.length) {
                            if (cardsEqual(playedToRecycle[_j], number) || cardsEqual(playedToRecycle[_j], action)) {
                                oldPlayed.push(playedToRecycle[_j]);
                            }
                            _j++;
                        }
                    } else if (this.props.gameState === "reflexed" && (
                    this.isActiveReflexed(spaceState, number) && this.isActive(spaceState, action) ||
                    this.isActive(spaceState, number) && this.isActiveReflexed(spaceState, action)) &&
                    action.type != "A" && action.type != "R" && action.type != "H") {
                        var _j2 = 0;
                        reflexused = true;
                        while (_j2 < cardsToRemove.length) {
                            if (cardsEqual(cardsToRemove[_j2], number) || cardsEqual(cardsToRemove[_j2], action)) {
                                tempPlayed.push(cardsToRemove.splice(_j2, 1)[0]);
                            } else {
                                _j2++;
                            }
                        }
                        if (cardsToRemove.length === this.props.selectCards.length) {
                            return false;
                        }
                        _j2 = 0;
                        while (_j2 < playedToRecycle.length) {
                            if (cardsEqual(playedToRecycle[_j2], number) || cardsEqual(playedToRecycle[_j2], action)) {
                                oldPlayed.push(playedToRecycle[_j2]);
                            }
                            _j2++;
                        }
                    } else {
                        return false;
                    }
                } else if (action != null) {
                    if (this.isActive(spaceState, action) && (action.type === "A" || action.type === "R")) {
                        var _j3 = 0;
                        while (_j3 < cardsToRemove.length) {
                            if (cardsEqual(cardsToRemove[_j3], action)) {
                                tempPlayed.push(cardsToRemove.splice(_j3, 1)[0]);
                            } else {
                                _j3++;
                            }
                        }
                        _j3 = 0;
                        while (_j3 < playedToRecycle.length) {
                            if (cardsEqual(playedToRecycle[_j3], action)) {
                                oldPlayed.push(playedToRecycle[_j3]);
                            }
                            _j3++;
                        }
                    } else if (this.props.gameState === "reflexed" && this.isActiveReflexed(spaceState, action) && (action.type === "A" || action.type === "R")) {
                        var _j4 = 0;
                        reflexused = true;
                        while (_j4 < cardsToRemove.length) {
                            if (cardsEqual(cardsToRemove[_j4], action)) {
                                tempPlayed.push(cardsToRemove.splice(_j4, 1)[0]);
                            } else {
                                _j4++;
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
                number: number });

            this.setState({
                selectedNumberCard: null,
                selectedActionCard: null,
                playedThisTurn: playedThisTurn });

            socket.emit('cardPlayed', {
                newPlayed: tempPlayed,
                oldPlayed: oldPlayed,
                rest: cardsToRemove,
                pid: this.props.pid,
                id: this.props.id,
                reflexused: reflexused });

        } }, { key: "handleCardClick", value: function handleCardClick(

        i) {var _this18 = this;
            var selectCards = this.props.selectCards.slice();
            var played = this.props.played.slice();
            var cardType = i.type;
            var accessable = this.props.processCode === null ? selectCards.length : this.props.processCode;
            var selectCardsIndex = -1;
            for (var j = 0; j < selectCards.length; j++) {
                if (cardsEqual(i, selectCards[j])) {
                    selectCardsIndex = j;
                    break;
                }
            }
            if (this.props.gameState === 'discardphase') {
                var tempDiscard = this.state.queuedForDiscard.slice();
                if (selectCardsIndex >= selectCards.length - accessable) {
                    var found = false;
                    for (var _j5 = 0; _j5 < tempDiscard.length; _j5++) {
                        if (cardsEqual(tempDiscard[_j5], i)) {
                            tempDiscard[_j5] = null;
                            found = true;
                            break;
                        }
                    }
                    if (!found && tempDiscard.includes(null)) {
                        for (var _j6 = 0; _j6 < tempDiscard.length; _j6++) {
                            if (tempDiscard[_j6] === null) {
                                tempDiscard[_j6] = i;
                                break;
                            }
                        }
                    }
                    this.setState({
                        queuedForDiscard: tempDiscard,
                        cards: selectCards.map(function (name) {
                            var selected = "";
                            for (var _j7 = 0; _j7 < tempDiscard.length; _j7++) {
                                if (cardsEqual(tempDiscard[_j7], name)) {
                                    selected = "selectedCard";
                                    break;
                                }
                            }
                            return React.createElement(Card, { key: name.ID, selected: selected, onClick: function onClick(i) {return _this18.handleCardClick(i);}, display: "", card: name });
                        }) });

                }
            } else {
                if (cardType === "1" || cardType === "2" || cardType === "3") {
                    var newSelected = i === this.state.selectedNumberCard ? null : i;
                    this.setState({
                        selectedNumberCard: newSelected,
                        cards: selectCards.map(function (name) {
                            var active = "";
                            if (_this18.isActive(_this18.props.spaces, name)) {
                                active = "active";
                            } else if (_this18.props.gameState === "reflexed" && _this18.props.currentPlayer === _this18.props.pid && _this18.isActiveReflexed(_this18.props.spaces, name)) {
                                active = "activeReflexed";
                            }
                            var selected = cardsEqual(name, newSelected) || cardsEqual(name, _this18.state.selectedActionCard) ? "selectedCard" : "";
                            return React.createElement(Card, { key: name.ID, selected: selected, onClick: function onClick(i) {return _this18.handleCardClick(i);}, display: active, card: name });
                        }),
                        played: played.map(function (name) {
                            var active = _this18.isActive(_this18.props.spaces, name) ? "active" : "";
                            var selected = cardsEqual(name, newSelected) || cardsEqual(name, _this18.state.selectedActionCard) ? "selectedCard" : "";
                            return React.createElement(Card, { key: name.ID, selected: selected, onClick: function onClick(i) {return _this18.handleCardClick(i);}, display: active, card: name });
                        }) });

                } else {
                    var _newSelected = i === this.state.selectedActionCard ? null : i;
                    this.setState({
                        selectedActionCard: _newSelected,
                        cards: selectCards.map(function (name) {
                            var active = "";
                            if (_this18.isActive(_this18.props.spaces, name)) {
                                active = "active";
                            } else if (_this18.props.gameState === "reflexed" && _this18.props.currentPlayer === _this18.props.pid && _this18.isActiveReflexed(_this18.props.spaces, name)) {
                                active = "activeReflexed";
                            }
                            var selected = cardsEqual(name, _newSelected) || cardsEqual(name, _this18.state.selectedNumberCard) ? "selectedCard" : "";
                            return React.createElement(Card, { key: name.ID, selected: selected, onClick: function onClick(i) {return _this18.handleCardClick(i);}, display: active, card: name });
                        }),
                        played: played.map(function (name) {
                            var active = _this18.isActive(_this18.props.spaces, name) ? "active" : "";
                            var selected = cardsEqual(name, _newSelected) || cardsEqual(name, _this18.state.selectedNumberCard) ? "selectedCard" : "";
                            return React.createElement(Card, { key: name.ID, selected: selected, onClick: function onClick(i) {return _this18.handleCardClick(i);}, display: active, card: name });
                        }) });

                }
            }
        } }, { key: "handleSelectorClick", value: function handleSelectorClick(

        i) {
            if (this.props.currentPlayer === this.props.pid) {
                if (i.count > 0) {
                    this.setState({
                        selectedColor: i.color,
                        isSwap: false,
                        index: null });

                }
            }
        } }, { key: "handleBoardClick", value: function handleBoardClick(

        i, index) {
            var prevState = this.state;
            if (this.props.currentPlayer === this.props.pid) {
                if (this.props.gameState === "setup") {
                    if (prevState.selectedColor != null && this.props.spaces[index] === null) {
                        // swap with stack
                        var newSpaces = this.props.spaces.slice();
                        newSpaces[index] = prevState.selectedColor;
                        var newCounts = this.props.colorCounts.slice();
                        var setupcomplete = true;
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
                            this.props.spaces[index] === newCounts[j].color)
                            {
                                newCounts[j].count++;
                            }
                        }
                        socket.emit('boardChange', { newSpaces: newSpaces, newCounts: newCounts, id: this.props.id });
                        this.setState({
                            selectedColor: null,
                            isSwap: false,
                            index: null,
                            gameState: setupcomplete ? "" : "setup" });

                    }
                } else if (this.props.gameState === "bonusswap" || this.props.gameState === "boardChange") {
                    if (prevState.index === index) {
                        //Selecting already selected deselects
                        this.setState({
                            selectedColor: null,
                            isSwap: false,
                            index: null });

                    } else if (prevState.selectedColor != null) {
                        // swap with stack
                        var _newSpaces = this.props.spaces.slice();
                        _newSpaces[index] = prevState.selectedColor;
                        var _newCounts = this.props.colorCounts.slice();
                        for (var j = 0; j < _newCounts.length; j++) {
                            if (_newCounts[j].color === prevState.selectedColor) {
                                _newCounts[j].count--;
                            }
                            if (
                            this.props.spaces[index] != null &&
                            this.props.spaces[index] === _newCounts[j].color)
                            {
                                _newCounts[j].count++;
                            }
                        }
                        var emitCheck = this.props.gameState === 'bonusswap' ? 'bonusswap' : 'boardChange';
                        socket.emit(emitCheck, { newSpaces: _newSpaces, newCounts: _newCounts, id: this.props.id });
                        this.setState({
                            selectedColor: null,
                            isSwap: false,
                            index: null });

                    } else if (prevState.isSwap) {
                        //Swapping with active thing
                        var _newSpaces2 = this.props.spaces.slice();
                        var temp = _newSpaces2[index];
                        _newSpaces2[index] = _newSpaces2[prevState.index];
                        _newSpaces2[prevState.index] = temp;
                        var _emitCheck = this.props.gameState === 'bonusswap' ? 'bonusswap' : 'boardChange';
                        socket.emit(_emitCheck, { newSpaces: _newSpaces2, newCounts: this.props.colorCounts, id: this.props.id });
                        this.setState({
                            selectColor: null,
                            isSwap: false,
                            index: null });

                    } else {
                        //Selecting for swap
                        this.setState({
                            selectColor: null,
                            isSwap: true,
                            index: index });

                    }
                }
            }
        } }, { key: "updateActiveCards", value: function updateActiveCards(

        newState, selectCards) {var _this19 = this;
            return selectCards.map(function (name) {
                var active = "";
                if (_this19.isActive(newState, name)) {
                    active = "active";
                } else if (_this19.props.gameState === "reflexed" && _this19.props.currentPlayer === _this19.props.pid && _this19.isActiveReflexed(newState, name)) {
                    active = "activeReflexed";
                }
                var selected = cardsEqual(_this19.state.selectedActionCard, name) || cardsEqual(_this19.state.selectedNumberCard, name) ? "selectedCard" : "";
                return React.createElement(Card, { key: name.ID, onClick: function onClick(i) {return _this19.handleCardClick(i);}, selected: selected, display: active, card: name });
            });
        } }, { key: "isActive", value: function isActive(

        newState, name) {
            var rotation = newState.slice();
            var nameSpaces = name.spaces.slice();
            return this.arraysAreRotations(nameSpaces, rotation);
        } }, { key: "isActiveReflexed", value: function isActiveReflexed(

        newState, name) {
            var rotation = this.purgeNull(newState);
            var nameSpaces = this.purgeNull(name.spaces);
            return this.arraysAreRotations(nameSpaces, rotation);
        } }, { key: "arraysAreRotations", value: function arraysAreRotations(

        cardSpaces, boardSpaces) {
            var active = true;
            for (var j = 0; j < boardSpaces.length; j++) {
                active = false;
                var k = 0;
                for (var i = 0; i < boardSpaces.length; i++) {
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
                var temp = boardSpaces[0];
                for (var _i = 0; _i < boardSpaces.length; _i++) {
                    boardSpaces[_i] = boardSpaces[_i + 1];
                }
                boardSpaces[boardSpaces.length - 1] = temp;
            }
            return active;
        } }, { key: "purgeNull", value: function purgeNull(

        name) {
            var purged = name.slice();
            var j = 0;
            while (j < purged.length) {
                if (purged[j] === null) {
                    purged.splice(j, 1);
                } else {
                    j++;
                }
            }
            return purged;
        } }, { key: "abandonRoom", value: function abandonRoom()

        {
            socket.emit("abandonRoom", {
                id: this.props.id,
                user: getCookie() });

        } }, { key: "nextTurn", value: function nextTurn()

        {
            if (this.props.gameState === 'playCards' || this.props.gameState === 'reflexed') {
                this.setState({
                    playedThisTurn: [] });

            }
            socket.emit('nextPhase', {
                id: this.props.id });

        } }, { key: "modifyPoints", value: function modifyPoints()

        {
            var points = this.props.points.slice();
            var played = this.props.allPlayed.slice();
            for (var i = 0; i < points.length; i++) {
                for (var j = 0; j < played[i].length; j++) {
                    points[i] += played[i][j].points;
                }
            }
            return points;
        } }, { key: "render", value: function render()

        {var _this20 = this;
            var allPlayed = this.props.allPlayed.slice();
            for (var i = 0; i < allPlayed.length; i++) {
                allPlayed[i] = this.updateActiveCards(this.props.spaces, allPlayed[i]);
            }
            var display = React.createElement(Display, {
                spaces: this.props.spaces //[]
                , colorCounts: this.props.colorCounts //[]
                , selectorClick: function selectorClick(i) {return _this20.handleSelectorClick(i);} //function
                , boardClick: function boardClick(i, j) {return _this20.handleBoardClick(i, j);} //function
                , cards: this.state.cards //[<Cards>]
                , played: this.state.played //[<Cards>]
                , playClicked: function playClicked() {return _this20.handlePlayClick();} //function
                , discardClicked: function discardClicked() {return _this20.handleDiscardClick();},
                myTurn: this.props.pid === this.props.currentPlayer,
                gameState: this.props.gameState,
                allPlayed: allPlayed,
                pid: this.props.pid,
                players: this.props.players,
                points: this.modifyPoints(),
                id: this.props.id,
                nextTurn: function nextTurn() {return _this20.nextTurn();} });

            var waiting = React.createElement(Waiting, { id: this.props.id, players: this.props.players });
            var showMe = this.props.gameState === "prestart" ? waiting : display;
            return React.createElement("div", { id: "game" },
                React.createElement("button", { id: "backbutton", type: 'button', onClick: function onClick() {return _this20.abandonRoom();} }, "Back"),
                showMe,
                React.createElement(ChatBox, { id: this.props.id, chat: this.props.chat }));

        } }]);return Game;}(React.Component);


var connectTo = 'https://damoclesgame.herokuapp.com';
//var connectTo = 'http://localhost:3000';
var socket = io.connect(connectTo);

var currentCookie = getCookie();
var localData = {};
if (currentCookie != "") {
    console.log(currentCookie);
    socket.emit('refreshCookie', currentCookie);
} else {
    renderLogin(localData, socket);
}
socket.on('standby', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('boardChange', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('setupphase', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('cardUpdate', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('messageSent', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('discardphase', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('cardPlayed', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('bonusswap', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('reflexed', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('cookify', function (data) {
    document.cookie = data.cookie;
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on('newroom', function (data) {
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on('lobify', function (data) {
    localData = {};
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on('userjoined', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('userready', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on('nextTurn', function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});

function renderGame(data, socket) {
    ReactDOM.render(React.createElement(Game, { spaces: data.spaces,
        colorCounts: data.colorCounts,
        selectCards: data.selectCards,
        gameState: data.gameState,
        pid: data.pid,
        currentPlayer: data.currentPlayer,
        socket: socket,
        played: data.played[data.pid],
        allPlayed: data.played,
        discardCount: data.discardCount,
        processCode: data.processCode,
        players: data.players,
        id: data.id,
        points: data.points,
        chat: data.chat }),

    document.getElementById("root"));
}

function renderLobby(data, socket) {
    ReactDOM.render(React.createElement(Lobby, {
        available: data.availableGames }),
    document.getElementById("root"));
}

function renderLogin() {
    ReactDOM.render(React.createElement(Login, {
        onClick: function onClick(user, pass) {return logMeIn(user, pass);} }),
    document.getElementById("root"));
}

function logMeIn(user, pass) {
    socket.emit("login", {
        username: user,
        password: pass });

}

function cardsEqual(a, b) {
    return a === null && b === null || a != null && b != null && a.one === b.one &&
    a.two === b.two &&
    a.three === b.three &&
    a.four === b.four &&
    a.five === b.five &&
    a.six === b.six &&
    a.seven === b.seven &&
    a.type === b.type &&
    a.id === b.id;

}

function getCookie() {
    var name = "Damocles=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(",");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}var

Lobby = function (_React$Component9) {_inherits(Lobby, _React$Component9);
    function Lobby(props) {_classCallCheck(this, Lobby);var _this21 = _possibleConstructorReturn(this, (Lobby.__proto__ || Object.getPrototypeOf(Lobby)).call(this,
        props));
        _this21.state = {
            available: [],
            selected: 3,
            name: null };return _this21;

    }_createClass(Lobby, [{ key: "selectChange", value: function selectChange(

        e) {
            this.setState({
                selected: e.target.value });

        } }, { key: "nameChange", value: function nameChange(

        e) {
            this.setState({
                name: e.target.value });

        } }, { key: "createNewValues", value: function createNewValues()

        {
            var name = this.state.name;
            if (name != null) {
                socket.emit("roomcreated", {
                    name: name,
                    players: this.state.selected,
                    creator: getCookie() });

            }
        } }, { key: "joinRoom", value: function joinRoom(

        id) {
            socket.emit('roomjoined', {
                user: getCookie(),
                id: id });

        } }, { key: "renderAvailable", value: function renderAvailable()

        {var _this22 = this;
            var lobbies = [];
            var games = this.props.available.slice();
            for (var i = 0; i < games.length; i++) {
                lobbies.push(React.createElement("li", {
                        id: games[i].id,
                        className: "lobbylist",
                        onDoubleClick: function onDoubleClick(e) {return _this22.joinRoom(parseInt(e.target.id));} },
                    games[i].name + " - " + games[i].maxPlayers));
            }
            return React.createElement("div", { className: "browser" }, React.createElement("label", null, "Currently Available Rooms"), React.createElement("ul", null, lobbies));

        } }, { key: "render", value: function render()

        {var _this23 = this;
            return React.createElement("div", { id: "lobby" },
                React.createElement("div", { id: "newroomlabeldiv" },
                    React.createElement("label", { id: "newroomlabel" }, "New Room Name"),
                    React.createElement("input", { id: "newroominput", onInput: function onInput(e) {return _this23.nameChange(e);}, type: "text" })),

                React.createElement("div", { id: "newroommaxplayerdiv" },
                    React.createElement("label", { id: "maxplayer" }, "MAX PLAYERS"),
                    React.createElement("select", _defineProperty({ id: "playeroptions", onChange: function onChange(e) {return _this23.selectChange(e);} }, "id", "max_val"),
                        React.createElement("option", { value: "2" }, "2"),
                        React.createElement("option", { value: "3" }, "3"),
                        React.createElement("option", { value: "4" }, "4"),
                        React.createElement("option", { value: "5" }, "5"),
                        React.createElement("option", { value: "6" }, "6"))),


                React.createElement("button", { id: "newroombutton", type: "button", onClick: function onClick() {return _this23.createNewValues();} }, "New Instance"),
                this.renderAvailable());


        } }]);return Lobby;}(React.Component);
//# sourceMappingURL=index.js.map