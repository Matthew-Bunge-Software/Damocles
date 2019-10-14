export default function Header(props) {
    let myTurn = "";
    switch (props.gameState) {
        case gameStates.initialDiscard:
        case gameStates.discardNormal:
            myTurn = "Please discard " + props.discardCount + " cards"
            break;
        case gameStates.standby:
            myTurn = "Waiting for other players";
            break;
        default: 
            myTurn = props.myTurn ? "My turn" : "Not my turn";
            break;
    }
    return <p>{myTurn}</p>
}