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