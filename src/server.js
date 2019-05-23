const gameStates = require("./gameStates.js");
const courrier = require("./courrier.js");
var {colors} = require('../cards');
var {cards} = require('../cards');
const { Client } = require('pg');
var path = require('path');

//Postgres database connection
/* const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://matthew:cadenza@localhost:5432/tempdb",
});
client.connect(); */
var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//Port server runs on
var port = process.env.PORT || 3000;

app.use("/css", express.static(path.resolve(__dirname + '/../css/')));
app.use("/static", express.static(path.resolve(__dirname + '/../static/')));
app.use("/src", express.static('./src/'));
app.use("/dist", express.static(path.resolve(__dirname + '/../dist/')));
//Host the main page
app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname + ('/../index.html')));
});

const MIN_PLAYERS = 2;
//On initial connection
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('refreshCookie', function(data) {
        socket.join('lobby');
        socket.emit(courrier.cookify, { 
            cookie: setCookie(data),
            gameState: gameStates.mainLobby,
            availableGames: publicInstances
        });
    });
    //Login via database if available
    socket.on('login', function(data) {

        const values = [data.username];
        socket.join('lobby');
        socket.emit(courrier.cookify, {
            cookie: setCookie(values[0]),
            gameState: gameStates.mainLobby,
            availableGames: publicInstances
        });
    });
    //Create a new game room
    socket.on('roomcreated', function(data) {
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
            played.push(deck.splice(0, 8));
            points.push(0);
            players.push({ name: 'The Iron Giant', ready: true});
            played.push(deck.splice(0, 8));
            points.push(0);
            ready = 2;
            maxPlayers = 3;
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
        io.to('lobby').emit(courrier.newRoom, {
            availableGames: publicInstances
        });
        socket.leave('lobby');
        socket.join('' + gameId);
        socket.emit(courrier.userJoined, {
            selectCards: deck.splice(0, 8),
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
    socket.on('roomjoined', function(data) {
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
                    io.to('lobby').emit(courrier.newRoom, {
                        availableGames: publicInstances
                    })
                }
            }
        }
        gameInstances[data.id] = joinedInstance;
        socket.emit(courrier.userJoined, {
            selectCards: joinedInstance.deck.splice(0,8),
            gameState: joinedInstance.gameState,
            id: joinedInstance.id,
            pid: joinedInstance.players.length - 1,
        });
        io.to('' + data.id).emit("userjoined", {
            players: joinedInstance.players,
            chat: joinedInstance.chat,
            played: joinedInstance.played,
            points: joinedInstance.points
        });

    });
    socket.on("sendChat", function(data) {
        let instance = gameInstances[data.id];
        instance.chat.push({user: data.user, message: data.message});
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit("messageSent", {
            chat: instance.chat
        });
    });
    socket.on('userreadied', function(data) {
        let instance = gameInstances[data.id];
        instance.ready += 1;
        for (let i = 0; i < instance.players.length; i++) {
            if (instance.players[i].name === data.user) {
                instance.players[i].ready = true;
                gameInstances[data.id] = instance;
                io.to('' + data.id).emit(courrier.userReadied, {
                    players: instance.players
                });
                break;
            }
        }
        if (instance.ready === instance.players.length && instance.ready >= MIN_PLAYERS) {
            for (let i = 0; i < publicInstances.length; i++) {
                if (publicInstances[i].id === data.id) {
                    publicInstances.splice(i, 1);
                    io.to('lobby').emit(courrier.newRoom, {
                        availableGames: publicInstances
                    })
                }
            }
            instance.gameState = gameStates.initialDiscard;
            gameInstances[data.id] = instance;
            io.to('' + data.id).emit('discardphase', {
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
    socket.on('discardPresetup', function(data) {
        let instance = gameInstances[data.id];
        instance.numDiscarded++;
        socket.emit('cardUpdate', {
            selectCards: data.newHand
        });
        if (instance.numDiscarded === instance.players.length) {
            instance.currentPlayer = Math.floor(Math.random() * instance.players.length);
            instance.gameState = "setup";
            gameInstances[data.id] = instance;
            io.to('' + data.id).emit('setupphase', {
                gameState: instance.gameState,
                currentPlayer: instance.currentPlayer,
            });
        } else {
            instance.gameState = "standby";
            gameInstances[data.id] = instance;
            socket.emit("standby", {
                gameState: instance.gameState
            });
        }
    });
    socket.on('nextPhase', function(data) {
        let instance = gameInstances[data.id];
        if (instance.gameState === gameStates.hasteCheck) {
            instance.gameState = gameStates.swapBoard;
        } else if (instance.gameState === 'playCards' || instance.gameState === gameStates.reflexed) {
            instance.turn++;
            if (instance.turn === instance.players.length * 8) {
                instance.currentPlayer = null;
                instance.gameState = "gameover";
            } else {
                instance.currentPlayer = ((instance.currentPlayer + 1) % instance.players.length);
                instance.gameState = gameStates.hasteCheck;
            }
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit(courrier.nextPlayer, {
            gameState: instance.gameState,
            currentPlayer: instance.currentPlayer
        });
    });
    socket.on('boardChange', function(data) {
        let instance = gameInstances[data.id];
        instance.spaces = data.newSpaces;
        instance.colorCounts = data.newCounts;
        if (instance.gameState === "setup") {
            instance.currentPlayer = ((instance.currentPlayer + 1) % instance.players.length);
            if (!instance.spaces.includes(null)) {
                instance.gameState = gameStates.hasteCheck;
            }
        } else {
            instance.gameState = "playCards";
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit('boardChange', {  
            spaces: instance.spaces,
            colorCounts: instance.colorCounts,
            currentPlayer: instance.currentPlayer,
            gameState: instance.gameState,
        });
    });
    socket.on('bonusswap', function(data) {
        let instance = gameInstances[data.id];
        instance.spaces = data.newSpaces;
        instance.colorCounts = data.newCounts;
        instance.gameState = gameStates.swapBoard;
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit('boardChange', {  
            spaces: instance.spaces,
            colorCounts: instance.colorCounts,
            gameState: instance.gameState,
        });
    });
    socket.on('discardNormalHand', function(data) {
        let instance = gameInstances[data.id];
        instance.gameState = "playCards";
        let tempCards = data.hand.slice();
        socket.emit('boardChange', {
            selectCards: tempCards
        });
        io.to('' + data.id).emit('boardChange', {
            gameState: instance.gameState,

        });
    });
    socket.on('cardPlayed', function(data) {
        let instance = gameInstances[data.id];
        let newPlayed = instance.played[data.pid].slice();
        let interacted = handleCardInteractions(data.newPlayed, data.oldPlayed, data.id);
        instance.points[data.pid] += interacted.combust;
        newPlayed = newPlayed.concat(interacted.played);
        instance.played[data.pid] = newPlayed;
        socket.emit('cardUpdate', {
            selectCards: data.rest.concat(interacted.newCards)
        });
        if (interacted.processCode != null) {
            instance.gameState = 'discardNormal';
            socket.emit('discardphase', {
                gameState: instance.gameState,
                processCode: interacted.processCode,
                discardCount: 2
            })
        }
        if (interacted.stateEdit === "H") {
            instance.gameState = gameStates.hasted;
            socket.emit('bonusswap', {
                gameState: instance.gameState
            });
        } else if (interacted.stateEdit === "R") {
            instance.gameState = gameStates.reflexed;
            socket.emit('reflexed', {
                gameState: instance.gameState
            });
        } else {
            if (instance.gameState === gameStates.reflexed && data.reflexused === true) {
                instance.gameState = 'playCards';
            }
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit('cardPlayed', {
            played: instance.played,
            gameState: instance.gameState,
            points: instance.points
        });
    });
    socket.on("abandonRoom", function(data) {
        gameInstances[data.id] = [];
        for(let i = 0; i < publicInstances.length; i++) {
            if (publicInstances[i].id == data.id) {
                publicInstances.splice(i ,1);
                break;
            }
        }
        var users = io.sockets.adapter.rooms['' + data.id].sockets;
        Object.keys(users).forEach(function(client) {
            let socket = io.in('' + gameId).connected[client];
            socket.leave('' + gameId);
            socket.join('lobby');
            socket.emit(courrier.returnToLobby, {
                gameState: gameStates.mainLobby,
                availableGames: publicInstances
            });
        });
        io.to('lobby').emit(courrier.newRoom, {
            availableGames: publicInstances
        });
    });
});

server.listen(port, function() {
    console.log('listening on *' + port);
});

const colorNames = Object.values(colors);
var IDS = new Set();

var selectCards = cards.map(card => {
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

var gameId = 1;
var gameInstances = [];
var publicInstances = [];

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
    var d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
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
        if (current.type != 'C') {
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
