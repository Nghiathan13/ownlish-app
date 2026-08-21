/// <reference types="vite/client" />

// unplugin-icons raw compiler — icons import as SVG strings (tree-shaken)
declare module "~icons/*" {
  const svg: string;
  export default svg;
}
