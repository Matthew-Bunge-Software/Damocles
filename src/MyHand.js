import {ButtonGroup} from "react-bootstrap";

const gameStates = require("./gameStates.js");
import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
class MyHand extends React.Component {
    renderButton() {
        if (this.props.discardValid(this.props.gameState, this.props.myTurn)) {
            return <Button
                        onClick={() => this.props.discardClicked()} 
                        className={"play-button"}
                        type="button"
                        variant={"damocles-primary"}>
                        
                        {"Discard Tiles"}
                    </Button>
        } else {
            return <Button
                        disabled={(this.props.gameState === "setup") || !this.props.myTurn} 
                        onClick={() => this.props.playClicked()} 
                        className={"play-button"}
                        type="button"
                        variant={"damocles-primary"}>
                        
                        {"Play Tiles"}
                    </Button>
        }
    }

    renderDiscard() {
        // TODO: Differentiate Finish Turn and Next Phases
        return <Button
                    disabled={(!this.props.myTurn || this.props.gameState === "setup" || this.props.gameState === gameStates.initialDiscard)} 
                    onClick={() => this.props.nextTurn() }
                    type="button"
                    variant={"damocles-primary"}>
                    
                    { "Finish Turn" }
                </Button>
    }

    render() {
        return <div className="hand">
            {this.props.cards}
            <Row>
                <Col xs={12}>
                    <ButtonGroup className={"mr-2"}>
                        {this.renderButton()}
                    </ButtonGroup>
                    <ButtonGroup className={"mr-2"}>
                        {this.renderDiscard()}
                    </ButtonGroup>
                </Col>
            </Row>
        </div>;
    }
}

export default MyHand;