import React from "react";
import Draggable from "react-draggable";
import BoxBody from "./Box/BoxBody";

export default class Box extends React.Component {
    render() {
        const id = this.props.id;
        return (
            <Draggable
                handle=".box-title" >
                <div className="box-ctr">
                    <p className="box-title">{id}</p>
                    <BoxBody text={this.props.boxes[id].text}/>
                </div>
            </Draggable>
        );
    }
}
