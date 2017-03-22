import React from "react";

export default class ViewerImageViewer extends React.Component {
    loadImage = imageURL => {
        firefly.showImage(this.props.name, {
            plotId: this.props.name,
            URL: imageURL,
            Title: "title",
            ZoomType: "TO_WIDTH",
            ZoomToWidth: '100%'
        });
    }

    componentDidMount() {
        this.loadImage(this.props.imageURL);
    }

    componentDidUpdate() {
        this.loadImage(this.props.imageURL);
    }

    render() {
        return (
            <div id={this.props.name} className="viewer-imgViewer"></div>
        );
    }
}
