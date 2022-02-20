import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import Modal from "../../lib/q_modal.js";
import TextArea from "../../lib/q_textarea.js";

export default class DeclarationProxyIndexView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "proxies": [],
            "renderModal": false,
            "modal": {
                "configurationModal": false,
                "configurationText": "",
                "declarationModal": false,
            }
        }
    }

    updateProxies() {
        let proxiesPromise = this.context.sdk.getProxies();
        proxiesPromise.then((ret) => {
            this.setState({"proxies": ret.data});
        });
    }

    componentDidMount() {
        this.updateProxies();
    }

    render() {
        let rows = [];
        for (let proxy of this.state.proxies) {
            rows.push(
                <tr className="clickable"
                    onClick={this.context.setPath.bind(null, {"path": ["declaration", "proxies", proxy.id]})} >
                    <td className="smallCell"><label><input type="checkbox" /></label></td>
                    <td className="smallCell">{proxy.id}</td>
                    <td className="normalCell">{proxy.name}</td>
                    <td className="normalCell">{proxy.address}</td>
                    <td>{proxy.comment}</td>
                    <td className="smallCell">
                        <button className="colorless button"
                                onClick={(v) => {
                                    v.stopPropagation();
                                }} >
                            <img src={this.context.static + "img/share.svg"} alt="Share" />
                        </button>
                    </td>
                    <td className="smallCell">
                        <button className="colorless button"
                                onClick={(v) => {
                                    v.stopPropagation();
                                    let modal = this.state.modal;
                                    modal.configurationModal = true;
                                    modal.declarationModal = false;
                                    this.setState({
                                        "renderModal": true,
                                        "modal": modal
                                    });
                                    this.context.sdk.generateProxyConfiguration(proxy.id).then((res) => {
                                        if(res.status !== 200) {
                                            toast.error(res.text);
                                            return;
                                        }
                                        modal.configurationText = res.data;
                                        this.setState({"modal": modal});
                                    });
                                }} >
                            <img src={this.context.static + "img/key.svg"} alt="GenConfig" />
                        </button>
                    </td>
                    <td className="smallCell">
                        <button className="colorless button"
                                onClick={(v) => {
                                    v.stopPropagation();
                                    this.context.sdk.deleteProxy(proxy.id).then((res) => {
                                        if(res.status === 200) {
                                            toast.success("Proxy deleted", {autoClose: 1000});
                                            this.updateProxies();
                                        } else {
                                            toast.error(res.message);
                                        }
                                    });
                                }} >
                            <img src={this.context.static + "img/delete.svg"} alt="Delete" />
                        </button>
                    </td>
                </tr>
            );
        }

        let noProxies = null;
        if (this.state.proxies.length === 0) {
            noProxies = "There are no proxies.";
        }

        let table;
        if(noProxies === null) {
            table = <table>
                        <tbody>
                            <tr>
                                <th>
                                    <label>
                                        <input type="checkbox" />
                                    </label>
                                </th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Comment</th>
                                <th>Update declaration</th>
                                <th>Generate configuration</th>
                                <th>Delete</th>
                            </tr>
                            {rows}
                        </tbody>
                    </table>;
        }

        let modalContent;
        if(this.state.modal.declarationModal) {

        } else if(this.state.modal.configurationModal) {
            if(this.state.modal.configurationText === "") {
                modalContent = <div className="flexColumn centered">
                    <div style={{paddingBottom: 2 + "rem"}}>Generating configuration...</div>
                    <img className="rotate bigImg"
                         src={this.context.static + "img/loader.svg"}
                         alt="Loading" />
                </div>;
            } else {
                modalContent = <div className="flexColumn centered">
                    <div style={{marginBottom: 1 + "rem"}}>Execute this command on the target proxy</div>
                    <div className="flexRow centered">
                        <TextArea className="darkInput modalTextArea"
                                  value={this.state.modal.configurationText}
                                  readonly={true}
                                  id="refConfigurationText" />
                        <img className="buttonImg"
                             style={{marginLeft: 1 + "rem"}}
                             src={this.context.static + "img/save.svg"}
                             alt="Copy"
                             onClick={(v) => {
                                 v.stopPropagation();
                                 document.getElementById("refConfigurationText").select();
                                 if(window.isSecureContext) {
                                     navigator.clipboard.writeText(this.state.modal.configurationText).then((res) => {
                                         toast.info("Copied to clipboard", {autoClose: 1500});
                                     });
                                 } else {
                                     toast.error("Couldn't copy to clipboard without secure context", {autoClose: 1500});
                                 }
                             }} />
                    </div>
                </div>;
            }
        }

        return (<div>
            <Modal content={modalContent}
                   onClose={() => {
                       this.setState({"renderModal": false});
                   }}
                   show={this.state.renderModal} />
            <div className="declarationContent">
                <div className="declarationHeader">
                    <div className="flexRow">
                        <button className="buttonLink"
                                onClick={
                                    this.context.setPath.bind(null, {"path": ["declaration", "proxies", "create"]})
                                } >
                            Add Proxy
                        </button>
                    </div>
                </div>
                <div className="declarationList">
                    {noProxies}
                    {table}
                </div>
            </div>
        </div>);
    }
}
