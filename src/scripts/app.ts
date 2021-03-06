/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="../../node_modules/@types/js-cookie/index.d.ts" />

interface AppCookie {
	login: string;
	token: string;
	admin: boolean;
}

@component("fb-app")
class AppComponent extends polymer.Base implements polymer.Element {
	@property({ type: String, notify: true })
	public api: string;

	private _fbapi: Flowerbox;
	private _bus: AppBus;
	private _cookie: AppCookie;

	constructor() {
		super();

		// Look for login cookies. If we find one, just use that. Otherwise, the user will
		// have to manually login to get a cookie.
		let appCookie = Cookies.get("flowerbox");
		if (appCookie) {
			this._cookie = JSON.parse(appCookie);
			this._apiChanged();
		} else {
			this._cookie = {
				login: "Not logged in",
				token: null,
				admin: false
			};
		}
	}

	@observe("api")
	private _apiChanged() {
		this._fbapi = new Flowerbox(this.api, this._cookie ? this._cookie.token : null);
		this._bus = new AppBus();
	}

	private _showLogin() {
		this.$.loginmodal.show();
	}

	private _login(event: any) {
		let info: LoginInfo = event.detail;
		this._fbapi.login(info.login, info.password)
			.then((token: string) => {
				console.log("got token", token);
				this.$.loginmodal.close();

				this._cookie = {
					login: info.login,
					token: token,
					admin: false
				};
				Cookies.set("flowerbox", JSON.stringify(this._cookie));
			})
			.catch((error: string) => {
				console.log("got error", error);
				this.$.loginmodal.error(error);
			});
	}
}

AppComponent.register();
