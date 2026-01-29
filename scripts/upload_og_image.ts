
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage() {
    const filePath = path.join(process.cwd(), 'seo', 'default_og_image.png');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath);
    const fileName = 'og/default.png'; // Target path in bucket
    const bucketName = 'quiz-images';

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileContent, {
            contentType: mime.lookup(filePath) || 'image/png',
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

uploadImage();
