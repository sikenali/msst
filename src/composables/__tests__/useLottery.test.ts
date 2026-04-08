import { describe, it, expect } from 'vitest'
import { generateSSQ, generateDLT } from '../useLottery'

describe('random helpers', () => {
  it('returns specified count of unique sorted numbers (single)', () => {
    const result = generateSSQ(1, 'single')
    expect(result).toHaveLength(1)
    expect(result[0].red).toHaveLength(6)
    expect(result[0].blue).toHaveLength(1)
    
    // Check sorted
    const reds = result[0].red
    for (let i = 1; i < reds.length; i++) {
      expect(reds[i]).toBeGreaterThan(reds[i - 1])
    }
  })

  it('numbers are in valid range', () => {
    const result = generateSSQ(1, 'single')
    result[0].red.forEach((n: number) => {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(33)
    })
    result[0].blue.forEach((n: number) => {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(16)
    })
  })
})

describe('generateSSQ', () => {
  it('generates correct structure for single mode', () => {
    const result = generateSSQ(1, 'single')
    expect(result[0].type).toBe('single')
    expect(result[0].red).toHaveLength(6)
    expect(result[0].blue).toHaveLength(1)
  })

  it('generates correct structure for multiple mode', () => {
    const result = generateSSQ(1, 'multiple')
    expect(result[0].type).toBe('multiple')
    expect(result[0].red.length).toBeGreaterThan(6)
  })

  it('generates correct structure for dantuo mode', () => {
    const result = generateSSQ(1, 'dantuo')
    expect(result[0].type).toBe('dantuo')
    expect(result[0].redBanker).toBeDefined()
    expect(result[0].redDrag).toBeDefined()
  })

  it('generates multiple notes', () => {
    const result = generateSSQ(5, 'single')
    expect(result).toHaveLength(5)
  })
})

describe('generateDLT', () => {
  it('generates correct structure for single mode', () => {
    const result = generateDLT(1, 'single')
    expect(result[0].type).toBe('single')
    expect(result[0].front).toHaveLength(5)
    expect(result[0].back).toHaveLength(2)
  })

  it('generates correct structure for multiple mode', () => {
    const result = generateDLT(1, 'multiple')
    expect(result[0].type).toBe('multiple')
    expect(result[0].front.length).toBeGreaterThan(5)
  })

  it('generates correct structure for dantuo mode', () => {
    const result = generateDLT(1, 'dantuo')
    expect(result[0].type).toBe('dantuo')
    expect(result[0].frontBanker).toBeDefined()
    expect(result[0].frontDrag).toBeDefined()
  })

  it('front/back numbers are in valid range', () => {
    const result = generateDLT(1, 'single')
    result[0].front.forEach((n: number) => {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(35)
    })
    result[0].back.forEach((n: number) => {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(12)
    })
  })
})
