import { describe, expect, it } from 'vitest'
import { courseGradeSummary, gradePercentage } from '@/features/grades/grade.calculations'
import type { GradeItem } from '@/features/grades/grade.types'

function grade(score: number, maximumScore: number, weight = 0): GradeItem {
  return {
    id: crypto.randomUUID(), userId: 'u', courseId: 'c', title: 'x', type: 'quiz', score,
    maximumScore, weight, date: '2026-01-01', notes: '', createdAt: '', updatedAt: '',
    deletedAt: null, version: 1, deviceId: 'd',
  }
}

describe('grade calculations', () => {
  it('calculates and clamps percentages', () => {
    expect(gradePercentage(40, 50)).toBe(80)
    expect(gradePercentage(120, 100)).toBe(100)
    expect(gradePercentage(5, 0)).toBe(0)
  })

  it('uses weights when they are available', () => {
    const result = courseGradeSummary([grade(80, 100, 30), grade(90, 100, 70)])
    expect(result.percentage).toBe(87)
    expect(result.completedWeight).toBe(100)
  })
})
