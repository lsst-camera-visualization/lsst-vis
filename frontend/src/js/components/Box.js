import React from "react";
import Draggable from "react-draggable";
import { ReactUtil } from "../util/react";
import commandDispatcher from "../commands/commandDispatcher";

import BoxBody from "./Box/BoxBody";

export default class Box extends React.Component {
    // Handles closing the box
    handleClose = () => {
        commandDispatcher.dispatch("delete_box", { box_id: this.props.id });
    }

    render() {
        const id = this.props.id;
        const ctrClassName = (this.props.boxes[id].bMini) ? "box-ctr-mini" : "";
        return (
            <Draggable
                handle=".box-title"
                onStart={this.handleStart} >
                <div className={"box-ctr " + ctrClassName} >
                    <ReactUtil.Toolbar
                        onClose={this.handleClose}>
                        <p className="box-title">{id}</p>
                        <BoxBody
                            text={this.props.boxes[id].text}
                            minimize={this.props.boxes[id].bMini} />
                    </ReactUtil.Toolbar>
                </div>
            </Draggable>
        );
    }
}
