const gameStates = require("./gameStates.js");
import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
class MyHand extends React.Component {
    renderButton() {
        if (this.props.discardValid(this.props.gameState, this.props.myTurn)) {
            return <button
                        onClick={() => this.props.discardClicked()} 
                        className={"playbutton"}
                        type="button">
                        
                        {"Discard Tiles"}
                    </button>
        } else {
            return <button 
                        disabled={(this.props.gameState === "setup") || !this.props.myTurn} 
                        onClick={() => this.props.playClicked()} 
                        className={"playbutton"}
                        type="button">
                        
                        {"Play Tiles"}
                    </button>
        }
    }

    renderDiscard() {
        // TODO: Differentiate Finish Turn and Next Phases
        return <button 
                    disabled={(!this.props.myTurn || this.props.gameState === "setup" || this.props.gameState === gameStates.initialDiscard)} 
                    onClick={() => this.props.nextTurn() }
                    type="button">
                    
                    { "Finish Turn" }
                </button>
    }

    render() {
        return <div className="hand">
            {this.props.cards}
            {this.renderButton()}
            {this.renderDiscard()}
        </div>;
    }
}

export default MyHand;