import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import Paginator from "../../lib/q_declaration_paginator.js";

export default class DeclarationContactsIndex extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "contacts": [],
            "pagination": {
                "current_page": 1,
                "page_count": 1,
                "object_count": 0,
                "objects_per_page": 50
            }
        }
    }

    updateContacts(page) {
        this.context.sdk.getContacts(page).then((v) => {
            if(v.status === 200) {
                this.setState({"contacts": v.data, "pagination": v.pagination});
            }
        });
    }

    componentWillMount() {
        this.updateContacts(1);
    }

    render() {
        let rows = [];
        for(let contact of this.state.contacts) {
            rows.push(<tr className="clickable"
                          onClick={
                              this.context.setPath.bind(null, {"path": ["declaration", "contacts", contact.id]})
                          } >
                <td><input type="checkbox" /></td>
                <td>{contact.id}</td>
                <td>{contact.name}</td>
                <td>{contact.mail}</td>
                <td>{contact.comment}</td>
                <td>
                    <button className="colorless button"
                            onClick={(v) => {
                                v.stopPropagation();
                                this.context.sdk.deleteContact(contact.id).then((res) => {
                                    if(res.status === 200) {
                                        toast.success("Contact deleted", {autoClose: 1000})
                                        this.updateContacts(this.state.pagination.current_page);
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

        let noContacts;
        let table;
        if(this.state.contacts.length === 0) {
            noContacts = "There are no contacts.";
        } else {
            table = <table>
                <tr>
                    <th className="smallCell"><input type="checkbox" /></th>
                    <th className="smallCell">ID</th>
                    <th>Name</th>
                    <th>Mail</th>
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
                                    this.context.setPath.bind(null, {"path": ["declaration", "contacts", "create"]})
                                } >
                            Add Contact
                        </button>
                        <Paginator currentPage={this.state.pagination.current_page}
                                   lastPage={this.state.pagination.page_count}
                                   onChange={(v) => {
                                       this.updateContacts(v);
                                   }} />
                    </div>
                </div>
                <div className="declarationList">
                    {noContacts}
                    {table}
                </div>
            </div>
    }
}
