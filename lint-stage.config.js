import { existsSync } from 'fs'
import { join } from 'path'

const isBun = existsSync(join(__dirname, 'bun.lockb'))
const isYarn = existsSync(join(__dirname, 'yarn.lock'))
const isPnpm = existsSync(join(__dirname, 'pnpm-lock.yaml'))

const packageManager = isBun ? 'bun' : isYarn ? 'yarn' : isPnpm ? 'pnpm' : 'npm'

const options = {
  '**/*.(ts|tsx|js)': filenames => [
    `${packageManager} prettier --write ${filenames.join(' ')}`
  ],
  '**/*.(md|json)': filenames =>
    `${packageManager} prettier --write ${filenames.join(' ')}`
}

export default options
