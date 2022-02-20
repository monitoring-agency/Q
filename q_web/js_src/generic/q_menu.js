import {React} from "../react.js";
import ctx from "../lib/q_ctx.js";

export default class MenuView extends React.PureComponent {
    static contextType = ctx;

    constructor(props) {
        super(props);

        this.logout = this.logout.bind(this);
    }


    logout() {
        this.context.sdk.logout(() => {
            this.context.setPath({"path": ["login"], "logged_in": false});
        });
    }

    render() {
        return(<div>
        <div className="sidebar" id="sidebar">
            <div draggable="false" className="sidebarLogo" onClick={this.props.menu_logo_action}>
                <img draggable="false" alt="logo" src={this.context.static + "img/q_little.png"} />
            </div>
            <div className="sidebarSeparator"/>
            <div id="sidebarToggle" className="sidebarDiv">
                <img src={this.context.static + "img/chevrons-left.svg"} alt="Hide/Show sidebar" />
            </div>
            <div className="sidebarSeparator"/>
            <nav className="sidebarNav disableSelection">
                <ul>
                    <li className="sidebarRow">
                        <img src={this.context.static + "img/activity.svg"} alt="activity" />
                        <p>Activity</p>
                        <ul className="sidebarNested">
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_dashboard_action}>
                                    <img src={this.context.static + "img/activity.svg"} alt="dashboard" />
                                    <p>Dashboard</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_host_dashboard_action}>
                                    <img src={this.context.static + "img/bar-chart.svg"} alt="Host dashboard" />
                                    <p>Host Dashboard</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_metric_dashboard_action}>
                                    <img src={this.context.static + "img/bar-chart.svg"} alt="Metric dashboard" />
                                    <p>Metric Dashboard</p>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebarRow">
                        <img src={this.context.static + "img/sliders.svg"} alt="declaration" />
                        <p>Declaration</p>
                        <ul className="sidebarNested">
                            <li>
                                <div className="sidebarRow" onClick={this.context.setPath.bind(null, {"path": ["declaration", "hosts", "index"]})}>
                                    <img src={this.context.static + "img/server.svg"} alt="Hosts" />
                                    <p>Hosts</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_host_templates_action}>
                                    <img src={this.context.static + "img/hosttemplate.svg"} alt="Host Templates" />
                                    <p>Host Templates</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_metrics_action}>
                                    <img src={this.context.static + "img/cpu.svg"} alt="Metrics" />
                                    <p>Metrics</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_metric_templates_action}>
                                    <img src={this.context.static + "img/metrictemplate.svg"} alt="Metric Templates" />
                                    <p>Metric Templates</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.context.setPath.bind(null, {"path": ["declaration", "checks", "index"]})}>
                                    <img src={this.context.static + "img/terminal.svg"} alt="Checks" />
                                    <p>Checks</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.context.setPath.bind(null, {"path": ["declaration", "globalvariables", "index"]})}>
                                    <img src={this.context.static + "img/variable.svg"} alt="Global variables" />
                                    <p>Global Variables</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_contacts_action}>
                                    <img src={this.context.static + "img/user.svg"} alt="Contacts" />
                                    <p>Contacts</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_contact_groups_action}>
                                    <img src={this.context.static + "img/users.svg"} alt="Contact Groups" />
                                    <p>Contact Groups</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_time_periods_action}>
                                    <img src={this.context.static + "img/calendar.svg"} alt="Time Periods" />
                                    <p>Time Periods</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.context.setPath.bind(null, {"path": ["declaration", "proxies", "index"]})}>
                                    <img src={this.context.static + "img/structure.svg"} alt="Proxies" />
                                    <p>Proxies</p>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebarRow">
                        <img src={this.context.static + "img/settings.svg"} alt="settings" />
                        <p>Settings</p>
                        <ul className="sidebarNested">
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_general_settings_action}>
                                    <img src={this.context.static + "img/settings.svg"} alt="General Settings" />
                                    <p>General Settings</p>
                                </div>
                            </li>
                            <li>
                                <div className="sidebarRow" onClick={this.props.menu_account_settings_action}>
                                    <img src={this.context.static + "img/user.svg"} alt="Account Settings" />
                                    <p>Account Settings</p>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
        <div className="topbar" id="topbar">
            <div/>
            <div className="topbarRight">
                <div onClick={this.logout} className="logout">
                    <img src={this.context.static + "img/logout.svg"} alt="Logout" />
                </div>
            </div>
        </div>
            </div>);
    }
}
