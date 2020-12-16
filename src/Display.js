import React from 'react';
import OtherHands from "./OtherHands.js";
import Board from "./Board.js";
import Community from "./Community.js";
import Header from "./Header.js";
import MyHand from "./MyHand.js";
import PlayedTiles from "./PlayedTiles.js";
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
class Display extends React.Component {
    renderSelector() {
        return (
            <Community
                onClick={i => this.props.selectorClick(i)}
                colorCounts={this.props.colorCounts}
            />
        );
    }

    renderOtherHands() {
        let hands = [];
        hands.push(<OtherHands
            pid={this.props.pid}
            points={this.props.points}
            players={this.props.players}
            played={this.props.allPlayed}
        />);
        return hands;
    }

    render() {
        return (
            <Col xs={9}>
                <Form className="display">
                    {this.renderOtherHands()}
                    <Col>
                        <Row className="justify-content-center">
                            <Header myTurn={this.props.myTurn}
                                gameState={this.props.gameState}
                                discardCount={this.props.discardCount}
                            />
                        </Row>
                        <Row className="justify-content-center">
                            {this.renderSelector()}
                        </Row>
                        <Row className="justify-content-center">
                            <Board
                                onClick={(i, j) => this.props.boardClick(i, j)}
                                spaces={this.props.spaces}
                            />
                        </Row>
                    </Col>
                    <PlayedTiles played={this.props.played} />
                    <MyHand playClicked={() => this.props.playClicked()}
                        discardClicked={() => this.props.discardClicked()}
                        discardValid={(i, j) => this.props.discardValid(i, j)}
                        nextTurn={() => this.props.nextTurn()}
                        cards={this.props.cards}
                        myTurn={this.props.myTurn}
                        gameState={this.props.gameState}
                        id={this.props.id}
                    />
                </Form>
            </Col>
        );
    }
}

export default Display;