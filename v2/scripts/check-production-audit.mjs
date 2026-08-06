import fs from 'node:fs'

const reportPath = process.argv[2]
if (!reportPath) {
  console.error('Usage: node scripts/check-production-audit.mjs <audit-report.json>')
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const vulnerabilities = report.vulnerabilities ?? {}
const allowedAdvisories = new Set([
  // React Router RSC-only advisory. Axsis is a client-side SPA and does not use
  // React Server Components, Server Actions, or the affected RSC request path.
  'GHSA-qwww-vcr4-c8h2',
])

function advisoryIsAllowed(advisory) {
  const reference = `${advisory.url ?? ''} ${advisory.source ?? ''}`
  return [...allowedAdvisories].some((id) => reference.includes(id))
}

function vulnerabilityIsAllowed(packageName, visiting = new Set()) {
  if (visiting.has(packageName)) return false

  const vulnerability = vulnerabilities[packageName]
  if (!vulnerability || !Array.isArray(vulnerability.via) || vulnerability.via.length === 0) {
    return false
  }

  const nextVisiting = new Set(visiting)
  nextVisiting.add(packageName)

  return vulnerability.via.every((entry) => {
    if (typeof entry === 'object' && entry !== null) {
      return advisoryIsAllowed(entry)
    }

    if (typeof entry === 'string') {
      return vulnerabilityIsAllowed(entry, nextVisiting)
    }

    return false
  })
}

const blocking = []
const acknowledged = []

for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
  if (!['high', 'critical'].includes(vulnerability.severity)) continue

  if (vulnerabilityIsAllowed(packageName)) {
    acknowledged.push({
      packageName,
      severity: vulnerability.severity,
      advisory: 'transitively limited to acknowledged RSC advisory',
    })
    continue
  }

  const advisories = Array.isArray(vulnerability.via)
    ? vulnerability.via.filter((entry) => typeof entry === 'object' && entry !== null)
    : []

  if (advisories.length === 0) {
    blocking.push({ packageName, severity: vulnerability.severity, advisory: 'unknown' })
    continue
  }

  for (const advisory of advisories) {
    blocking.push({
      packageName,
      severity: advisory.severity ?? vulnerability.severity,
      advisory: advisory.url ?? advisory.title ?? String(advisory.source ?? 'unknown'),
    })
  }
}

for (const item of acknowledged) {
  console.warn(`Acknowledged non-applicable advisory: ${item.packageName} ${item.advisory}`)
}

if (blocking.length > 0) {
  console.error('Blocking production dependency vulnerabilities:')
  for (const item of blocking) {
    console.error(`- ${item.packageName} [${item.severity}]: ${item.advisory}`)
  }
  process.exit(1)
}

console.log('Production dependency audit passed.')
