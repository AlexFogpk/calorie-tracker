export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  // Проверяем, является ли число целым
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
} 