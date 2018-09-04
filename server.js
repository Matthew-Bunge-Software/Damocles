var {colors} = require('./cards');
var {cards} = require('./cards');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
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
    socket.on('login', function(data) {
        const text = 'SELECT * FROM login';
        const values = [data.username, data.password];
        console.log("HiHi");
        client.query('SELECT * FROM login', values, (err, res) => {
            if (err) {
                console.log(err.stack);
            }
            for (let row of res.rows) {
              console.log(row);
            }
          });
    });
    console.log(socket.request.connection._peername);
    players.push(idCount);
    socket.emit('initialize', { 
        selectCards: selectCards.splice(0, 8), 
        spaces: spaces,
        colorCounts: colorCounts,
        gameState: gameState,
        pid: idCount,
        currentPlayer: currentPlayer,
        played: played
    });
    idCount++;
    if (idCount == 3) {
        gameState = "discardphase";
        io.emit('discardphase', {
            gameState: gameState,
            processCode: null,
            discardCount: 2
        });
    }
    socket.on('discardPresetup', function(data) {
        numDiscarded++;
        socket.emit('cardUpdate', {
            selectCards: data
        });
        if (numDiscarded === players.length) {
            currentPlayer = Math.floor(Math.random(players.length) + 1);
            gameState = "setup";
            io.emit('setupphase', {
                gameState: gameState,
                currentPlayer: currentPlayer,
            });
        } else {
            gameState = "standby";
            socket.emit("standby", {
                gameState: gameState
            });
        }
    });
    console.log('a user connected');
    socket.on('boardChange', function(data) {
        spaces = data.newSpaces;
        colorCounts = data.newCounts;
        currentPlayer = ((currentPlayer % players.length) + 1);
        gameState = spaces.includes(null) ? gameState : "";
        io.emit('boardChange', {  
            spaces: spaces,
            colorCounts: colorCounts,
            currentPlayer: currentPlayer,
            gameState: gameState,
        });
    });
    socket.on('bonusswap', function(data) {
        spaces = data.newSpaces;
        colorCounts = data.newCounts;
        gameState = "";
        io.emit('boardChange', {  
            spaces: spaces,
            colorCounts: colorCounts,
            gameState: gameState,
        });
    });
    socket.on('discardNormalHand', function(data) {
        //TODO: Figure out turn order
        currentPlayer = ((currentPlayer % players.length) + 1);
        gameState = spaces.includes(null) ? gameState : "";
        let tempCards = data.slice();
        socket.emit('boardChange', {
            selectCards: tempCards
        });
        io.emit('boardChange', {
            currentPlayer: currentPlayer,
            gameState: gameState,

        });
    });
    socket.on('cardPlayed', function(data) {
        let newPlayed = played[data.pid - 1].slice();
        let interacted = handleCardInteractions(data.newPlayed);
        newPlayed = newPlayed.concat(interacted.played);
        played[data.pid - 1] = newPlayed;
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
        io.emit('cardPlayed', {
            played: played
        });
    });
});

server.listen(port, function() {
    console.log('listening on *' + port);
});

var IDS = new Set();
var spaces = Array(7).fill(null);
let colorNames = Object.values(colors);
var colorCounts = colorNames.map(name => ({ color: name, count: 4 }));


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

selectCards = shuffle(selectCards);

var players = [];
var idCount = 1;
var currentPlayer = null;
var gameState = "lobby";
var played = [[], []];
var numDiscarded = 0;

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

function handleCardInteractions(played) {
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
                newCards: selectCards.splice(0, num + 1)
            });
        } else if (action === "O") {
            Object.assign(returnMe, {
                newCards: selectCards.splice(0, num + 2),
                processCode: num + 2
            });
        } else if (action === "G" ) {
            Object.assign(returnMe, {
                newCards: selectCards.splice(0, num)
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
