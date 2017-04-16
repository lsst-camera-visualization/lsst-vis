import React from "react";

export default class BoxBody extends React.Component {
    createLine = (e,i) => {
        return (
            <p key={i}>{e}</p>
        );
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
