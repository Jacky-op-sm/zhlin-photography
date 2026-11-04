import { spawnSync } from 'node:child_process'
import { addWriting } from './add.mjs'

if (process.argv.length > 2) throw new Error('Usage: npm run writing:publish')

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
}

const staged = spawnSync('git', ['diff', '--cached', '--quiet'], { stdio: 'ignore' })
if (staged.status !== 0) throw new Error('Git already has staged changes. Commit or unstage them before publishing writing.')

const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' })
if (branch.status !== 0 || branch.stdout.trim() !== 'main') throw new Error('Publishing requires the main branch.')

addWriting()
run('npm', ['run', 'check:writing'])
run('git', ['add', '-A', '--', 'content/writing'])
const changed = spawnSync('git', ['diff', '--cached', '--quiet', '--', 'content/writing'], { stdio: 'ignore' })
if (changed.status === 0) {
  console.log('No writing changes to publish.')
} else {
  run('git', ['commit', '-m', 'Publish writing updates'])
  run('git', ['push', 'origin', 'main'])
  console.log('Writing was pushed to Git. The site will update after deployment finishes.')
}
