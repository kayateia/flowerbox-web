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
			success: (data: any, status: string, xhr: JQueryXHR) => {
				this._token = data.token;
				callback(data.token, null);
			},
			error: (xhr: JQueryXHR, status: string, error: string) => {
				callback(null, xhr.responseJSON.error);
			}
		};
		$.ajax(settings);
	}

	public terminalExec(command: string, success: () => void, error: (errorMessage: string) => void) {
		let execUrl: string = this._url + "terminal/command";

		$.ajax({
			url: execUrl
					+ "/" + escape(command)
					+ "?datehack=" + new Date().getTime(),
			headers: {
				"Authorization": "Bearer " + this._token
			},
			method: "GET",
			success: (data: any) => {
				success();
			},
			error: (xhr: JQueryXHR, status: string, errorMsg: string) => {
				if (xhr.responseJSON)
					error(xhr.responseJSON.error);
				else
					error(errorMsg);
			},
			timeout: 30000
		});
	}

	public terminalNewEvents(since: number, success: (data: any) => void, error: (timeout: boolean, errorMessage: string) => void) {
		let pushUrl: string = this._url + "terminal/new-events";

		$.ajax({
			url: pushUrl
				+ "?datehack=" + new Date().getTime()
				+ "&since=" + since,
			headers: {
				"Authorization": "Bearer " + this._token
			},
			method: "GET",
			success: (data: any) => {
				success(data);
			},
			error: (xhr: JQueryXHR, status: string, errorMsg: string) => {
				error(status === "timeout", errorMsg);
			},
			timeout: 12000
		});
	}
}
