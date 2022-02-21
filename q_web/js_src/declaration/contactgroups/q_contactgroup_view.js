import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";
import TableSectionHeading from "../../lib/q_table_section_heading.js";
import MultiSelectSort from "../../lib/q_multiselect.js";


export default class DeclarationContactGroupView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "contactGroup": {
                "name": "",
                "linked_contacts": [],
                "comment": ""
            },
            "faulty": {
                "name": false
            },
            "contacts": [],
            "selected": {
                "contacts": [],
            }
        }
    }

    checkFaultyName(value) {
        return String(value) === ""
    }

    createOrUpdateContactGroup() {
        let faultyStates = this.state.faulty;
        faultyStates.name = this.checkFaultyName(this.state.contactGroup.name);

        let succeeded = Object.keys(faultyStates).filter((key) => faultyStates[key]).length === 0;
        if (!succeeded) {
            toast.error("Faulty configuration");
            this.setState({"faulty": faultyStates})
            return;
        }

        let contactGroup = this.state.contactGroup;
        if("contact_group_id" in this.props) {
            this.context.sdk.updateContactGroup(this.props.contact_group_id, contactGroup).then((v) => {
                if(v.status === 200) {
                    toast.success("Contact group has been updated", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "contactgroups", "index"]});
                } else {
                    toast.error(v.message);
                }
            });
        } else {
            this.context.sdk.createContactGroup(contactGroup).then((res) => {
                if(res.status !== 200) {
                    toast.error(res.message, {autoClose: 1500});
                } else {
                    toast.success("Contact group was created!", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "contactgroups", "index"]});
                }
            });
        }
    }

    componentWillMount() {
        if("contact_group_id" in this.props) {
            this.context.sdk.getContactGroup(this.props.contact_group_id).then((res) => {
                if(res.status === 200) {
                    this.setState({"contactGroup": res.data});
                }
            })
        }
        this.context.sdk.getContacts(1, ["name"]).then((v) => {
            let contactsData = v.data;
            let contacts = [];
            let selected = this.state.selected;
            for(let contact of contactsData) {
                contacts.push({value: contact.id, label: contact.name});
            }
            selected.contacts = contacts;
            this.setState({"selected": selected, "contacts": contactsData});
        });
    }

    render() {
        let heading;
        if("contact_group_id" in this.props) {
            heading = <h2 className="declarationHeading">Update Contact group</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new Contact group</h2>;
        }

        let sortedLinkedContacts = [];
        for (let contact_id of this.state.contactGroup.linked_contacts) {
            sortedLinkedContacts.push(this.state.selected.contacts.find(x => x.value === contact_id));
        }

        return <div className="declarationContent">
            {heading}
            <table className="declarationTable">
                <TableSectionHeading text="Basic contact information" />
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Name</label>
                    </td>
                    <td>
                        <TextInput className={this.state.faulty.name ? "darkInput redBorder" : "darkInput"}
                                   value={this.state.contactGroup.name}
                                   onChange={(v) => {
                                       let contactGroup = this.state.contactGroup;
                                       let faulty = this.state.faulty;
                                       faulty.name = this.checkFaultyName(v);
                                       contactGroup.name = v;
                                       this.setState({"contactGroup": contactGroup, "faulty": faulty});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Linked contacts</label>
                    </td>
                    <td>
                        <MultiSelectSort options={this.state.selected.contacts}
                                         onChange={(v) => {
                                             let a = this.state.contactGroup;
                                             let linkedContacts = [];
                                             v.forEach(x => linkedContacts.push(x.value));
                                             a["linked_contacts"] = linkedContacts;
                                             this.setState({"contactGroup": a});
                                         }}
                                         value={sortedLinkedContacts} />
                    </td>
                </tr>
                <TableSectionHeading text="Additional settings" />
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Comment</label>
                    </td>
                    <td>
                        <TextArea className="darkInput bigTextArea"
                                  value={this.state.contactGroup.comment}
                                  onChange={(v) => {
                                      let contactGroup = this.state.contactGroup;
                                      contactGroup.comment = v;
                                      this.setState({"contactGroup": contactGroup});
                                  }} />
                    </td>
                </tr>
            </table>
            <button className="button"
                    onClick={(v) => {
                        this.createOrUpdateContactGroup();
                    }} >
                Submit
            </button>
        </div>
    }
}
