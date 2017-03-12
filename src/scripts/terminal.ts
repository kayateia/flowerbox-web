/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

@component("fb-terminal")
class TerminalComponent extends polymer.Base implements polymer.Element {
	@property({ type: Object, notify: true })
	public fbapi: Flowerbox;

	@property({ type: Object, notify: true })
	public appbus: AppBus;

	public attached() {
		termInit(this.$.mainterm);
	}

	@observe("fbapi")
	@observe("appbus")
	private _fbApiChanged() {
		if (this.fbapi && this.appbus)
			termSetApi(this.fbapi, this.appbus);
	}
}

TerminalComponent.register();
