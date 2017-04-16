import React from "react";

export default class CommandPanelParameters extends React.Component {
    handleChange = e => {
        this.props.setParam(e.target.dataset.param, e.target.value);
    }

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
