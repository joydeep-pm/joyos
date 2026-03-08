import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv from 'ajv'

const ROOT = process.cwd()
const MODULES_DIR = path.join(ROOT, 'modules')
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'module.schema.json')
const CACHE_DIR = path.join(ROOT, '.cache')
const CACHE_PATH = path.join(CACHE_DIR, 'module-endpoints.json')

async function collectManifests(dir) {
  const output = []
  let entries = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return output
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      output.push(...(await collectManifests(full)))
    } else if (entry.isFile() && entry.name === 'module.json') {
      output.push(full)
    }
  }

  return output.sort((a, b) => a.localeCompare(b))
}

function formatErrors(errors = []) {
  if (!errors.length) return 'Unknown schema validation error.'
  return errors
    .map((error) => `${error.instancePath || '/'} ${error.message || 'is invalid'}`)
    .join('; ')
}

async function run() {
  const manifests = await collectManifests(MODULES_DIR)
  const schema = JSON.parse(await fs.readFile(SCHEMA_PATH, 'utf8'))
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema)

  const warnings = []
  const modules = []

  for (const manifestPath of manifests) {
    try {
      const raw = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
      const valid = validate(raw)
      if (!valid) {
        warnings.push(`Invalid module manifest at ${manifestPath}: ${formatErrors(validate.errors)}`)
        continue
      }
      modules.push(raw)
    } catch (error) {
      warnings.push(`Failed to read module manifest at ${manifestPath}: ${error.message}`)
    }
  }

  modules.sort((left, right) => left.name.localeCompare(right.name))

  const registry = {
    version: 1,
    generated_at: new Date().toISOString(),
    source_files: manifests,
    modules,
    endpoints: modules.flatMap((module) =>
      module.actions.map((action) => ({
        method: 'POST',
        route: `/api/modules/${module.id}/actions/${action.id}/run`,
        moduleId: module.id,
        moduleName: module.name,
        actionId: action.id,
        actionName: action.name,
        toolName: action.toolName
      }))
    ),
    warnings
  }

  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(CACHE_PATH, JSON.stringify(registry, null, 2), 'utf8')

  console.log('Generated module endpoints cache:')
  console.log(`- cache: ${CACHE_PATH}`)
  console.log(`- modules: ${registry.modules.length}`)
  console.log(`- endpoints: ${registry.endpoints.length}`)
  if (registry.warnings.length) {
    console.log(`- warnings: ${registry.warnings.length}`)
    for (const warning of registry.warnings) {
      console.log(`  - ${warning}`)
    }
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
