import React from "react";
import Draggable from 'react-draggable';

export default class Viewer extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Draggable
                defaultPosition={{x: 100, y: 100}} >
                <div className="viewer-ctr">
                    <p>{this.props.name}</p>
                </div>
            </Draggable>
        );
    }
}
