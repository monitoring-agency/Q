import Select from 'https://cdn.skypack.dev/react-select';

import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";
import TableSectionHeading from "../../lib/q_table_section_heading.js";
import MultiSelectSort from "../../lib/q_multiselect.js";
import Variables from "../../lib/q_variables.js";
import SliderInput from "../../lib/q_slider_input.js";

export default class DeclarationHostView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "host": {
                "name": "",
                "address": "",
                "comment": "",
                "host_templates": [],
                "notification_period": null,
                "scheduling_period": null,
                "scheduling_interval": "",
                "linked_proxy": null,
                "linked_contacts": [],
                "linked_contact_groups": [],
                "variables": {},
                "disabled": false
            },
            "faulty": {
                "name": false,
                "linked_proxy": false,
                "variables": false,
                "scheduling_interval": false
            },
            "original": {},
            "proxies": [],
            "checks": [],
            "hostTemplates": [],
            "contacts": [],
            "contactGroups": [],
            "timePeriods": [],
            "selected": {
                "proxies": [],
                "contacts": [],
                "contactGroups": [],
                "timePeriods": [],
                "hostTemplates": [],
                "checks": [],
                "name": "",
                "address": "",
                "variables": {},
                "scheduling_period": "",
                "comment": "",
                "disabled": false
            },
        }

        this.createHost = this.createHost.bind(this);
    }

    createHost() {
        let faultyStates = this.state.faulty;
        faultyStates.name = this.state.host.name.match(new RegExp("^[a-zA-Z0-9.#+_\-]+$")) === null;
        faultyStates.scheduling_interval = !(
            (String(this.state.host.scheduling_interval).match(new RegExp("^[0-9]+$")) && parseInt(this.state.host.scheduling_interval) > 0)
            || this.state.host.scheduling_interval === ""
        );
        faultyStates.variables = Object.values(this.state.host.variables).filter((v) => v["faulty"]).length !== 0;
        faultyStates.linked_proxy = this.state.host.linked_proxy === null || this.state.host.linked_proxy === "";

        let succeeded = Object.keys(faultyStates).filter((key) => faultyStates[key]).length === 0;
        if (!succeeded) {
            toast.error("Faulty configuration");
            this.setState({"faulty": faultyStates})
            return;
        }

        let variables = {};
        for(let v of Object.values(this.state.host.variables)) {
            variables[v["key"]] = v["value"];
        }

        if("host_id" in this.props) {
            let changes = this.state.host;
            changes["variables"] = variables;
            this.context.sdk.updateHost(this.props["host_id"], changes).then((result) => {
                if (result.success) {
                    toast.success("Changes were successful", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "hosts", "index"]});
                } else {
                    toast.error(result.message);
                }
            });
        } else {
            let obj = this.state.host;
            obj["variables"] = variables;
            this.context.sdk.createHost(obj).then((result) => {
                if(result.success) {
                    toast.success("Host was created successfully", {autoClose: 1500});
                    this.context.setPath({"path": ["declaration", "hosts", "index"]});
                } else {
                    toast.error(result.message);
                }
            });
        }
    }

    componentWillMount() {
        if("host_id" in this.props) {
            this.context.sdk.getHost(this.props.host_id).then((v) => {
                if(v.status === 200) {
                    let host = v.data;
                    let variables = {};
                    let counter = 1;
                    for(let k of Object.keys(host.variables)) {
                        variables[counter] = {
                            "faulty": false,
                            "key": k,
                            "value": host.variables[k]
                        };
                        counter++;
                    }
                    host["variables"] = variables;
                    this.setState({"host": host})
                } else {
                    console.error(v);
                }
            });
        } else {
            this.setState({
                "host": {
                    "name": "",
                    "address": "",
                    "comment": "",
                    "host_templates": [],
                    "notification_period": null,
                    "scheduling_period": null,
                    "scheduling_interval": "",
                    "linked_proxy": null,
                    "linked_contacts": [],
                    "linked_contact_groups": [],
                    "variables": {},
                    "disabled": false
                }
            });
        }

        this.context.sdk.getProxies(1, ["name"]).then((v) => {
            let proxiesData = v.data;
            let proxies = [];
            let selected = this.state.selected;
            for(let proxy of proxiesData) {
                proxies.push({value: proxy.id, label: proxy.name});
            }
            selected.proxies = proxies;
            this.setState({"selected": selected, "proxies": proxiesData});
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
        this.context.sdk.getHostTemplates(1, ["name"]).then((v) => {
            let hostTemplatesData = v.data;
            let hostTemplates = [];
            let selected = this.state.selected;
            for(let hostTemplate of hostTemplatesData) {
                hostTemplates.push({value: hostTemplate.id, label: hostTemplate.name});
            }
            selected.hostTemplates = hostTemplates;
            this.setState({"selected": selected, "hostTemplates": hostTemplatesData});
        });
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
        this.context.sdk.getContactGroups(1, ["name"]).then((v) => {
            let contactGroupsData = v.data;
            let contactGroups = [];
            let selected = this.state.selected;
            for(let contactGroup of contactGroupsData) {
                contactGroups.push({value: contactGroup.id, label: contactGroup.name});
            }
            selected.contactGroups = contactGroups;
            this.setState({"selected": selected, "contactGroups": contactGroupsData});
        });
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
    }

    render() {
        let heading;
        if("host_id" in this.props) {
            heading = <h2 className="declarationHeading">Update Host</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new Host</h2>;
        }

        let sortedHostTemplates = [];
        for (let host_id of this.state.host.host_templates) {
            sortedHostTemplates.push(this.state.selected.hostTemplates.find(x => x.value === host_id));
        }

        let sortedContacts = [];
        for (let contact_id of this.state.host.linked_contacts) {
            sortedContacts.push(this.state.selected.contacts.find(x => x.value === contact_id));
        }

        let sortedContactGroups = [];
        for (let contact_group_id of this.state.host.linked_contact_groups) {
            sortedContactGroups.push(this.state.selected.contactGroups.find(x => x.value === contact_group_id));
        }

        return <div className="declarationContent">
            {heading}
                <table className="declarationTable">
                    <TableSectionHeading text="Basic host information" />
                    <tr>
                        <td className="smallCell" />
                        <td className="largeCell">Name</td>
                        <td>
                            <TextInput className={this.state.faulty.name ? "darkInput redBorder" : "darkInput"}
                                       required
                                       value={this.state.host.name}
                                       onChange={(v) => {
                                           let a = this.state.host;
                                           a["name"] = v;
                                           let faultyState = this.state.faulty;
                                           let regexp = new RegExp("^[a-zA-Z0-9.#+_\-]+$");
                                           faultyState["name"] = v.match(regexp) === null;
                                           this.setState({"host": a, "faulty": faultyState});
                                       }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="address">Address</label>
                        </td>
                        <td>
                            <TextInput className="darkInput"
                                       value={this.state.host.address}
                                       onChange={(v) => {
                                           let a = this.state.host;
                                           a["address"] = v;
                                           this.setState({"host": a});
                                       }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="linked_proxy">Linked proxy</label>
                        </td>
                        <td>
                            <Select className={this.state.faulty.linked_proxy ? "react-select-container react-select-redBorder" : "react-select-container"}
                                    classNamePrefix="react-select"
                                    options={this.state.selected.proxies}
                                    onChange={(v) => {
                                        let a = this.state.host;
                                        a["linked_proxy"] = v === null ? null : v.value;
                                        let faultyStates = this.state.faulty;
                                        faultyStates.linked_proxy = v === null;
                                        this.setState({"host": a, "faulty": faultyStates});
                                    }}
                                    value={this.state.selected.proxies.filter(
                                        (x) => x.value === this.state.host.linked_proxy)
                                    } />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="host_templates">Host Templates</label>
                        </td>
                        <td>
                            <MultiSelectSort options={this.state.selected.hostTemplates}
                                             onChange={(v) => {
                                                 let a = this.state.host;
                                                 let host_templates = [];
                                                 v.forEach(x => host_templates.push(x.value));
                                                 a["host_templates"] = host_templates;
                                                 this.setState({"host": a});
                                             }}
                                             value={sortedHostTemplates} />
                        </td>
                    </tr>
                    <TableSectionHeading text="Check information" />
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="linked_check">Linked check</label>
                        </td>
                        <td>
                            <Select className="react-select-container"
                                    classNamePrefix="react-select"
                                    isClearable
                                    options={this.state.selected.checks}
                                    onChange={(v) => {
                                        let a = this.state.host;
                                        a["linked_check"] = v === null ? null : v.value;
                                        this.setState({"host": a});
                                    }}
                                    value={this.state.selected.checks.filter(
                                        (x) => x.value === this.state.host.linked_check)
                                    } />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <div className="declarationEntry">Variables</div>
                        </td>
                        <td>
                            <Variables value={this.state.host.variables}
                                       onChange={(v) => {
                                           let a = this.state.host;
                                           a["variables"] = v;
                                           let faultyStates = this.state.faulty;
                                           faultyStates.variables = Object.values(this.state.host.variables)
                                               .filter((v) => v["faulty"]).length !== 0;
                                           this.setState({"host": a, "faulty": faultyStates});
                                       }} />
                        </td>
                    </tr>
                    <TableSectionHeading text="Notification options" />
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="linked_contacts">Contacts</label>
                        </td>
                        <td>
                            <MultiSelectSort options={this.state.selected.contacts}
                                             onChange={(v) => {
                                                 let a = this.state.host;
                                                 let contacts = [];
                                                 v.forEach(x => contacts.push(x.value));
                                                 a["linked_contacts"] = contacts;
                                                 this.setState({"host": a});
                                             }}
                                             value={sortedContacts} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="linked_contact_groups">Contact Groups</label>
                        </td>
                        <td>
                            <MultiSelectSort options={this.state.selected.contactGroups}
                                             onChange={(v) => {
                                                 let a = this.state.host;
                                                 let contactGroups = [];
                                                 v.forEach(x => contactGroups.push(x.value));
                                                 a["linked_contact_groups"] = contactGroups;
                                                 this.setState({"host": a});
                                             }}
                                             value={sortedContactGroups} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="notification_period">Notification Period</label>
                        </td>
                        <td>
                            <Select className="react-select-container"
                                    classNamePrefix="react-select"
                                    isClearable={true}
                                    options={this.state.selected.timePeriods}
                                    onChange={(v) => {
                                        let a = this.state.host;
                                        a["notification_period"] = v === null ? null : v.value;
                                        this.setState({"host": a});
                                    }}
                                    value={this.state.selected.timePeriods.filter((x) => x.value === this.state.host.notification_period)} />
                        </td>
                    </tr>
                    <TableSectionHeading text="Scheduling options" />
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="scheduling_interval">Scheduling Interval</label>
                        </td>
                        <td>
                            <TextInput className={this.state.faulty.scheduling_interval ? "darkInput redBorder" : "darkInput"}
                                       value={this.state.host.scheduling_interval}
                                       onChange={(v) => {
                                           let a = this.state.host;
                                           a["scheduling_interval"] = v;
                                           let faultyStates = this.state.faulty;
                                           let regexp = new RegExp("^[0-9]+$")
                                           faultyStates.scheduling_interval = !((v.match(regexp) && parseInt(v) > 0) || v === "");
                                           this.setState({"host": a, "faulty": faultyStates});
                                       }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="scheduling_period">Scheduling Period</label>
                        </td>
                        <td>
                            <Select className="react-select-container"
                                    classNamePrefix="react-select"
                                    isClearable={true}
                                    options={this.state.selected.timePeriods}
                                    onChange={(v) => {
                                        let a = this.state.host;
                                        a["scheduling_period"] = v === null ? null : v.value;
                                        this.setState({"host": a});
                                    }}
                                    value={this.state.selected.timePeriods.filter((x) => x.value === this.state.host.scheduling_period)} />
                        </td>
                    </tr>
                    <TableSectionHeading text="Miscellaneous options" />
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="disabled">Disabled</label>
                        </td>
                        <td>
                            <SliderInput value={this.state.host.disabled}
                                         onChange={(v) => {
                                             let a = this.state.host;
                                             a["disabled"] = v;
                                             this.setState({"host": a});
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
                                      value={this.state.host.comment}
                                      onChange={(v) => {
                                          let a = this.state.host;
                                          a["comment"] = v;
                                          this.setState({"host": a});
                                      }} />
                        </td>
                    </tr>
                </table>
                <button className="button" onClick={this.createHost}>Submit</button>
            </div>;
    }
}
