/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

// Fired as detail with the "login" event.
interface LoginInfo {
	login: string;
	password: string;
}

@component("login-modal")
class LoginModal extends polymer.Base implements polymer.Element {
	public show() {
		this._clear();
		this.$.loginmodal.active = true;
	}

	public error(message: string) {
		this.$.message.innerText = message;
		this.$.spinner.active = false;
	}

	public hide() {
		this._clear();
		this.$.loginmodal.active = false;
	}

	private _clear() {
		this.error("");
		this.$.login.value = "";
		this.$.password.value = "";
	}

	private _loginClick() {
		let info: LoginInfo = {
			login: this.$.login.value,
			password: this.$.password.value
		};

		this.$.spinner.active = true;
		this.fire("login", info);
	}

	private _cancelClick() {
		this.$.loginmodal.active = false;
	}
}

LoginModal.register();
