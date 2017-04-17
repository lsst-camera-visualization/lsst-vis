import React from "react";
import { ReactUtil } from "../../util/react";

export default class BoxBody extends React.Component {
    createLVPair = (e, i) => {
        return (
            <ReactUtil.LVPair
                label={e[0]} value={e[1]}
                className="box-body-entry"
                labelClass="box-body-entry-label"
                key={i} >
            </ReactUtil.LVPair>
        );
    }

    createSpecialLine = (e, i) => {
        // Special case
        let style = {};

        if (e.match(/^:line-/)) {
            // Line
            const type = e.substr(6, e.length - 7);
            style["borderBottom"] = "1px " + type + " #000";
        }

        return (<p
            className="box-body-entry box-body-special"
            style={style}
            key={i}>
            </p>
        );
    }

    // Creates a line of text
    createLine = (e,i) => {
        if (Array.isArray(e)) {
            return this.createLVPair(e, i);
        }
        else if (e.match(/^:.*:$/g)) {
            return createSpecialLine(e, i);
        }
        else {
            // Normal text
            return <p className="box-body-entry" key={i}>{e}</p>;
        }
    }

    // Creates the body of text from the text array
    createBody = textArray => {
        return (
            <ul>
                {textArray.map( (e,i) => this.createLine(e,i) )}
            </ul>
        );
    }

    render() {
        const className = (this.props.minimize) ? "box-body-mini" : "box-body";
        return (
            <div className={className}>
                {this.createBody(this.props.text)}
            </div>
        );
    }
}
