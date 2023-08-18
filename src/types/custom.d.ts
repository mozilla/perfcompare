declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.woff' {
  const content: string;
  export = content;
}

declare module '*.woff2' {
  const content: string;
  export = content;
}
