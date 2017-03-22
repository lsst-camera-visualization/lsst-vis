import React from "react";
import Draggable from 'react-draggable';

import ViewerImageViewer from "./Viewer/ViewerImageViewer";
import ViewerUVPanel from "./Viewer/ViewerUVPanel";
import ViewerCursorPanel from "./Viewer/ViewerCursorPanel";
import { ReactUtil } from "../util/Util";

export default class Viewer extends React.Component {
    constructor() {
        super();

        this.state = {
            imageURL: null
        }
    }

    componentDidMount() {
        this.setState({
            imageURL: "http://localhost:8080/static/images/imageE2V_untrimmed.fits"
        })

        const region = {
            type: "rect",
            value: {
                x1: 1000, y1: 1000, x2: 3000, y2: 3000
            }
        }

        const params = {
            ...region,
            image_url: "http://localhost:8080/static/images/imageE2V_untrimmed.fits"
        }
        console.log(params);

        firefly.getJsonFromTask('python', "average", params).then(function(data) {
            console.log(data);
        }).catch(function(data) {
            console.log(data);
        })
    }

    render() {
        const left = <ViewerCursorPanel />
        const right = <ViewerUVPanel />;

        return (
            <Draggable
                defaultPosition={{x: 100, y: 50}} >
                <div className="viewer-ctr">
                    <p className="viewer-title">{this.props.name}</p>
                    <ViewerImageViewer name={this.props.name} imageURL={this.state.imageURL} />
                    <ReactUtil.Col2
                        className="viewer-info"
                        width="50%"
                        left={left}
                        right={right}
                        separator={true} />
                </div>
            </Draggable>
        );
    }
}
