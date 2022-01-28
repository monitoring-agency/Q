import {React} from "../react.js";
import DeclarationHostsRouter from "./hosts/q_hosts_router.js";

let e = React.createElement;

export default class DeclarationRouter extends React.Component {
    render() {
        let path = this.props.path[0];

         // Host declaration router
        if (path === "hosts") {
            return e(DeclarationHostsRouter, {"path": this.props.path.slice(1)});
        }
        return null;
    }
}
