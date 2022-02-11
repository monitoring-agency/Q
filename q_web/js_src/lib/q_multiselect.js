import {React} from "../react.js";

import Select, {components} from "https://cdn.skypack.dev/react-select";
import {SortableContainer, SortableElement, SortableHandle} from "https://cdn.skypack.dev/react-sortable-hoc";


function arrayMove(array, from, to) {
    let slicedArray = array.slice();
    slicedArray.splice(to < 0 ? array.length + to : to, 0, slicedArray.splice(from, 1)[0]);
    return slicedArray;
}

const SortableMultiValue = SortableElement((props) => {
    const onMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
    };
    const innerProps = {onMouseDown};
    return <components.MultiValue {...props} innerProps={innerProps}/>;
});

const SortableMultiValueLabel = SortableHandle(
  (props) => <components.MultiValueLabel {...props} />
);

const SortableSelect = SortableContainer(Select);

export default class MultiSelectSort extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: [],
        }
    }

    componentDidUpdate() {
        if("value" in this.props && this.props.value !== this.state.value) {
            this.setState({"value": this.props.value});
        }
    }

    render() {
        return (
            <SortableSelect
                useDragHandle
                axis="xy"
                onSortEnd={({oldIndex, newIndex}) => {
                    let newValue = arrayMove(this.state.value, oldIndex, newIndex);
                    if ("onChange" in this.props) {
                        this.props.onChange(newValue);
                    }
                }}
                distance={4}
                getHelperDimensions={({node}) => node.getBoundingClientRect()}
                isMulti={true}
                isClearable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                options={this.props.options}
                value={this.state.value}
                onChange={(v) => {
                    if ("onChange" in this.props) {
                        this.props.onChange(v);
                    }
                }}
                components={{
                    MultiValue: SortableMultiValue,
                    MultiValueLabel: SortableMultiValueLabel
                }}
                closeMenuOnSelect={false}
            />
        );
    }
}