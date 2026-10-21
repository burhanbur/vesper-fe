export interface FeatureItem {
  readonly id: string
  readonly title: string
  readonly tag: string
  readonly description: string
  readonly iconName: string
  readonly badgeText?: string
  readonly highlights: readonly string[]
}

export interface FaqItem {
  readonly question: string
  readonly answer: string
}

export interface MetricItem {
  readonly label: string
  readonly value: string
  readonly detail: string
}
