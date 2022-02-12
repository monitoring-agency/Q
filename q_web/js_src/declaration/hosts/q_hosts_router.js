import {React} from "../../react.js";
import ctx from "../../lib/q_ctx.js"
import DeclarationHostIndexView from "./q_hosts_index.js";
import DeclarationHostView from "./q_host_view.js";


export default class DeclarationHostsRouter extends React.Component {
    static contextType = ctx;

    render() {
        let path = "" + this.props.path[0];

        if (path === "index") {
            return <DeclarationHostIndexView />;
        } else if(path === "create") {
            return <DeclarationHostView />;
        } else if(path.match(/^[0-9]+$/)) {
            return <DeclarationHostView host_id={path} />;
        }

        return null;
    }
}
