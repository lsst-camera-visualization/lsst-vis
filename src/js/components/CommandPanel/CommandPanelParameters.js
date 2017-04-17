import React from "react";

export default class CommandPanelParameters extends React.Component {
    // On change handler for entering a new value into a parameter input
    handleChange = e => {
        this.props.setParam(e.target.dataset.param, e.target.value);
    }

    // Generator function for creating a parameter and input
    createParameter = p => {
        if (p === "region" || p === "viewer_id")
            return null;

        return (
            <div className="cmdpanel-parameters-element" key={p}>
                <span className="cmdpanel-parameters-label">{p + ": "}</span>
                <input
                    className="cmdpanel-parameters-input"
                    type="text"
                    data-param={p}
                    onChange={this.handleChange} />
            </div>
        );
    }

    render() {
        const paramsBody = this.props.parameters.map(this.createParameter);
        return (
            <ul className="cmdpanel-parameters-ctr">{paramsBody}</ul>
        )
    }
}
