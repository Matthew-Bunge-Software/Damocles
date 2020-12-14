import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

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
        return (<Col xs={6}><label>{"Currently Available Rooms"}</label><ul>{lobbies}</ul></Col>
        );
    }
    
    render() {
      return (<Row id="lobby">
                <Col xs={6} id="new-room">
                  <Form>
                    <Row>
                      <Col xs={6}>
                        <Form.Group id={"new-room-label-div"}>
                            <Form.Label id={"new-room-label"}>
                              {"New Room Name"}
                            </Form.Label>
                            <Form.Control id={"new-room-input"} 
                                          onInput={(e) => this.nameChange(e)} 
                                          type="text"/>
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group id={"new-room-max-player-div"}>
                            <Form.Label id={"max-player"}>{"MAX PLAYERS"}</Form.Label>
                            <Form.Control as="select" 
                                          id={"player-options"} 
                                          onChange={(e) => this.selectChange(e)}>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary"
                            id={"new-room-button"} 
                            type="button" 
                            onClick={() => this.createNewValues()}>
                      {"New Instance"}
                    </Button>
                  </Form>
                </Col>
            {this.renderAvailable()}
            </Row> 
          );
    }
}

export default Lobby;