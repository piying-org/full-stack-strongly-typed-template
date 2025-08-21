import * as esbuild from 'esbuild';
import path from 'node:path';
import { build, CommonConfig } from '../../script/common.esbuild-config';
// 发布之前构建
async function main() {
  const cwd = process.cwd();
  const OUT_DIR = path.join(cwd, '/dist');
  const options: esbuild.BuildOptions = {
    ...CommonConfig(),
    treeShaking: true,
    entryPoints: [
      { in: path.join(cwd, './src/main.init.ts'), out: './main.init' },
    ],
    outdir: OUT_DIR,
    tsconfig: path.join(cwd, 'tsconfig.json'),
    define: { ENV: `'dev'` },
    packages: 'external',
  };
  await build(options, async () => {
    const { $ } = await import('execa');
    $({ stdio: 'inherit' })(`node  ./dist/main.init.mjs`);
  });
}

main();
