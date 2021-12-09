(() => {
	const tests = {};
	let numWithoutTests = 0;
	for(const scenario of scenarios) {
		const testData = SCENARIO_TEST_DATA[scenario.name] ?? "";
		const testName = `correctly simulates the scenario '${scenario.name}'`;
		if(testData !== "") {
			tests[testName] = () => {
				const parsed = JSON.parse(testData);
				const world = PhysicsWorld.fromString(testData);
				for(let i = 0; i < parsed.history.length; i ++) {
					world.update();
					for(const [j, obj] of world.objects.entries()) {
						const expectedPosition = parsed.history[i][j];
						expect(obj.position.x).toApproximatelyEqual(expectedPosition.x);
						expect(obj.position.y).toApproximatelyEqual(expectedPosition.y);
						expect(obj.rotation).toApproximatelyEqual(expectedPosition.r);
					}
				}
			};
		}
		else {
			numWithoutTests ++;
		}
	}
	testing.addUnit("PhysicsWorld.update()", tests);
	testing.units[testing.units.length - 1].isSlow = true;
	if(numWithoutTests !== 0) {
		console.warn(`${numWithoutTests} scenarios are untested.`);
	}
}) ();

const updateScenarioTest = (scenarioName, numFrames) => {
	const world = findScenario(scenarioName).world();
	numFrames ??= JSON.parse(SCENARIO_TEST_DATA[scenarioName]).history.length;
	world.beginRecording();
	for(let i = 0; i < numFrames; i ++) {
		world.update();
	}
	return world.historyString();
};
