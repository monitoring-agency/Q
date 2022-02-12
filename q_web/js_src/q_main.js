import {React, ReactDOM, ToastContainer, toast} from "./react.js";
import ctx from "./lib/q_ctx.js";

import LoginView from "./auth/q_authenticate.js";
import MenuView from "./generic/q_menu.js";
import DeclarationRouter from "./declaration/q_declaration_router.js";

const e = React.createElement;


class Main extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
        this.state = {
            "path": window.location.hash.substr(2).split("/"),
            "logged_in": false
        };

        this.setPath = this.setPath.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);

        window.addEventListener('hashchange', () => {
            this.setPath({"path": window.location.hash.substr(2).split("/")});
        });
    }

    setPath(state) {
        if (state.path !== undefined) {
            let path = state.path;
            localStorage.setItem("q_path_current", JSON.stringify(path));
            let newHref = window.location.href;
            if (newHref.includes("#")) {
                newHref = newHref.split("#")[0];
            }
            newHref += "#/" + path.join("/");
            window.location.href = newHref;
        }
        this.setState(state);
    }

    componentDidMount() {
        document.body.id = "";
        let preloader = document.getElementById("preloader");
        preloader.remove();

        this.context.sdk.test().then((v) => {
            this.setState({"logged_in": v});
        });

        this.context.sdk.setLoggedOutCallback((ret) => {
            this.setPath({"path": ["login"], "logged_in": false});
            console.log("QWebSDK: Logged out");
        });
    }

    render() {
        let t = <ToastContainer position="top-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                theme="colored"
                                pauseOnHover />

        // Login router
        if (!this.state.logged_in || this.state.path.length === 1 && this.state.path[0] === "login") {
            return e(ctx.Provider, {value: {...this.context, "setPath": this.setPath}}, [
                t,
                e(LoginView, {"setPath": this.setPath})
            ]);
        }

        // Broken router
        if(this.state.path.length === 0) {
            return null;
        }

        // Declaration router
        let content;
        let path = this.state.path[0];
        if (path === "declaration") {
            content = e(DeclarationRouter, {"path": this.state.path.slice(1)});
        }

        localStorage.setItem("q_path_current", JSON.stringify(this.state.path));
        // Create side menu and embed content
        return e(ctx.Provider, {value: {...this.context, "setPath": this.setPath}}, [
            t,
            e(MenuView),
            e("div", {className: "content", id: "content"}, content)
        ]);
    }
}

ReactDOM.render(e(Main), document.getElementById("root"));
