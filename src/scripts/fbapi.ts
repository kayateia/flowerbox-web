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

	public login(login: string, password: string): Promise<string> {
		return new Promise<string>((res, rej) => {
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
					res(this._token);
				},
				error: (xhr: JQueryXHR, status: string, error: string) => {
					if (xhr.responseJSON)
						rej(xhr.responseJSON.error);
					else
						rej(error);
				}
			};
			$.ajax(settings);
		});
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

	public playerInfo(): Promise<fbapi.Info> {
		return new Promise<fbapi.Info>((res, rej) => {
			let settings = this.getStandardGet(this._url + "user/player-info", res, rej);
			$.ajax(settings);
		});
	}

	public wobInfo(id: number | string): Promise<fbapi.Info> {
		return new Promise<fbapi.Info>((res, rej) => {
			let settings = this.getStandardGet(this._url + "world/wob/" + id + "/info", res, rej);
			$.ajax(settings);
		});
	}

	public wobContents(id: number | string): Promise<fbapi.InfoList> {
		return new Promise<fbapi.InfoList>((res, rej) => {
			let settings = this.getStandardGet(this._url + "world/wob/" + id + "/contents", res, rej);
			$.ajax(settings);
		});
	}

	public wobPropertyValue(wobId: number | string, propertyId: string): Promise<fbapi.Property> {
		return new Promise<fbapi.Property>((res, rej) => {
			let settings = this.getStandardGet(this._url + "world/wob/" + wobId + "/property/" + propertyId, res, rej);
			$.ajax(settings);
		});
	}

	public terminalExec(command: string): Promise<void> {
		return new Promise<void>((res, rej) => {
			let settings = this.getStandardAjax(rej);
			settings.url = this._url + "terminal/command"
				+ "/" + escape(command)
				+ "?datehack=" + new Date().getTime(),
			settings.method = "GET";
			settings.success = res;
			settings.timeout = 30000;
			$.ajax(settings);
		});
	}

	// This one is still done as a callback because of its extra error handling requirements;
	// this isn't a big deal, I think, because it's only used in one place.
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
		$.ajax(settings);
	}
}
