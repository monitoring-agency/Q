class SDK {
    constructor() {
        let url = new URL(document.location.origin);
        url.pathname = "/api/v1/";
        this.baseURL = url.toString();
        this.token = "";
        this.loggedOutCallback = null;
    }

    setLoggedOutCallback(callback) {
        this.loggedOutCallback = callback;
    }

    async authenticate(username, password) {
        let response = await fetch(this.baseURL + "authenticate", {
            method: "POST",
            body: JSON.stringify({"username": username, "password": password})
        });
        try {
            return {"data": await response.json(), "status": response.status};
        } catch (SyntaxError) {
            return {"text": await response.text(), "status": response.status};
        }
    }

    logout(success_callback) {
        fetch(this.baseURL + "logout", {
            method: "GET"
        }).then((response) => {
            if(response.status === 200) {
                success_callback();
            }
        });
    }

    async getHost(hostID) {
        return await this._makeRESTGetRequest("hosts/" + hostID);
    }

    async getHosts() {
        return await this._makeRESTGetRequest("hosts");
    }

    async getProxies() {
        return await this._makeRESTGetRequest("proxies");
    }

    async getProxy(proxyID) {
        return await this._makeRESTGetRequest("proxies/" + proxyID);
    }

    async getMetrics() {
        return await this._makeRESTGetRequest("metrics");
    }

    async getMetric(metricID) {
        return await this._makeRESTGetRequest("metrics/" + metricID);
    }

    async getChecks() {
        return await this._makeRESTGetRequest("checks");
    }

    async getCheck(checkID) {
        return await this._makeRESTGetRequest("checks/" + checkID);
    }

    async getHostTemplates() {
        return await this._makeRESTGetRequest("hosttemplates");
    }

    async getHostTemplate(hostTemplateID) {
        return await this._makeRESTGetRequest("hosttemplates/" + hostTemplateID);
    }

    async getMetricTemplates() {
        return await this._makeRESTGetRequest("metrictemplates");
    }

    async getMetricTemplate(metricTemplateID) {
        return await this._makeRESTGetRequest("metrictemplates/" + metricTemplateID);
    }

    async getTimePeriods() {
        return await this._makeRESTGetRequest("timeperiods");
    }

    async getTimePeriod(timePeriodID) {
        return await this._makeRESTGetRequest("timeperiods/" + timePeriodID);
    }

    async getContacts() {
        return await this._makeRESTGetRequest("contacts");
    }

    async getContact(contactID) {
        return await this._makeRESTGetRequest("contacts/" + contactID);
    }

    async getContactGroups() {
        return await this._makeRESTGetRequest("contactgroups");
    }

    async getContactGroup(contactGroupID) {
        return await this._makeRESTGetRequest("contactgroups/" + contactGroupID);
    }

    async getGlobalVariables() {
        return await this._makeRESTGetRequest("globalvariables");
    }

    async getGlobalVariable(globalVariableID) {
        return await this._makeRESTGetRequest("globalvariables/" + globalVariableID);
    }

    async _makeRESTGetRequest(path) {
        let response = await fetch(this.baseURL + path, {
            method: "GET",
        });
        try {
            let ret = await response.json();
            if (response.status === 403)
                this.loggedOutCallback(ret);

            if (ret.success === true)
                return {...ret, "status": response.status};
            else
                return({...ret, "status": response.status});

        } catch (SyntaxError) {
            return({"status": response.status, "text": response.text()});
        }
    }
}

let QWebSDK = new SDK();
export default QWebSDK;
