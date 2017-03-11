/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../node_modules/@types/jquery/index.d.ts" />

class Flowerbox {
	private _url: string;

	constructor(url: string) {
		this._url = url;
	}

	public login(login: string, password: string, callback: (token: string, errorMessage: string) => void) {
		let settings: JQueryAjaxSettings = {
			url: this._url + "user/login/" + login,
			method: "POST",
			mimeType: "application/json",
			data: {
				password: password,
				admin: false
			},
			success: (data: any, status: string, xhr: JQueryXHR) => {
				callback(data.token, null);
			},
			error: (xhr: JQueryXHR, status: string, error: string) => {
				callback(null, xhr.responseJSON.error);
			}
		};
		$.ajax(settings);
	}
}
