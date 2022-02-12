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

    async test() {
        let req = await fetch(this.baseURL + "test", {
            method: "GET"
        });
        let res = await req.json();
        return await res.success;
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

    async updateHost(hostID, changes) {
        return await this._changeObject("hosts/" + hostID, changes);
    }

    async deleteHost(hostID) {
        return await this._deleteObject("hosts/" + hostID);
    }

    async createHost(obj) {
        return await this._createObject("hosts", obj);
    }

    async getProxies(values) {
        return await this._makeRESTGetRequest("proxies", values);
    }

    async getProxy(proxyID, values) {
        return await this._makeRESTGetRequest("proxies/" + proxyID, values);
    }

    async updateProxy(proxyID, changes) {
        return await this._changeObject("proxies/" + proxyID, changes);
    }

    async deleteProxy(proxyID) {
        return await this._deleteObject("proxies/" + proxyID)
    }

    async getMetrics(values) {
        return await this._makeRESTGetRequest("metrics", values);
    }

    async getMetric(metricID, values) {
        return await this._makeRESTGetRequest("metrics/" + metricID, values);
    }

    async updateMetric(metricID, changes) {
        return await this._changeObject("metrics/" + metricID, changes);
    }

    async deleteMetric(metricID) {
        return await this._deleteObject("metrics/" + metricID);
    }

    async getChecks(values) {
        return await this._makeRESTGetRequest("checks", values);
    }

    async getCheck(checkID, values) {
        return await this._makeRESTGetRequest("checks/" + checkID, values);
    }

    async updateCheck(checkID, changes) {
        return await this._changeObject("checks/" + checkID, changes);
    }

    async deleteCheck(checkID) {
        return await this._deleteObject("checks/" + checkID);
    }

    async getHostTemplates(values) {
        return await this._makeRESTGetRequest("hosttemplates", values);
    }

    async getHostTemplate(hostTemplateID, values) {
        return await this._makeRESTGetRequest("hosttemplates/" + hostTemplateID, values);
    }

    async updateHostTemplate(hostTemplateID, changes) {
        return await this._changeObject("hosttemplates/" + hostTemplateID, changes);
    }

    async deleteHostTemplate(hostTemplateID) {
        return await this._deleteObject("hosttemplates/" + hostTemplateID);
    }

    async getMetricTemplates(values) {
        return await this._makeRESTGetRequest("metrictemplates", values);
    }

    async getMetricTemplate(metricTemplateID, values) {
        return await this._makeRESTGetRequest("metrictemplates/" + metricTemplateID, values);
    }

    async updateMetricTemplate(metricTemplateID, changes) {
        return await this._changeObject("metrictemplates/" + metricTemplateID, changes);
    }

    async deleteMetricTemplate(metricTemplateID) {
        return await this._deleteObject("metrictemplates/" + metricTemplateID);
    }

    async getTimePeriods(values) {
        return await this._makeRESTGetRequest("timeperiods", values);
    }

    async getTimePeriod(timePeriodID, values) {
        return await this._makeRESTGetRequest("timeperiods/" + timePeriodID, values);
    }

    async updateTimePeriod(timePeriodID, changes) {
        return await this._changeObject("timeperiods/" + timePeriodID, changes);
    }

    async deleteTimePeriod(timePeriodID) {
        return await this._deleteObject("timeperiods/" + timePeriodID);
    }

    async getContacts(values) {
        return await this._makeRESTGetRequest("contacts", values);
    }

    async getContact(contactID, values) {
        return await this._makeRESTGetRequest("contacts/" + contactID, values);
    }

    async updateContact(contactID, changes) {
        return await this._changeObject("contacts/" + contactID, changes);
    }

    async deleteContact(contactID) {
        return await this._deleteObject("contacts/" + contactID);
    }

    async getContactGroups(values) {
        return await this._makeRESTGetRequest("contactgroups", values);
    }

    async getContactGroup(contactGroupID, values) {
        return await this._makeRESTGetRequest("contactgroups/" + contactGroupID, values);
    }

    async updateContactGroup(contactGroupID, changes) {
        return await this._changeObject("contactgroups/" + contactGroupID, changes);
    }

    async deleteContactGroup(contactGroupID) {
        return await this._deleteObject("contactgroups/" + contactGroupID);
    }

    async getGlobalVariables(values) {
        return await this._makeRESTGetRequest("globalvariables", values);
    }

    async getGlobalVariable(globalVariableID, values) {
        return await this._makeRESTGetRequest("globalvariables/" + globalVariableID, values);
    }

    async updateGlobalVariable(globalVariableID, changes) {
        return await this._changeObject("globalvariables/" + globalVariableID, changes);
    }

    async deleteGlobalVariable(globalVariableID) {
        return await this._deleteObject("globalvariables/" + globalVariableID);
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

    async _createObject(path, object) {
        let url = new URL(this.baseURL + path);
        let response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(object)
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

    async _changeObject(path, changes) {
        let url = new URL(this.baseURL + path);
        let response = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(changes)
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

    async _deleteObject(path) {
        let url = new URL(this.baseURL + path);
        let response = await fetch(url, {
            method: "DELETE"
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
