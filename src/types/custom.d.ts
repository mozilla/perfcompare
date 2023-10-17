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

declare module 'fast-kde' {
  interface Point {
    x: number;
    y: number;
  }

  interface Options {
    bandwidth: number;
    extent: number[];
  }

  export function density1d(
    data: number[],
    options?: Partial<Options>,
  ): Iterable<Point>;
}
