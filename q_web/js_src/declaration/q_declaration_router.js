import {React} from "../react.js";
import DeclarationHostsRouter from "./hosts/q_hosts_router.js";
import DeclarationGlobalVariablesRouter from "./globalVariables/q_globalvariables_router.js";
import DeclarationProxiesRouter from "./proxies/q_proxies_router.js";


export default class DeclarationRouter extends React.Component {
    render() {
        let path = this.props.path[0];
        let slice = this.props.path.slice(1);

        // Host declaration router
        if (path === "hosts") {
            return <DeclarationHostsRouter path={slice} />
        }

        // GlobalVariables router
        if(path === "globalvariables") {
            return <DeclarationGlobalVariablesRouter path={slice} />
        }

        // Proxies router
        if(path === "proxies") {
            return <DeclarationProxiesRouter path={slice} />
        }

        return null;
    }
}
