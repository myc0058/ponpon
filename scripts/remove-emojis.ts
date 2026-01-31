
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const CONTENTS_DIR = path.join(process.cwd(), 'contents');

// Regex to match emojis
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{203C}\u{2049}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}]/gu;

function removeEmojis(text: string): string {
    if (!text) return text;
    // Replace emojis with empty string and trim whitespace
    return text.replace(EMOJI_REGEX, '').trim().replace(/\s{2,}/g, ' ');
}

// Function to recursively process objects and remove emojis from string values
function cleanObject(obj: any): any {
    if (typeof obj === 'string') {
        return removeEmojis(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(cleanObject);
    }
    if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            // Skip imageUrl keys, though emojis usually aren't in URLs, just to be safe
            if (key === 'imageUrl') {
                newObj[key] = obj[key];
            } else {
                newObj[key] = cleanObject(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

async function main() {
    const dirs = fs.readdirSync(CONTENTS_DIR);

    for (const dir of dirs) {
        const dirPath = path.join(CONTENTS_DIR, dir);
        if (!fs.statSync(dirPath).isDirectory()) continue;

        const jsonPath = path.join(dirPath, 'quiz-data.json');
        if (!fs.existsSync(jsonPath)) continue;

        console.log(`Processing ${dir}...`);
        const content = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(content);

        // 1. Clean JSON data
        const cleanedData = cleanObject(data);

        // Write back to file if changed
        const newContent = JSON.stringify(cleanedData, null, 2);
        if (content !== newContent) {
            console.log(`  Updating quiz-data.json for ${dir}...`);
            fs.writeFileSync(jsonPath, newContent);
        } else {
            console.log(`  No changes needed for ${dir} JSON.`);
        }

        // 2. Update Database
        // Find quiz by title (assuming title might have emojis in DB) or construct a loose search?
        // Better strategy: Since we just cleaned the local file, we know what the title *should* contain minus emojis.
        // But database might still have the old title.
        // We should try to find the quiz.

        // We will list all quizzes and match by id if possible? 
        // Wait, the local JSON doesn't strictly track the ID.
        // However, usually we can fuzzy match or rely on the previous content.
        // Let's rely on cleaning the DB in place.

    }

    // Database cleaning phase
    console.log('Cleaning Database...');
    const allQuizzes = await prisma.quiz.findMany({
        include: {
            questions: { include: { options: true } },
            results: true
        }
    });

    for (const quiz of allQuizzes) {
        console.log(`Checking DB Quiz: ${quiz.title}`);

        const newTitle = removeEmojis(quiz.title);
        const newDescription = removeEmojis(quiz.description);

        if (quiz.title !== newTitle || quiz.description !== newDescription) {
            console.log(`  Updating Quiz -> ${newTitle}`);
            await prisma.quiz.update({
                where: { id: quiz.id },
                data: { title: newTitle, description: newDescription }
            });
        }

        for (const question of quiz.questions) {
            const newQContent = removeEmojis(question.content);
            if (question.content !== newQContent) {
                await prisma.question.update({
                    where: { id: question.id },
                    data: { content: newQContent }
                });
            }

            for (const option of question.options) {
                const newOContent = removeEmojis(option.content);
                if (option.content !== newOContent) {
                    await prisma.option.update({
                        where: { id: option.id },
                        data: { content: newOContent }
                    });
                }
            }
        }

        for (const result of quiz.results) {
            const newRTitle = removeEmojis(result.title);
            const newRDesc = removeEmojis(result.description);

            if (result.title !== newRTitle || result.description !== newRDesc) {
                await prisma.result.update({
                    where: { id: result.id },
                    data: { title: newRTitle, description: newRDesc }
                });
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
