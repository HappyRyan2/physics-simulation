class Segment extends Shape {
	constructor() {
		super();
		if([...arguments].every(v => typeof v === "number")) {
			const [x1, y1, x2, y2] = arguments;
			this.endpoint1 = new Vector(x1, y1);
			this.endpoint2 = new Vector(x2, y2);
		}
		else if([...arguments].every(v => v instanceof Vector)) {
			[this.endpoint1, this.endpoint2] = arguments;
		}
		else if(arguments[0] instanceof Line) {
			const [line] = arguments;
			this.endpoint1 = new Vector(line.endpoint1);
			this.endpoint2 = new Vector(line.endpoint2);
		}
	}
}

testing.addUnit("Segment constructor", {
	"can create a Segment from two endpoints": () => {
		const segment = new Segment(
			new Vector(1, 2),
			new Vector(3, 4)
		);
		expect(segment.endpoint1).toEqual(new Vector(1, 2));
		expect(segment.endpoint2).toEqual(new Vector(3, 4));
	},
	"can create a Segment from four numbers representing the x and y positions of the endpoints": () => {
		const segment = new Segment(1, 2, 3, 4);
		expect(segment.endpoint1).toEqual(new Vector(1, 2));
		expect(segment.endpoint2).toEqual(new Vector(3, 4));
	},
	"can create a Segment from a Line": () => {
		const line = new Line(1, 2, 3, 4);
		const segment = new Segment(line);
		expect(segment.endpoint1).toEqual(new Vector(1, 2));
		expect(segment.endpoint2).toEqual(new Vector(3, 4));
	}
});
