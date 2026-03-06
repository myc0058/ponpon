
import fs from 'fs';
import path from 'path';

const jsonPath = path.resolve(process.cwd(), 'contents/lucid-dream/quiz-data.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

data.questions.forEach((q: any) => {
    if (q.id === 'corridor_start') q.imageUrl = 'corridor.png';
    else if (q.id === 'party_room') q.imageUrl = 'party.png';
    else if (q.id === 'q15') q.imageUrl = 'library.png';
    else if (q.id.startsWith('ext_')) {
        const num = parseInt(q.id.split('_')[1]);
        if (num <= 19) q.imageUrl = 'ocean.png';
        else if (num <= 39) q.imageUrl = 'library.png';
        else q.imageUrl = 'glitch.png';
    }
});

data.results.forEach((r: any) => {
    if (r.id === 'res_fake_wake') r.imageUrl = 'res_loop.png';
    else if (r.id === 'res_ego_dissolution') r.imageUrl = 'res_dissolve.png';
    else if (r.id === 'res_drowning') r.imageUrl = 'res_drown.png';
    else if (r.id === 'res_poison_toast') r.imageUrl = 'res_poison.png';
    else if (r.id === 'res_void_falling') r.imageUrl = 'res_void.png';
    else if (r.id.startsWith('res_ext_')) r.imageUrl = 'glitch.png';
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('✅ quiz-data.json mapped to local image filenames.');
