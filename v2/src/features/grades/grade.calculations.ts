import type { GradeItem } from '@/features/grades/grade.types'

export function gradePercentage(score: number, maximumScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maximumScore) || maximumScore <= 0) return 0
  return Math.max(0, Math.min(100, (score / maximumScore) * 100))
}

export function courseGradeSummary(grades: GradeItem[]) {
  if (!grades.length) return { percentage: 0, completedWeight: 0, itemCount: 0 }

  const weighted = grades.filter((grade) => grade.weight > 0)
  if (weighted.length) {
    const completedWeight = weighted.reduce((sum, grade) => sum + grade.weight, 0)
    const earned = weighted.reduce(
      (sum, grade) => sum + gradePercentage(grade.score, grade.maximumScore) * grade.weight,
      0,
    )
    return {
      percentage: completedWeight > 0 ? earned / completedWeight : 0,
      completedWeight,
      itemCount: grades.length,
    }
  }

  const percentage =
    grades.reduce((sum, grade) => sum + gradePercentage(grade.score, grade.maximumScore), 0) /
    grades.length
  return { percentage, completedWeight: 0, itemCount: grades.length }
}
