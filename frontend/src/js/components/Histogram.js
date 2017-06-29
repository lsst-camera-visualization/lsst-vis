import React from "react";
import Draggable from "react-draggable";
import { DrawHistogram } from "../util/firefly";
import { ReactUtil } from "../util/react";

export default class Histogram extends React.Component {
    // Sets the ref to the histogram container
    setCtrRef = ctr => {
        this.ctrRef = ctr;
    }

    // Sets the ref to the histogram title
    setTitleRef = title => {
        this.titleRef = title;
    }

    // Handles closing the histogram window
    handleClose = () => {
        this.props.onClose(this.props.id);
    }

    // Update and draw the actual histogram from Firefly
    componentDidMount() {
        const id = this.props.id;
        const h = this.props.histograms[id];

        let ctrStyle = window.getComputedStyle(this.ctrRef);
        const lrPadding = parseFloat(ctrStyle.getPropertyValue("padding-right")) +
                            parseFloat(ctrStyle.getPropertyValue("padding-left"));
        const tbPadding = parseFloat(ctrStyle.getPropertyValue("padding-top")) +
                            parseFloat(ctrStyle.getPropertyValue("padding-bottom"));

        let titleStyle = window.getComputedStyle(this.titleRef);
        const titleHeight = parseFloat(titleStyle.getPropertyValue("padding-top")) +
                            parseFloat(titleStyle.getPropertyValue("padding-bottom")) +
                            parseFloat(titleStyle.getPropertyValue("margin-top")) +
                            parseFloat(titleStyle.getPropertyValue("margin-bottom")) +
                            this.titleRef.clientHeight;

        // Calculate the remaining width and height of the histogram window
        const width = this.ctrRef.clientWidth - lrPadding;
        const height = this.ctrRef.clientHeight - tbPadding - titleHeight;
        DrawHistogram(id, h.data, width, height, h.opts);
    }

    render() {
        const id = this.props.id;

        return (
            <Draggable
                handle=".histo-title" >
                <div id={id + "-ctr"} className="histo-ctr" ref={ this.setCtrRef }>
                    <ReactUtil.Toolbar
                        onClose={this.handleClose}>
                        <p
                            className="histo-title"
                            ref={ this.setTitleRef }>
                            {this.props.histograms[id].opts.title}
                        </p>
                        <div id={id} className="histo-body"></div>
                    </ReactUtil.Toolbar>
                </div>
            </Draggable>
        );
    }
}
