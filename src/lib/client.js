/**
 * © Awesome Developers UG, 2016
 *
 * You may use this software for your own purposes, as you wish. You may not use it directly for any commercial purpose,
 * that is, you are not allowed to distribute this code in any direct for-profit manner.
 */

import axios from 'axios';
import querystring from 'querystring';

export default class Client {

    constructor(rootUrl, fdeskUrl, fdeskProductField) {
        this.root = rootUrl;
        this.fdeskUrl = fdeskUrl;
        this.fdeskProductField = fdeskProductField;
        axios.defaults.withCredentials = true;
        axios.defaults.baseURL = this.root;
    }

    login(user, pass) {
        return axios.post('/rest/user/login', querystring.stringify({
            login: user,
            password: pass
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    getTickets(fdeskId) {
        return axios.get(`/rest/issue?filter="${this.fdeskUrl}${fdeskId}"`);
    }

    getUrlForIssue(id) {
        return `${this.root}/issue/${id}`;
    }

    getProjects() {
        return axios.get('/rest/project/all');
    }

    getProducts(project) {
        return axios.get(`/rest/issue/intellisense?project=${project}&filter=${this.fdeskProductField}:&optionsLimit=100`);
    }

    getUser() {
        return axios.get('/rest/user/current');
    }

    createTicket(project, product, summary, description, fdeskId) {
        // Create the issue first
        return axios.put('/rest/issue', querystring.stringify({
            project: project,
            summary: summary,
            description: description
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((result) => {
            let split = result.headers.location.split('/');
            let issueId = split[split.length-1];

            // Apply command to link to freshdesk
            let query = {
                comment: `${this.fdeskUrl}${fdeskId}`
            };
            if (product != null && product != ' -- None --')
                query.command = `${this.fdeskProductField} ${product}`;
            return axios.post(`/rest/issue/${issueId}/execute`, querystring.stringify(query));
        })
    }

    linkTicket(issueId, fdeskId) {
        return axios.post(`/rest/issue/${issueId}/execute`, querystring.stringify({
            comment: `${this.fdeskUrl}${fdeskId}`
        }))
    }
}