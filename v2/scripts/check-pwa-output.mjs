import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const requiredFiles = ['index.html', 'manifest.webmanifest', 'sw.js', 'icons/axsis-icon.svg']

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(distDir, file)))

if (missingFiles.length > 0) {
  console.error('PWA build output is incomplete:')
  for (const file of missingFiles) console.error(`- Missing dist/${file}`)
  process.exit(1)
}

const manifestPath = path.join(distDir, 'manifest.webmanifest')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const requiredManifestFields = {
  name: 'Axsis',
  short_name: 'Axsis',
  display: 'standalone',
  start_url: '/',
}

const invalidFields = Object.entries(requiredManifestFields).filter(
  ([key, expected]) => manifest[key] !== expected,
)

if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
  invalidFields.push(['icons', 'at least one icon'])
}

if (invalidFields.length > 0) {
  console.error('PWA manifest validation failed:')
  for (const [key, expected] of invalidFields) {
    console.error(`- ${key} must be ${JSON.stringify(expected)}`)
  }
  process.exit(1)
}

const serviceWorker = fs.readFileSync(path.join(distDir, 'sw.js'), 'utf8')
if (!serviceWorker.includes("addEventListener('fetch'") || !serviceWorker.includes("addEventListener('install'")) {
  console.error('Service worker is missing required install or fetch handlers.')
  process.exit(1)
}

console.log('PWA build output validation passed.')
