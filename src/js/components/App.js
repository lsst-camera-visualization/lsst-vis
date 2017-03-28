import React from "react";

import TerminalCtr from "../containers/Terminal.container";
import BoxCtr from "../containers/Box.container";
import ViewerCtr from "../containers/Viewer.container";
import { Util } from "../util/Util";

export default class App extends React.Component {
    createBox = e => {
        return <BoxCtr key={e.id} id={e.id} />;
    }

    createViewer = e => {
        return <ViewerCtr key={e.id} id={e.id} />;
    }

    createUIElements = (elements, elemGen) => {
        if (elements)
            return <ul style={{position: "absolute"}}> { Util.ObjectMap(elements, elemGen) } </ul>
        else
            return null;
    }

    render() {
        return (
            <div>
                { this.createUIElements(this.props.boxes, this.createBox) }
                { this.createUIElements(this.props.viewers, this.createViewer) }
                <div className="cmdline-ctr" >
                    <TerminalCtr width={900} height={300} />
                </div>
            </div>
        );
    }
}
