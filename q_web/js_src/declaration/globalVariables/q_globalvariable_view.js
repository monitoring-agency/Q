import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";


export default class DeclarationGlobalVariableView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {

        }

        this.createGlobalVariable = this.createGlobalVariable.bind(this);
    }

    createGlobalVariable() {

    }

    componentWillMount() {

    }

    render() {
        return null;
    }
}
