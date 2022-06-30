
const _sectionSelectors = (
	['article', 'section'].flatMap(a => 
		[0, 1, 2].flatMap(b => 
			`:scope ${'> div '.repeat(b)}> ${a}`
		)
	)
);
const _headerSelectors = (
	[true, false].flatMap(a => 
		[1, 2, 3, 4, 5, 6].flatMap(b => 
			`:scope ${a ? '> header ' : ''}> h${b}`
		)
	)
);
const exploreDocumentStructure = (parent) => {
	return _sectionSelectors
		.flatMap(selector => [...parent.querySelectorAll(selector)])
		.map(section => {
			let header;
			for (const selector of _headerSelectors) {
				const element = section.querySelector(selector);
				if (element) {
					header = element;
					break;
				}
			}

			let id = section.id;
			if (!id) {
				if (header) {
					id = header.id;
					if (!id) {
						id = header.innerText.replace(/\s/, '_');
						section.id = id;
					}
				}
			}
			if (!id) {
				return;
			}

			const children = exploreDocumentStructure(section).filter(x => x);

			return {
				section,
				header,
				children,
			}
		})
	;
};

////////////////////////////////////////////////////////////////////////////////

const structure = exploreDocumentStructure(document.querySelector('main article'));

// Generate nav hash links for main level sections
const navLinksListElement = document.querySelector('nav ul');
structure.forEach(entry => {
	const li = document.createElement('li');
	const a = document.createElement('a');
	a.href = '#' + entry.section.id;
	a.innerText = entry.header.innerText;
	li.appendChild(a);
	navLinksListElement.appendChild(li);
});
