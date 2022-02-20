import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import Paginator from "../../lib/q_declaration_paginator.js";
import TextInput from "../../lib/q_input.js";

export default class DeclarationHostIndexView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "hosts": [],
            "pagination": {
                "current_page": 1,
                "page_count": 1,
                "object_count": 0,
                "objects_per_page": 50
            },
            "search": ""
        }
    }

    updateHosts(page, newSearch) {
        let search = this.state.search === "" ? undefined : this.state.search;
        search = newSearch === undefined ? search : newSearch;
        let hostsPromise = this.context.sdk.getHosts(page, ["name", "address", "comment"], search);
        hostsPromise.then((ret) => {
            this.setState({"hosts": ret.data, "pagination": ret.pagination});
        });
    }

    componentDidMount() {
        this.updateHosts(1);
    }

    render() {
        let rows = [];
        for (let host of this.state.hosts) {
            rows.push(
                <tr className="clickable"
                    onClick={
                        this.context.setPath.bind(null, {"path": ["declaration", "hosts", host.id]})
                    } >
                    <td className="smallCell"><label><input type="checkbox" /></label></td>
                    <td className="smallCell">{host.id}</td>
                    <td className="normalCell">{host.name}</td>
                    <td className="normalCell">{host.address}</td>
                    <td>{host.comment}</td>
                    <td className="normalCell">
                        <button className="colorless button"
                                onClick={(v) => {
                                    v.stopPropagation();
                                    this.context.sdk.deleteHost(host.id).then((res) => {
                                        if(res.status === 200) {
                                            toast.success("Host deleted", {autoClose: 1000})
                                            this.updateHosts(this.state.pagination.current_page);
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

        let noHosts = null;
        if (this.state.hosts.length === 0) {
            noHosts = "There are no hosts.";
        }

        let table;
        if(noHosts === null) {
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
                    <div className="declarationHeaderContent">
                        <button className="buttonLink"
                                onClick={
                                    this.context.setPath.bind(null, {"path": ["declaration", "hosts", "create"]})
                                } >
                            Add Host
                        </button>
                        <div>
                            <div style={{marginRight: 1 + "rem"}}>Search:</div>
                            <TextInput className="darkInput"
                                   value={this.state.search}
                                   onChange={(v) => {
                                       this.setState({"search": v});
                                       this.updateHosts(this.state.pagination.current_page, v);
                                   }} />
                        </div>
                        <Paginator currentPage={this.state.pagination.current_page}
                                   lastPage={this.state.pagination.page_count}
                                   onChange={(v) => {
                                       this.updateHosts(v);
                                   }} />
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
