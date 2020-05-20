class Waiting extends React.Component {
    userReady() {
        socket.emit("userreadied", {
            user: this.props.getCookie(),
            id: this.props.id
        });
    }

    buttonStatus() {
        let player = this.props.players.slice();
        let user = this.props.getCookie();
        for (let i = 0; i < player.length; i++) {
            if (player[i].name === user) {
                return player[i].ready;
            }
        }
    }

    renderPlayers() {
        let player = this.props.players.slice();
        player = player.map(player => { 
            let active = player.ready ? "readied" : "notreadied";
            return <li index={player.name} className={"pregameListItem " + active}>{player.name}</li>
        });
        return <ul>{player}</ul>
    }

    render() {
        return (
            <div className={"Waiting"}>
                {this.renderPlayers()}
                <button disabled={this.buttonStatus()} onClick={() => this.userReady()} type={"button"}>{"Ready"}</button>
            </div>);
    }
}

export default Waiting;