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
        const styleWH = {
            width: this.props.width,
            height: this.props.height
        };
        return (
            <div
                id={this.props.e.id}
                className="viewer-imgViewer"
                style={styleWH}
                onClick={this.props.onClick}
                onDoubleClick={this.props.onDblClick} >
            </div>
        );
    }
}
