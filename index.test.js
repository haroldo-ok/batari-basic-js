const bBasic = require('.');

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

test('fully builds "Hello World" and returns the generated binaries.', () => {
	const binaries = bBasic(HELLO_WORLD);
	
	expect(Object.keys(binaries)).toEqual(['output', 'listings', 'symbolmap', 'stats']);
	expect(binaries.output.length).toEqual(4096);
});