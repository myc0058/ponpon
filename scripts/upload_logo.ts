
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadLogo() {
    // Correct absolute path to the uploaded file
    const sourcePath = '/home/myc0058/.gemini/antigravity/brain/c344b077-cfd3-4414-809b-21f28cd76d01/uploaded_media_1769781651213.png';

    if (!fs.existsSync(sourcePath)) {
        console.error(`Source file not found: ${sourcePath}`);
        process.exit(1);
    }

    console.log('Converting image to WebP...');
    const webpBuffer = await sharp(sourcePath)
        .webp()
        .toBuffer();

    const fileName = 'logo.webp'; // Root of the bucket or specific folder? Plan said 'logo.webp'
    const bucketName = 'quiz-images';

    console.log(`Uploading ${fileName} to ${bucketName}...`);
    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, webpBuffer, {
            contentType: 'image/webp',
            upsert: true
        });

    if (error) {
        console.error('Error uploading image:', error);
        process.exit(1);
    }

    console.log('Upload successful:', data);

    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);
}

uploadLogo();
