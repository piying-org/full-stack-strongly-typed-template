import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { clean } from 'esbuild-plugin-clean';
import * as path from 'path';
// import { $ } from 'execa';

export function CommonConfig(): esbuild.BuildOptions {
  const PROD_ENV = process.argv.includes('--prod');

  return {
    platform: 'node',
    bundle: true,
    charset: 'utf8',
    splitting: true,
    format: 'esm',
    keepNames: false,
    outExtension: {
      '.js': '.mjs',
    },
    minify: PROD_ENV,
    sourcemap: !PROD_ENV,
    plugins: [
      copy({
        assets: [{ from: `./assets/*`, to: './' }],
      }),
      clean({ patterns: ['./dist/*'] }),
    ],
    entryPoints: [
      {
        in: 'index.ts',
        out: 'index',
      },
    ],
    outdir: path.join(process.cwd(), '/dist'),
    tsconfig: 'tsconfig.json',
  };
}

export async function build(options: esbuild.BuildOptions, fn?: (watch: boolean) => Promise<void>) {
  let isPublish = process.argv.includes('--publish');
  const watch = process.argv.includes('--watch');

  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('[watch]构建完成');
    await fn?.(watch);
  } else {
    let result = await esbuild.build(options);
    console.log('[build]构建完成');
    await fn?.(watch);
  }
  // await Promise.all([esbuild.build(options), $(`tsc`, ['-p', isPublish ? 'tsconfig.type-prod.json' : 'tsconfig.type.json'])]);
}
