/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

interface AppBusListener {
	moveNotification(what: fbapi.WobRef, from: fbapi.WobRef, to: fbapi.WobRef): void;
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
			this._listeners[lid].moveNotification(what, from, to);
		}
	}
}
