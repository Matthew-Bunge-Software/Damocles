import React from 'react';

export default function Board(props) {
    const NAMES = ["one", "two", "three", "four", "five", "six", "seven"];
    const HEP_INDEX = NAMES.map(name => name + "hep");
    const spaces = props.spaces;
    const listBoard = spaces.map((color, index) => (
        <button
            className={"dot " + color + " " + HEP_INDEX[index]}
            key={index}
            onClick={() => props.onClick(color, index)}
            type="button"
        >
        
        {'BANQUET'.charAt(index)}</button>
    ));
    return <ul className="board">{listBoard}</ul>;
}