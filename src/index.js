import 'bootstrap/dist/css/bootstrap.css';
import courier from "./courier";
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
    socket.emit(courier.refreshCookie, currentCookie);
} else {
    renderLogin(localData, socket);
}
socket.on(courier.waiting, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.boardChange, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.setupPhase, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.cardUpdate, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.newMessage, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.discardPhase, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.cardPlayed, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.bonusSwap, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.reflex, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.cookieSent, function (data) {
    document.cookie = data.cookie;
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on(courier.newRoom, function (data) {
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on(courier.returnToLobby, function (data) {
    localData = {};
    Object.assign(localData, data);
    renderLobby(localData, socket);
});
socket.on(courier.userJoined, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.userReadied, function (data) {
    Object.assign(localData, data);
    renderGame(localData, socket);
});
socket.on(courier.nextPlayer, function (data) {
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
    socket.emit(courier.login, {
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