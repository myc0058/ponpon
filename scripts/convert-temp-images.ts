import sharp from 'sharp';
import fs from 'fs';

const images = [
    { src: '/home/myc0058/.gemini/antigravity/brain/9a90313b-0ca9-4e70-9d83-c06c4a4fcc5f/sherlock_cover_1772695660213.png', dest: '/home/myc0058/projects/ponpon/gemini/images/sherlock_cover.webp' },
    { src: '/home/myc0058/.gemini/antigravity/brain/9a90313b-0ca9-4e70-9d83-c06c4a4fcc5f/sherlock_intro_helen_1772695690142.png', dest: '/home/myc0058/projects/ponpon/gemini/images/sherlock_intro_helen.webp' },
    { src: '/home/myc0058/.gemini/antigravity/brain/9a90313b-0ca9-4e70-9d83-c06c4a4fcc5f/sherlock_roylott_threat_1772695702741.png', dest: '/home/myc0058/projects/ponpon/gemini/images/sherlock_roylott_threat.webp' }
];

async function convert() {
    for (const img of images) {
        if (fs.existsSync(img.src)) {
            await sharp(img.src)
                .webp({ quality: 80 })
                .toFile(img.dest);
            console.log(`Converted ${img.src} to ${img.dest}`);
        } else {
            console.error(`File not found: ${img.src}`);
        }
    }
}

convert().catch(console.error);
