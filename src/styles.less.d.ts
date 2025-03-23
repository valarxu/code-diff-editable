declare namespace StylesLessNamespace {
  export interface IStylesLess {
    "diff-container": string;
    "editor-column": string;
    "editor-header": string;
    "editor-title": string;
    "scroll-container": string;
    "line-numbers-wrapper": string;
    "arrows-wrapper": string;
    "editor": string;
    "line-numbers": string;
    "line-number": string;
    "line": string;
    "diff-line-left": string;
    "diff-line-right": string;
    "line-number-wrapper": string;
    "arrow-left": string;
    "arrow-right": string;
    "arrows-container": string;
  }
}

declare const StylesLessModule: StylesLessNamespace.IStylesLess & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesLessNamespace.IStylesLess;
};

export = StylesLessModule; 