/*
	Flowerbox
	Copyright (C) 2016 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

declare namespace fbapi {

// This is what will go inside the encrypted bearer tokens we hand out at login.
class Token {
	public username: string;
	public wobId: number;
	public pwhash: string;
	public creationTime: number;
	public admin: boolean;
}

}
