export type FormElement = HTMLInputElement | HTMLSelectElement;

export type ParsedFormData = {
  [option: string]: {
    [name: string]: string | boolean | string[] | Record<string, string>;
  }[];
};

export type BaseParam = {
  param: string;
  name: string;
  isArray?: boolean;
  isOptional?: boolean; // always true when boolean
  condition?: (opts: ParsedFormData) => boolean;
};

export type StringParam = BaseParam & {
  type: "path" | "string";
  placeholder?: string;
};
export type LiteralParam = BaseParam & {
  type: "literal";
  default?: string;
  options: string[] | Record<string, string>;
};
export type BooleanParam = BaseParam & {
  type: "boolean";
  default?: boolean;
  isArray?: undefined;
  isOptional?: undefined;
};
export type PairParam = BaseParam & {
  // Max 1 pair
  type: "pair";
  placeholder?: [string, string];
};

export type Param = StringParam | LiteralParam | BooleanParam | PairParam;

export type Option = {
  arg: string; // podman-run arg, not unique!
  allowMultiple?: boolean;
  format?: (params: any) => string; // defaults to {value} => value
  argFormat?: (params: any) => string; // format for podman-run, if different
  params: Param[];
};

type QuadletTypes =
  | "container"
  | "pod"
  | "kube"
  | "network"
  | "volume"
  | "build"
  | "image";

export type Options = {
  [Type in QuadletTypes]: {
    [option: string]: Option;
  };
};
