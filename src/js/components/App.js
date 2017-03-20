import React from "react";

import { TerminalCtr } from "../containers/TerminalCtr";
import Box from "../components/Box";
import Viewer from "../components/Viewer";

export default class App extends React.Component {
    createBox = id => {
        return <Box key={id} name={id} />;
    }

    createViewer = id => {
        return <Viewer key={id} name={id} />;
    }

    createUIElements = (elements, elemGen) => {
        if (elements)
            return <ul> { elements.map( e => elemGen(e.id) ) } </ul>
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
