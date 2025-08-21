import * as esbuild from 'esbuild';
import { build, CommonConfig } from '../../script/common.esbuild-config';

// 发布之前构建
async function main() {
  const options: esbuild.BuildOptions = {
    ...CommonConfig(),
    minify: false,
    sourcemap: true,
    packages: 'external',
  };
  await build(options);
}
main();
