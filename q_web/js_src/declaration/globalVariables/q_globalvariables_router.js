import {React} from "../../react.js";
import ctx from "../../lib/q_ctx.js"
import DeclarationGlobalVariableView from "./q_globalvariable_view.js";
import DeclarationGlobalVariableIndexView from "./q_globalvariables_index.js";

export default class DeclarationGlobalVariablesRouter extends React.Component {
    static contextType = ctx;

    render() {
        let path = "" + this.props.path[0];

        if (path === "index") {
            return <DeclarationGlobalVariableIndexView />;
        } else if(path === "create") {
            return <DeclarationGlobalVariableView />;
        } else if(path.match(/^[0-9]+$/)) {
            return <DeclarationGlobalVariableView globalvariable_id={path} />
        }

        return null;
    }
}
