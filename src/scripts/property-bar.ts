/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

@component("property-bar")
class PropertyBar extends polymer.Base implements polymer.Element, AppBusListener {
	@property({ type: Object, notify: true })
	public fbapi: Flowerbox;

	@property({ type: Object, notify: true })
	public appbus: AppBus;

	@property({ type: Array, notify: true })
	private _properties: any[] = [
		{ name: "No item selected", value: "" }
	];

	@property({ type: Array, notify: true })
	private _contents: any[] = [
	];

	public selectedWob(what: number): void {
		console.log("property-bar noticed a selection", what);
		(async () => {
			let info: fbapi.Info = await this.fbapi.wobInfo(what);
			this.set("_properties", [
				{ name: "Id", value: info.id },
				{ name: "Name", value: info.name },
				{ name: "Description", value: info.desc }
			]);

			let contents: fbapi.InfoList = await this.fbapi.wobContents(what);
			this.set("_contents", contents.list);
		})()
			.catch((err: string) => {
				this.set("_properties", [
					{ name: "Error loading properties", value: err }
				]);
			})
	}

	@observe("fbapi")
	@observe("appbus")
	private _fbApiChanged() {
		if (!this.fbapi || !this.appbus)
			return;

		this.appbus.listen("property-bar", this);
	}

	public attached() {
	}
}

PropertyBar.register();
