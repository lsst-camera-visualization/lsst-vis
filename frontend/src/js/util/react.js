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

    // A React component for label/value pairs.
    // Props:
    //    label : String - The label.
    //    value : String - The value.
    //    className : String - The class for the container, if necessary.
    //    labelClass : String - The class for the label, if necessary.
    //    valueClass : String - The class for the value, if necessary.
    LVPair: class extends React.Component {
        render() {
            // Default values for props
            const opts = Object.assign({
                className: "",
                labelClass: "",
                valueClass: ""
            }, this.props);

            return (
                <div className={opts.className}>
                    <span className={opts.labelClass}>{this.props.label}</span>
                    <span>: </span>
                    <span className={opts.valueClass}>{this.props.value}</span>
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

    // A React component for a toolbar on a UI element.
    // Props:
    //      onClose : Function - The handler function for closing this element
    Toolbar: class extends React.Component {
        render() {
            const iconStyle = {
                display: "inline-block",
                float:"right",
                marginTop:"-2px",
                marginRight:"0px",
                cursor:"pointer"
            };
            const iconClass = "material-icons md-36 md-light";
            const closeButton = (<i className={iconClass}
                                    style={iconStyle}
                                    onClick={this.props.onClose}>
                                    close
                                </i>);

            if (this.props.hasOwnProperty("isMini")){
                const clickFnMinMax = (this.props.isMini) ? this.props.onMaximize : this.props.onMinimize;
                const iconMinMax = (this.props.isMini) ?  "expand_more" : "expand_less";
                const miniButton = (<i className={iconClass}
                                        style={iconStyle}
                                        onClick={clickFnMinMax}>
                                        {iconMinMax}
                                    </i>);

                return (
                    <div className={this.props.className}>
                        {closeButton}
                        {miniButton}
                        {this.props.children}
                    </div>
                );
            } else {
                return (
                    <div className={this.props.className}>
                        {closeButton}
                        {this.props.children}
                    </div>
                );
            }
        }
    },
}
