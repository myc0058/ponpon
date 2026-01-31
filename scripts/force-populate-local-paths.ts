
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const topicArg = args.find(arg => arg.startsWith('--topic='));

if (!topicArg) {
    console.error('Usage: npx tsx scripts/force-populate-local-paths.ts --topic=your-topic-slug');
    process.exit(1);
}

const topic = topicArg.split('=')[1];
const dirPath = path.resolve(process.cwd(), 'contents', topic);
const jsonPath = path.join(dirPath, 'quiz-data.json');

if (!fs.existsSync(jsonPath)) {
    console.error('JSON file not found:', jsonPath);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Main Cover
data.imageUrl = 'main-cover.png';

// Questions
data.questions.forEach((q: any) => {
    q.imageUrl = `q${q.order}.png`;
});

// Results
data.results.forEach((r: any) => {
    const code = r.typeCode || r.title;
    const filename = `result-${code.toLowerCase()}.png`;
    r.imageUrl = filename;
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`✅ Forced local paths for: ${topic}`);
