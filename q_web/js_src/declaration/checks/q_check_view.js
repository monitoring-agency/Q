import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";


export default class DeclarationCheckView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "check": {
                "name": "",
                "cmd": "",
                "comment": ""
            },
            "faulty": {
                "name": false
            }
        }
    }

    checkFaultyName(value) {
        return String(value).match(new RegExp("^[a-zA-Z0-9.#+_\-]+$")) === null;
    }

    createOrUpdateCheck() {
        if(this.checkFaultyName(this.state.check.name)) {
            toast.error("Faulty configuration", {autoClose: 1500});
            let faulty = this.state.faulty;
            faulty.name = true;
            this.setState({"faulty": faulty});
            return;
        }

        if("check_id" in this.props) {
            this.context.sdk.updateCheck(this.props.check_id, this.state.check).then((v) => {
                if(v.status === 200) {
                    toast.success("Check has been updated", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "checks", "index"]});
                } else {
                    toast.error(v.message);
                }
            });
        } else {
            this.context.sdk.createCheck(this.state.check).then((res) => {
                if(res.status !== 200) {
                    toast.error(res.message, {autoClose: 1500});
                } else {
                    toast.success("Check was created!", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "checks", "index"]});
                }
            });
        }
    }

    componentWillMount() {
        if("check_id" in this.props) {
            this.context.sdk.getCheck(this.props.check_id).then((res) => {
                if(res.status === 200) {
                    this.setState({"check": res.data});
                }
            })
        }
    }

    render() {
        let heading;
        if("check_id" in this.props) {
            heading = <h2 className="declarationHeading">Update Check</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new Check</h2>;
        }

        return <div className="declarationContent">
            {heading}
            <table className="declarationTable">
                <tr>
                    <td>
                        <label>Name</label>
                    </td>
                    <td>
                        <TextInput className={this.state.faulty.name ? "darkInput redBorder" : "darkInput"}
                                   value={this.state.check.name}
                                   onChange={(v) => {
                                       let check = this.state.check;
                                       let faulty = this.state.faulty;
                                       if (this.checkFaultyName(v)) {
                                           faulty.name = true;
                                       }
                                       check.name = v;
                                       this.setState({"check": check, "faulty": faulty});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>Commandline</label>
                    </td>
                    <td>
                        <TextArea className="darkInput bigTextArea"
                                   value={this.state.check.cmd}
                                   onChange={(v) => {
                                       let check = this.state.check;
                                       check.cmd = v;
                                       this.setState({"check": check});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label>Comment</label>
                    </td>
                    <td>
                        <TextArea className="darkInput bigTextArea"
                                  value={this.state.check.comment}
                                  onChange={(v) => {
                                      let check = this.state.check;
                                      check.comment = v;
                                      this.setState({"check": check});
                                  }} />
                    </td>
                </tr>
            </table>
            <button className="button"
                    onClick={(v) => {
                        this.createOrUpdateCheck();
                    }} >
                Submit
            </button>
        </div>
    }
}
