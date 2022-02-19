import {React} from "../react.js";
import ctx from "./q_ctx.js";

export default class Modal extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
    }

    render() {
        if(!this.props.show) {
            return null;
        }

        return <div className="modalBackground"
                    onClick={(v) => {
                        v.stopPropagation();
                        this.props.onClose();
                    }} >
            <div className="modalBox" onClick={(v) => v.stopPropagation()}>
                <img className="buttonImg modalClose"
                     src={this.context.static + "img/x.svg"}
                     alt="Close"
                     onClick={(v) => {
                         v.stopPropagation();
                         this.props.onClose();
                     }} />
                <div className="modal">
                    {this.props.content}
                </div>
            </div>
        </div>;
    }
}
