export function calculateTypeResult(types: string[], limit: number = 2, validCodes?: string[]): string {
    if (types.length === 0) return ''

    // If validCodes are provided, use Dimensional (MBTI-style) Calculation
    // This assumes all validCodes have the same length and structure (e.g., ["FS", "FT", "RS", "RT"])
    if (validCodes && validCodes.length > 0) {
        // 1. Determine length of the code (Dimensions)
        const codeLength = validCodes[0].length

        let result = ''

        // 2. Iterate through each position (Dimension/Axis)
        for (let i = 0; i < codeLength; i++) {
            // Identify all possible characters for this axis (e.g., 'F', 'R' for pos 0)
            const axisOptions = new Set<string>()
            validCodes.forEach(code => {
                if (code.length > i) axisOptions.add(code[i])
            })

            // Count frequency for characters in this axis
            let bestChar = ''
            let maxCount = -1

            // Sort axis options alphabetically to have a deterministic tie-breaker
            const sortedOptions = Array.from(axisOptions).sort()

            for (const char of sortedOptions) {
                const count = types.filter(t => t === char).length
                if (count > maxCount) {
                    maxCount = count
                    bestChar = char
                }
            }

            result += bestChar
        }

        // Final check: does the generated result actually exist in validCodes?
        // (It theoretically should if the grid is complete, e.g. 2x2=4 types)
        if (validCodes.includes(result)) {
            return result
        } else {
            // Fallback for sparse grids: find closest match in validCodes
            return validCodes[0]
        }
    }

    // --- Legacy Frequency-Based Fallback ---
    // (Used if validCodes is missing)
    const counts: Record<string, number> = {}
    types.forEach(t => {
        counts[t] = (counts[t] || 0) + 1
    })

    const sortedTypes = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(item => item[0])

    return sortedTypes.slice(0, limit).sort().join('')
}
