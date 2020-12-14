import React from 'react';

export default function PlayedTiles(props) {
    return <div className="playedtiles">
                {props.played}
            </div>;
}