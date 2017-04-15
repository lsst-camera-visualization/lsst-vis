import React from "react";

import TerminalCtr from "../containers/Terminal.container";
import BoxCtr from "../containers/Box.container";
import ViewerCtr from "../containers/Viewer.container";
import HistogramCtr from "../containers/Histogram.container";
import { JSUtil } from "../util/jsutil";

export default class App extends React.Component {
    createBox = e => {
        return <BoxCtr key={e.id} id={e.id} />;
    }

    createViewer = e => {
        return <ViewerCtr key={e.id} id={e.id} />;
    }

    createHistogram = e => {
        return <HistogramCtr key={e.id} id={e.id} />;
    }

    createUIElements = (elements, elemGen) => {
        if (elements)
            return <ul style={{position: "absolute"}}> { JSUtil.ObjectMap(elements, elemGen) } </ul>
        else
            return null;
    }

    render() {
        return (
            <div>
                { this.createUIElements(this.props.boxes, this.createBox) }
                { this.createUIElements(this.props.viewers, this.createViewer) }
                { this.createUIElements(this.props.histograms, this.createHistogram) }
                <div className="cmdline-ctr" >
                    <TerminalCtr width={900} height={300} />
                </div>
            </div>
        );
    }
}
