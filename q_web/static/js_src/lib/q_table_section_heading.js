import {React} from "../react.js";

export default function TableSectionHeading(props) {
    const {text} = props;
    return <tr>
        <td colSpan="4">
            <h4 className="declarationSectionHeading">{text}</h4>
        </td>
    </tr>;
}
