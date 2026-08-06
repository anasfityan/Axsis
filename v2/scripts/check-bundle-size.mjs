import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const assetsDirectory = path.resolve(import.meta.dirname, '../dist/assets')
const limits = {
  mainJavaScript: 350 * 1024,
  deferredFirebase: 600 * 1024,
  css: 50 * 1024,
}

const fileNames = await readdir(assetsDirectory)
const assets = await Promise.all(
  fileNames.map(async (name) => ({
    name,
    size: (await stat(path.join(assetsDirectory, name))).size,
  })),
)

const failures = []

for (const asset of assets) {
  if (asset.name.endsWith('.css') && asset.size > limits.css) {
    failures.push(`${asset.name} تجاوز حد CSS: ${formatBytes(asset.size)} > ${formatBytes(limits.css)}`)
  }

  if (!asset.name.endsWith('.js')) continue

  const limit = asset.name.startsWith('firebase.client-')
    ? limits.deferredFirebase
    : limits.mainJavaScript

  if (asset.size > limit) {
    failures.push(`${asset.name} تجاوز ميزانية الحزمة: ${formatBytes(asset.size)} > ${formatBytes(limit)}`)
  }
}

if (failures.length > 0) {
  console.error('فشل فحص ميزانية الحزم:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

const largest = [...assets]
  .filter((asset) => asset.name.endsWith('.js'))
  .sort((left, right) => right.size - left.size)
  .slice(0, 5)

console.log('نجح فحص ميزانية الحزم. أكبر ملفات JavaScript:')
for (const asset of largest) {
  console.log(`- ${asset.name}: ${formatBytes(asset.size)}`)
}

function formatBytes(value) {
  return `${(value / 1024).toFixed(2)} KB`
}
