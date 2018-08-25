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
    if (idCount == 4) {
        currentPlayer = Math.floor(Math.random(players.length) + 1);
        gameState = "setup";
        io.emit('setupphase', {
            gameState: gameState,
            currentPlayer: currentPlayer,
        });
    }
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
            played: played
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
        io.emit('cardPlayed', {
            played: played
        });
    });
});

server.listen(port, function() {
    console.log('listening on *' + port);
});

const COLORS = {
    RED: "red",
    BLUE: "blue",
    GREEN: "green",
    BLACK: "black",
    GOLD: "gold"
};

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

const CARDS = [
    {
        type: generate,
        one: gold,
        four: blue,
        five: blue
    },
    {
        type: generate,
        one: gold,
        four: green,
        five: green
    },
    {
        type: generate,
        one: blue,
        four: black,
        five: black
    },
    {
        type: generate,
        one: blue,
        four: gold,
        five: gold
    },
    {
        type: generate,
        one: green,
        four: black,
        five: black
    },
    {
        type: generate,
        one: green,
        four: blue,
        five: blue
    },
    {
        type: generate,
        one: red,
        four: green,
        five: green
    },
    {
        type: generate,
        one: red,
        four: gold,
        five: gold
    },
    {
        type: generate,
        one: black,
        four: red,
        five: red
    },
    {
        type: generate,
        one: black,
        four: gold,
        five: gold
    },
    {
        type: combust,
        one: red,
        three: blue,
        six: blue
    },
    {
        type: combust,
        one: red,
        three: black,
        six: black
    },
    {
        type: combust,
        one: blue,
        three: green,
        six: green
    },
    {
        type: combust,
        one: blue,
        three: gold,
        six: gold
    },
    {
        type: combust,
        one: green,
        three: red,
        six: red
    },
    {
        type: combust,
        one: green,
        three: gold,
        six: gold
    },
    {
        type: combust,
        one: black,
        three: blue,
        six: blue
    },
    {
        type: combust,
        one: black,
        three: green,
        six: green
    },
    {
        type: combust,
        one: gold,
        three: black,
        six: black
    },
    {
        type: combust,
        one: gold,
        three: red,
        six: red
    },
    {
        type: oracle,
        one: red,
        two: black,
        seven: green
    },
    {
        type: oracle,
        one: blue,
        three: green,
        seven: red
    },
    {
        type: oracle,
        one: gold,
        two: black,
        six: blue
    },
    {
        type: oracle,
        one: black,
        four: red,
        five: gold
    },
    {
        type: oracle,
        one: green,
        three: gold,
        six: blue
    },
    {
        type: reflex,
        one: green,
        three: green
    },
    {
        type: reflex,
        one: red,
        three: red
    },
    {
        type: reflex,
        one: blue,
        three: blue
    },
    {
        type: reflex,
        one: black,
        three: black
    },
    {
        type: reflex,
        one: gold,
        three: gold
    },
    {
        type: conquer,
        one: green,
        two: blue
    },
    {
        type: conquer,
        one: blue,
        two: black
    },
    {
        type: conquer,
        one: black,
        two: red
    },
    {
        type: conquer,
        one: red,
        two: gold
    },
    {
        type: conquer,
        one: gold,
        two: green
    },
    {
        type: haste,
        one: gold,
    },
    {
        type: haste,
        one: blue,
    },
    {
        type: haste,
        one: green,
    },
    {
        type: haste,
        one: red,
    },
    {
        type: haste,
        one: black,
    },
    {
        type: one,
        one: red,
        two: red,
    },
    {
        type: one,
        one: gold,
        two: gold,
    },
    {
        type: one,
        one: blue,
        two: blue,
    },
    {
        type: one,
        one: green,
        two: green,
    },
    {
        type: one,
        one: black,
        two: black,
    },
    {
        type: one,
        one: red,
        four: red,
    },
    {
        type: one,
        one: gold,
        four: gold,
    },
    {
        type: one,
        one: green,
        four: green,
    },
    {
        type: one,
        one: blue,
        four: blue,
    },
    {
        type: one,
        one: black,
        four: black,
    },
    {
        type: two,
        one: blue,
        three: blue,
        seven: red
    },
    {
        type: two,
        one: black,
        three: black,
        seven: green
    },
    {
        type: two,
        one: gold,
        three: gold,
        seven: black
    },
    {
        type: two,
        one: red,
        three: red,
        seven: gold
    },
    {
        type: two,
        one: green,
        three: green,
        seven: blue
    },
    {
        type: three,
        two: gold,
        three: black,
        six: blue,
        seven: red
    },
    {
        type: three,
        two: blue,
        three: red,
        six: black,
        seven: green
    },
    {
        type: three,
        two: red,
        three: gold,
        six: green,
        seven: blue
    },
    {
        type: three,
        two: green,
        three: blue,
        six: gold,
        seven: black
    },
    {
        type: three,
        two: blue,
        three: green,
        six: red,
        seven: gold
    }
];

var IDS = new Set();
var spaces = Array(7).fill(null);
let colorNames = Object.values(COLORS);
var colorCounts = colorNames.map(name => ({ color: name, count: 4 }));


var selectCards = CARDS.map(card => {
    let intAdded = false;
    let randInt = -1;
    while (!intAdded) {
        randInt = Math.floor(Math.random() * 100000);
        if (!IDS.has(randInt)) {
            IDS.add(randInt);
            intAdded = true;
        }
    }
    card.ID = randInt;
    return card;
});

selectCards = shuffle(selectCards);

var players = [];
var idCount = 1;
var currentPlayer = null;
var gameState = "lobby";
var played = [[], [], []];

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
        actionToTake: null,
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
                actionToTake: 2
            });
        } else if (action === "G" ) {
            Object.assign(returnMe, {
                newCards: selectCards.splice(0, num)
            });
        } else {
            console.log("Something went wrong");
        }
    } else {
        if (action === "A") {

        } else if (action === "R") {

        } else if (action === "H") {

        }
    }
    return returnMe;
}