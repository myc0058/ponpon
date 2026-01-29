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

    // Weighted Scoring Tests
    it('should use weighted scores when provided (Legacy/Frequency Mode)', () => {
        const types = ['A', 'B'] // Dummy types since we provide weights
        const weightedScores = { 'A': 0.5, 'B': 1.0, 'C': 2.0 }
        // C=2.0 > B=1.0 > A=0.5
        // Limit 2 -> BC (sorted alphabetically) -> BC
        expect(calculateTypeResult(types, 2, undefined, weightedScores)).toBe('BC')
    })

    it('should use weighted scores when provided (Dimensional Mode)', () => {
        const validCodes = ['FS', 'FT', 'RS', 'RT']
        const types = ['F', 'T'] // Dummy types

        // Axis 0: F vs R
        // Axis 1: S vs T

        const weightedScores = {
            'F': 0.5,
            'R': 1.0, // R wins Axis 0
            'S': 2.0, // S wins Axis 1
            'T': 1.5
        }

        // Result -> RS
        expect(calculateTypeResult(types, 2, validCodes, weightedScores)).toBe('RS')
    })

    it('should fall back to frequency if weightedScores are zero', () => {
        const validCodes = ['FS', 'FT', 'RS', 'RT']
        const types = ['F', 'F', 'T']
        // F=2, T=1
        // Frequency -> FT

        const weightedScores = { 'F': 0, 'R': 0, 'S': 0, 'T': 0 }

        expect(calculateTypeResult(types, 2, validCodes, weightedScores)).toBe('FT')
    })
})
