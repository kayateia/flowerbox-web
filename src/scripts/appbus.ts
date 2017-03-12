/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

interface AppBusListener {
	moveNotification?(what: fbapi.WobRef, from: fbapi.WobRef, to: fbapi.WobRef): void;
	selectedWob?(what: number): void;
}

interface AppBusDictionary {
	[index: string]: AppBusListener
}

class AppBus {
	private _listeners: any;

	constructor() {
		this._listeners = {};
	}

	public listen(id: string, target: AppBusListener) {
		this._listeners[id] = target;
	}

	public moveNotification(what: fbapi.WobRef, from: fbapi.WobRef, to: fbapi.WobRef): void {
		for (let lid in this._listeners) {
			if (this._listeners[lid].moveNotification)
				this._listeners[lid].moveNotification(what, from, to);
		}
	}

	public selectedWob(what: number): void {
		for (let lid in this._listeners) {
			if (this._listeners[lid].selectedWob)
				this._listeners[lid].selectedWob(what);
		}
	}
}
