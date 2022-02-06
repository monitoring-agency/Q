import {React} from "../react.js";

export default class SliderInput extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let className;
        if(this.props.value === true) {
            className = "slider on";
        } else {
            className = "slider off";
        }
        return <div className={className}
                    onClick={() => {
                        this.props.onChange(this.props.value !== true);
                    }} >
            <div className="sliderButton" />
        </div>;
    }
}
