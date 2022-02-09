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

    async getHost(hostID, values) {
        return await this._makeRESTGetRequest("hosts/" + hostID, values);
    }

    async getHosts(values) {
        return await this._makeRESTGetRequest("hosts", values);
    }

    async getProxies(values) {
        return await this._makeRESTGetRequest("proxies", values);
    }

    async getProxy(proxyID, values) {
        return await this._makeRESTGetRequest("proxies/" + proxyID, values);
    }

    async getMetrics(values) {
        return await this._makeRESTGetRequest("metrics", values);
    }

    async getMetric(metricID, values) {
        return await this._makeRESTGetRequest("metrics/" + metricID, values);
    }

    async getChecks(values) {
        return await this._makeRESTGetRequest("checks", values);
    }

    async getCheck(checkID, values) {
        return await this._makeRESTGetRequest("checks/" + checkID, values);
    }

    async getHostTemplates(values) {
        return await this._makeRESTGetRequest("hosttemplates", values);
    }

    async getHostTemplate(hostTemplateID, values) {
        return await this._makeRESTGetRequest("hosttemplates/" + hostTemplateID, values);
    }

    async getMetricTemplates(values) {
        return await this._makeRESTGetRequest("metrictemplates", values);
    }

    async getMetricTemplate(metricTemplateID, values) {
        return await this._makeRESTGetRequest("metrictemplates/" + metricTemplateID, values);
    }

    async getTimePeriods(values) {
        return await this._makeRESTGetRequest("timeperiods", values);
    }

    async getTimePeriod(timePeriodID, values) {
        return await this._makeRESTGetRequest("timeperiods/" + timePeriodID, values);
    }

    async getContacts(values) {
        return await this._makeRESTGetRequest("contacts", values);
    }

    async getContact(contactID, values) {
        return await this._makeRESTGetRequest("contacts/" + contactID, values);
    }

    async getContactGroups(values) {
        return await this._makeRESTGetRequest("contactgroups", values);
    }

    async getContactGroup(contactGroupID, values) {
        return await this._makeRESTGetRequest("contactgroups/" + contactGroupID, values);
    }

    async getGlobalVariables(values) {
        return await this._makeRESTGetRequest("globalvariables", values);
    }

    async getGlobalVariable(globalVariableID, values) {
        return await this._makeRESTGetRequest("globalvariables/" + globalVariableID, values);
    }

    async _makeRESTGetRequest(path, values) {
        let url = new URL(this.baseURL + path);
        if (values !== undefined) {
            for (let v of values) {
                url.searchParams.append("values", v);
            }
        }

        let response = await fetch(url, {
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
