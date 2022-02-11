import {React} from "../../react.js";
import ctx from "../../lib/q_ctx.js"
import DeclarationHostIndexView from "./q_hosts_index.js";
import DeclarationHostView from "./q_host_view.js";

let e = React.createElement;


export default class DeclarationHostsRouter extends React.Component {
    static contextType = ctx;

    render() {
        let path = "" + this.props.path[0];

        if (path === "index") {
            return e(DeclarationHostIndexView);
        } else if(path === "create") {
            return e(DeclarationHostView);
        } else if(path.match(/^[0-9]+$/)) {
            return e(DeclarationHostView, {"host_id": path});
        }

        return null;
    }
}
