
import fs from 'fs';
import path from 'path';

// Configuration
const SOURCE_DIR = '/home/myc0058/.gemini/antigravity/brain/ae602c66-b984-4a4c-b34c-64dfc7f36ab5';
const TARGET_DIR = path.resolve(process.cwd(), 'contents/feel-consumption-test/images');

// Mapping pattern: startsWith -> newName
const mappings = [
    { prefix: 'feel_consumption_main_cover_', target: 'main-cover.png' },
    { prefix: 'feel_consumption_q1_', target: 'q1.png' },
    { prefix: 'feel_consumption_q2_', target: 'q2.png' },
    { prefix: 'feel_consumption_q3_', target: 'q3.png' },
    { prefix: 'feel_consumption_q4_', target: 'q4.png' },
    { prefix: 'feel_consumption_q5_', target: 'q5.png' },
    { prefix: 'feel_consumption_q6_', target: 'q6.png' },
    { prefix: 'feel_consumption_q7_', target: 'q7.png' },
    { prefix: 'feel_consumption_q8_', target: 'q8.png' },
    { prefix: 'feel_consumption_q9_', target: 'q9.png' },
    { prefix: 'feel_consumption_result_fs_', target: 'result-fs.png' },
    { prefix: 'feel_consumption_result_ft_', target: 'result-ft.png' },
    { prefix: 'feel_consumption_result_rs_', target: 'result-rs.png' },
    { prefix: 'feel_consumption_result_rt_', target: 'result-rt.png' },
];

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Get all files in source
const files = fs.readdirSync(SOURCE_DIR);

mappings.forEach(mapping => {
    // Find the most recent file matching the prefix (in case of retries, we want the last one)
    const matchingFiles = files
        .filter(f => f.startsWith(mapping.prefix) && f.endsWith('.png'))
        .sort() // Sorts by timestamp in filename usually, if format is consistent
        .reverse();

    if (matchingFiles.length > 0) {
        const sourceFile = matchingFiles[0];
        const sourcePath = path.join(SOURCE_DIR, sourceFile);
        const targetPath = path.join(TARGET_DIR, mapping.target);

        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${sourceFile} -> ${mapping.target}`);
    } else {
        console.warn(`⚠️ No file found for prefix: ${mapping.prefix}`);
    }
});
