import {React, toast} from "../../react.js";
import ctx from "../../lib/q_ctx.js";

export default class DeclarationGlobalVariableIndexView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "globalvariables": []
        }
    }

    updateGlobalVariables() {
        this.context.sdk.getGlobalVariables().then((v) => {
            if(v.status === 200) {
                this.setState({"globalvariables": v.data});
            }
        });
    }

    componentWillMount() {
        this.updateGlobalVariables();
    }

    render() {
        let rows = [];
        for(let globalvariable of this.state.globalvariables) {
            rows.push(<tr className="clickable"
                          onClick={
                              this.context.setPath.bind(null, {"path": ["declaration", "globalvariables", globalvariable.id]})
                          } >
                <td><input type="checkbox" /></td>
                <td>{globalvariable.id}</td>
                <td>{globalvariable.key}</td>
                <td>{globalvariable.value}</td>
                <td>{globalvariable.comment}</td>
                <td>
                    <button className="colorless button"
                            onClick={(v) => {
                                v.stopPropagation();
                                this.context.sdk.deleteGlobalVariable(globalvariable.id).then((res) => {
                                    if(res.status === 200) {
                                        toast.success("Global variable deleted", {autoClose: 1000})
                                        this.updateGlobalVariables();
                                    } else {
                                        toast.error(res.message);
                                    }
                                });
                             }} >
                        <img src={this.context.static + "img/delete.svg"}
                             alt="Delete" />
                    </button>
                </td>
            </tr>);
        }

        let noGlobalVariables;
        let table;
        if(this.state.globalvariables.length === 0) {
            noGlobalVariables = "There are no global variables.";
        } else {
            table = <table>
                <tr>
                    <th className="smallCell"><input type="checkbox" /></th>
                    <th className="smallCell">ID</th>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Comment</th>
                    <th className="normalCell">Delete</th>
                </tr>
                {rows}
            </table>;
        }

        return <div className="declarationContent">
                <div className="declarationHeader">
                    <div className="flexRow">
                        <button className="buttonLink"
                                onClick={
                                    this.context.setPath.bind(null, {"path": ["declaration", "globalvariables", "create"]})
                                } >
                            Add Global Variable
                        </button>
                    </div>
                </div>
                <div className="declarationList">
                    {noGlobalVariables}
                    {table}
                </div>
            </div>
    }
}
