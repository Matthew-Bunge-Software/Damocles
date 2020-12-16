import React from 'react';

export default function Community(props) {
    const basin = props.colorCounts;
    const listBasin = basin.map(color => (
        <button
            className={"dot " + color.color}
            key={color.color}
            onClick={() => props.onClick(color)}
            type="button"
        >
            {color.count}
        </button>
    ));
    return <ul>{listBasin}</ul>;
}