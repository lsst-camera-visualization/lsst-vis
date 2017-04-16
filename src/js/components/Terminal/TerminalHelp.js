import React from "react";

import { JSUtil } from "../../util/jsutil";

export default class TerminalHelp extends React.Component {
    constructor() {
        super();
        this.defaultHelpString = "Command line interface: Type help for more info";
    }

    getCurrentCommandInfo = () => {
        const trimmed = this.props.input.trim();
        const split = JSUtil.SplitStringByWS(trimmed);

        if (trimmed != "") {
            const ac = this.props.terminal.autoCompleteArray.autoComplete(split[0]);

            if (ac.match) {
                // Make sure we have a valid command if we're not typing it anymore
                const bCheckCommand = (split.length > 1 || this.props.input.match(/\s$/));

                // More readable version: !bCheckCommand || (bCheckCommand && ac.bWhole)
                if (!bCheckCommand || ac.bWhole) {
                    const command = this.props.commands.commands[ac.match];
                    return {
                        str: ac.match + " " + command.params.join(" "),
                        desc: command.desc,
                    };
                }
            }
        }

        return null;
    }

    highlightString = (str, index, className) => {
        const split = JSUtil.SplitStringByWS(str);

        const list = split.map((e, i) => {
            if (i === index) {
                // We are highlighting a parameter
                if (i > 0) {
                    this.props.onHighlightParameter(split[i]);
                    this.currParam = split[i];
                }
                else {
                    this.props.onHighlightParameter(null);
                    this.currParam = null;
                }

                return <span key={i} className={className}>{split[i]} </span>;
            }
            else
                return <span key={i}>{split[i]} </span>
        });
        return (<ul className="term-help-command">{list}</ul>);
    }

    render() {
        const info = this.getCurrentCommandInfo();

        let helpString = null;
        let descHeader, desc = null;
        let paramHeader, paramDesc = null;

        if (info) {
            // Valid command
            const caretIndex = JSUtil.GetWordNumFromCaret(this.props.input, this.props.caretPos);
            helpString = this.highlightString(info.str, caretIndex, "term-help-highlight");

            descHeader = "Command Description: ";
            desc = info.desc;

            const parameterDescs = this.props.terminal.parameterDescs;
            if (this.currParam && parameterDescs && this.currParam in parameterDescs) {
                paramHeader = this.currParam + ": ";
                paramDesc = parameterDescs[this.currParam];
            }
        }
        else {
            // Invalid command
            helpString = <p>{this.defaultHelpString}</p>;
            descHeader = desc = null;
            paramHeader = paramDesc = null;
        }

        return(
            <div className="term-help-ctr">
                <div>{helpString}</div>
                <div className="term-help-info-ctr">
                    <div className="term-help-desc">
                        <span className="term-help-descHeader">{descHeader}</span>
                        <span>{desc}</span>
                    </div>
                    <div className="term-help-param">
                        <span className="term-help-descHeader">{paramHeader}</span>
                        <span>{paramDesc}</span>
                    </div>
                </div>
            </div>
        );
    }
}
