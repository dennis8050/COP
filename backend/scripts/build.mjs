import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const functions = [
  'getMembers','getMember','createMember','updateMember','deactivateMember',
  'getAttendance','recordAttendance','updateAttendance','getMemberAttendanceHistory',
  'getDashboardStatistics','getAttendanceReport','migrate'
];

await fs.rm('build', { recursive: true, force: true });
await fs.mkdir('build', { recursive: true });

for (const name of functions) {
  await build({
    entryPoints: [`functions/${name}.js`],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    outfile: `build/${name}.mjs`,
    sourcemap: true,
    minify: false,
    external: []
  });
}
console.log('Backend Lambda bundles created.');
