class Card extends React.Component {
    NAMES = ["one", "two", "three", "four", "five", "six", "seven"];
    HEPINDEX = this.NAMES.map(name => name + "hep");

    constructor(props) {
        super(props);
        this.state = {
            spaces: props.card.spaces,
            card: props.card,
        }
    }

    rotateDisplay(event) {
        let temp = this.state.spaces.slice();
        if (event.keyCode === 81) {
            let hold = temp[0];
            for (var i = 0; i < 6; i++) {
                temp[i] = temp[i + 1];
            }
            temp[6] = hold;
        } else if (event.keyCode === 69) {
            let hold = temp[6];
            for (var i = 6; i > 0; i--) {
                temp[i] = temp[i - 1];
            }
            temp[0] = hold;
        }
        this.setState({
            spaces: temp
        })
    }

    render() {
        let newSpaces = this.state.spaces.map((color, index) => <li key={index} className={"dot small " + color + " " + this.HEPINDEX[index]}>{}</li>);
        newSpaces.push(<li key={7} className="cardType">{this.props.card.type}</li>);
        return (<div onKeyDown={(e) => this.rotateDisplay(e)}
            tabIndex="0"
            className="cardRotateContainer">
            <ul onClick={() => this.props.onClick(this.state.card)}
                className={"card " + this.props.display + " " + this.props.selected}
            >  {newSpaces} </ul></div>);
    }
}

export default Card;