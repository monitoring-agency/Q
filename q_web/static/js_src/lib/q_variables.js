import {React} from "../react.js";
import ctx from "./q_ctx.js";
import TextInput from "./q_input.js";

export default class Variables extends React.Component {
    contextType = ctx;

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="variableContent">
            <table className="variableTable">
                <tr>
                    <td>Key</td>
                    <td>Value</td>
                </tr>
                <tr>
                    <td>
                        <TextInput className="darkInput variableInput" />
                    </td>
                    <td>
                        <TextInput className="darkInput variableInput" />
                    </td>
                </tr>
            </table>
        </div>;
    }
}
