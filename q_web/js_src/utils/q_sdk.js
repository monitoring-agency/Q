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
        return await this._makeRESTGetRequest("hosts/" + hostID, undefined, values);
    }

    async getHosts(page, values, query) {
        return await this._makeRESTGetRequest("hosts", page, values, query);
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

    async getProxies(page, values, query) {
        return await this._makeRESTGetRequest("proxies", page, values, query);
    }

    async getProxy(proxyID, values) {
        return await this._makeRESTGetRequest("proxies/" + proxyID, undefined, values);
    }

    async updateProxy(proxyID, changes) {
        return await this._changeObject("proxies/" + proxyID, changes);
    }

    async deleteProxy(proxyID) {
        return await this._deleteObject("proxies/" + proxyID);
    }

    async createProxy(obj) {
        return await this._createObject("proxies", obj);
    }

    async getObservables(page, values, query) {
        return await this._makeRESTGetRequest("observables", page, values, query);
    }

    async getObservable(observableID, values) {
        return await this._makeRESTGetRequest("observables/" + observableID, undefined, values);
    }

    async updateObservable(observableID, changes) {
        return await this._changeObject("observables/" + observableID, changes);
    }

    async deleteObservable(observableID) {
        return await this._deleteObject("observables/" + observableID);
    }

    async createObservable(obj) {
        return await this._createObject("observables", obj);
    }

    async getChecks(page, values, query) {
        return await this._makeRESTGetRequest("checks", page, values, query);
    }

    async getCheck(checkID, values) {
        return await this._makeRESTGetRequest("checks/" + checkID, undefined, values);
    }

    async updateCheck(checkID, changes) {
        return await this._changeObject("checks/" + checkID, changes);
    }

    async deleteCheck(checkID) {
        return await this._deleteObject("checks/" + checkID);
    }

    async createCheck(obj) {
        return await this._createObject("checks", obj);
    }

    async getHostTemplates(page, values, query) {
        return await this._makeRESTGetRequest("hosttemplates", page, values, query);
    }

    async getHostTemplate(hostTemplateID, values) {
        return await this._makeRESTGetRequest("hosttemplates/" + hostTemplateID, undefined, values);
    }

    async updateHostTemplate(hostTemplateID, changes) {
        return await this._changeObject("hosttemplates/" + hostTemplateID, changes);
    }

    async deleteHostTemplate(hostTemplateID) {
        return await this._deleteObject("hosttemplates/" + hostTemplateID);
    }

    async createHostTemplate(obj) {
        return await this._createObject("hosttemplates", obj);
    }

    async getObservableTemplates(page, values, query) {
        return await this._makeRESTGetRequest("observabletemplates", page, values, query);
    }

    async getObservableTemplate(observableTemplateID, values) {
        return await this._makeRESTGetRequest("observabletemplates/" + observableTemplateID, undefined, values);
    }

    async updateObservableTemplate(observableTemplateID, changes) {
        return await this._changeObject("observabletemplates/" + observableTemplateID, changes);
    }

    async deleteObservableTemplate(observableTemplateID) {
        return await this._deleteObject("observabletemplates/" + observableTemplateID);
    }

    async createObservableTemplate(obj) {
        return await this._createObject("observabletemplates", obj);
    }

    async getTimePeriods(page, values, query) {
        return await this._makeRESTGetRequest("timeperiods", page, values, query);
    }

    async getTimePeriod(timePeriodID, values) {
        return await this._makeRESTGetRequest("timeperiods/" + timePeriodID, undefined, values);
    }

    async updateTimePeriod(timePeriodID, changes) {
        return await this._changeObject("timeperiods/" + timePeriodID, changes);
    }

    async deleteTimePeriod(timePeriodID) {
        return await this._deleteObject("timeperiods/" + timePeriodID);
    }

    async createTimePeriod(obj) {
        return await this._createObject("timeperiods", obj);
    }

    async getContacts(page, values, query) {
        return await this._makeRESTGetRequest("contacts", page, values, query);
    }

    async getContact(contactID, values) {
        return await this._makeRESTGetRequest("contacts/" + contactID, undefined, values);
    }

    async updateContact(contactID, changes) {
        return await this._changeObject("contacts/" + contactID, changes);
    }

    async deleteContact(contactID) {
        return await this._deleteObject("contacts/" + contactID);
    }

    async createContact(obj) {
        return await this._createObject("contacts", obj);
    }

    async getContactGroups(page, values, query) {
        return await this._makeRESTGetRequest("contactgroups", page, values, query);
    }

    async getContactGroup(contactGroupID, values) {
        return await this._makeRESTGetRequest("contactgroups/" + contactGroupID, undefined, values);
    }

    async updateContactGroup(contactGroupID, changes) {
        return await this._changeObject("contactgroups/" + contactGroupID, changes);
    }

    async deleteContactGroup(contactGroupID) {
        return await this._deleteObject("contactgroups/" + contactGroupID);
    }

    async createContactGroup(obj) {
        return await this._createObject("contactgroups", obj);
    }

    async getGlobalVariables(page, values, query) {
        return await this._makeRESTGetRequest("globalvariables", page, values, query);
    }

    async getGlobalVariable(globalVariableID, values) {
        return await this._makeRESTGetRequest("globalvariables/" + globalVariableID, undefined, values);
    }

    async updateGlobalVariable(globalVariableID, changes) {
        return await this._changeObject("globalvariables/" + globalVariableID, changes);
    }

    async deleteGlobalVariable(globalVariableID) {
        return await this._deleteObject("globalvariables/" + globalVariableID);
    }

    async createGlobalVariable(obj) {
        return await this._createObject("globalvariables", obj);
    }

    async updateDeclaration(proxies) {
        let url = new URL(this.baseURL + "updateDeclaration");
        let response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                "proxies": proxies
            })
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

    async generateProxyConfiguration(proxy_id) {
        let url = new URL(this.baseURL + "generateProxyConfiguration");
        let response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                "proxy": proxy_id
            })
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

    async _makeRESTGetRequest(path, page, values, query) {
        let url = new URL(this.baseURL + path);
        if (values !== undefined) {
            for (let v of values) {
                url.searchParams.append("values", v);
            }
        }
        if (page !== undefined) {
            url.searchParams.append("p", page);
        }

        if(query !== undefined) {
            url.searchParams.append("query", query);
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
