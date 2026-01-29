import { calculateTypeResult } from '../quiz-logic'

describe('Quiz Logic - Type Calculation', () => {
    it('should return empty string for empty input', () => {
        expect(calculateTypeResult([])).toBe('')
    })

    it('should calculate frequency based result correctly', () => {
        const types = ['E', 'E', 'I', 'E', 'I', 'N']
        // E: 3, I: 2, N: 1
        // Expected top 2: E, I -> EI
        expect(calculateTypeResult(types, 2)).toBe('EI')
    })

    it('should respect the limit', () => {
        const types = ['A', 'B', 'C', 'D']
        // Each appears once. Alphabetical tie-break: A, B, C, D
        // Limit 1 -> A
        expect(calculateTypeResult(types, 1)).toBe('A')
        // Limit 3 -> ABC
        expect(calculateTypeResult(types, 3)).toBe('ABC')
    })

    it('should handle ties alphabetically', () => {
        const types = ['B', 'A']
        // B: 1, A: 1. Tie-break: A comes before B.
        // Limit 2 -> AB
        expect(calculateTypeResult(types, 2)).toBe('AB')
    })

    it('should handle complex ties', () => {
        const types = ['Z', 'Y', 'X', 'Z', 'Y']
        // Z: 2, Y: 2, X: 1
        // Top 1: Y (Y < Z) -> Error? Wait. 
        // Logic: b[1] - a[1] || a[0].localeCompare(b[0])
        // Frequency check: Z=2, Y=2.
        // Compare keys: 'Y'.localeCompare('Z') -> -1 (Y comes first)
        // So Y should be first.
        expect(calculateTypeResult(types, 2)).toBe('YZ')
    })
})
