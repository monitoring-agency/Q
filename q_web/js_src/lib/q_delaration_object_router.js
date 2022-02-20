import {React} from "../react.js";
import ctx from "../lib/q_ctx.js"


export default class DeclarationObjectRouter extends React.Component {
    static contextType = ctx;

    render() {
        let path = "" + this.props.path[0];

        // Index router
        if(path === "index") {
            return this.props.indexView;
        }

        // Create router
        if(path === "create") {
            return this.props.createView;
        }

        // Update router
        if(path.match(/^[0-9]+$/)) {
            return this.props.updateView;
        }

        return null;
    }
}
