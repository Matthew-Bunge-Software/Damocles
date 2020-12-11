import OtherHands from "./OtherHands.js";
import Board from "./Board.js";
import Community from "./Community.js";
import Header from "./Header.js";
import MyHand from "./MyHand.js";
import PlayedTiles from "./PlayedTiles.js";

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
            <div className="display">
                {this.renderOtherHands()}
                <Header myTurn={this.props.myTurn}
                        gameState={this.props.gameState}
                        discardCount={this.props.discardCount}

                />
                {this.renderSelector()}
                <Board
                    onClick={(i, j) => this.props.boardClick(i, j)}
                    spaces={this.props.spaces}
                />
                <PlayedTiles played={this.props.played} />
                <MyHand playClicked={() => this.props.playClicked()} 
                        discardClicked={() => this.props.discardClicked()}
                        discardValid={(i, j) => this.props.discardValid(i, j)}
                        nextTurn = {() => this.props.nextTurn()}
                        cards={this.props.cards} 
                        myTurn={this.props.myTurn}
                        gameState={this.props.gameState}
                        id={this.props.id}
                />
            </div>
        );
    }
}

export default Display;