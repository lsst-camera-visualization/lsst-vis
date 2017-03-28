import React from "react";
import { FireflyUtil } from "../../util/FireflyUtil";

export default class ViewerImageViewer extends React.Component {
    constructor() {
        super();
        this._imageURL = null;
    }

    loadImage = imageURL => {
        if (this._imageURL !== imageURL) {
            FireflyUtil.LoadImage(this.props.e.id, imageURL);
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
            <div id={this.props.e.id} className="viewer-imgViewer"></div>
        );
    }
}
