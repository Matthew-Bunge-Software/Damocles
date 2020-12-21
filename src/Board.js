import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export default function Board(props) {
    const NAMES = ["one", "two", "three", "four", "five", "six", "seven"];
    const HEPINDEX = NAMES.map(name => name + "hep");
    const spaces = props.spaces;
    const listBoard = spaces.map((color, index) => (
        <button
            className={"dot " + color + " " + HEPINDEX[index]}
            key={index}
            onClick={() => props.onClick(color, index)}
            type="button"
        >
        
        {'BANQUET'.charAt(index)}</button>
    ));
    return <ul className="board">{listBoard}</ul>;
}