import 'bootstrap/dist/css/bootstrap.css';
const courrier = require("./courrier.js");
import React from 'react';
import ReactDOM from 'react-dom';
import Game from "./Game.js";
import Lobby from "./Lobby.js";
import Login from "./Login.js";

//const connectTo = 'https://damoclesgame.herokuapp.com';
const connectTo = 'http://localhost:3000';
const socket = io.connect(connectTo);

let currentCookie = getCookie();
let localData = {};
if (currentCookie !== "") {
    console.log(currentCookie);
    socket.emit('refreshCookie', currentCookie);
} else {
    renderLogin(localData, socket);
}
socket.on(courrier.waiting, function (data) {
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
socket.on(courrier.newMessage, function (data) {
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
socket.on(courrier.cookify, function (data) {
    console.log("cool jesus");
    document.cookie = data.cookie;
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on(courrier.newRoom, function (data) {
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on(courrier.returnToLobby, function (data) {
    localData = {};
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on(courrier.userJoined, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courrier.userReadied, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courrier.nextPlayer, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});

function renderGame(data, socket) {
    ReactDOM.render(<Game spaces={data.spaces}
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
        points={data.points}
        chat={data.chat}
        getCookie={() => getCookie()}
    />, document.getElementById("root"));
}

function renderLobby(data, socket) {
    console.log("Cool guy");
    ReactDOM.render(<Lobby
        available={data.availableGames}
        socket={socket}
        getCookie={() => getCookie()}
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

function getCookie() {
    const name = "Damocles=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}