import React from "react";

import { ReactUtil } from "../../util/react";

export default class ViewerSelectedPanel extends React.Component {
    render() {
        const selectedRegionName = this.props.selectedRegion ? this.props.selectedRegion.name : "";
        // Selected region info
        const info =
            (<div>
                <span className="viewer-selectedPanel-selected">
                    {"Selected Region: " + selectedRegionName}
                </span>
                <input
                    className="viewer-selectedPanel-execButton"
                    type="button"
                    value="Execute command over selected region"
                    onClick={this.props.onClick} />
            </div>);

        // Help text
        const help =
            (<div>
                <ReactUtil.LVPair
                    label="Shift + click"
                    value="Select amplifier region"
                    labelClass="viewer-info-label" />
                <ReactUtil.LVPair
                    label="Shift + dbl click"
                    value="Select entire amp"
                    labelClass="viewer-info-label" />
            </div>);


        return (
            <ReactUtil.Col2
                className="viewer-selectedPanel"
                width="50%"
                left={info}
                right={help}
                separator={false}
                col2Ref={this.props.col2Ref}/>
        );
    }
}
