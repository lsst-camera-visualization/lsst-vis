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
                <p><span className="viewer-selectedPanel-label">Shift + click</span>: Select amplifier region</p>
                <p><span className="viewer-selectedPanel-label">Shift + dbl click</span>: Select entire amp</p>
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
