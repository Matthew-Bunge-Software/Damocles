class OtherHands extends React.Component {
    renderSingleHands() {
        let returnMe = [];
        for (let i = 0; i < this.props.players.length; i++) {
            if (i != this.props.pid) {
                returnMe.push(<div className="otherHands">
                    <label>{this.props.players[i].name + ": " + this.props.points[i] + " Points"}</label>
                    <div className="otherHandsPlayed">
                        {this.props.played[i]}
                    </div>
                </div>);
            }
        }
        return returnMe;
    }
    render() {
        return <div className="otherHands">
            {this.renderSingleHands()}
        </div>;
    }
}

export default OtherHands;