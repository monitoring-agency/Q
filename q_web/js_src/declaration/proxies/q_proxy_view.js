import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TableSectionHeading from "../../lib/q_table_section_heading.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";
import SliderInput from "../../lib/q_slider_input.js";

export default class DeclarationProxyCreateOrUpdateView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "proxy": {
                "name": "",
                "address": "",
                "port": 443,
                "core_address": "",
                "core_port": 8443,
                "comment": "",
                "disabled": false
            },
            "faulty": {
                "name": false,
                "address": false,
                "port": false,
                "core_address": false,
                "core_port": false
            }
        }

        this.createProxy = this.createProxy.bind(this);
    }

    componentWillMount() {
        if("proxy_id" in this.props) {
            this.context.sdk.getProxy(
                this.props.proxy_id,
                ["name", "address", "port", "core_address", "core_port", "disabled", "comment"]
            ).then((res) => {
                this.setState({"proxy": res.data});
            });
        }
    }

    createProxy() {
        let faultyStates = this.state.faulty;

        let regexp = new RegExp("^[a-zA-Z0-9.#+_\-]+$");
        faultyStates["name"] = this.state.proxy.name.match(regexp) === null;
        let regex = new RegExp("^[0-9]+$");
        faultyStates["core_port"] = !(String(this.state.proxy.core_port).match(regex) && parseInt(this.state.proxy.core_port) > 0);
        faultyStates["port"] = !(String(this.state.proxy.port).match(regex) && parseInt(this.state.proxy.port) > 0);
        faultyStates["address"] = this.state.proxy.address === "";
        faultyStates["core_address"] = this.state.proxy.core_address === "";

        let succeeded = Object.keys(faultyStates).filter((key) => faultyStates[key]).length === 0;
        if (!succeeded) {
            toast.error("Faulty configuration");
            this.setState({"faulty": faultyStates})
            return;
        }

        if("proxy_id" in this.props) {
            this.context.sdk.updateProxy(this.props.proxy_id, this.state.proxy).then((res) => {
                if (res.success) {
                    toast.success("Changes were successful", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "proxies", "index"]});
                } else {
                    toast.error(res.message);
                }
            });
        } else {
            this.context.sdk.createProxy(this.state.proxy).then((res) => {
                if(res.success) {
                    toast.success("Proxy was created successfully", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "proxies", "index"]});
                } else {
                    toast.error(res.message);
                }
            });
        }
    }

    render() {
        let heading;
        if("proxy_id" in this.props) {
            heading = <h2 className="declarationHeading">Update Proxy</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new Proxy</h2>;
        }

        return <div className="declarationContent">
            {heading}
                <table className="declarationTable">
                    <TableSectionHeading text="Basic proxy information" />
                    <tr>
                        <td className="smallCell" />
                        <td className="largeCell">Name</td>
                        <td>
                            <TextInput className={this.state.faulty.name ? "darkInput redBorder" : "darkInput"}
                                       required
                                       value={this.state.proxy.name}
                                       onChange={(v) => {
                                           let a = this.state.proxy;
                                           a["name"] = v;
                                           let faultyState = this.state.faulty;
                                           let regexp = new RegExp("^[a-zA-Z0-9.#+_\-]+$");
                                           faultyState["name"] = v.match(regexp) === null;
                                           this.setState({"proxy": a, "faulty": faultyState});
                                       }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="address">Address</label>
                        </td>
                        <td>
                            <TextInput className={this.state.faulty.address ? "darkInput redBorder" : "darkInput"}
                                       value={this.state.proxy.address}
                                       onChange={(v) => {
                                           let a = this.state.proxy;
                                           let faultyStates = this.state.faulty;
                                           faultyStates["address"] = v === "";
                                           a["address"] = v;
                                           this.setState({"proxy": a, "faulty": faultyStates});
                                       }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="port">Port</label>
                        </td>
                        <td>
                            <TextInput className={this.state.faulty.port ? "darkInput redBorder" : "darkInput"}
                                       value={this.state.proxy.port}
                                       onChange={(v) => {
                                           let a = this.state.proxy;
                                           let faultyStates = this.state.faulty;
                                           let regex = new RegExp("^[0-9]+$");
                                           faultyStates["port"] = !(String(v).match(regex) && parseInt(v) > 0);
                                           a["port"] = v;
                                           this.setState({"proxy": a, "faulty": faultyStates});
                                       }} />
                        </td>
                    </tr>
                    <TableSectionHeading text="Core address as seen be the proxy" />
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="address">Core address</label>
                        </td>
                        <td>
                            <TextInput className={this.state.faulty.core_address ? "darkInput redBorder" : "darkInput"}
                                       value={this.state.proxy.core_address}
                                       onChange={(v) => {
                                           let a = this.state.proxy;
                                           let faultyStates = this.state.faulty;
                                           faultyStates["core_address"] = v === "";
                                           a["core_address"] = v;
                                           this.setState({"proxy": a, "faulty": faultyStates});
                                       }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="port">Core port</label>
                        </td>
                        <td>
                            <TextInput className={this.state.faulty.core_port ? "darkInput redBorder" : "darkInput"}
                                       value={this.state.proxy.core_port}
                                       onChange={(v) => {
                                           let a = this.state.proxy;
                                           let faultyStates = this.state.faulty;
                                           let regex = new RegExp("^[0-9]+$");
                                           faultyStates["core_port"] = !(String(v).match(regex) && parseInt(v) > 0);
                                           a["core_port"] = v;
                                           this.setState({"proxy": a, "faulty": faultyStates});
                                       }} />
                        </td>
                    </tr>
                    <TableSectionHeading text="Miscellaneous options" />
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="disabled">Disabled</label>
                        </td>
                        <td>
                            <SliderInput value={this.state.proxy.disabled}
                                         onChange={(v) => {
                                             let a = this.state.proxy;
                                             a["disabled"] = v;
                                             this.setState({"proxy": a});
                                         }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="comment">Comment</label>
                        </td>
                        <td>
                            <TextArea className="darkInput bigTextArea"
                                      value={this.state.proxy.comment}
                                      onChange={(v) => {
                                          let a = this.state.proxy;
                                          a["comment"] = v;
                                          this.setState({"proxy": a});
                                      }} />
                        </td>
                    </tr>
                </table>
                <button className="button" onClick={this.createProxy}>Submit</button>
            </div>;
    }
}
