/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

@component("fb-app")
class AppComponent extends polymer.Base implements polymer.Element {
	@property({ type: String, notify: true })
	public api: string;

	private _fbapi: Flowerbox;

	@observe("api")
	private _apiChanged() {
		this._fbapi = new Flowerbox(this.api);
	}

	private _showLogin() {
		this.$.loginmodal.show();
	}

	private _login(event: any) {
		let info: LoginInfo = event.detail;
		console.log("login", info.login, "pw", info.password);
		this._fbapi.login(info.login, info.password, (token: string, error: string) => {
			if (token) {
				console.log("got token", token);
				this.$.loginmodal.close();
			} else {
				console.log("got error", error);
				this.$.loginmodal.error(error);
			}
		});
	}
}

AppComponent.register();
