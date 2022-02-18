import {React} from "../../react.js";
import ctx from "../../lib/q_ctx.js"
import DeclarationProxiesIndexView from "./q_proxies_index.js";
import DeclarationProxyCreateOrUpdateView from "./q_proxy_view.js";


export default class DeclarationProxiesRouter extends React.Component {
    static contextType = ctx;

    render() {
        let path = "" + this.props.path[0];

        // Index router
        if(path === "index") {
            return <DeclarationProxiesIndexView />
        }

        // Create router
        if(path === "create") {
            return <DeclarationProxyCreateOrUpdateView />
        }

        // Update router
        if(path.match(/^[0-9]+$/)) {
            return <DeclarationProxyCreateOrUpdateView proxy_id={path} />
        }

        return null;
    }
}
