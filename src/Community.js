export default function Community(props) {
    const basin = props.colorCounts;
    const listBasin = basin.map(color => (
        <button
            className={"dot " + color.color}
            key={color.color}
            onClick={() => props.onClick(color)}
        >
            {color.count}
        </button>
    ));
    return <ul>{listBasin}</ul>;
}