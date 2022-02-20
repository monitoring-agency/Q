import Select from 'https://cdn.skypack.dev/react-select';

import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";
import TableSectionHeading from "../../lib/q_table_section_heading.js";
import Variables from "../../lib/q_variables.js";
import MultiSelectSort from "../../lib/q_multiselect.js";


export default class DeclarationContactView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "contact": {
                "name": "",
                "mail": "",
                "variables": {},
                "linked_host_notification_period": null,
                "linked_host_notifications": [],
                "linked_observable_notification_period": null,
                "linked_observable_notifications": [],
                "comment": ""
            },
            "faulty": {
                "name": false,
                "mail": false,
                "variables": false,
            },
            "timePeriods": [],
            "checks": [],
            "selected": {
                "timePeriods": [],
                "checks": [],
            }
        }
    }

    checkFaultyName(value) {
        return String(value) === ""
    }

    checkFaultyMail(value) {

    }

    createOrUpdateContact() {
        let faultyStates = this.state.faulty;
        faultyStates.name = this.checkFaultyName(this.state.contact.name);
        faultyStates.variables = Object.values(this.state.contact.variables).filter((v) => v["faulty"]).length !== 0;

        let succeeded = Object.keys(faultyStates).filter((key) => faultyStates[key]).length === 0;
        if (!succeeded) {
            toast.error("Faulty configuration");
            this.setState({"faulty": faultyStates})
            return;
        }

        let variables = {};
        for(let v of Object.values(this.state.contact.variables)) {
            variables[v["key"]] = v["value"];
        }

        let contact = this.state.contact;
        contact.variables = variables;
        if("contact_id" in this.props) {
            this.context.sdk.updateContact(this.props.contact_id, contact).then((v) => {
                if(v.status === 200) {
                    toast.success("Contact has been updated", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "contacts", "index"]});
                } else {
                    toast.error(v.message);
                }
            });
        } else {
            this.context.sdk.createContact(contact).then((res) => {
                if(res.status !== 200) {
                    toast.error(res.message, {autoClose: 1500});
                } else {
                    toast.success("Contact was created!", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "contacts", "index"]});
                }
            });
        }
    }

    componentWillMount() {
        if("contact_id" in this.props) {
            this.context.sdk.getContact(this.props.contact_id).then((res) => {
                if(res.status === 200) {
                    let contact = res.data;
                    let variables = {};
                    let counter = 1;
                    for(let k of Object.keys(contact.variables)) {
                        variables[counter] = {
                            "faulty": false,
                            "key": k,
                            "value": contact.variables[k]
                        };
                        counter++;
                    }
                    contact["variables"] = variables;
                    this.setState({"contact": contact});
                }
            })
        }
        this.context.sdk.getTimePeriods(1, ["name"]).then((v) => {
            let timePeriodsData = v.data;
            let timePeriods = [];
            let selected = this.state.selected;
            for(let timePeriod of timePeriodsData) {
                timePeriods.push({value: timePeriod.id, label: timePeriod.name});
            }
            selected.timePeriods = timePeriods;
            this.setState({"selected": selected, "timePeriods": timePeriodsData});
        });
        this.context.sdk.getChecks(1, ["name"]).then((v) => {
            let checksData = v.data;
            let checks = [];
            let selected = this.state.selected;
            for(let check of checksData) {
                checks.push({value: check.id, label: check.name});
            }
            selected.checks = checks;
            this.setState({"selected": selected, "checks": checksData});
        });
    }

    render() {
        let heading;
        if("contact_id" in this.props) {
            heading = <h2 className="declarationHeading">Update Contact</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new Contact</h2>;
        }

        let sortedHostNotifications = [];
        for (let check_id of this.state.contact.linked_host_notifications) {
            sortedHostNotifications.push(this.state.selected.checks.find(x => x.value === check_id));
        }

        let sortedObservableNotifications = [];
        for (let check_id of this.state.contact.linked_observable_notifications) {
            sortedObservableNotifications.push(this.state.selected.checks.find(x => x.value === check_id));
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
                                   value={this.state.contact.name}
                                   onChange={(v) => {
                                       let contact = this.state.contact;
                                       let faulty = this.state.faulty;
                                       faulty.name = this.checkFaultyName(v);
                                       contact.name = v;
                                       this.setState({"contact": contact, "faulty": faulty});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Mail</label>
                    </td>
                    <td>
                        <TextInput className={this.state.faulty.mail ? "darkInput redBorder" : "darkInput"}
                                   value={this.state.contact.mail}
                                   onChange={(v) => {
                                       let contact = this.state.contact;
                                       let faulty = this.state.faulty;
                                       faulty.mail = this.checkFaultyMail(v);
                                       contact.mail = v;
                                       this.setState({"contact": contact, "faulty": faulty});
                                   }} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <div className="declarationEntry">Variables</div>
                    </td>
                    <td>
                        <Variables value={this.state.contact.variables}
                                   onChange={(v) => {
                                       let a = this.state.contact;
                                       a["variables"] = v;
                                       let faultyStates = this.state.faulty;
                                       faultyStates.variables = Object.values(this.state.contact.variables)
                                           .filter((v) => v["faulty"]).length !== 0;
                                       this.setState({"contact": a, "faulty": faultyStates});
                                   }} />
                    </td>
                </tr>
                <TableSectionHeading text="Notification options" />
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Host notification period</label>
                    </td>
                    <td>
                        <Select className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={true}
                                options={this.state.selected.timePeriods}
                                onChange={(v) => {
                                    let a = this.state.contact;
                                    a["linked_host_notification_period"] = v === null ? null : v.value;
                                    this.setState({"contact": a});
                                }}
                                value={this.state.selected.timePeriods.filter((x) => x.value === this.state.contact.linked_host_notification_period)} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Host notifications</label>
                    </td>
                    <td>
                        <MultiSelectSort options={this.state.selected.checks}
                                         onChange={(v) => {
                                             let a = this.state.contact;
                                             let hostNotifications = [];
                                             v.forEach(x => hostNotifications.push(x.value));
                                             a["linked_host_notifications"] = hostNotifications;
                                             this.setState({"contact": a});
                                         }}
                                         value={sortedHostNotifications} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Observable notification period</label>
                    </td>
                    <td>
                        <Select className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={true}
                                options={this.state.selected.timePeriods}
                                onChange={(v) => {
                                    let a = this.state.contact;
                                    a["linked_observable_notification_period"] = v === null ? null : v.value;
                                    this.setState({"contact": a});
                                }}
                                value={this.state.selected.timePeriods.filter((x) => x.value === this.state.contact.linked_observable_notification_period)} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Observable notifications</label>
                    </td>
                    <td>
                        <MultiSelectSort options={this.state.selected.checks}
                                         onChange={(v) => {
                                             let a = this.state.contact;
                                             let observableNotifications = [];
                                             v.forEach(x => observableNotifications.push(x.value));
                                             a["linked_observable_notifications"] = observableNotifications;
                                             this.setState({"contact": a});
                                         }}
                                         value={sortedObservableNotifications} />
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
                                  value={this.state.contact.comment}
                                  onChange={(v) => {
                                      let contact = this.state.contact;
                                      contact.comment = v;
                                      this.setState({"contact": contact});
                                  }} />
                    </td>
                </tr>
            </table>
            <button className="button"
                    onClick={(v) => {
                        this.createOrUpdateContact();
                    }} >
                Submit
            </button>
        </div>
    }
}
