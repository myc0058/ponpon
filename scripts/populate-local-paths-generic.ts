
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const topicArg = args.find(arg => arg.startsWith('--topic='));

if (!topicArg) {
    console.error('Usage: npx tsx scripts/populate-local-paths-generic.ts --topic=your-topic-slug');
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
let updated = false;

// Main Cover
if (!data.imageUrl || !data.imageUrl.startsWith('http')) {
    data.imageUrl = 'main-cover.png';
    updated = true;
}

// Questions
data.questions.forEach((q: any) => {
    if (!q.imageUrl || !q.imageUrl.startsWith('http')) {
        q.imageUrl = `q${q.order}.png`;
        updated = true;
    }
});

// Results
data.results.forEach((r: any) => {
    const code = r.typeCode || r.title;
    const filename = `result-${code.toLowerCase()}.png`;
    if (!r.imageUrl || !r.imageUrl.startsWith('http')) {
        r.imageUrl = filename;
        updated = true;
    }
});

if (updated) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`✅ Populated local paths for: ${topic}`);
} else {
    console.log(`ℹ️ No paths needed updates for: ${topic}`);
}
