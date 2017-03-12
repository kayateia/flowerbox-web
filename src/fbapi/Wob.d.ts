/*
	Flowerbox
	Copyright (C) 2016 Dove, Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

declare namespace fbapi {

// For returning one property on a wob.
class Property extends ModelBase {
	public id: number;
	public name: string;
	public value: any;
	public perms: string;
	public permseffective: string;
	public ownereffective: number;
	public sub: string;
	public computed: boolean;
}

// For returning one verb on a wob.
class Verb extends ModelBase {
	public id: number;
	public name: string;
	public sigs: string[];
	public code: string;
	public perms: string;
	public permseffective: string;
	public ownereffective: number;
}

// Expected object to be passed in per verb being set.
class VerbSet {
	public sigs: string[];
	public code: string;
}

// Returned from setting multiple verbs. Since verbs may have compilation errors,
// we have to return info about what happened.
class VerbSetErrors extends ModelBase {
	// This will be an object of verb-word to error.
	public verbErrors: any;
}

// For returning the basic info about a wob.
class Info extends ModelBase {
	// Intrinsic properties
	public id: number;
	public base: number;
	public container: number;
	public owner: number;
	public group: number;
	public perms: string;

	// Common named properties
	public name: string;
	public desc: string;
	public globalid: string;

	// List of properties and verbs, by wob ID.
	public properties: AttachedProperty[];
	public verbs: AttachedVerb[];
}

class AttachedItem {
	public sourceid: number;
	public value: string;
	public perms: string;
	public permseffective: string;
	public ownereffective: number;
}

class AttachedProperty extends AttachedItem {
	public blobmimetype: string;
}

class AttachedVerb extends AttachedItem {
}

class IdList extends ModelBase {
	public list: number[];
}

class InfoList extends ModelBase {
	public list: Info[];
}

class InstanceOfResult {
	public id: number;
	public isInstance: boolean;
}

class InstanceOfList extends ModelBase {
	public list: InstanceOfResult[];
}

// Model for setting permissions on a wob, property, or verb.
// The value here is "any" because it could be a numeric property value or a
// diff string ("u+rw").
class PermsSet {
	public perms: any;
}

// Returned by the permission getters and setters to describe permissions on an item.
class PermsStatus extends ModelBase {
	public perms: string;
	public permseffective: string;
	public ownereffective: number;
}

}
