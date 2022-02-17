import {React} from "../../react.js";
import ctx from "../../lib/q_ctx.js"
import DeclarationProxiesIndexView from "./q_proxies_index.js";


export default class DeclarationProxiesRouter extends React.Component {
    static contextType = ctx;

    render() {
        let path = "" + this.props.path[0];

        if(path === "index") {
            return <DeclarationProxiesIndexView />
        }

        return null;
    }
}
