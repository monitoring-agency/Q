import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import Paginator from "../../lib/q_declaration_paginator.js";

export default class DeclarationContactGroupsIndex extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "contactGroups": [],
            "pagination": {
                "current_page": 1,
                "page_count": 1,
                "object_count": 0,
                "objects_per_page": 50
            }
        }
    }

    updateContactGroups(page) {
        this.context.sdk.getContactGroups(page).then((v) => {
            if(v.status === 200) {
                this.setState({"contactGroups": v.data, "pagination": v.pagination});
            }
        });
    }

    componentWillMount() {
        this.updateContactGroups(1);
    }

    render() {
        let rows = [];
        for(let contactGroup of this.state.contactGroups) {
            rows.push(<tr className="clickable"
                          onClick={
                              this.context.setPath.bind(null, {"path": ["declaration", "contactgroups", contactGroup.id]})
                          } >
                <td><input type="checkbox" /></td>
                <td>{contactGroup.id}</td>
                <td>{contactGroup.name}</td>
                <td>{contactGroup.comment}</td>
                <td>
                    <button className="colorless button"
                            onClick={(v) => {
                                v.stopPropagation();
                                this.context.sdk.deleteContactGroup(contactGroup.id).then((res) => {
                                    if(res.status === 200) {
                                        toast.success("Contact group deleted", {autoClose: 1000})
                                        this.updateContactGroups(this.state.pagination.current_page);
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

        let noContactGroups;
        let table;
        if(this.state.contactGroups.length === 0) {
            noContactGroups = "There are no contact groups.";
        } else {
            table = <table>
                <tr>
                    <th className="smallCell"><input type="checkbox" /></th>
                    <th className="smallCell">ID</th>
                    <th className="normalCell">Name</th>
                    <th>Comment</th>
                    <th className="mediumCell">Delete</th>
                </tr>
                {rows}
            </table>;
        }

        return <div className="declarationContent">
                <div className="declarationHeader">
                    <div className="declarationHeaderContent">
                        <button className="buttonLink"
                                onClick={
                                    this.context.setPath.bind(null, {"path": ["declaration", "contactgroups", "create"]})
                                } >
                            Add Contact group
                        </button>
                        <Paginator currentPage={this.state.pagination.current_page}
                                   lastPage={this.state.pagination.page_count}
                                   onChange={(v) => {
                                       this.updateContactGroups(v);
                                   }} />
                    </div>
                </div>
                <div className="declarationList">
                    {noContactGroups}
                    {table}
                </div>
            </div>
    }
}
