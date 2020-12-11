const gameStates = require("./gameStates.js");
class MyHand extends React.Component {
    renderButton() {
        if (this.props.discardValid(this.props.gameState, this.props.myTurn)) {
            return <button
                        onClick={() => this.props.discardClicked()} 
                        className={"playbutton"}>
                        
                        {"Discard Tiles"}
                    </button>
        } else {
            return <button 
                        disabled={(this.props.gameState === "setup") || !this.props.myTurn} 
                        onClick={() => this.props.playClicked()} 
                        className={"playbutton"}>
                        
                        {"Play Tiles"}
                    </button>
        }
    }

    renderDiscard() {
        // TODO: Differentiate Finish Turn and Next Phases
        return <button 
                    disabled={(!this.props.myTurn || this.props.gameState === "setup" || this.props.gameState === gameStates.initialDiscard)} 
                    onClick={() => this.props.nextTurn() }>
                    
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