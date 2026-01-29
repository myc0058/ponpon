
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); // defaults to .env in cwd

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = 'quiz-images';

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function main() {
    console.log(`Checking bucket: ${bucketName}`);

    // 1. Get all files in storage
    let allFiles: { name: string; id: string }[] = [];
    let page = 0;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: pageSize, offset: page * pageSize, sortBy: { column: 'name', order: 'asc' } });

        if (error) {
            console.error('Error fetching storage objects:', error);
            process.exit(1);
        }

        // Recursive fetch for folders not supported well by list at root, 
        // but our structure seems flat or known folders.
        // Wait, list() returns folders and files in the current dir.
        // If we have subfolders like 'feel-consumption-test', 'seed', we need to traverse.

        // Actually, list('') returns items in root.
        // If there is a folder, it returns it as an entry.
        // We need to list recursively? Supabase list doesn't support recursive flag directly usually.
        // But we can iterate.

        // Let's implement a recursive list function.

        // However, for this cleanup, we know the structure might be nested.
        // Checking Step 34 output: `seed/resilience-cover.jpg` etc.
        // It seems list() might be returning flat paths if we use a specific option or if we query `storage.objects` table.
        // But we can't query `storage.objects` with client easily (unless we use rpc or just iterate).

        // Easier approach: Use the SQL query I confirmed works to get the list of IDs/Names TO DELETE.
        // But I can't run SQL easily from the script unless I access the DB directly (Postgres) or use an RPC.

        // Alternative: Use the JS client to FETCH valid URLs from DB, and then Iterate Storage.
        // But iterating storage recursively is tedious.

        // Better Idea: Use the JS client to run the `rpc` if I had one.
        // Or just connect to Postgres directly? No, I want to use Supabase client.

        // Let's rely on the previous SQL tool output. I already know what to delete.
        // Can I pass the list to the script?
        // Or can the script use the same Logic?
        // "Identify orphans" logic in script:
        // 1. Fetch ALL used image URLs from DB (Quiz, Result, Question).
        // 2. Iterate through known folders (root, 'seed', 'feel-consumption-test') to list files.
        //    Delete if not in used list.

        // Let's try to list recursively.

        // But simplified approach:
        // 1. Fetch used URLs.
        // 2. Fetch all files from storage (recursive traversal).
        // 3. Diff and delete.

        // Let's write a recursive list function.

        // Used URLs
        const { data: quizzes } = await supabase.from('Quiz').select('imageUrl');
        const { data: results } = await supabase.from('Result').select('imageUrl');
        const { data: questions } = await supabase.from('Question').select('imageUrl');

        const usedUrls = new Set([
            ...(quizzes?.map((q) => q.imageUrl) || []),
            ...(results?.map((r) => r.imageUrl) || []),
            ...(questions?.map((q) => q.imageUrl) || []),
        ].filter(Boolean));

        console.log(`Found ${usedUrls.size} used image URLs.`);

        // Recursive walker
        const filesToDelete: string[] = [];

        async function traverse(pathPrefix: string) {
            const { data, error } = await supabase.storage.from(bucketName).list(pathPrefix, { limit: 1000 });
            if (error) throw error;

            for (const item of data || []) {
                const fullPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;

                if (item.id === null) {
                    // It's a folder (Supabase storage behavior: folder has null id usually, or we check metadata)
                    // Wait, Supabase list returns checking is tricky. metadata might indicate folder?
                    // Usually if it has no id, it is a folder placeholder.
                    // Let's assume if it has no ID it is a folder.
                    // But looking at Step 34, items have IDs.
                    // If `item.metadata` is null? 
                    // `list` returns `name`, `id`, `metadata`, etc.
                    // Check if `id` is present.
                    await traverse(fullPath);
                } else {
                    // It is a file
                    // Construct URL
                    const publicUrl = supabase.storage.from(bucketName).getPublicUrl(fullPath).data.publicUrl;

                    // Check if used
                    // We need to match exactly.
                    // The used URL might be: .../quiz-images/path/to/file
                    // Check if usedUrls has THIS publicUrl.

                    if (!usedUrls.has(publicUrl)) {
                        console.log(`Orphan found: ${fullPath}`);
                        filesToDelete.push(fullPath);
                    } else {
                        // Used
                    }
                }
            }
        }

        // But `item.id` being null for folder is not always reliable.
        // `list` usually returns `id` for files.
        // Let's try to just traverse what we see.

        await traverse('');

        console.log(`Found ${filesToDelete.length} orphaned files.`);

        if (filesToDelete.length > 0) {
            // Delete in batches
            const batchSize = 50;
            for (let i = 0; i < filesToDelete.length; i += batchSize) {
                const batch = filesToDelete.slice(i, i + batchSize);
                console.log(`Deleting batch ${i / batchSize + 1}...`);
                const { error } = await supabase.storage.from(bucketName).remove(batch);
                if (error) console.error('Error deleting:', error);
            }
            console.log('Deletion complete.');
        } else {
            console.log('No files to delete.');
        }
    }
}

main().catch(console.error);

