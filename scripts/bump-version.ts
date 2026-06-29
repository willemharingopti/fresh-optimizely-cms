// Bumps the patch version in deno.json by editing only the version line,
// so the rest of the file formatting is left untouched.
const path = new URL("../deno.json", import.meta.url).pathname
const text = await Deno.readTextFile(path)

const match = text.match(/"version":\s*"(\d+)\.(\d+)\.(\d+)"/)
if (!match) {
  console.error("Could not find a semver version in deno.json")
  Deno.exit(1)
}

const [, major, minor, patch] = match
const current = `${major}.${minor}.${patch}`
const next = `${major}.${minor}.${Number(patch) + 1}`

const updated = text.replace(match[0], `"version": "${next}"`)
await Deno.writeTextFile(path, updated)

console.log(`Bumped version: ${current} -> ${next}`)
