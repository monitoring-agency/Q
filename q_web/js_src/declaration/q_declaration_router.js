import {React} from "../react.js";
import DeclarationObjectRouter from "../lib/q_delaration_object_router.js";
import DeclarationHostIndexView from "./hosts/q_hosts_index.js";
import DeclarationHostView from "./hosts/q_host_view.js";
import DeclarationGlobalVariableIndexView from "./globalVariables/q_globalvariables_index.js";
import DeclarationGlobalVariableView from "./globalVariables/q_globalvariable_view.js";
import DeclarationProxyIndexView from "./proxies/q_proxies_index.js";
import DeclarationProxyView from "./proxies/q_proxy_view.js"
import DeclarationChecksIndex from "./checks/q_checks_index.js";
import DeclarationCheckView from "./checks/q_check_view.js";
import DeclarationContactsIndex from "./contacts/q_contacts_index.js";
import DeclarationContactView from "./contacts/q_contact_view.js";
import DeclarationContactGroupsIndex from "./contactgroups/q_contactgroups_index.js";
import DeclarationContactGroupView from "./contactgroups/q_contactgroup_view.js";


export default class DeclarationRouter extends React.Component {
    render() {
        let path = this.props.path[0];
        let slice = this.props.path.slice(1);

        // Check router
        if (path === "checks") {
            return <DeclarationObjectRouter path={slice}
                                            indexView={<DeclarationChecksIndex />}
                                            createView={<DeclarationCheckView />}
                                            updateView={<DeclarationCheckView check_id={slice} />} />
        }

        // Contactgroups router
        if(path === "contactgroups") {
            return <DeclarationObjectRouter path={slice}
                                            indexView={<DeclarationContactGroupsIndex />}
                                            createView={<DeclarationContactGroupView />}
                                            updateView={<DeclarationContactGroupView contact_group_id={slice} />} />
        }

        // Contact router
        if (path === "contacts") {
            return <DeclarationObjectRouter path={slice}
                                            indexView={<DeclarationContactsIndex />}
                                            createView={<DeclarationContactView />}
                                            updateView={<DeclarationContactView contact_id={slice} />} />
        }

        // GlobalVariables router
        if(path === "globalvariables") {
            return <DeclarationObjectRouter path={slice}
                                            indexView={<DeclarationGlobalVariableIndexView />}
                                            createView={<DeclarationGlobalVariableView />}
                                            updateView={<DeclarationGlobalVariableView globalvariable_id={slice} />} />;
        }

        // Host declaration router
        if (path === "hosts") {
            return <DeclarationObjectRouter path={slice}
                                            indexView={<DeclarationHostIndexView />}
                                            createView={<DeclarationHostView />}
                                            updateView={<DeclarationHostView host_id={slice} />} />;
        }

        // Proxies router
        if(path === "proxies") {
            return <DeclarationObjectRouter path={slice}
                                            indexView={<DeclarationProxyIndexView />}
                                            createView={<DeclarationProxyView />}
                                            updateView={<DeclarationProxyView proxy_id={slice} />} />;
        }

        return null;
    }
}
