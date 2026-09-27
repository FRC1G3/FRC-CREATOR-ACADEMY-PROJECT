export function toggleModule(open: number[], number: number) {
  return open.includes(number) ? open.filter(value => value !== number) : [...open, number];
}
export function toggleAllModules(open: number[], numbers: number[]) {
  return numbers.every(number => open.includes(number)) ? [] : numbers;
}
