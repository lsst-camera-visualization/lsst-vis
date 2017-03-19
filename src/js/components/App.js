import React from "react";

import { TerminalCtr } from "../containers/TerminalCtr";
import Box from "../components/Box";

export default class App extends React.Component {
    createBoxes() {
        if (this.props.boxes)
            return <ul> { this.props.boxes.map( box => <Box key={box.id} name={box.id} /> ) } </ul>
        else
            return null;
    }

    render() {
        return (
            <div>
                { this.createBoxes() }
                <div className="cmdline-ctr" >
                    <TerminalCtr width={900} height={300} />
                </div>
            </div>
        );
    }
}
