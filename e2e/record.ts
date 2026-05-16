import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.resolve(__dirname, 'test-users.json')

export function record(email: string) {
  const list = read()
  if (list.includes(email)) return
  list.push(email)
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2) + '\n')
}

export function read(): string[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  } catch {
    return []
  }
}

export function clear() {
  fs.writeFileSync(FILE, '[]\n')
}
