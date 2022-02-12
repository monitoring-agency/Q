import {React} from "../../react.js";
import ctx from "../../lib/q_ctx.js";

export default class DeclarationHostIndexView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "hosts": []
        }
    }

    componentDidMount() {
        let hostsPromise = this.context.sdk.getHosts();
        hostsPromise.then((ret) => {
            console.log(ret.data);
            this.setState({"hosts": ret.data});
        });
    }

    render() {
        let rows = [];
        for (let host of this.state.hosts) {
            rows.push(
                <tr className="clickable" onClick={this.context.setPath.bind(null, {"path": ["declaration", "hosts", host.id]})}>
                    <td className="smallCell"><label><input type="checkbox" /></label></td>
                    <td className="smallCell">{host.id}</td>
                    <td className="normalCell">{host.name}</td>
                    <td className="normalCell">{host.address}</td>
                    <td>{host.comment}</td>
                    <td className="normalCell">
                        <button className="colorless button"><img src={this.context.static + "img/delete.svg"} alt="Delete" /></button>
                    </td>
                </tr>
            );
        }

        let noHosts = null;
        if (this.state.hosts.length === 0) {
            noHosts = "There are no hosts.";
        }

        let table;
        if(noHosts === null) {
            table = <table>
                        <tbody>
                            <tr>
                                <th><label><input type="checkbox" id="check_all" /></label></th>
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
                        <button className="buttonLink" onClick={this.context.setPath.bind(null, {"path": ["declaration", "hosts", "create"]})}>Add Host</button>
                    </div>
                </div>
                <div className="declarationList">
                    {noHosts}
                    {table}
                </div>
            </div>
        </div>);
    }
}