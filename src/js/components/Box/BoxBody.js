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
        return (
            <div className="box-body">
                {this.createBody(this.props.text)}
            </div>
        );
    }
}
