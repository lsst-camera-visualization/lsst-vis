import React from "react";
import { ReactUtil } from "../../util/react";

export default class BoxBody extends React.Component {
    createLine = (e,i) => {
        if (Array.isArray(e)) {
            return (
                <ReactUtil.LVPair
                    label={e[0]}
                    value={e[1]}
                    className="box-body-entry"
                    labelClass="box-body-entry-label"
                    key={i} >
                </ReactUtil.LVPair>
            );
        }
        else if (e.match(/^:.*:$/g)) {
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
        else
            return <p className="box-body-entry" key={i}>{e}</p>;
    }

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
