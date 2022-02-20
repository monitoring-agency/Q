import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";


export default class DeclarationGlobalVariableView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "globalvariable": {
                "key": "",
                "value": "",
                "comment": ""
            },
            "faultyKey": false,
        }

        this.createOrUpdateGlobalVariable = this.createOrUpdateGlobalVariable.bind(this);
    }

    checkFaultyKey(value) {
        let regex = new RegExp("^[^ \$]+$");
        return !String(value).match(regex);
    }

    createOrUpdateGlobalVariable() {
        if(this.checkFaultyKey(this.state.globalvariable.key)) {
            toast.error("Faulty configuration", {autoClose: 1500});
            this.setState({"faultyKey": true});
            return;
        }

        if("globalvariable_id" in this.props) {
            this.context.sdk.updateGlobalVariable(this.props.globalvariable_id, this.state.globalvariable).then((v) => {
                if(v.status === 200) {
                    toast.success("Global variable has been updated", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "globalvariables", "index"]});
                } else {
                    toast.error(v.message);
                }
            });
        } else {
            this.context.sdk.createGlobalVariable(this.state.globalvariable).then((res) => {
            if(res.status !== 200) {
                toast.error(res.message, {autoClose: 1500});
            } else {
                toast.success("Global variable was created!", {autoClose: 1500});
                this.context.setPath({"path": ["declaration", "globalvariables", "index"]});
            }
        });
        }
    }

    componentWillMount() {
        if("globalvariable_id" in this.props) {
            this.context.sdk.getGlobalVariable(this.props.globalvariable_id).then((res) => {
                if(res.status === 200) {
                    this.setState({"globalvariable": res.data});
                }
            })
        }
    }

    render() {
        let heading;
        if("globalvariable_id" in this.props) {
            heading = <h2 className="declarationHeading">Update GlobalVariable</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new GlobalVariable</h2>;
        }

        return <div className="declarationContent">
            {heading}
            <table className="declarationTable">
                <tr>
                    <td>
                        <label>Key</label>
                    </td>
                    <td>
                        <TextInput className={this.state.faultyKey ? "darkInput redBorder" : "darkInput"}
                                   value={this.state.globalvariable.key}
                                   onChange={(v) => {
                                       let globalVariable = this.state.globalvariable;
                                       let faulty = this.checkFaultyKey(v);
                                       globalVariable.key = v;
                                       this.setState({"globalvariable": globalVariable, "faultyKey": faulty});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>Value</label>
                    </td>
                    <td>
                        <TextInput className="darkInput"
                                   value={this.state.globalvariable.value}
                                   onChange={(v) => {
                                       let globalVariable = this.state.globalvariable;
                                       globalVariable.value = v;
                                       this.setState({"globalvariable": globalVariable});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>Comment</label>
                    </td>
                    <td>
                        <TextArea className="darkInput bigTextArea"
                                  value={this.state.globalvariable.comment}
                                  onChange={(v) => {
                                      let globalvariable = this.state.globalvariable;
                                      globalvariable.comment = v;
                                      this.setState({"globalvariable": globalvariable});
                                  }} />
                    </td>
                </tr>
            </table>
            <button className="button"
                    onClick={(v) => {
                        this.createOrUpdateGlobalVariable();
                    }} >
                Submit
            </button>
        </div>
    }
}
