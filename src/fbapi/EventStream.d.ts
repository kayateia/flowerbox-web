/*
	Flowerbox
	Copyright (C) 2016 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

declare namespace fbapi {

class EventStream extends ModelBase {
	public log: EventStreamItem[];
}

class EventStreamItem {
	public timestamp: number;
	public type: string;		// Comes from World/Wob.ts/EventType
	public tag: string;
	public items: any[];
}

// Rich text with a wob reference.
class WobRef {
	public rich: string;
	public text: string;
	public id: number;
}

// Rich image with a wob property reference.
class ImageRef {
	public rich: string;
	public text: string;
	public id: number;
	public property: string;
}

}
