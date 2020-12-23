const gameStates = require("./gameStates.js");
const courier = require("./courier.js");
const {colors} = require('../cards');
const {cards} = require('../cards');
//const { Client } = require('pg');
const path = require('path');

//Postgres database connection
/* const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://matthew:cadenza@localhost:5432/tempdb",
});
client.connect(); */
const express = require('express'),
    http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

//Port server runs on
const port = process.env.PORT || 3000;

app.use("/css", express.static(path.resolve(__dirname + '/../css/')));
app.use("/static", express.static(path.resolve(__dirname + '/../static/')));
app.use("/src", express.static('./src/'));
app.use("/dist", express.static(path.resolve(__dirname + '/../dist/')));
//Host the main page
app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname + ('/../index.html')));
});

const MIN_PLAYERS = 2;
let gameId = 1;
const gameInstances = [];
const publicInstances = [];
//On initial connection
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on(courier.refreshCookie, function(data) {
        socket.join('lobby');
        socket.emit(courier.cookieSent, {
            cookie: setCookie(data),
            gameState: gameStates.mainLobby,
            availableGames: publicInstances
        });
    });
    //Login via database if available
    socket.on(courier.login, function(data) {
        const values = [data.username];
        socket.join('lobby');
        socket.emit(courier.cookieSent, {
            cookie: setCookie(values[0]),
            gameState: gameStates.mainLobby,
            availableGames: publicInstances
        });
    });
    //Create a new game room
    socket.on(courier.newRoom, function(data) {
        let id = gameId;
        let deck = shuffle(selectCards.slice());
        let creator = data.creator;
        let players = [];
        let maxPlayers = data.players;
        let played = [];
        let points = [0];
        let ready = 0;
        if (data.name === "p555test") {
            players.push({ name: 'B-9', ready: true});
            played.push(deck.splice(0, 4));
            points.push(0);
            players.push({ name: 'The Iron Giant', ready: true});
            played.push(deck.splice(0, 12));
            points.push(0);
            players.push({ name: 'Robbie', ready: true});
            played.push(deck.splice(0, 6));
            points.push(0);
            players.push({ name: 'Gigantor', ready: true});
            played.push(deck.splice(0, 10));
            points.push(0);
            ready = 4;
            maxPlayers = 5;
        }
        played.push([]);
        players.push({ name: creator, ready: false });
        let newInstance = {
            creator: data.creator,
            name: data.name,
            maxPlayers: maxPlayers,
            id: gameId,
            deck: deck,
            players: players,
            ready: ready,
            points: points,
            gameState: gameStates.preGameLobby,
            played: played,
            numDiscarded: 0,
            spaces: Array(7).fill(null),
            colorCounts: colorNames.map(name => ({ color: name, count: 4 })),
            turn: 0,
            chat: []
        };
        let newPublicInstance = {
            creator: data.creator,
            name: data.name,
            maxPlayers: data.players,
            currentPlayers: players.length,
            id: gameId
        };
        gameInstances[id] = newInstance;
        publicInstances.push(newPublicInstance);
        io.to('lobby').emit(courier.newRoom, {
            availableGames: publicInstances
        });
        socket.leave('lobby');
        socket.join('' + gameId);
        socket.emit(courier.userJoined, {
            selectCards: deck.splice(0, 20),
            gameState: newInstance.gameState,
            players: newInstance.players,
            chat: newInstance.chat,
            played: newInstance.played,
            id: newInstance.id,
            pid: newInstance.players.length - 1,
            points: newInstance.points,
        });
        gameId += 1;
    });
    socket.on(courier.userJoined, function(data) {
        let joinedInstance = gameInstances[data.id];
        let user = data.user;
        joinedInstance.players.push({ name: user, ready: false});
        joinedInstance.points.push(0);
        joinedInstance.played.push([]);
        joinedInstance.pid++;
        socket.leave('lobby');
        socket.join('' + data.id);
        if (joinedInstance.players.length === joinedInstance.maxPlayers) {
            for (let i = 0; i < publicInstances.length; i++) {
                if (publicInstances[i].id === data.id) {
                    publicInstances.splice(i, 1);
                    io.to('lobby').emit(courier.newRoom, {
                        availableGames: publicInstances
                    })
                }
            }
        }
        gameInstances[data.id] = joinedInstance;
        socket.emit(courier.userJoined, {
            selectCards: joinedInstance.deck.splice(0,8),
            gameState: joinedInstance.gameState,
            id: joinedInstance.id,
            pid: joinedInstance.players.length - 1,
        });
        io.to('' + data.id).emit(courier.userJoined, {
            players: joinedInstance.players,
            chat: joinedInstance.chat,
            played: joinedInstance.played,
            points: joinedInstance.points
        });

    });
    socket.on(courier.sendChat, function(data) {
        let instance = gameInstances[data.id];
        instance.chat.push({user: data.user, message: data.message});
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit(courier.sendChat, {
            chat: instance.chat
        });
    });
    socket.on(courier.userReadied, function(data) {
        let instance = gameInstances[data.id];
        instance.ready += 1;
        for (let i = 0; i < instance.players.length; i++) {
            if (instance.players[i].name === data.user) {
                instance.players[i].ready = true;
                gameInstances[data.id] = instance;
                io.to('' + data.id).emit(courier.userReadied, {
                    players: instance.players
                });
                break;
            }
        }
        if (instance.ready === instance.players.length && instance.ready >= MIN_PLAYERS) {
            for (let i = 0; i < publicInstances.length; i++) {
                if (publicInstances[i].id === data.id) {
                    publicInstances.splice(i, 1);
                    io.to('lobby').emit(courier.newRoom, {
                        availableGames: publicInstances
                    })
                }
            }
            instance.gameState = gameStates.initialDiscard;
            gameInstances[data.id] = instance;
            io.to('' + data.id).emit(courier.discardPhase, {
                spaces: instance.spaces,
                colorCounts: instance.colorCounts,
                gameState: instance.gameState,
                played: instance.played,
                processCode: null,
                discardCount: 2,
                points: instance.points
            });
        }
    });
    socket.on(courier.discardPreSetup, function(data) {
        let instance = gameInstances[data.id];
        instance.numDiscarded++;
        socket.emit(courier.cardUpdate, {
            selectCards: data.newHand
        });
        if (instance.numDiscarded === instance.players.length) {
            instance.currentPlayer = Math.floor(Math.random() * instance.players.length);
            instance.gameState = gameStates.setup;
            gameInstances[data.id] = instance;
            io.to('' + data.id).emit(courier.setupPhase, {
                gameState: instance.gameState,
                currentPlayer: instance.currentPlayer,
            });
        } else {
            instance.gameState = gameStates.standby;
            gameInstances[data.id] = instance;
            socket.emit(courier.waiting, {
                gameState: instance.gameState
            });
        }
    });
    socket.on(courier.nextPhase, function(data) {
        let instance = gameInstances[data.id];
        if (instance.gameState === gameStates.hasteCheck) {
            instance.gameState = gameStates.swapBoard;
        } else if (instance.gameState === gameStates.playCards || instance.gameState === gameStates.reflexActive) {
            instance.turn++;
            if (instance.turn === instance.players.length * 8) {
                instance.currentPlayer = null;
                instance.gameState = gameStates.gameOver;
            } else {
                instance.currentPlayer = ((instance.currentPlayer + 1) % instance.players.length);
                instance.gameState = gameStates.hasteCheck;
            }
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit(courier.nextPlayer, {
            gameState: instance.gameState,
            currentPlayer: instance.currentPlayer
        });
    });
    socket.on(courier.boardChange, function(data) {
        let instance = gameInstances[data.id];
        instance.spaces = data.newSpaces;
        instance.colorCounts = data.newCounts;
        if (instance.gameState === gameStates.setup) {
            instance.currentPlayer = ((instance.currentPlayer + 1) % instance.players.length);
            if (!instance.spaces.includes(null)) {
                instance.gameState = gameStates.hasteCheck;
            }
        } else {
            instance.gameState = gameStates.playCards;
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit(courier.boardChange, {
            spaces: instance.spaces,
            colorCounts: instance.colorCounts,
            currentPlayer: instance.currentPlayer,
            gameState: instance.gameState,
        });
    });
    socket.on(courier.bonusSwap, function(data) {
        let instance = gameInstances[data.id];
        instance.spaces = data.newSpaces;
        instance.colorCounts = data.newCounts;
        instance.gameState = gameStates.swapBoard;
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit(courier.boardChange, {
            spaces: instance.spaces,
            colorCounts: instance.colorCounts,
            gameState: instance.gameState,
        });
    });
    socket.on(gameStates.discardNormal, function(data) {
        let instance = gameInstances[data.id];
        instance.gameState = gameStates.playCards;
        let tempCards = data.hand.slice();
        socket.emit(courier.boardChange, {
            selectCards: tempCards
        });
        io.to('' + data.id).emit(courier.boardChange, {
            gameState: instance.gameState,

        });
    });
    socket.on(courier.cardPlayed, function(data) {
        let instance = gameInstances[data.id];
        let newPlayed = instance.played[data.pid].slice();
        let interacted = handleCardInteractions(data.newPlayed, data.oldPlayed, data.id);
        instance.points[data.pid] += interacted.combust;
        newPlayed = newPlayed.concat(interacted.played);
        instance.played[data.pid] = newPlayed;
        socket.emit(courier.cardUpdate, {
            selectCards: data.rest.concat(interacted.newCards)
        });
        if (interacted.processCode != null) {
            instance.gameState = gameStates.discardNormal;
            socket.emit(courier.discardPhase, {
                gameState: instance.gameState,
                processCode: interacted.processCode,
                discardCount: 2
            })
        }
        if (interacted.stateEdit === "H") {
            instance.gameState = gameStates.hasted;
            socket.emit(courier.bonusSwap, {
                gameState: instance.gameState
            });
        } else if (interacted.stateEdit === "R") {
            instance.gameState = gameStates.reflexActive;
            socket.emit(courier.reflex, {
                gameState: instance.gameState
            });
        } else {
            if (instance.gameState === gameStates.reflexActive && data.reflexused === true) {
                instance.gameState = gameStates.playCards;
            }
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit(courier.cardPlayed, {
            played: instance.played,
            gameState: instance.gameState,
            points: instance.points
        });
    });
    socket.on(courier.abandonRoom, function(data) {
        gameInstances[data.id] = [];
        for(let i = 0; i < publicInstances.length; i++) {
            if (publicInstances[i].id === data.id) {
                publicInstances.splice(i ,1);
                break;
            }
        }
        const users = io.sockets.adapter.rooms['' + data.id].sockets;
        Object.keys(users).forEach(function(client) {
            let socket = io.in('' + gameId).connected[client];
            socket.leave('' + gameId);
            socket.join('lobby');
            socket.emit(courier.returnToLobby, {
                gameState: gameStates.mainLobby,
                availableGames: publicInstances
            });
        });
        io.to('lobby').emit(courier.newRoom, {
            availableGames: publicInstances
        });
    });
});

server.listen(port, function() {
    console.log('listening on *' + port);
});

const colorNames = Object.values(colors);
const IDS = new Set();

const selectCards = cards.map(card => {
    let intAdded = false;
    let randInt = -1;
    let spaces = Array(7).fill(null);
    let points = 0;
    if (card.one != null) { spaces[0] = card.one; points++; }
    if (card.two != null) { spaces[1] = card.two; points++; }
    if (card.three != null) { spaces[2] = card.three; points++; }
    if (card.four != null) { spaces[3] = card.four; points++; }
    if (card.five != null) { spaces[4] = card.five; points++; }
    if (card.six != null) { spaces[5] = card.six; points++; }
    if (card.seven != null) { spaces[6] = card.seven; points++; }
    while (!intAdded) {
        randInt = Math.floor(Math.random() * 100000);
        if (!IDS.has(randInt)) {
            IDS.add(randInt);
            intAdded = true;
        }
    }
    card.ID = randInt;
    card.spaces = spaces;
    card.points = points;
    return card;
});

function shuffle(toShuffle) {
    let arr = toShuffle.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function setCookie(user) {
    const d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    return ("Damocles=" + user + "; " + expires + "; path=/");
}

function handleCardInteractions(played, oldPlayed, id) {
    let returnToPublic = [];
    let returnMe = {
        newCards: [],
        processCode: null,
        played: [],
        combust: 0
    }
    let num = null;
    let action = null;
    for (let i = 0; i < played.length; i++) {
        let current = played[i];
        if (current.type === '1' || current.type === '2' || current.type === '3') {
            num = parseInt(current.type);
        }
        else {
            action = current.type;
        }
        if (current.type !== 'C') {
            returnToPublic.push(current);
        } else {
            returnMe.combust += current.points;
        }
    }
    for (let i = 0; i < oldPlayed.length; i++) {
        let current = oldPlayed[i];
        if (current.type === '1' || current.type === '2' || current.type === '3') {
            num = parseInt(current.type);
        }
        else {
            action = current.type;
        }
    }
    returnMe.played = returnToPublic.slice();
    if (num != null) {
        if (action === "C") {
            Object.assign(returnMe, {
                newCards: gameInstances[id].deck.splice(0, num + 1)
            });
        } else if (action === "O") {
            Object.assign(returnMe, {
                newCards: gameInstances[id].deck.splice(0, num + 2),
                processCode: num + 2
            });
        } else if (action === "G" ) {
            Object.assign(returnMe, {
                newCards: gameInstances[id].deck.splice(0, num)
            });
        } else {
            console.log("Something went wrong");
        }
    } else {
        if (action === "A") { //use opponents revealed
            Object.assign(returnMe, {
                stateEdit: "A"
            })
        } else if (action === "R") { //use relative position
            Object.assign(returnMe, {
                stateEdit: "R"
            })
        } else if (action === "H") { //swap twice
            Object.assign(returnMe, {
                stateEdit: "H"
            });
        } else {
            console.log("Something went wrong");
        }
    }
    return returnMe;
}
