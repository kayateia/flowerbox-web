/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

@component("command-bar")
class CommandBar extends polymer.Base implements polymer.Element, AppBusListener {
	@property({ type: Object, notify: true })
	public fbapi: Flowerbox;

	@property({ type: Object, notify: true })
	public appbus: AppBus;

	@property({ type: Array, notify: true })
	private _tools: any[] = [
		{ name: "New" },
		{ name: "Delete Selected" }
	];

	public selectedWob(what: number): void {
		console.log("tool-bar noticed a selection", what);
	}

	@observe("fbapi")
	@observe("appbus")
	private _fbApiChanged() {
		if (!this.fbapi || !this.appbus)
			return;

		this.appbus.listen("tool-bar", this);
	}

	public attached() {
	}
}

CommandBar.register();
