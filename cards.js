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
    /* {
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
    }, */
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

module.exports = {
    colors: COLORS,
    cards: CARDS
}