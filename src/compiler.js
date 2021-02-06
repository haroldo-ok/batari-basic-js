(function(){
	
	const preprocess = require('./third-party/bbpreprocess');
	const bb2600basic = require('./third-party/bb2600basic');
	const DASM = require('./third-party/dasm');
	
	const DEFAULT_INCLUDES = require('./fsContents');
	
	// Just a noop placeholder, for now.
	const logger = { log: (message, data) => null };
	
	function prepareException(mainMessage, errors) {
		var joinedErrors = errors.map(err => 
			err.length ? err 
			: err.msg ? `Line ${err.line}: ${err.msg}`
			: JSON.stringify(err) 
		).join('\n');
		var err = new Error(mainMessage + '\n' + joinedErrors);
		err.errors = errors;
		return err;
	}

	function setupStdin(fs, code) {
		var i = 0;
		fs.init(function () { return i < code.length ? code.charCodeAt(i++) : null; });
	}

	function preprocessBatariBasic(code) {
		var bbout = "";
		function addbbout_fn(s) {
			bbout += s;
			bbout += "\n";
		}
		
		var errors = [];
		function adderror_fn(s) {
			errors.push(s);
		}
		
		var BBPRE = preprocess({
			noInitialRun: true,
			print: addbbout_fn,
			printErr: adderror_fn,
			noFSInit: true,
		});
		var FS = BBPRE['FS'];
		setupStdin(FS, code);
		BBPRE.callMain([]);
		if (errors.length) {
			throw prepareException("Errors while preprocessing.", errors);
		}
		logger.log("preprocess " + code.length + " -> " + bbout.length + " bytes");
		return bbout;
	}
	
	function execMain(mod, args) {
		var run = mod.callMain || mod.run; // TODO: run?
		run(args);
	}
	
	// To obtain the JSON: JSON.stringify(Object.fromEntries(Object.keys(FS.lookupPath('/share/includes', {}).node.contents).map(name => ([name, FS.readFile('/share/includes/' + name, {encoding: 'utf8'})]))))
	
	function compileBatariBasic(code) {
		// stdout
		var asmout = "";
		function addasmout_fn(s) {
			asmout += s;
			asmout += "\n";
		}
		// stderr
		var re_err1 = /[(](\d+)[)]:?\s*(.+)/;
		var errors = [];
		var errline = 0;
		function match_fn(s) {
			logger.log(s);
			var matches = re_err1.exec(s);
			if (matches) {
				errline = parseInt(matches[1]);
				errors.push({
					line: errline,
					msg: matches[2]
				});
			}
		}

		var destpath = 'main.asm';			
		{
			var BB = bb2600basic({
				noInitialRun: true,
				//logReadFiles:true,
				print: addasmout_fn,
				printErr: match_fn,
				noFSInit: true,
				TOTAL_MEMORY: 64 * 1024 * 1024,
			});
			var FS = BB['FS'];
			FS.mkdir('share');
			FS.mkdir('share/includes');
			Object.entries(DEFAULT_INCLUDES).forEach(([name, content]) => {
				FS.writeFile('share/includes/' + name, content, { encoding: 'utf8' });
			});
			
			setupStdin(FS, code);
			FS.writeFile('main.bas', code, { encoding: 'utf8' });
			execMain(BB, ["-i", "/share", 'main.bas']);
			if (errors.length) {
				throw prepareException("Errors while compiling.", errors);
			}
				
			// build final assembly output from include file list
			var includesout = FS.readFile("includes.bB", { encoding: 'utf8' });
			var redefsout = FS.readFile("2600basic_variable_redefs.h", { encoding: 'utf8' });
			var includes = includesout.trim().split("\n");
			var combinedasm = "";
			var splitasm = asmout.split("bB.asm file is split here");
			for (var _i = 0, includes_1 = includes; _i < includes_1.length; _i++) {
				var incfile = includes_1[_i];
				var inctext;
				if (incfile == "bB.asm")
					inctext = splitasm[0];
				else if (incfile == "bB2.asm")
					inctext = splitasm[1];
				else
					inctext = FS.readFile("/share/includes/" + incfile, { encoding: 'utf8' });
				logger.log(incfile, inctext.length);
				combinedasm += "\n\n;;;" + incfile + "\n\n";
				combinedasm += inctext;
			}
			
			/*
			// TODO: ; bB.asm file is split here
			putWorkFile(destpath, combinedasm);
			putWorkFile("2600basic.h", FS.readFile("/share/includes/2600basic.h"));
			putWorkFile("2600basic_variable_redefs.h", redefsout);
			*/
				
			return {
				'main.asm': combinedasm,
				'2600basic.h': FS.readFile("/share/includes/2600basic.h", { encoding: 'utf8' }),
				'2600basic_variable_redefs.h': redefsout
			};
		}
	}
	
	// test.c(6) : warning 85: in function main unreferenced local variable : 'x'
	// main.a (4): error: Unknown Mnemonic 'xxx'.
	// at 2: warning 190: ISO C forbids an empty source file
	var re_msvc = /[/]*([^( ]+)\s*[(](\d+)[)]\s*:\s*(.+?):\s*(.*)/;
	var re_msvc2 = /\s*(at)\s+(\d+)\s*(:)\s*(.*)/;
	function msvcErrorMatcher(errors) {
		return function (s) {
			var matches = re_msvc.exec(s) || re_msvc2.exec(s);
			if (matches) {
				var errline = parseInt(matches[2]);
				errors.push({
					line: errline,
					path: matches[1],
					msg: matches[4]
				});
			}
			else {
				logger.log(s);
			}
		};
	}
	
	// TODO: "of" doesn't work in MSIE
	var re_crlf = /\r?\n/;
	//    1   %line 16+1 hello.asm
	var re_lineoffset = /\s*(\d+)\s+[%]line\s+(\d+)\+(\d+)\s+(.+)/;

	function parseDASMListing(code, listings, errors, unresolved) {
		// TODO: this gets very slow
		//        4  08ee		       a9 00	   start      lda	#01workermain.js:23:5
		var lineMatch = /\s*(\d+)\s+(\S+)\s+([0-9a-f]+)\s+([?0-9a-f][?0-9a-f ]+)?\s+(.+)?/i;
		var equMatch = /\bequ\b/i;
		var macroMatch = /\bMAC\s+(.+)?/i;
		var macrolines = [];
		var lastline = 0;
		var macros = {};
		for (var _i = 0, _a = code.split(re_crlf); _i < _a.length; _i++) {
			var line = _a[_i];
			var linem = lineMatch.exec(line);
			if (linem && linem[1]) {
				var linenum = parseInt(linem[1]);
				var filename = linem[2];
				var offset = parseInt(linem[3], 16);
				var insns = linem[4];
				var restline = linem[5];
				if (insns && insns.startsWith('?'))
					insns = null;
				// inside of a file?
				var lst = listings[filename];
				if (lst) {
					var lines = lst.lines;
					// look for MAC statement
					var macmatch = macroMatch.exec(restline);
					if (macmatch) {
						macros[macmatch[1]] = { line: parseInt(linem[1]), file: linem[2].toLowerCase() };
					}
					else if (insns && !restline.match(equMatch)) {
						lines.push({
							line: linenum,
							offset: offset,
							insns: insns,
							iscode: restline[0] != '.'
						});
					}
					lastline = linenum;
				}
				else {
					// inside of macro or include file
					if (insns && linem[3] && lastline > 0) {
						lines.push({
							line: lastline + 1,
							offset: offset,
							insns: null
						});
					}
					// inside of macro?
					var mac = macros[filename.toLowerCase()];
					if (insns && mac) {
						macrolines.push({
							filename: mac.file,
							line: mac.line + linenum,
							offset: offset,
							insns: insns
						});
					}
				}
				// TODO: better symbol test (word boundaries)
				// TODO: ignore IFCONST and IFNCONST usage
				for (var key in unresolved) {
					var l = restline || line;
					var pos = l.indexOf(key);
					if (pos >= 0) {
						var cmt = l.indexOf(';');
						if (cmt < 0 || cmt > pos) {
							// make sure identifier is flanked by non-word chars
							if (/\w+/.test(key) && new RegExp("\\b" + key + "\\b").test(key)) {
								errors.push({
									path: filename,
									line: linenum,
									msg: "Unresolved symbol '" + key + "'"
								});
							}
						}
					}
				}
			}
			var errm = re_msvc.exec(line);
			if (errm) {
				errors.push({
					path: errm[1],
					line: parseInt(errm[2]),
					msg: errm[4]
				});
			}
		}
		// TODO: use macrolines
	}

	function assembleDASM(assemblyFiles) {
		var re_usl = /(\w+)\s+0000\s+[?][?][?][?]/;
		var unresolved = {};
		var errors = [];
		var errorMatcher = msvcErrorMatcher(errors);
		function match_fn(s) {
			// TODO: what if s is not string? (startsWith is not a function)
			var matches = re_usl.exec(s);
			if (matches) {
				var key = matches[1];
				if (key != 'NO_ILLEGAL_OPCODES') { // TODO
					unresolved[matches[1]] = 0;
				}
			}
			else if (s.startsWith("Warning:")) {
				errors.push({ line: 0, msg: s.substr(9) });
			}
			else if (s.startsWith("unable ")) {
				errors.push({ line: 0, msg: s });
			}
			else {
				errorMatcher(s);
			}
		}
		var Module = DASM({
			noInitialRun: true,
			print: match_fn
		});
		var FS = Module['FS'];

		Object.entries(assemblyFiles).forEach(([name, content]) => FS.writeFile(name, content, { 'encoding': 'utf8' }));
		/*
		populateFiles(step, FS, {
			mainFilePath: 'main.a'
		});
		*/
		
		var binpath = 'main.bin';
		var lstpath = 'main.lst';
		var sympath = 'main.sym';
		execMain(Module, ['main.asm', '-f3',
			"-l" + lstpath,
			"-o" + binpath,
			"-s" + sympath]);
		var alst = FS.readFile(lstpath, { 'encoding': 'utf8' });
		// parse main listing, get errors and listings for each file
		var listings = {};
		for (var _i = 0, _a = Object.keys(assemblyFiles); _i < _a.length; _i++) {
			var path = _a[_i];
			listings[path] = { lines: [] };
		}
		parseDASMListing(alst, listings, errors, unresolved);
		if (errors.length) {
			throw prepareException("Errors while assembling.", errors);
		}
		// read binary rom output and symbols
		var aout, asym;
		aout = FS.readFile(binpath);
		try {
			asym = FS.readFile(sympath, { 'encoding': 'utf8' });
		} catch (e) {
			logger.log(e);
			errors.push({ line: 0, msg: "No symbol table generated, maybe segment overflow?" });
			if (errors.length) {
				throw prepareException("Errors while reading symbol table.", errors);
			}
		}
		
		var symbolmap = {};
		for (var _b = 0, _c = asym.split("\n"); _b < _c.length; _b++) {
			var s = _c[_b];
			var toks = s.split(/\s+/);
			if (toks && toks.length >= 2 && !toks[0].startsWith('-')) {
				symbolmap[toks[0]] = parseInt(toks[1], 16);
			}
		}
		
		if (errors.length) {
			throw prepareException("Errors while assembling.", errors);
		}
		
		return {
			output: aout,
			listings: listings,
			symbolmap: symbolmap
		};
	}
	
	module.exports = { preprocessBatariBasic, compileBatariBasic, assembleDASM };

})();