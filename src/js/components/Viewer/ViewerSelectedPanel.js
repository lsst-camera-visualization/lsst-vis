import React from "react";

import { ReactUtil } from "../../util/react";

export default class ViewerSelectedPanel extends React.Component {
    render() {
        const info =
            (<div>
                <span>Selected Region: selected</span>
                <input
                    className="viewer-selectedPanel-execButton"
                    type="button"
                    value="Execute command over selected region" />
            </div>);

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
                separator={false} />
        );
    }
}
