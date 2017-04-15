import React from "react";

export const ReactUtil = {
    // A 2 column React component.
    // Props:
    //    width : Integer - The width of the left column, or null for 50%.
    //    left : React Component - The component to put in the left column.
    //    right : React Component - The component to put in the right column.
    //    separator : Boolean - Should we put a separator bar in between the columns?
    //    separatorWidth : Integer - The width of the separator, if necessary.
    //    className : String - The class name to apply to the container.
    Col2: class extends React.Component {
        render() {
            const leftStyle = {
                width: this.props.width || "50%"
            };

            const rightStyle = {
                width: (100 - parseInt(leftStyle.width)).toString() + "%"
            };

            return(
                <div className={"col-container " + (this.props.className || "")}>
                    <div class="col-2" style={leftStyle}>
                        {this.props.left}
                    </div>

                    <div className="col-separator-container">
                        <ReactUtil.Separator
                            empty={!this.props.separator}
                            width={this.props.separatorWidth} />
                    </div>

                    <div className="col-2" style={rightStyle}>
                        {this.props.right}
                    </div>
                </div>
            );
        }
    },

    // Props: { empty : Bool }
    Separator: class extends React.Component {
        render() {
            if (this.props.empty)
                return (<div></div>);

            const w = this.props.width;
            const style = {
                width: (w) ? (w + "px") : "2px"
            };

            return <div style={style} class="col-separator"></div>;
        }
    },
}
