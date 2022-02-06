import Select from 'https://cdn.skypack.dev/react-select';

import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";
import MultiSelectSort from "../../lib/q_multiselect.js";
import Variables from "../../lib/q_variables.js";
import TableSectionHeading from "../../lib/q_table_section_heading.js";
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
                "scheduling_interval": null,
                "linked_proxy": null,
                "linked_contacts": [],
                "linked_contact_groups": [],
                "disabled": false
            },
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
                "scheduling_period": "",
                "comment": "",
                "disabled": false
            },
        }

        this.createHost = this.createHost.bind(this);
    }

    createHost() {
        toast.error("Submit!");
        if("host_id" in this.props) {

        } else {

        }
    }

    componentWillMount() {
        let promises = [];
        promises.push(this.context.sdk.getProxies());
        promises.push(this.context.sdk.getChecks());
        promises.push(this.context.sdk.getHostTemplates());
        promises.push(this.context.sdk.getContacts());
        promises.push(this.context.sdk.getContactGroups());
        promises.push(this.context.sdk.getTimePeriods());
        if("host_id" in this.props) {
            promises.push(this.context.sdk.getHost(this.props.host_id));
        }
        Promise.all(promises).then((values) => {
            let proxiesData = values[0].data;
            let checksData = values[1].data;
            let hostTemplatesData = values[2].data;
            let contactsData = values[3].data;
            let contactGroupsData = values[4].data;
            let timePeriodsData = values[5].data;
            let host = {
                "host": {
                    "name": "",
                    "address": "",
                    "comment": "",
                    "host_templates": [],
                    "notification_period": null,
                    "scheduling_period": null,
                    "scheduling_interval": null,
                    "linked_proxy": null,
                    "linked_contacts": [],
                    "linked_contact_groups": [],
                    "disabled": false
                }
            };
            if(values.length === 7) {
                if(values[6].status === 200) {
                    host = {
                        "host": values[6].data
                    };
                } else {
                    console.error(values[6]);
                }
            }
            let proxies = [];
            let checks = [];
            let timePeriods = [];
            let contacts = [];
            let contactGroups = [];
            let hostTemplates = [];

            for(let proxy of proxiesData) {
                proxies.push({value: proxy.id, label: proxy.name});
            }
            for(let check of checksData) {
                checks.push({value: check.id, label: check.name});
            }
            for(let timePeriod of timePeriodsData) {
                timePeriods.push({value: timePeriod.id, label: timePeriod.name});
            }
            for(let contact of contactsData) {
                contacts.push({value: contact.id, label: contact.name});
            }
            for(let contactGroup of contactGroupsData) {
                contactGroups.push({value: contactGroup.id, label: contactGroup.name});
            }
            for(let hostTemplate of hostTemplatesData) {
                hostTemplates.push({value: hostTemplate.id, label: hostTemplate.name});
            }

            this.setState({
                "hostTemplates": hostTemplatesData,
                "checks": checksData,
                "timePeriods": timePeriodsData,
                "contacts": contactsData,
                "contactGroups": contactGroupsData,
                "selected": {
                    "proxies": proxies,
                    "checks": checks,
                    "hostTemplates": hostTemplates,
                    "contacts": contacts,
                    "contactGroups": contactGroups,
                    "timePeriods": timePeriods
                },
                ...host
            });
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
                            <TextInput className="darkInput"
                                       required
                                       value={this.state.host.name}
                                       setValue={(v) => {
                                           let a = this.state.host;
                                           a["name"] = v;
                                           this.setState({"host": a});
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
                                       setValue={(v) => {
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
                            <Select className="react-select-container"
                                    classNamePrefix="react-select"
                                    options={this.state.selected.proxies}
                                    onChange={(v) => {
                                        let a = this.state.host;
                                        a["linked_proxy"] = v === null ? null : v.value;
                                        this.setState({"host": a});
                                    }}
                                    value={this.state.selected.proxies.filter((x) => x.value === this.state.host.linked_proxy)} />
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
                                    value={this.state.selected.checks.filter((x) => x.value === this.state.host.linked_check)} />
                        </td>
                    </tr>
                    <tr>
                        <td className="smallCell" />
                        <td>
                            <label htmlFor="variables">Variables</label>
                        </td>
                        <td>
                            <Variables />
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
                            <TextInput className="darkInput"
                                       value={this.state.host.scheduling_interval}
                                       setValue={(v) => {
                                           let a = this.state.host;
                                           a["scheduling_interval"] = v;
                                           this.setState({"host": a});
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
                                      setValue={(v) => {
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
