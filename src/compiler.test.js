const { preprocessBatariBasic, compileBatariBasic, assembleDASM, fullBuild } = require('./compiler');

const HELLO_WORLD = `
 rem Hello World

 playfield:
................................
......X.X.XXX.X...X...XXX.......
......X.X.X...X...X...X.X.......
......XXX.XX..X...X...X.X.......
......X.X.X...X...X...X.X.......
......X.X.XXX.XXX.XXX.XXX.......
................................
.....X...X.XXX.XX..X...XX.......
.....X...X.X.X.X.X.X...X.X......
.....X.X.X.X.X.XX..X...X.X......
.....XX.XX.XXX.X.X.XXX.XX.......
end

 COLUPF = 22
 COLUBK = 2

mainloop
 drawscreen
 score = score + 1
 goto mainloop
`;

test('preprocesses "Hello World" and returns something.', () => {
	expect(preprocessBatariBasic(HELLO_WORLD)).toBeDefined();
});

test('compiles "Hello World" and returns the generated assemblies.', () => {
	const preprocessedSrc = preprocessBatariBasic(HELLO_WORLD);
	const generatedAssemblies = compileBatariBasic(preprocessedSrc);
	
	expect(Object.keys(generatedAssemblies)).toEqual(['main.asm', '2600basic.h', '2600basic_variable_redefs.h']);
});

test('compiles and assembles "Hello World" and returns the generated binaries.', () => {
	const preprocessedSrc = preprocessBatariBasic(HELLO_WORLD);
	const generatedAssemblies = compileBatariBasic(preprocessedSrc);
	const assembledBinaries = assembleDASM(generatedAssemblies);
	
	expect(Object.keys(assembledBinaries)).toEqual(['output', 'listings', 'symbolmap', 'stats']);
	expect(assembledBinaries.output.length).toEqual(4096);
	expect(assembledBinaries.stats.romSpaceLeft).toEqual(2737);
});

test('fully builds "Hello World" and returns the generated binaries.', () => {
	const binaries = fullBuild(HELLO_WORLD);
	
	expect(Object.keys(binaries)).toEqual(['output', 'listings', 'symbolmap', 'stats']);
	expect(binaries.output.length).toEqual(4096);
	expect(binaries.stats.romSpaceLeft).toEqual(2737);
});