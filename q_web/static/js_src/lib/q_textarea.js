import {React} from "../react.js";

export default function TextArea(props) {
    const {value, onChange, autoFocus, ...otherProps} = props;
    const callback = React.useCallback((element) => {
        if (element && autoFocus) {
            setTimeout(function () {element.focus();}, 10);
        }
    }, []);

    return <textarea value={value}
                     onChange={(event) => {onChange(event.target.value);}}
                     ref={callback}
                     {...otherProps} />;
}
