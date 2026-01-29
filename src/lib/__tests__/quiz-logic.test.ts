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

    it('should sort final result alphabetically regardless of frequency', () => {
        const types = ['B', 'B', 'A']
        expect(calculateTypeResult(types, 2)).toBe('AB')
    })

    it('should calculate result based on dimensions when validCodes are provided', () => {
        // Dimensions inferred from validCodes ['FS', 'FT', 'RS', 'RT']:
        // Axis 0: F vs R
        // Axis 1: S vs T

        const validCodes = ['FS', 'FT', 'RS', 'RT']

        // Case 1: Clear winners
        // F=1, T=1 -> F > R(0), T > S(0) -> FT
        expect(calculateTypeResult(['F', 'T'], 2, validCodes)).toBe('FT')

        // Case 2: Mixed bag (F vs R winner, S vs T winner)
        // F=3, R=1 (Winner F)
        // S=2, T=5 (Winner T)
        // Result -> FT
        const types = ['F', 'F', 'F', 'R', 'S', 'S', 'T', 'T', 'T', 'T', 'T']
        expect(calculateTypeResult(types, 2, validCodes)).toBe('FT')

        // Case 3: Ties (Alphabetical preference)
        // F=1, R=1 -> F (alphabetical first)
        // S=1, T=1 -> S (alphabetical first)
        // Result -> FS
        // logic: F vs R (tie -> F), S vs T (tie -> S) => FS
        expect(calculateTypeResult(['F', 'R', 'S', 'T'], 2, validCodes)).toBe('FS')
    })
})
