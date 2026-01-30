import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = '/home/myc0058/.gemini/antigravity/brain/c31b8c17-4b85-4d04-acd0-70d23889c673';
const TARGET_DIR = '/home/myc0058/projects/ponpon/contents/my-creative-aura-2026/images';

const MAPPING: Record<string, string> = {
    'aura_main_cover': 'main-cover',
    'aura_result_hd': 'result-hd',
    'aura_result_hr': 'result-hr',
    'aura_result_cd': 'result-cd',
    'aura_result_cr': 'result-cr',
    'aura_q1': 'q1',
    'aura_q2': 'q2',
    'aura_q3': 'q3',
    'aura_q4': 'q4',
    'aura_q5': 'q5',
    'aura_q6': 'q6',
    'aura_q7': 'q7',
};

async function main() {
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const files = fs.readdirSync(ARTIFACT_DIR);

    for (const [prefix, targetName] of Object.entries(MAPPING)) {
        // Find the file that starts with the prefix and ends with .png
        // We sort to get the latest one if multiple exist, but usually unique timestamp
        const matchingFiles = files
            .filter(f => f.startsWith(prefix + '_') && f.endsWith('.png'))
            .sort();

        // Use the last one (latest)
        const file = matchingFiles[matchingFiles.length - 1];

        if (file) {
            const sourcePath = path.join(ARTIFACT_DIR, file);
            const targetPath = path.join(TARGET_DIR, targetName + '.webp');

            console.log(`Converting ${file} to ${targetName}.webp...`);

            await sharp(sourcePath)
                .webp({ quality: 80 })
                .toFile(targetPath);

            console.log(`Done: ${targetPath}`);
        } else {
            console.warn(`Warning: No file found for prefix ${prefix}`);
        }
    }
}

main().catch(console.error);
