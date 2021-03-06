utils.continuousBinarySearch = (callback, min = -Infinity, max = Infinity, iterations = 20) => {
	/*
	`min` and `max` are the boundaries. `max` can be infinite.
	`callback` should return a negative if too small and a positive if too big.
	*/
	if(max === Infinity) {
		let i = 1;
		while(max === Infinity) {
			if(callback(i) > 0) {
				max = i;
			}
			i *= 2;
		}
	}
	if(min === -Infinity) {
		let i = -1;
		while(min === -Infinity) {
			if(callback(i) < 0) {
				min = i;
			}
			i *= 2;
		}
	}

	for(let i = 0; i < iterations; i ++) {
		const mid = (max + min) / 2;
		const result = callback(mid);
		if(result < 0) { min = mid; }
		else if(result > 0) { max = mid; }
		else { return mid; }
	}
	return (max + min) / 2;
};
testing.addUnit("utils.continuousBinarySearch()", {
	"can do a binary search in the basic case": () => {
		const callback = (x) => x ** 2 - 2;
		const result = utils.continuousBinarySearch(callback, 0, 2);
		expect(result).toApproximatelyEqual(Math.SQRT2, 1e-5);
	},
	"can do a binary search when the upper bound is infinite": () => {
		const callback = (x) => x ** 2 - 2;
		const result = utils.continuousBinarySearch(callback, 0);
		expect(result).toApproximatelyEqual(Math.SQRT2, 1e-5);
	},
	"can do a binary search when the lower bound is infinite": () => {
		const callback = (x) => x ** 2 - 2;
		const result = utils.continuousBinarySearch(callback);
		expect(result).toApproximatelyEqual(Math.SQRT2, 1e-5);
	},
});


utils.drawArrow = (c, arrow, position, positionType = "head") => {
	const TO_RADIANS = Math.PI / 180;
	const pointLength = Math.max(10, arrow.magnitude * 1/5);
	if(positionType === "head") {
		c.save();
		c.translate(position.x, position.y);
		c.rotate(TO_RADIANS * (-arrow.angle + 90));
		c.strokeLine(0, 0, pointLength, pointLength);
		c.strokeLine(0, 0, -pointLength, pointLength);
		c.strokeLine(0, 0, 0, arrow.magnitude);
		c.restore();
	}
	else if(positionType === "tail") {
		utils.drawArrow(c, arrow, position.add(arrow), "head");
	}
};


utils.weightedVectorAverage = (vectors, weights) => {
	return vectors.map((v, i) => v.multiply(weights[i])).reduce((a, b) => a.add(b)).divide(weights.sum());
};
