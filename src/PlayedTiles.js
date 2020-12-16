import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
export default function PlayedTiles(props) {
    return <div className="playedtiles">
                {props.played}
            </div>;
}