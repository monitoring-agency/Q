import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import Paginator from "../../lib/q_declaration_paginator.js";

export default class DeclarationChecksIndex extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "checks": [],
            "pagination": {
                "current_page": 1,
                "page_count": 1,
                "object_count": 0,
                "objects_per_page": 50
            }
        }
    }

    updateChecks(page) {
        this.context.sdk.getChecks(page).then((v) => {
            if(v.status === 200) {
                this.setState({"checks": v.data, "pagination": v.pagination});
            }
        });
    }

    componentWillMount() {
        this.updateChecks(1);
    }

    render() {
        let rows = [];
        for(let check of this.state.checks) {
            rows.push(<tr className="clickable"
                          onClick={
                              this.context.setPath.bind(null, {"path": ["declaration", "checks", check.id]})
                          } >
                <td><input type="checkbox" /></td>
                <td>{check.id}</td>
                <td>{check.name}</td>
                <td>{check.cmd}</td>
                <td>{check.comment}</td>
                <td>
                    <button className="colorless button"
                            onClick={(v) => {
                                v.stopPropagation();
                                this.context.sdk.deleteCheck(check.id).then((res) => {
                                    if(res.status === 200) {
                                        toast.success("Check deleted", {autoClose: 1000})
                                        this.updateChecks(this.state.pagination.current_page);
                                    } else {
                                        toast.error(res.message);
                                    }
                                });
                             }} >
                        <img src={this.context.static + "img/delete.svg"}
                             alt="Delete" />
                    </button>
                </td>
            </tr>);
        }

        let noChecks;
        let table;
        if(this.state.checks.length === 0) {
            noChecks = "There are no checks.";
        } else {
            table = <table>
                <tr>
                    <th className="smallCell"><input type="checkbox" /></th>
                    <th className="smallCell">ID</th>
                    <th>Name</th>
                    <th>Commandline</th>
                    <th>Comment</th>
                    <th className="normalCell">Delete</th>
                </tr>
                {rows}
            </table>;
        }

        return <div className="declarationContent">
                <div className="declarationHeader">
                    <div className="declarationHeaderContent">
                        <button className="buttonLink"
                                onClick={
                                    this.context.setPath.bind(null, {"path": ["declaration", "checks", "create"]})
                                } >
                            Add Check
                        </button>
                        <Paginator currentPage={this.state.pagination.current_page}
                                   lastPage={this.state.pagination.page_count}
                                   onChange={(v) => {
                                       this.updateChecks(v);
                                   }} />
                    </div>
                </div>
                <div className="declarationList">
                    {noChecks}
                    {table}
                </div>
            </div>
    }
}
