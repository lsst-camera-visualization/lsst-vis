import React from "react";
import Draggable from 'react-draggable';

export default class Box extends React.Component {
    render() {
        return (
            <Draggable
                defaultPosition={{x: 1000, y: 100}}
                handle=".box-title" >
                <div className="box-ctr">
                    <p className="box-title">{this.props.name}</p>
                    <div className="box-body">{this.props.children}</div>
                </div>
            </Draggable>
        );
    }
}
