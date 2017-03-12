/*
	Flowerbox
	Copyright (C) 2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.
*/

///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

// Doesn't seem to be typings for Cytoscape in npm.
declare let cytoscape: any;

@component("vis-graph")
class VisGraph extends polymer.Base implements polymer.Element {
	@property({ type: Object, notify: true })
	public fbapi: Flowerbox;

	private _cy: any;

	@observe("fbapi")
	private _fbApiChanged() {
		function err(error: string) {
			console.log(err);
		}

		this.fbapi.playerInfo((info: fbapi.Info) => {
			console.log(info);

			let loc: number = info.container;
			this.fbapi.wobInfo(loc, (hereInfo: fbapi.Info) => {
				console.log("Here", hereInfo);
				this.fbapi.wobContents(loc, (contents: fbapi.InfoList) => {
					console.log("Contents", contents);
				}, err);
			}, err);
		}, err);
	}

	private _elements(graph): any {
		var es = [];
		var already = [];
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
					id: room.id,
					label: room.desc
				},
				classes: cl + " type" + room.type
			});
			for (var link of room.exits) {
				if (!done(room.id, link)) {
					es.push({
						group: "edges",
						data: {
							id: room.id + "-" + link,
							source: room.id,
							target: link
						}
					});
					already.push([room.id, link]);
				}
			}
		}
		return es;
	}

	public attached() {
		var w = 15;
		var h = 15;
		var punchpct = 5;
		var graph = maze(w, h, punchpct);

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

		/*cy.on("mouseover", "node", function(e) {
			var node = this;
			$("#desc").text(node.data("label"));
		}); */
	}
}

VisGraph.register();
