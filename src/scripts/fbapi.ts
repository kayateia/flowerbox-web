/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../node_modules/@types/jquery/index.d.ts" />

class Flowerbox {
	private _url: string;
	private _token: string;

	constructor(url: string, token?: string) {
		this._url = url;
		this._token = token;
	}

	public get url(): string {
		return this._url;
	}

	public get token(): string {
		return this._token;
	}

	public login(login: string, password: string, callback: (token: string, errorMessage: string) => void) {
		let settings: JQueryAjaxSettings = {
			url: this._url + "user/login/" + login,
			method: "POST",
			dataType: "json",
			data: {
				password: password,
				admin: false
			},
			success: (data: fbapi.LoginResult, status: string, xhr: JQueryXHR) => {
				this._token = data.token;
				callback(data.token, null);
			},
			error: (xhr: JQueryXHR, status: string, error: string) => {
				callback(null, xhr.responseJSON.error);
			}
		};
		$.ajax(settings);
	}

	// Returns headers to be used on logged-in calls.
	private getHeaders(): any {
		return {
			"Authorization": "Bearer " + this._token
		};
	}

	// Returns a settings block for a standard AJAX request while logged in. Fill in extra members as needed.
	private getStandardAjax(err: (errorMessage: string) => void): JQueryAjaxSettings {
		let settings: JQueryAjaxSettings = {
			headers: this.getHeaders(),
			error: (xhr: JQueryXHR, status: string, errorMsg: string) => {
				if (xhr.responseJSON)
					err(xhr.responseJSON.error);
				else
					err(errorMsg);
			}
		};
		return settings;
	}

	private getStandardGet(url: string, success: (info: any) => void, error: (errorMessage: string) => void): JQueryAjaxSettings {
		let settings = this.getStandardAjax(error);
		settings.url = url;
		settings.method = "GET";
		settings.success = success;
		return settings;
	}

	public playerInfo(success: (info: fbapi.Info) => void, error: (errorMessage: string) => void) {
		let settings = this.getStandardGet(this._url + "user/player-info", success, error);
		$.ajax(settings);
	}

	public wobInfo(id: number, success: (info: fbapi.Info) => void, error: (errorMessage: string) => void) {
		let settings = this.getStandardGet(this._url + "world/wob/" + id + "/info", success, error);
		$.ajax(settings);
	}

	public wobContents(id: number, success: (info: fbapi.InfoList) => void, error: (errorMessage: string) => void) {
		let settings = this.getStandardGet(this._url + "world/wob/" + id + "/contents", success, error);
		$.ajax(settings);
	}

	public terminalExec(command: string, success: () => void, error: (errorMessage: string) => void) {
		let settings = this.getStandardAjax(error);
		settings.url = this._url + "terminal/command";
			+ "/" + escape(command)
			+ "?datehack=" + new Date().getTime(),
		settings.method = "GET";
		settings.success = success;
		settings.timeout = 30000;
		$.ajax(settings);
	}

	public terminalNewEvents(since: number, success: (data: fbapi.EventStream) => void, error: (timeout: boolean, errorMessage: string) => void) {
		let settings = this.getStandardAjax(null);
		settings.url = this._url + "terminal/new-events"
			+ "?datehack=" + new Date().getTime()
			+ "&since=" + since;
		settings.method = "GET";
		settings.success = success;
		settings.error = (xhr: JQueryXHR, status: string, errorMsg: string) => {
			error(status === "timeout", errorMsg);
		};
		settings.timeout = 12000;
	}
}
