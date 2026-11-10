import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { glob, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { parse, serialize } from 'parse5';

const { assets } = JSON.parse(await readFile('wrangler.json', 'utf8'));
const basePath = '/ux-portfolio';
const output = dirname(assets.directory);
const client = join(output, 'client');

if (existsSync('.git')) {
  const unpublishedFiles = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src', 'public'], {
    encoding: 'utf8',
  });
  if (unpublishedFiles.trim()) {
    throw new Error('Build the Cloudflare release from a clean checkout. This checkout contains untracked site files.');
  }
}

execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', output], {
  stdio: 'inherit',
});

function mountUrl(url) {
  if (!url.startsWith('/') || url.startsWith('//') || url === basePath || url.startsWith(`${basePath}/`)) {
    return url;
  }
  return `${basePath}${url}`;
}

// Astro leaves literal URLs to files in public/ unchanged. The case studies
// also reference public images in inline background-image styles.
function prefixUrls(node) {
  for (const attribute of node.attrs ?? []) {
    if (['href', 'src', 'poster', 'action'].includes(attribute.name)) {
      attribute.value = mountUrl(attribute.value);
    } else if (attribute.name === 'style') {
      attribute.value = attribute.value.replace(/(url\(\s*["']?)(\/[^"')\s]*)/gi, (_, prefix, url) => `${prefix}${mountUrl(url)}`);
    }
  }
  for (const child of node.childNodes ?? []) prefixUrls(child);
}

for await (const file of glob('**/*.html', { cwd: client })) {
  const path = join(client, file);
  const document = parse(await readFile(path, 'utf8'));
  prefixUrls(document);
  await writeFile(path, serialize(document));
}

await rm(join(client, 'CNAME'), { force: true });
await rm(assets.directory, { recursive: true, force: true });
await mkdir(assets.directory, { recursive: true });
await rename(client, join(assets.directory, basePath.slice(1)));
