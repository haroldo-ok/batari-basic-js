var OUTPUT_TEMPLATE = Handlebars.compile(
			'{{#each contents}}' +
			'	<div class="panel is-{{type}}"><p class="panel-heading">{{name}}</p>' +
			'		<textArea class="textarea is-family-code" readonly>{{content}}</textArea>' +
			'	</div>' +
			'{{/each}}');
function updateOutput(contents, type) {
	document.getElementById('output').innerHTML = OUTPUT_TEMPLATE({
		contents: Object.entries(contents).map(([name, content]) => ({name, content, type})), 		
	});
}

function clearOutput() {
	updateOutput({'Compiling': 'Please wait...'}, 'warning');
	document.getElementById('downloadROM').disabled = true;
	document.getElementById('error').value = '';
}

function setupStdin(fs, code) {
	var i = 0;
	fs.init(function () { return i < code.length ? code.charCodeAt(i++) : null; });
}

function stderr(asciiCode) {
	var err = document.getElementById('error');
	err.value = err.value + String.fromCharCode(asciiCode);
}
		
function executeApplication() {

	var remainingTries = 3;
	function tryRunning() {
		try {
			clearOutput();
		
			var source = document.getElementById('input').value;
							
			var preprocessed = preprocessBatariBasic(source);				
			console.info('Preprocessing results', preprocessed);
			var preprocessedResults = {'Preprocessed': preprocessed};
			updateOutput(preprocessedResults, 'info');
			
			var assemblyFiles = compileBatariBasic(preprocessed);				
			console.info('Assembly files generated from BASIC source', assemblyFiles);
			updateOutput(Object.assign({}, preprocessedResults, assemblyFiles), 'info');
			
			var assemblyOutputs = assembleDASM(assemblyFiles);
			console.info('Output files generated from assemblies', assemblyOutputs);
			
			var downloadButton = document.getElementById('downloadROM');
			downloadButton.onclick = () => saveAs(new Blob([assemblyOutputs.output]), 'generated-rom.bin');
			downloadButton.disabled = false;
			
			Javatari.fileLoader.loadFromContent('main.bin', assemblyOutputs.output);
		} catch (e) {
			console.error('Error while compiling', e);
			document.getElementById('error').value = e;
		}
	}
	
	var inputArea = document.getElementById('input');
	var inputEvent = _.debounce(tryRunning, 300);
	inputArea.onchange = inputEvent;
	inputArea.onkeyup = inputEvent;
	document.getElementById('compile-button').onclick = inputEvent;
	
	console.log('First try...');
	tryRunning();
	
}

setTimeout(executeApplication, 1000);
