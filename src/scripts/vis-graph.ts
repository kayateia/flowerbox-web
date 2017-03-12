/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

// Doesn't seem to be typings for Cytoscape in npm.
declare let cytoscape: any;

interface Room {
	id: number;
	name: string;
	desc: string;
	type: number;
	exit: boolean;
	exits: number[];
}

@component("vis-graph")
class VisGraph extends polymer.Base implements polymer.Element, AppBusListener {
	@property({ type: Object, notify: true })
	public fbapi: Flowerbox;

	@property({ type: Object, notify: true })
	public appbus: AppBus;

	private _cy: any;
	private _graph: Room[];
	private _player: number;
	private _curRoom: number;

	public moveNotification(what: fbapi.WobRef, from: fbapi.WobRef, to: fbapi.WobRef): void {
		console.log("vis-graph noticed a movement", what, from, to);
		if (what.id === this._player)
			this._fbApiChanged();
	}

	@observe("fbapi")
	@observe("appbus")
	private _fbApiChanged() {
		if (!this.fbapi || !this.appbus)
			return;

		let debug: boolean = false;

		let map: Room[] = [];
		let updater = async () => {
			let info: fbapi.Info = await this.fbapi.playerInfo();
			if (debug)
				console.log(info);

			if (info.container === this._curRoom)
				return;
			this._player = info.id;
			this._curRoom = info.container;

			let exitInfo: fbapi.Info = await this.fbapi.wobInfo("@exit");
			if (debug)
				console.log("Exit:", exitInfo);

			let exploreNext = async (loc: number, remainingDist: number) => {
				if (remainingDist <= 0) {
					map.push({
						id: loc,
						name: "*",
						desc: "*",
						type: 1,
						exit: true,
						exits: []
					});
					return;
				}

				let hereInfo: fbapi.Info = await this.fbapi.wobInfo(loc);
				if (debug)
					console.log("Here", hereInfo);

				let contents: fbapi.InfoList = await this.fbapi.wobContents(loc);
				if (debug)
					console.log("Contents", contents);

				// Find all the exits.
				let exits: fbapi.Info[] = [];
				for (let i of contents.list) {
					if (i.base === exitInfo.id)
						exits.push(i);
				}

				// Number or string. We have to resolve them.
				let exitTargets: number[] = [];
				for (let ex of exits) {
					try {
						let targetId: fbapi.Property = await this.fbapi.wobPropertyValue(ex.id, "target");
						if (targetId) {
							let resolvedExit: fbapi.Info = await this.fbapi.wobInfo(targetId.value);
							exitTargets.push(resolvedExit.id);
						}
					} catch(err) {
						console.log("Can't get target for wob #" + ex.id);
					}
				}

				map.push({
					id: loc,
					name: hereInfo.name,
					desc: hereInfo.desc,
					type: loc === info.container ? 2 : 0,
					exit: false,
					exits: exitTargets
				});

				for (let exId of exitTargets) {
					// If we've reached an old room, we need to check to see if it was a
					// too-far-terminal. If so, nuke it and try again. Otherwise, skip.
					let oldRooms = map.filter(r => r.id === exId);
					if (oldRooms.length > 0) {
						if (oldRooms[0].name !== "*") {
							if (debug)
								console.log(loc, "SKIPPING", exId, "as it's not a * room", remainingDist);
							continue;
						} else {
							if (debug)
								console.log(loc, "GIVING", exId, "another chance", remainingDist);
							map = map.filter(r => r.id !== exId);
						}
					} else {
						if (debug)
							console.log(loc, "EXPLORING", exId, remainingDist);
					}

					await exploreNext(exId, remainingDist - 1);
				}
			};

			let loc: number = info.container;
			await exploreNext(loc, 5);
		};
		updater()
			.then(() => {
				if (debug)
					console.log("Final map:", JSON.stringify(map, null, 4));
				this._graph = map;
				this.attached();

				this.appbus.listen("vis-graph", this);
			})
			.catch((err: string) => {
				console.log("Error updating graph vis:", err);
			});
	}

	private _elements(graph): any {
		let idMap: any = {};

		// We have to map these for use in edges below.
		for (let room of graph) {
			idMap[room.id] = room.name + " (#" + room.id + ")";
		}

		let es = [];
		let already = [];
		function done(l1, l2) {
			for (var l of already) {
				if ((l[0] === l1 && l[1] === l2)
					|| (l[0] === l2 && l[1] === l1)) {
					return true;
				}
			}
			return false;
		}
		for (var room of graph) {
			var cl = "";
			if (room.exit)
				cl = "exit";
			es.push({
				group: "nodes",
				data: {
					id: idMap[room.id],
					wobId: room.id,
					label: room.name,
					desc: room.desc
				},
				classes: cl + " type" + room.type
			});
			for (var link of room.exits) {
				if (!done(room.id, link)) {
					es.push({
						group: "edges",
						data: {
							id: room.id + "-" + link,
							source: idMap[room.id],
							target: idMap[link]
						}
					});
					already.push([room.id, link]);
				}
			}
		}
		// console.log("Finished graph:", JSON.stringify(es, null, 4));
		return es;
	}

	public attached() {
		/*var w = 15;
		var h = 15;
		var punchpct = 5;
		var graph = maze(w, h, punchpct); */
		let graph = this._graph;
		if (!graph)
			return;

		this._cy = cytoscape({
			container: this.$.cy,
			boxSelectionEnabled: false,
			autounselectify: true,
			layout: {
				name: "cose-bilkent"
				// name: "dagre"
				// name: "breadthfirst"
				// name: layout
			},
			style: cytoscape.stylesheet()
			 	.selector("node")
					.css({
						"background-color": "#ad1a66",
						"content": "data(id)"
					})
				.selector("edge")
					.css({
						"width": 3,
						"line-color": "#ad1a66",
						"curve-style": "bezier"
					})
				.selector(".type0") // exit
					.css({
						"background-color": "#661aad",
						"shape": "diamond",
						"border-color": "#661a1a"
					})
				.selector(".type1")
					.css({
						"background-color": "#ad1a66",
						"shape": "circle",
						"border-color": "#661a1a"
					})
				.selector(".type2")
					.css({
						"background-color": "#66ad1a",
						"shape": "square"
					})
				.selector(".type3")
					.css({
						"background-color": "#66adad",
						"shape": "triangle"
					}),
			elements: this._elements(graph)
		});

		let that = this;
		/*this._cy.on("mouseover", "node", function(e) {
			let node = this;
			that.$.desc.innerText = node.data("desc");
		}); */

		this._cy.on("click", "node", function(e) {
			let node = this;
			if (that.appbus)
				that.appbus.selectedWob(node.data("wobId"));
		});
	}
}

VisGraph.register();
