import {React} from "../react.js";
import ctx from "./q_ctx.js";
import TextInput from "./q_input.js";

export default class Variables extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
    }

    checkKey(value) {
        let counter = 0;
        for(let key in this.props.value) {
            if(this.props.value[key]["key"] === value)
                counter++;
        }
        if (value.includes(" ") || value === "" || counter >= 2)
            return "darkInput variableInput redBorder"
        else
            return "darkInput variableInput"
    }

    render() {
        let variables = [];
        for(let key in this.props.value) {
            variables.push(<tr>
                <td>
                    <TextInput className={this.checkKey(this.props.value[key]["key"])}
                               value={this.props.value[key]["key"]}
                               required="required"
                               onChange={(v) => {
                                   let tmp = this.props.value;
                                   tmp[key]["key"] = v;
                                   this.props.onChange(tmp);
                               }} />
                </td>
                <td>
                    <TextInput className="darkInput variableInput"
                               value={this.props.value[key]["value"]}
                               onChange={(v) => {
                                   let tmp = this.props.value;
                                   tmp[key]["value"] = v;
                                   this.props.onChange(tmp);
                               }} />
                </td>
                <td>
                    <img className="buttonImg"
                         src={this.context.static + "img/x.svg"}
                         alt="Delete"
                         onClick={(v) => {
                             let tmp = this.props.value;
                             delete tmp[key];
                             this.props.onChange(tmp);
                         }} />
                </td>
            </tr>);
        }

        return <div className="variableContent">
            <table className="variableTable">
                <tr>
                    <td>
                        <div className="variableInput">Key</div>
                    </td>
                    <td>
                        <div className="variableInput">Value</div>
                    </td>
                    <td>
                        <img className="buttonImg"
                             src={this.context.static + "img/plus.svg"}
                             alt="Add variable"
                             onClick={(v) => {
                                 let tmp = this.props.value;
                                 let max = Math.max(...Object.keys(this.props.value).map((v) => parseInt(v))) + 1;
                                 if (max === -Infinity) {
                                     max = 0;
                                 }
                                 tmp[max] = {
                                     "key": "",
                                     "value": ""
                                 }
                                 this.props.onChange(tmp);
                             }} />
                    </td>
                </tr>
                {variables}
            </table>
        </div>;
    }
}
