import QWebSDK from "../utils/q_sdk.js";
import {React} from "../react.js";

const sdk = QWebSDK;
let ctx = React.createContext({"sdk": sdk, "static": "/static/"});
export default ctx;
delete document.static;
