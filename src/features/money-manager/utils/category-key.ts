export function categoryKey(type: 'INCOME' | 'EXPENSE', name: string): string {
    return `${type}:${name.trim().toLowerCase()}`
}
