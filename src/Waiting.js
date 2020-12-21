import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
class Waiting extends React.Component {
    userReady() {
        this.props.socket.emit("userreadied", {
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
            <Col xs={6} className={"Waiting"}>
                {this.renderPlayers()}
                <Row>
                    <Col xs={6} md={4} lg={3} xl={2}>
                        <Button variant="damocles-primary" 
                                disabled={this.buttonStatus()} 
                                onClick={() => this.userReady()} 
                                type={"button"}>
                            {"Ready"}
                        </Button>
                    </Col>
                    <Col xs={6} md={4} lg={3} xl={2}>
                        <Button variant="damocles-danger" 
                                id={"backbutton"} 
                                type={'button'} 
                                onClick={() => this.props.abandonRoom()}>
                            {"Back"}
                        </Button>
                    </Col>
                </Row>
            </Col>);
    }
}

export default Waiting;