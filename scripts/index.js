
const settings = {
	darkMode: false,
	points: 4,
	showResults: true,
	showDetails: true,
	delay: 0,
	stepByStep: false,
	expandTable: false,
};

const loadSettings = () => {
	Object.assign(settings, JSON.parse(localStorage.getItem('settings') || '{}'));
}
const saveSettings = (data) => {
	localStorage.setItem('settings', JSON.stringify(data || settings));
}

loadSettings();

const section = document.querySelector('section#calculator');

if (settings.expandTable) {
	section.classList.toggle('expand', true);
	section.querySelectorAll('.expandable').forEach(parent => {
		const child = parent.firstElementChild;
		new ResizeObserver(() => {
			parent.style.height = child.clientHeight + 16 + 'px';
			if (window.outerWidth < child.clientWidth) {
				child.style.left = 0;
				child.style.transform = 'translate(0, -50%)';
			}
			else {
				child.style.left = '';
				child.style.transform = '';
			}
		}).observe(child);
	})
}

const calculator = new NewtonInterpolationCalculator(section, settings);

////////////////////////////////////////////////////////////////////////////////

{
	const pointsInput = section.querySelector('.controls input[name=points]');
	pointsInput.value = settings.points;
	pointsInput.addEventListener('change', async function () {
		settings.points = parseInt(this.value);
		calculator.prepare(settings);
		await calculator.stepController.terminate();
		if (settings.showResults) {
			calculator.solve();
		}
	});

	const showResultsInput = section.querySelector('.controls input[name=showResults]');
	showResultsInput.checked = settings.showResults;
	showResultsInput.addEventListener('change', async function () {
		calculator.settings.showResults = settings.showResults = this.checked;
		await calculator.stepController.terminate();
		if (settings.showResults) {
			calculator.solve();
		}
	});

	const showDetailsInput = section.querySelector('.controls input[name=showDetails]');
	showDetailsInput.checked = settings.showDetails;
	showDetailsInput.addEventListener('change', async function() {
		calculator.settings.showDetails = settings.showDetails = this.checked;
		await calculator.stepController.terminate();
		if (settings.showResults) {
			calculator.solve();
		}
	});

	const stepByStepInput = section.querySelector('.controls input[name=stepByStep]');
	stepByStepInput.checked = settings.stepByStep;
	stepByStepInput.addEventListener('change', async function() {
		calculator.settings.stepByStep = settings.stepByStep = this.checked;
		if (this.checked) {
			nextStepButton.style.display = 'inline-block';
			if (settings.showResults) {
				calculator.solve();
			}
		}
		else {
			nextStepButton.style.display = 'none';
			calculator.stepController.drain();
		}
	});

	const nextStepButton = section.querySelector('.controls button[name=nextStep]');
	nextStepButton.addEventListener('click', () => {
		calculator.stepController.next();
	});
	nextStepButton.style.display = settings.stepByStep ? 'inline-block' : 'none';

	const element = section.querySelector('.controls input[name=delay]');
	element.value = settings.delay;
	element.addEventListener('change', async function () {
		calculator.settings.delay = settings.delay = parseInt(this.value);
	});
}

////////////////////////////////////////////////////////////////////////////////

const examplesSection = document.querySelector('#examples');
examplesSection.querySelector('.controls button[name=generateRandom]').addEventListener('click', async function () {
	calculator.useRandom();
});

////////////////////////////////////////////////////////////////////////////////

// Load examples
const examplesListElement = document.querySelector('#examples ul');
fetch(examplesDataURI).then(r => r.json()).then(json => {
	for (const example of json.examples) {
		let nameHTML = example.name;
		if (!nameHTML) {
			if (example.function) {
				nameHTML = `f(x) = ${example.function} &nbsp; (x: ${example.points.map(p => {
					if (Array.isArray(p.x)) {
						const { _, element, top, bottom } = Fraction.prepareHTMLElement();
						top.innerText = p.x[0];
						bottom.innerText = p.x[1];
						return element.outerHTML;
					}
					else {
						return p.x;
					}
				}).join(', ')})`;
			}
			else {
				nameHTML = example.points.map(p => {
					let html = 'f(';
					if (Array.isArray(p.x)) {
						const { _, element, top, bottom } = Fraction.prepareHTMLElement();
						top.innerText = p.x[0];
						bottom.innerText = p.x[1];
						html += element.outerHTML;
					}
					else {
						html += p.x;
					}
					html += ') = ';
					if (Array.isArray(p.y)) {
						const { _, element, top, bottom } = Fraction.prepareHTMLElement();
						top.innerText = p.y[0];
						bottom.innerText = p.y[1];
						html += element.outerHTML;
					}
					else {
						html += p.y;
					}
					return html;
				}).join(';&nbsp;&nbsp; ');
			}
		}
		const li = document.createElement('li');
		li.classList.toggle('math', true);
		li.innerHTML = nameHTML;
		li.addEventListener('click', () => {
			section.querySelector('.controls input[name=points]').value = example.points.length;
			calculator.usePreset(example);
		})
		examplesListElement.appendChild(li);
	}
});

// Experimental table expanding
section.querySelector('thead').addEventListener('click', (e) => {
	if (e.ctrlKey) {
		settings.expandTable = !settings.expandTable;
		saveSettings();
		location.reload();
	}
})

// Dark mode
if (settings.darkMode) {
	document.body.classList.toggle('dark', true);
}
else {
	document.body.classList.toggle('dark', false);
}
document.querySelector('#darkMode').addEventListener('click', (e) => {
	document.body.classList.toggle('dark');
	settings.darkMode = document.body.classList.contains('dark');
	saveSettings(e.ctrlKey ? {darkMode: settings.darkMode} : undefined);
});

// Use random points and calculate interpolation
(async () => {
	calculator.prepare();
	await calculator.useRandom();
	
	// Solve anyway for first time to have the table populated
	if (!settings.showResults) {
		calculator.solve();
	}
})();
