import {React} from "../react.js";
import ctx from "../lib/q_ctx.js";

import TextInput from "../lib/q_input.js";

const e = React.createElement;

export default class LoginView extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "username": "",
            "password": "",
            "login_error": ""
        };
        this.login = this.login.bind(this);
    }

    login() {
        let authPromise = this.context.sdk.authenticate(this.state.username, this.state.password);
        authPromise.then((ret) => {
            if(ret.status === 200) {
                this.context.setPath({"path": [""], "logged_in": true});
            } else {
                if ("data" in ret) {
                    this.setState({"login_error": ret.data.message});
                } else {
                    console.log(ret);
                }
            }
        });
    }

    render() {
        return (
            <div className="fullscreen centered">
                <div className="flexColumn centered">
                    <div className="loginBox">
                        <h1>Login</h1>
                        <p>{this.state.login_error}</p>
                        <table className="table">
                            <tbody>
                            <tr>
                                <td>Username</td>
                                <td>
                                    <TextInput className="darkInput normalCell" required="required" value={this.state.username}
                                        autoFocus="true" onChange={(value) => {this.setState({"username": value})}} />
                                </td>
                            </tr>
                            <tr>
                                <td>Password</td>
                                <td>
                                    <TextInput className="darkInput normalCell" required="required" value={this.state.password}
                                        onChange={(value) => {this.setState({"password": value})}} type="password" />
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <button className="button" onClick={this.login}>Login</button>
                    </div>
                </div>
            </div>
        );
    }
}
