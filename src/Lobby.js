import React from 'react';

class Lobby extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        available: [],
        selected: 2,
        name: null
      }
    }
    
    selectChange(e) {
      this.setState({
        selected: e.target.value
      });
    }
    
    nameChange(e) {
      this.setState({
        name: e.target.value
      });
    }
    
    createNewValues() {
      console.log("Trying to create")
        let name = this.state.name;
        if (name != null) {
            this.props.socket.emit("roomcreated", {
                name: name,
                players: this.state.selected,
                creator: this.props.getCookie()
            });
        }
    }

    joinRoom(id) {
        this.props.socket.emit('roomjoined', {
            user: this.props.getCookie(),
            id: id
        });
    }

    renderAvailable() {
        let lobbies = [];
        let games = this.props.available.slice();
        for (let i = 0; i < games.length; i++) {
            lobbies.push(<li 
                id={games[i].id}
                className={"lobbylist"}
                onDoubleClick={(e) => this.joinRoom(parseInt(e.target.id))}
            >{games[i].name + " - " + games[i].maxPlayers}</li>);
        }
        return (<div className="browser"><label>{"Currently Available Rooms"}</label><ul>{lobbies}</ul></div>
        );
    }
    
    render() {
      return (<div id="lobby">
                <div id={"newroomlabeldiv"}>
                    <label id={"newroomlabel"}>{"New Room Name"}</label>
                    <input id={"newroominput"} onInput={(e) => this.nameChange(e)} type="text"></input>
                </div>
                <div id={"newroommaxplayerdiv"}>
                    <label id={"maxplayer"}>{"MAX PLAYERS"}</label>
                    <select id={"playeroptions"} onChange={(e) => this.selectChange(e)} id="max_val">
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>
                <button id={"newroombutton"} type="button" onClick={() => this.createNewValues()}>{"New Instance"}</button>
            {this.renderAvailable()}
            </div> 
          );
    }
}

export default Lobby;