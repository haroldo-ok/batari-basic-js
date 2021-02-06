const { preprocessBatariBasic, compileBatariBasic, assembleDASM } = require('./compiler');

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
	
	const names = Object.keys(generatedAssemblies);
	console.warn('Names', names);
	expect(names).toEqual(['main.asm', '2600basic.h', '2600basic_variable_redefs.h']);
});