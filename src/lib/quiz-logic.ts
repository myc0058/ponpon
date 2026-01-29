export function calculateTypeResult(types: string[], limit: number = 2): string {
    if (types.length === 0) return ''

    const counts: Record<string, number> = {}
    types.forEach(t => {
        counts[t] = (counts[t] || 0) + 1
    })

    // Sort by frequency (descending), then alphabetically (ascending)
    const sortedTypes = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(item => item[0])

    // Return the top 'limit' codes joined together
    return sortedTypes.slice(0, limit).join('')
}
