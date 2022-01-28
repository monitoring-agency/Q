import {React} from "../react.js";

export default function TextArea(props) {
    const {value, setValue, autoFocus, ...otherProps} = props;
    const callback = React.useCallback((element) => {
        if (element && autoFocus) {
            setTimeout(function () {element.focus();}, 10);
        }
    }, []);

    return <textarea value={value}
                     onChange={(event) => {setValue(event.target.value);}}
                     ref={callback}
                     {...otherProps} />;
}
