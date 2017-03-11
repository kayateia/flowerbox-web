/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

@component("fb-app")
class AppComponent extends polymer.Base implements polymer.Element {
	@property({ type: String })
	public api: string;

	private _login(event: any) {
		let info: LoginInfo = event.detail;
		console.log("login", info.login, "pw", info.password);
	}
}

AppComponent.register();
