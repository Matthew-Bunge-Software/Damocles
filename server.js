var {colors} = require('./cards');
var {cards} = require('./cards');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://matthew:cadenza@localhost:5432/tempdb",
});

client.connect();
var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('refreshCookie', function(data) {
        socket.join('lobby');
        socket.emit("cookify", { 
            cookie: setCookie(data),
            gameState: "lobby",
            availableGames: publicInstances
        });
    });
    socket.on('login', function(data) {
        const text = 'SELECT * FROM login WHERE username = $1 AND password = $2';
        const values = [data.username, data.password];
        client.query(text, values, (err, res) => {
            if (err) {
                console.log(err.stack);
            }
            if (res.rows.length > 0) {
                socket.join('lobby');
                socket.emit("cookify", {
                    cookie: setCookie(res.rows[0].username),
                    gameState: "lobby",
                    availableGames: publicInstances
                });
            }
        });
    });
    socket.on('roomcreated', function(data) {
        let id = gameId;
        let deck = shuffle(selectCards.slice());
        let creator = data.creator;
        let players = [];
        players.push({ name: creator, ready: false });
        let played = [];
        played.push([]);
        let newInstance = {
            creator: data.creator,
            name: data.name,
            maxPlayers: data.players,
            id: gameId,
            deck: deck,
            players: players,
            ready: 0,
            gameState: "prestart",
            played: played,
            numDiscarded: 0,
            spaces: Array(7).fill(null),
            colorCounts: colorNames.map(name => ({ color: name, count: 4 })),
        };
        let newPublicInstance = {
            creator: data.creator,
            name: data.name,
            maxPlayers: data.players,
            currentPlayers: 1,
            id: gameId
        };
        gameInstances[id] = newInstance;
        publicInstances.push(newPublicInstance);
        io.to('lobby').emit("newroom", {
            availableGames: publicInstances
        });
        socket.leave('lobby');
        socket.join('' + gameId);
        socket.emit('userjoined', {
            selectCards: deck.splice(0, 8),
            gameState: newInstance.gameState,
            players: newInstance.players,
            chat: [],
            played: newInstance.played,
            id: newInstance.id,
            pid: newInstance.players.length - 1
        });
        gameId += 1;
    });
    socket.on('roomjoined', function(data) {
        let joinedInstance = gameInstances[data.id];
        let user = data.user;
        joinedInstance.players.push({ name: user, ready: false});
        joinedInstance.played.push([]);
        joinedInstance.pid++;
        socket.leave('lobby');
        socket.join('' + data.id);
        if (joinedInstance.players.length === joinedInstance.maxPlayers) {
            for (let i = 0; i < publicInstances.length; i++) {
                if (publicInstances[i].id === data.id) {
                    publicInstances.splice(i, 1);
                    io.to('lobby').emit('newroom', {
                        availableGames: publicInstances
                    })
                }
            }
        }
        gameInstances[data.id] = joinedInstance;
        socket.emit('userjoined', {
            selectCards: joinedInstance.deck.splice(0,8),
            gameState: joinedInstance.gameState,
            id: joinedInstance.id,
            pid: joinedInstance.players.length - 1
        });
        io.to('' + data.id).emit("userjoined", {
            players: joinedInstance.players,
            chat: joinedInstance.chat,
            played: joinedInstance.played,
        });

    });
    socket.on('userreadied', function(data) {
        let instance = gameInstances[data.id];
        instance.ready += 1;
        for (let i = 0; i < instance.players.length; i++) {
            if (instance.players[i].name === data.user) {
                instance.players[i].ready = true;
                gameInstances[data.id] = instance;
                io.to('' + data.id).emit("userready", {
                    players: instance.players
                });
                break;
            }
        }
        if (instance.ready === instance.players.length && instance.ready >= 3) {
            for (let i = 0; i < publicInstances.length; i++) {
                if (publicInstances[i].id === data.id) {
                    publicInstances.splice(i, 1);
                    io.to('lobby').emit('newroom', {
                        availableGames: publicInstances
                    })
                }
            }
            instance.gameState = "discardphase";
            gameInstances[data.id] = instance;
            io.to('' + data.id).emit('discardphase', {
                spaces: instance.spaces,
                colorCounts: instance.colorCounts,
                gameState: instance.gameState,
                played: instance.played,
                processCode: null,
                discardCount: 2,
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
    socket.on('boardChange', function(data) {
        let instance = gameInstances[data.id];
        instance.spaces = data.newSpaces;
        instance.colorCounts = data.newCounts;
        instance.currentPlayer = ((instance.currentPlayer + 1) % instance.players.length);
        instance.gameState = instance.spaces.includes(null) ? instance.gameState : "";
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
        instance.gameState = "";
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit('boardChange', {  
            spaces: instance.spaces,
            colorCounts: instance.colorCounts,
            gameState: instance.gameState,
        });
    });
    socket.on('discardNormalHand', function(data) {
        //TODO: Figure out turn order
        let instance = gameInstances[data.id];
        instance.currentPlayer = ((instance.currentPlayer  + 1) % instance.players.length);
        instance.gameState = instance.spaces.includes(null) ? instance.gameState : "";
        let tempCards = data.hand.slice();
        socket.emit('boardChange', {
            selectCards: tempCards
        });
        io.to('' + data.id).emit('boardChange', {
            currentPlayer: instance.currentPlayer,
            gameState: instance.gameState,

        });
    });
    socket.on('cardPlayed', function(data) {
        let instance = gameInstances[data.id];
        let newPlayed = instance.played[data.pid].slice();
        let interacted = handleCardInteractions(data.newPlayed, data.id);
        newPlayed = newPlayed.concat(interacted.played);
        instance.played[data.pid] = newPlayed;
        socket.emit('cardUpdate', {
            selectCards: data.rest.concat(interacted.newCards)
        });
        if (interacted.processCode != null) {
            socket.emit('discardphase', {
                gameState: 'discardphase',
                processCode: interacted.processCode,
                discardCount: 2
            })
        }
        if (interacted.stateEdit === "H") {
            socket.emit('bonusswap', {
                gameState: "bonusswap"
            });
        } else if (interacted.stateEdit === "R") {
            socket.emit('reflexed', {
                gameState: "reflexed"
            });
        }
        gameInstances[data.id] = instance;
        io.to('' + data.id).emit('cardPlayed', {
            played: instance.played
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
    if (card.one != null) { spaces[0] = card.one; }
    if (card.two != null) { spaces[1] = card.two; }
    if (card.three != null) { spaces[2] = card.three; }
    if (card.four != null) { spaces[3] = card.four; }
    if (card.five != null) { spaces[4] = card.five; }
    if (card.six != null) { spaces[5] = card.six; }
    if (card.seven != null) { spaces[6] = card.seven; }
    while (!intAdded) {
        randInt = Math.floor(Math.random() * 100000);
        if (!IDS.has(randInt)) {
            IDS.add(randInt);
            intAdded = true;
        }
    }
    card.ID = randInt;
    card.spaces = spaces;
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
    return ("Damocles=" + user + ", " + expires + ", path=/");
}

function handleCardInteractions(played, id) {
    let returnToPublic = [];
    let returnMe = {
        newCards: [],
        processCode: null,
        played: []
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

        } else if (action === "R") { //use relative position
            Object.assign(returnMe, {
                stateEdit: "R"
            })
        } else if (action === "H") { //swap twice
            Object.assign(returnMe, {
                stateEdit: "H"
            });
        }
    }
    return returnMe;
}
