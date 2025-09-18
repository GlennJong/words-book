
const fs = require('fs');
const path = require('path');

const freqPath = path.join(__dirname, 'en.txt');
const lines = fs.readFileSync(freqPath, 'utf8').split(/\r?\n/);

// 分組
const groups = {};
const specialCharPattern = /[~!@#$%^&*()_\-+=\/?<>,.;:'"\\|{}\[\]]/;
for (const line of lines) {
	if (!line.trim()) continue;
	const [word, freqStr] = line.split(/\s+/);
	if (!word || !freqStr) continue;
	if (specialCharPattern.test(word)) continue; // 過濾包含特殊符號的單字
	const first = word[0].toLowerCase();
	if (!/^[a-z]$/.test(first)) continue;
	if (!groups[first]) groups[first] = [];
	groups[first].push({ word, freq: Number(freqStr) });
}

// 依照 frequency 排序並寫入各字母 JSON
const outputDir = path.join(__dirname, 'corpus');
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

for (const letter in groups) {
	// 由高到低排序
	groups[letter].sort((a, b) => b.freq - a.freq);
	// 只輸出單字陣列
	const wordsSorted = groups[letter].map(item => item.word);
	const outPath = path.join(outputDir, `${letter}.json`);
		fs.writeFileSync(outPath, JSON.stringify(wordsSorted), 'utf8');
		console.log(`已產生 ${letter}.json（壓縮），共 ${wordsSorted.length} 字`);
}
