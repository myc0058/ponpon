
import { readdirSync, renameSync, existsSync } from 'fs'
import path from 'path'

const dir = path.resolve(process.cwd(), 'temp-game-assets', 'thumbnails')

function renameFiles() {
    if (!existsSync(dir)) return

    const files = readdirSync(dir)
    for (const file of files) {
        // Handle names like thumb_snake_game_webp_1769857726611.png
        // Goal: thumb_snake-game.png
        let newName = file
            .replace(/_webp_\d+/, '') // Remove timestamp part
            .replace(/\.webp\.png$/, '.png') // Fix extension if double

        // Ensure slug uses hyphens instead of underscores after 'thumb_'
        if (newName.startsWith('thumb_')) {
            const prefix = 'thumb_'
            const rest = newName.slice(prefix.length)
            const slug = rest.substring(0, rest.lastIndexOf('.')).replace(/_/g, '-')
            const ext = rest.substring(rest.lastIndexOf('.'))
            newName = `${prefix}${slug}${ext}`
        }

        if (file !== newName) {
            console.log(`Renaming: ${file} -> ${newName}`)
            renameSync(path.join(dir, file), path.join(dir, newName))
        }
    }
}

renameFiles()
