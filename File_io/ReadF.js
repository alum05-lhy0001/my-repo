(function () {
	// Holds extracted text when a PDF is loaded so the Search button can use it
	let currentPdfText = '';
	let currentFilename = '';

	function normalizeText(s) {
		if (!s) return '';
		// remove soft hyphens and hyphenation at line breaks, normalize all whitespace to single spaces
		return s
			.replace(/\u00AD/g, '')
			.replace(/-\s*\r?\n\s*/g, '')
			.replace(/\r?\n/g, ' ')
			.replace(/\u00A0/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	async function fetchAndDisplay(filename) {
		currentPdfText = '';
		currentFilename = filename;
		const output = document.getElementById('output');
		const embed = document.getElementById('embed');
		const link = document.getElementById('link');
		output.textContent = '';
		embed.innerHTML = '';
		link.innerHTML = '';
		const searchBtn = document.getElementById('searchBtn');
		if (searchBtn) searchBtn.disabled = true;

		try {
			const res = await fetch(filename);
			if (!res.ok) throw new Error('Failed to fetch file: ' + res.status + ' ' + res.statusText);

			const contentType = (res.headers.get('content-type') || '').toLowerCase();

			// Treat common text types as text
			if (contentType.startsWith('text/') || filename.match(/\.(txt|java|js|html|css|md|csv|log)$/i)) {
				const text = await res.text();
				output.textContent = text;
				currentPdfText = normalizeText(text); // allow searching text files too
				if (searchBtn) searchBtn.disabled = false;
			} else if (contentType.includes('application/pdf') || filename.match(/\.(pdf)$/i)) {
				// PDF: fetch blob, but verify it's actually a PDF (starts with %PDF).
				// If it's not real PDF content (e.g., a plain text file named .pdf), show as text.
				const blob = await res.blob();
				const headerBuf = await blob.slice(0, 4).arrayBuffer();
				const header = new TextDecoder('utf-8', { fatal: false }).decode(headerBuf);
				if (header.startsWith('%PDF')) {
					const url = URL.createObjectURL(blob);
					embed.innerHTML = `<iframe src="${url}" style="width:100%;height:80vh;border:0"></iframe>`;

					// Try extracting text using PDF.js if available
					if (window.pdfjsLib) {
						try {
							const arrayBuf = await blob.arrayBuffer();
							const pdf = await window.pdfjsLib.getDocument({ data: arrayBuf }).promise;
							let fullText = '';
							for (let i = 1; i <= pdf.numPages; i++) {
								const page = await pdf.getPage(i);
								const txt = await page.getTextContent();
								const pageText = txt.items.map(s => s.str).join(' ');
								fullText += '\n\n--- Page ' + i + ' ---\n' + pageText;
							}
							// normalize extracted text to make search more robust
							const norm = normalizeText(fullText);
							currentPdfText = norm;
							// show a portion of extracted text in output for search and preview
							output.textContent = norm.slice(0, 10000) + (norm.length > 10000 ? '\n\n[truncated]' : '');
							const searchBtn = document.getElementById('searchBtn');
							if (searchBtn) searchBtn.disabled = false;
						} catch (e) {
							// PDF.js not available or extraction failed — leave embed and allow download
							const url = URL.createObjectURL(blob);
							link.innerHTML = `<a href="${url}" download="${filename}">Download ${filename}</a>`;
						}
					} else {
						// no pdf.js — just allow download
						const url = URL.createObjectURL(blob);
						link.innerHTML = `<a href="${url}" download="${filename}">Download ${filename}</a>`;
					}
				} else {
					// Not a real PDF; try to decode as text and display
					try {
						const text = await blob.text();
						output.textContent = text;
						currentPdfText = normalizeText(text);
						const searchBtn = document.getElementById('searchBtn');
						if (searchBtn) searchBtn.disabled = false;
					} catch (e) {
						const url = URL.createObjectURL(blob);
						link.innerHTML = `<a href="${url}" download="${filename}">Download ${filename}</a>`;
					}
				}
			} else if (contentType.startsWith('image/') || filename.match(/\.(png|jpe?g|gif|webp)$/i)) {
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				embed.innerHTML = `<img src="${url}" style="max-width:100%;height:auto">`;
			} else {
				// Unknown binary: provide download link
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				link.innerHTML = `<a href="${url}" download="${filename}">Download ${filename}</a>`;
			}
		} catch (err) {
			output.textContent = 'Error: ' + err.message;
		}
	}

	function init() {
		const params = new URLSearchParams(window.location.search);
		const defaultFile = 'test1.pdf';
		const filename = params.get('file') || defaultFile;

		const filenameLabel = document.getElementById('filename');
		if (filenameLabel) filenameLabel.textContent = filename;

		const loadBtn = document.getElementById('loadBtn');
		const fileInput = document.getElementById('fileInput');
		const searchBtn = document.getElementById('searchBtn');
		const searchInput = document.getElementById('searchInput');

		if (loadBtn && fileInput) {
			loadBtn.addEventListener('click', () => {
				const f = fileInput.value.trim() || defaultFile;
				if (filenameLabel) filenameLabel.textContent = f;
				// disable search until content loaded
				if (searchBtn) searchBtn.disabled = true;
				fetchAndDisplay(f);
			});
		}

		if (searchBtn && searchInput) {
			searchBtn.addEventListener('click', () => {
				const q = searchInput.value.trim();
				doSearch(q);
			});
			// allow Enter key in search input
			searchInput.addEventListener('keyup', (e) => {
				if (e.key === 'Enter') {
					const q = searchInput.value.trim();
					doSearch(q);
				}
			});
		}

		// initial display
		fetchAndDisplay(filename);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

// Search currentPdfText and display results (simple substring search)
// placed inside the IIFE so it can access `currentPdfText`
(function () {
	function doSearch(query) {
		const output = document.getElementById('output');
		if (!query) {
			output.textContent = 'Enter search text.';
			return;
		}
		if (!currentPdfText) {
			output.textContent = 'No document text available. Load a file first.';
			return;
		}

		const q = query.trim().toLowerCase();
		const text = currentPdfText;

		const findMatches = (needle) => {
			const results = [];
			let idx = 0;
			while ((idx = text.indexOf(needle, idx)) !== -1) {
				const start = Math.max(0, idx - 60);
				const end = Math.min(text.length, idx + needle.length + 60);
				const snippet = text.substring(start, end).replace(/\s+/g, ' ');
				results.push({ idx, snippet });
				idx += needle.length;
				if (results.length >= 200) break;
			}
			return results;
		};

		let results = findMatches(q);

		// If no exact match for full query, try tokenized search (any token)
		if (results.length === 0 && q.indexOf(' ') !== -1) {
			const tokens = q.split(/\s+/).filter(Boolean);
			const tokenResults = [];
			tokens.forEach(t => {
				const r = findMatches(t);
				if (r.length) tokenResults.push({ token: t, matches: r });
			});
			if (tokenResults.length) {
				let out = `No exact match for "${query}". Showing matches for tokens:\n\n`;
				tokenResults.forEach(tr => {
					out += `Token: "${tr.token}" — ${tr.matches.length} match${tr.matches.length>1?'es':''}\n`;
					tr.matches.slice(0, 10).forEach((m, i) => {
						out += `  ${i+1}. ...${m.snippet.replace(new RegExp(tr.token, 'ig'), (m)=>`[${m}]`)}...\n`;
					});
					out += '\n';
				});
				output.textContent = out;
				return;
			}
		}

		if (results.length === 0) {
			output.textContent = `No matches for "${query}"`;
			return;
		}

		let out = `Found ${results.length} match${results.length>1?'es':''} for "${query}"\n\n`;
		results.forEach((r, i) => {
			const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
			out += `${i+1}. ...${r.snippet.replace(re, (m)=>`[${m}]`)}...\n\n`;
		});
		output.textContent = out;
	}

	// expose for debug if needed but keep scope private
	window.doSearch = doSearch;
})();
