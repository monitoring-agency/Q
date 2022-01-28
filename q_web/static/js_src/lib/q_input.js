import {React} from "../react.js";

export default function TextInput(props) {
    const {value, setValue, autoFocus, ...otherProps} = props;
    const callback = React.useCallback((element) => {
        if (element && autoFocus) {
            setTimeout(function () {element.focus();}, 10);
        }
    }, []);

    return <input value={value}
                  onChange={(event) => {setValue(event.target.value);}}
                  ref={callback} {...otherProps} />;
}
