function maze(xsize: number, ysize: number, punchpct: number) {
	// 8, 8, 3
	function rand(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	let grid = [];
	for (let y=0; y<ysize; ++y) {
		let r = [];
		grid.push(r);
		for (let x=0; x<xsize; ++x)
			r.push("#");
	}

	let checks = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];

	function next(curx: number, cury: number, first?: boolean) {
		// Unblock the current space.
		if (first)
			grid[cury][curx] = "+";
		else
			grid[cury][curx] = " ";

		// Pick a random direction that is not:
		// - Outside the map
		// - Behind an already opened wall.
		let dir: number = rand(0, 4);
		let dirarr: number[] = [];
		for (let i=0; i<4; ++i) {
			dirarr.push(dir);
			dir = (dir + 1) % 4;
		}
		for (let d of dirarr) {
			let vx = 0, vy = 0;
			switch (d) {
				case 0: // up
					vy = -1;
					break;
				case 1: // right
					vx = 1;
					break;
				case 2: // down
					vy = 1;
					break;
				case 3: // left
					vx = -1;
					break;
			}

			// Do the coordinates meet the requirements?
			let nx = curx + vx, ny = cury + vy;
			if (nx < 1 || ny < 1 || nx >= (xsize-1) || ny >= (ysize-1)) {
				if (nx === 0 || ny === 0 || nx === (xsize-1) || ny === (ysize-1)) {
					let makeExit: number = rand(0, 100);
					if (makeExit < 30) {
						// Look for nearby exits and don't put two next to each other.
						let skipExit = false;
						for (let check of checks) {
							let cx = nx + check[0];
							let cy = ny + check[1];
							if (cx >= 0 && cy >= 0 && cx <= (xsize-1) && cy <= (ysize-1))
								if (grid[cy][cx] === "+")
									skipExit = true;
						}
						if (!skipExit)
							grid[ny][nx] = "+";
					}
				}
				continue;
			}
			if (grid[ny][nx] === " ")
				continue;
			let borked = false;
			if (rand(0, 100) >= punchpct) {
				for (let check of checks) {
					let px = check[0];
					let py = check[1];
					if ( !((ny+py) === cury && (nx+px) === curx) && grid[ny+py][nx+px] === " ")
						borked = true;
				}
			}

			if (!borked)
				next(nx, ny);
		}
	}

	let x1 = 3;
	let y1 = 0;
	next(x1, y1, true);

	for (let y=0; y<ysize; ++y) {
		let o = "";
		for (let x=0; x<xsize; ++x) {
			o += grid[y][x] /*+ grid[y][x] + grid[y][x] + grid[y][x]*/;
		}
		console.log(o);
		/*console.log(o);
		console.log(o);
		console.log(o);*/
	}

	const roomTypeExit = 0;

	class Room {
		constructor(roomType: number) {
			this.type = roomType;
			this.exits = [];
		}
		public type: number;
		public exits: number[][];
	}

	let rooms: Room[][] = [];

	for (let y=0; y<ysize; ++y) {
		let roomRow: Room[] = [];
		for (let x=0; x<xsize; ++x) {
			if (grid[y][x] === " ") {
				let room = new Room(rand(1, 10));
				roomRow.push(room);
			} else if (grid[y][x] === "+") {
				let room = new Room(0);
				roomRow.push(room);
			} else {
				roomRow.push(null);
			}
		}
		rooms.push(roomRow);
	}

	function coordIn(coord: number[], arr: number[][]): boolean {
		for (let c of arr) {
			if (c[0] === coord[0] && c[1] === coord[1])
				return true;
		}
		return false;
	}

	for (let y=0; y<ysize; ++y) {
		for (let x=0; x<xsize; ++x) {
			let room = rooms[y][x];
			if (room === null)
				continue;
			for (let check of checks) {
				let nx = x + check[0], ny = y + check[1];
				if (nx < 0 || ny < 0 || nx >= xsize || ny >= ysize)
					continue;
				if (rooms[ny][nx] === null)
					continue;
				if (grid[ny][nx] !== " ")
					continue;

				if (coordIn([nx, ny], room.exits))
					continue;

				room.exits.push([nx, ny]);
				let otherRoom = rooms[ny][nx];
				otherRoom.exits.push([x, y]);
			}
		}
	}

	// Forest biome
	let descs = [
		{ type: 1, prob: 15, desc: "You're on a forest path. Dense oak, maple, and other deciduous trees surround you in every direction, though you can see a little of what's under them." },
		{ type: 1, prob: 15, desc: "You're on a forest path. You can hear the wind sighing through the leaves of the canopy above you as they swish around." },
		{ type: 1, prob: 15, desc: "You're on a forest path. A buzzing sound nearby reminds you that the industriousness of insects never stops." },
		{ type: 1, prob: 15, desc: "You're on a forest path. Firm and yet springy dirt clings lightly as you walk along under the branches." },
		{ type: 1, prob: 15, desc: "You're on a forest path. Rocks stick up out of the ground, making this part a little treacherous, but it's passable." },
		{ type: 1, prob: 15, desc: "You're in a clearing within a forest path. This space is filled with waist-high grasses, and is vaguely circular shaped." },
		{ type: 2, prob: 8, desc: "You're on a forest path. A little stone bridge crosses over a stream as it burbles along." },
		{ type: 2, prob: 8, desc: "You're on a forest path. A log has fallen across a small stream here, giving you a place to cross. It appears as though the log has been flattened on top to make passage easier." },
		{ type: 3, prob: 3, desc: "You're on a forest path. Sometimes it feels like something is watching you from under the trees, but you can never see anything when you turn around quickly." },
		{ type: 3, prob: 2, desc: "You're in a clearing within a forest path. A small wooden hut is here, and it looks like it has seen better days." }
	];
	function pickRoom() {
		while (true) {
			for (let d of descs) {
				let v = rand(0, 100);
				if (v < d.prob)
					return d;
			}
		}
	}

	let out = [];
	for (let y=0; y<ysize; ++y) {
		for (let x=0; x<xsize; ++x) {
			let room = rooms[y][x];
			if (room === null)
				continue;

			let desc = pickRoom();
			let descType = desc.type;
			let descText = desc.desc;
			if (room.type === roomTypeExit) {
				descType = roomTypeExit;
				descText = "Exit the zone";
			}
			out.push({
				id: y*xsize+x,
				desc: descText,
				type: descType,
				exit: room.type === roomTypeExit,
				exits: room.exits.map(e => e[1] * xsize + e[0])
			});
			// console.log(x,y,room.id, "exits", room.exits.map(e => rooms[e[1]][e[0]].id + " ("+(e[0])+", "+e[1]+")").join(','));
		}
	}

	return out;
	// console.log(JSON.stringify(out));
}
