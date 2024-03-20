export function spaceIndex(str: string) {
  const reg = /\s|\n|\t/
  const match = reg.exec(str)
  return match ? match.index : -1
}
