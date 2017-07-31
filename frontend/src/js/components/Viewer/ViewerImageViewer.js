import React from "react";
import { LoadImage } from "../../util/firefly";

export default class ViewerImageViewer extends React.Component {
    constructor() {
        super();
        this._imageURL = null;
    }

    // Loads a new image into the viewer
    loadImage = imageURL => {
        if (this._imageURL !== imageURL) {
            console.log("ViewerImageViewer._imageURL: " + this._imageURL);
            console.log("imageURL: " + imageURL);
            LoadImage(this.props.e.id, imageURL);
            this._imageURL = imageURL;
        }
    }

    componentDidMount() {
        this.loadImage(this.props.e.image);
    }

    componentDidUpdate() {
        this.loadImage(this.props.e.image);
    }

    render() {
        return (
            <div
                id={this.props.e.id}
                className="viewer-imgViewer"
                onClick={this.props.onClick}
                onDoubleClick={this.props.onDblClick} >
            </div>
        );
    }
}
