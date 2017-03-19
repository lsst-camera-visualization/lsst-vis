import React from "react";

import { Util } from "../../util/Util";

export default class TerminalHelp extends React.Component {
    constructor() {
        super();
        this._defaultHelpString = "Command line interface: Type help for more info";
    }

    getHelpString = () => {
        const trimmed = this.props.input.trim();
        const split = Util.SplitStringByWS(trimmed);

        if (trimmed != "") {
            const ac = this.props.commands.autoCompleteArray.autoComplete(split[0]);

            if (ac.match)
                return {str: ac.match + " " + this.props.commands.commands[ac.match].join(" "), bMatch: true};
        }

        return {str: this._defaultHelpString, bMatch: false};
    }

    highlightString = (str, index, className) => {
        const split = Util.SplitStringByWS(str);

        const list = split.map((e, i) => {
            if (i == index)
                return <span key={i} className={className}>{split[i]} </span>;
            else
                return <span key={i}>{split[i]} </span>
        });
        return (<ul className="term-help-command">{list}</ul>);
    }

    render() {
        let helpString = this.getHelpString();
        if (helpString.bMatch) {
            const caretIndex = Util.GetWordNumFromCaret(this.props.input, this.props.caretPos);
            helpString = this.highlightString(helpString.str, caretIndex, "term-help-highlight");
        }
        else
            helpString = <p>{helpString.str}</p>;

        return(
            <div className="term-help-ctr">
                <div>{helpString}</div>
            </div>
        );
    }
}
