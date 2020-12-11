export default function Board(props) {
    const NAMES = ["one", "two", "three", "four", "five", "six", "seven"];
    const HEPINDEX = NAMES.map(name => name + "hep");
    const spaces = props.spaces;
    const listBoard = spaces.map((color, index) => (
        <button
            className={"dot " + color + " " + HEPINDEX[index]}
            key={index}
            onClick={() => props.onClick(color, index)}
        >
        
        {'BANQUET'.charAt(index)}</button>
    ));
    return <ul className="board">{listBoard}</ul>;
}