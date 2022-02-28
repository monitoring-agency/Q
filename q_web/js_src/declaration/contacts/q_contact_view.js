import Select from 'https://cdn.skypack.dev/react-select';

import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";
import TextInput from "../../lib/q_input.js";
import TextArea from "../../lib/q_textarea.js";
import TableSectionHeading from "../../lib/q_table_section_heading.js";
import Variables from "../../lib/q_variables.js";


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
            "selectOptions": {
                "hostNotificationPeriods": [],
                "observableNotificationPeriods": [],
                "hostNotifications": [],
                "observableNotifications": []
            },
            "selectQueries": {
                "hostNotificationPeriod": "",
                "observableNotificationPeriod": "",
                "hostNotifications": "",
                "observableNotifications": "",
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
                    contact.variables = variables;

                    this.context.sdk.getTimePeriods(1, ["name"]).then((res) => {
                        if(res.status === 200) {
                            let selectOptions = this.state.selectOptions;
                            for(let timePeriod of res.data) {
                                selectOptions.hostNotificationPeriods.push({"label": timePeriod.name, "value": timePeriod.id});
                                selectOptions.observableNotificationPeriods.push({"label": timePeriod.name, "value": timePeriod.id});
                            }
                            this.setState({"selectOptions": selectOptions});
                            if(contact.linked_host_notification_period !== "" &&
                                !res.data.some((x) => x.id === parseInt(contact.linked_host_notification_period)) ) {
                                this.context.sdk.getTimePeriod(contact.linked_host_notification_period, ["name"]).then((res) => {
                                    if(res.status === 200) {
                                        let selectOptions = this.state.selectOptions;
                                        selectOptions.hostNotificationPeriods.push({"label": res.data.name, "value": res.data.id});
                                        this.setState({"selectOptions": selectOptions});
                                    }
                                });
                            }
                            if(contact.linked_observable_notification_period !== "" &&
                                !res.data.some((x) => x.id === parseInt(contact.linked_observable_notification_period)) ) {
                                this.context.sdk.getTimePeriod(contact.linked_observable_notification_period, ["name"]).then((res) => {
                                    if(res.status === 200) {
                                        let selectOptions = this.state.selectOptions;
                                        selectOptions.observableNotificationPeriods.push({"label": res.data.name, "value": res.data.id});
                                        this.setState({"selectOptions": selectOptions});
                                    }
                                });
                            }
                        }
                    });
                    this.context.sdk.getChecks(1, ["name"]).then((res) => {
                        if(res.status === 200) {
                            let selectOptions = this.state.selectOptions;
                            for(let check of res.data) {
                                selectOptions.hostNotifications.push({"label": check.name, "value": check.id});
                                selectOptions.observableNotifications.push({"label": check.name, "value": check.id});
                            }
                            this.setState({"selectOptions": selectOptions});
                            if(contact.linked_host_notifications.length !== 0) {
                                for (let linkedHostNotification of contact.linked_host_notifications) {
                                    if (!res.data.some(x => x.id === parseInt(linkedHostNotification))) {
                                        this.context.sdk.getCheck(linkedHostNotification, ["name"]).then((res) => {
                                            if (res.status === 200) {
                                                let selectOptions = this.state.selectOptions;
                                                selectOptions.hostNotifications.push({"label": res.data.name, "value": res.data.id});
                                                this.setState({"selectOptions": selectOptions});
                                            }
                                        })
                                    }
                                }
                            }
                            if(contact.linked_observable_notifications.length !== 0) {
                                for (let linkedObservableNotification of contact.linked_observable_notifications) {
                                    if (!res.data.some(x => x.id === parseInt(linkedObservableNotification))) {
                                        this.context.sdk.getCheck(linkedObservableNotification, ["name"]).then((res) => {
                                            if (res.status === 200) {
                                                let selectOptions = this.state.selectOptions;
                                                selectOptions.observableNotifications.push({"label": res.data.name, "value": res.data.id});
                                                this.setState({"selectOptions": selectOptions});
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    });

                    this.setState({"contact": contact});
                }
            })
        } else {
            this.context.sdk.getTimePeriods(1, ["name"]).then((res) => {
                if(res.status === 200) {
                    let selectOptions = this.state.selectOptions;
                    for(let timePeriod of res.data) {
                        selectOptions.hostNotificationPeriods.push({"label": timePeriod.name, "value": timePeriod.id});
                        selectOptions.observableNotificationPeriods.push({"label": timePeriod.name, "value": timePeriod.id});
                    }
                    this.setState({"selectOptions": selectOptions});
                }
            });
            this.context.sdk.getChecks(1, ["name"]).then((res) => {
                if(res.status === 200) {
                    let selectOptions = this.state.selectOptions;
                    for(let check of res.data) {
                        selectOptions.hostNotifications.push({"label": check.name, "value": check.id});
                        selectOptions.observableNotifications.push({"label": check.name, "value": check.id});
                    }
                    this.setState({"selectOptions": selectOptions});
                }
            });
        }
    }

    render() {
        let heading;
        if("contact_id" in this.props) {
            heading = <h2 className="declarationHeading">Update Contact</h2>;
        } else {
            heading = <h2 className="declarationHeading">Create new Contact</h2>;
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
                                options={this.state.selectOptions.hostNotificationPeriods}
                                onInputChange={(v) => {
                                    if(v === this.state.selectQueries.hostNotificationPeriod) return;

                                    this.context.sdk.getTimePeriods(1, ["name"], v).then((res) => {
                                        if(res.status === 200) {
                                            let timePeriodsData = res.data;
                                            let selectOptions = this.state.selectOptions;
                                            let selectQueries = this.state.selectQueries;

                                            selectQueries.hostNotificationPeriod = v;

                                            selectOptions.hostNotificationPeriods = [];
                                            for (let timePeriod of timePeriodsData) {
                                                selectOptions.hostNotificationPeriods.push({"value": timePeriod.id, "label": timePeriod.name});
                                            }

                                            if(this.state.contact.linked_host_notification_period !== null && !timePeriodsData.filter(
                                                (x) => x.id === this.state.contact.linked_host_notification_period)
                                            ) {
                                                for(let existing of this.state.selectOptions.hostNotificationPeriods.filter(
                                                    (x) => x.value === this.state.contact.linked_host_notification_period)
                                                ) {
                                                    selectOptions.hostNotificationPeriods.push(existing);
                                                }
                                            }

                                            this.setState({
                                                "selectOptions": selectOptions,
                                                "selectQueries": selectQueries
                                            });
                                        }
                                    });
                                }}
                                onChange={(v) => {
                                    let a = this.state.contact;
                                    a["linked_host_notification_period"] = v === null ? null : v.value;
                                    this.setState({"contact": a});
                                }}
                                value={this.state.selectOptions.hostNotificationPeriods.filter((x) => x.value === this.state.contact.linked_host_notification_period)} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Host notifications</label>
                    </td>
                    <td>
                        <Select className="react-select-container"
                                classNamePrefix="react-select"
                                isMulti={true}
                                isClearable={true}
                                options={this.state.selectOptions.hostNotifications}
                                onInputChange={(v) => {
                                    if(v === this.state.selectQueries.hostNotifications) return;

                                    this.context.sdk.getChecks(1, ["name"], v).then((res) => {
                                        if (res.status === 200) {
                                            let selectOptions = this.state.selectOptions;
                                            let selectQueries = this.state.selectQueries;

                                            selectQueries.hostNotifications = v;

                                            let hostNotifications = [];
                                            for (let check of res.data) {
                                                hostNotifications.push({
                                                    "value": check.id,
                                                    "label": check.name
                                                });
                                            }

                                            if (this.state.contact.linked_host_notifications.length !== 0) {
                                                for (let hostNotification of this.state.contact.linked_host_notifications) {
                                                    if (!hostNotifications.some(x => x.value === hostNotification)) {
                                                        this.state.selectOptions.hostNotifications.forEach(y => {
                                                            if (y.value === hostNotification) {
                                                                hostNotifications.push(y);
                                                            }
                                                        })
                                                    }
                                                }
                                            }

                                            selectOptions.hostNotifications = hostNotifications;

                                            this.setState({
                                                "selectOptions": selectOptions,
                                                "selectQueries": selectQueries
                                            });
                                        }
                                    });
                                }}
                                value={this.state.selectOptions.hostNotifications.filter(x => this.state.contact.linked_host_notifications.some(y => y === x.value))} />
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
                                options={this.state.selectOptions.observableNotificationPeriods}
                                onInputChange={(v) => {
                                    if(v === this.state.selectQueries.observableNotificationPeriod) return;

                                    this.context.sdk.getTimePeriods(1, ["name"], v).then((res) => {
                                        if(res.status === 200) {
                                            let timePeriodsData = res.data;
                                            let selectOptions = this.state.selectOptions;
                                            let selectQueries = this.state.selectQueries;

                                            selectQueries.observableNotificationPeriod = v;

                                            selectOptions.observableNotificationPeriods = [];
                                            for (let timePeriod of timePeriodsData) {
                                                selectOptions.observableNotificationPeriods.push({"value": timePeriod.id, "label": timePeriod.name});
                                            }

                                            if(this.state.contact.linked_observable_notification_period !== null && !timePeriodsData.filter(
                                                (x) => x.id === this.state.contact.linked_observable_notification_period)
                                            ) {
                                                for(let existing of this.state.selectOptions.observableNotificationPeriods.filter(
                                                    (x) => x.value === this.state.contact.linked_observable_notification_period)
                                                ) {
                                                    selectOptions.observableNotificationPeriods.push(existing);
                                                }
                                            }

                                            this.setState({
                                                "selectOptions": selectOptions,
                                                "selectQueries": selectQueries
                                            });
                                        }
                                    });
                                }}
                                onChange={(v) => {
                                    let a = this.state.contact;
                                    a["linked_observable_notification_period"] = v === null ? null : v.value;
                                    this.setState({"contact": a});
                                }}
                                value={this.state.selectOptions.observableNotificationPeriods.filter((x) => x.value === this.state.contact.linked_observable_notification_period)} />
                    </td>
                </tr>
                <tr>
                    <td className="smallCell" />
                    <td>
                        <label>Observable notifications</label>
                    </td>
                    <td>
                        <Select className="react-select-container"
                                classNamePrefix="react-select"
                                options={this.state.selectOptions.observableNotifications}
                                isClearable={true}
                                isMulti={true}
                                onInputChange={(v) => {
                                    if(v === this.state.selectQueries.observableNotifications) return;

                                    this.context.sdk.getChecks(1, ["name"], v).then((res) => {
                                        if (res.status === 200) {
                                            let selectOptions = this.state.selectOptions;
                                            let selectQueries = this.state.selectQueries;

                                            selectQueries.observableNotifications = v;

                                            let observableNotifications = [];
                                            for (let check of res.data) {
                                                observableNotifications.push({
                                                    "value": check.id,
                                                    "label": check.name
                                                });
                                            }

                                            if (this.state.contact.linked_observable_notifications.length !== 0) {
                                                for (let observableNotification of this.state.contact.linked_observable_notifications) {
                                                    if (!observableNotifications.some(x => x.value === observableNotification)) {
                                                        this.state.selectOptions.observableNotifications.forEach(y => {
                                                            if (y.value === observableNotification) {
                                                                observableNotifications.push(y);
                                                            }
                                                        })
                                                    }
                                                }
                                            }

                                            selectOptions.observableNotifications = observableNotifications;

                                            this.setState({
                                                "selectOptions": selectOptions,
                                                "selectQueries": selectQueries
                                            });
                                        }
                                    });
                                }}
                                onChange={(v) => {
                                    let a = this.state.contact;
                                    let observableNotifications = [];
                                    v.forEach(x => observableNotifications.push(x.value));
                                    a["linked_observable_notifications"] = observableNotifications;
                                    this.setState({"contact": a});
                                }}
                                value={this.state.selectOptions.observableNotifications.filter(x => this.state.contact.linked_observable_notifications.some(y => y === x.value))} />
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
