import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";

export default class DeclarationProxiesIndexView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "proxies": []
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
                    onClick={
                        this.context.setPath.bind(null, {"path": ["declaration", "proxies", proxy.id]})
                    } >
                    <td className="smallCell"><label><input type="checkbox" /></label></td>
                    <td className="smallCell">{proxy.id}</td>
                    <td className="normalCell">{proxy.name}</td>
                    <td className="normalCell">{proxy.address}</td>
                    <td>{proxy.comment}</td>
                    <td className="normalCell">
                        <button className="colorless button"
                                onClick={(v) => {
                                    this.context.sdk.deleteProxy(proxy.id).then((res) => {
                                        if(res.status === 200) {
                                            toast.success("Proxy deleted", {autoClose: 1000})
                                            this.updateProxies();
                                        } else {
                                            toast.error(res.message);
                                        }
                                    });
                                    v.stopPropagation();
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
                                <th>Delete</th>
                            </tr>
                            {rows}
                        </tbody>
                    </table>;
        }

        return (<div>
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
