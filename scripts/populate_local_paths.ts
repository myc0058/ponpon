import fs from 'fs';
import path from 'path';

const JSON_PATH = 'contents/my-creative-aura-2026/quiz-data.json';

if (!fs.existsSync(JSON_PATH)) {
    console.error('File not found:', JSON_PATH);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

// Main Cover
data.imageUrl = 'main-cover.webp';

// Questions
data.questions.forEach((q: any) => {
    q.imageUrl = `q${q.order}.webp`;
});

// Results
data.results.forEach((r: any) => {
    r.imageUrl = `result-${r.typeCode.toLowerCase()}.webp`;
});

fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
console.log('Populated local paths into quiz-data.json');
