import * as types from "../types.ts";
import { options } from "../data/options.ts";
import { addFormElement } from "./add.ts";
import { updateConditional } from "./update.ts";

export const conditions: {
  [option: string]: {
    [param: string]: types.FormElement[];
  };
} = {};

export function parseFormData(formData: FormData): types.ParsedFormData {
  // type: { option: [{ name: value, name: value }, {...}] }
  // value is string | string[] | Object<string, string>
  const result: types.ParsedFormData = {};

  let prevOption: string | null = null;
  let prevField: string | null = null;
  let prevPairKey: string | null = null;

  let currentParams: Record<
    string,
    string | boolean | string[] | Record<string, string>
  > = {};
  let currentArray: string[] = [];
  let currentPairs: Record<string, string> = {};

  function updateParams() {
    if (prevField === null) return;

    // Add current array
    if (currentArray.length !== 0) {
      currentParams[prevField] = currentArray;
      currentArray = [];
    }

    // Add current pairs
    if (Object.keys(currentPairs).length !== 0) {
      currentParams[prevField] = currentPairs;
      currentPairs = {};
    }
  }

  function updateResult() {
    if (prevOption === null) return;

    // Add params to result
    result[prevOption] ??= [];
    result[prevOption].push(currentParams);
    currentParams = {};
  }

  for (const [name, value] of formData.entries()) {
    // Narrow value to string
    if (typeof value !== "string") continue;

    // Submit option
    if (name == "submit") continue;

    // Assuming valid data
    let values = name.split(".");
    const isArray = name.endsWith("]");
    const index = values.length - 1;
    if (isArray)
      values[index] = values[index].substring(0, values[index].indexOf("["));
    const [option, field, type] = values;
    const arrayIndex = isArray
      ? Number(name.substring(name.indexOf("[") + 1, name.indexOf("]")))
      : null;

    // Next option
    if (option !== prevOption) {
      updateParams();
      updateResult();
      prevOption = option;
    }

    if (isArray) {
      // Next option with same name (when inconsistent index)
      if (
        (arrayIndex !== currentArray.length || field !== prevField) &&
        currentArray.length !== 0
      ) {
        updateParams();
        updateResult();
      }

      // Pair
      if (type === "keys") {
        prevPairKey = value;
      } else if (type === "values") {
        if (prevPairKey !== null) currentPairs[prevPairKey] = value;
      } else {
        currentArray.push(value);
      }

      prevField = field;
      continue;
    }

    updateParams();

    let processedValue: string | boolean = value;
    if (type === "boolean") {
      if (value === "true") processedValue = true;
      else if (value === "false") processedValue = false;
    }

    // Next option (double field)
    // except when boolean && true (because of checkbox value -> double option)
    if (field in currentParams && processedValue !== true) updateResult();

    currentParams[field] = processedValue;
    prevField = field;
  }

  // Last option
  updateParams();
  updateResult();

  return result;
}

export function generateOption(
  option: string,
  isRemovable: boolean = true
): HTMLFieldSetElement {
  const context = options.container[option];

  const optionSelectOption = (
    document.getElementById("select-option") as HTMLSelectElement
  ).querySelector<HTMLOptionElement>(`option[value=${option}]`);

  if (!context.allowMultiple && optionSelectOption !== null) {
    optionSelectOption.disabled = true;
  }

  const fieldset = document.createElement("fieldset");
  fieldset.className = "option";
  fieldset.name = option;

  const legend = document.createElement("legend");
  legend.textContent = option;

  if (isRemovable) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.onclick = (event) => {
      const target = event?.currentTarget as HTMLButtonElement;
      target.parentElement?.parentElement?.remove();

      if (optionSelectOption !== null) optionSelectOption.disabled = false;

      // Cleanup of conditions isn't really needed
      updateConditional();
    };

    legend.appendChild(remove);
  }

  fieldset.appendChild(legend);

  for (const param of context.params) {
    const div = document.createElement("div");
    div.className = "param";

    // Up to 8.2 trillion fields (36^8)
    let id;
    while (true) {
      id = Math.random().toString(36).substring(2, 10);
      if (!document.getElementById(id)) break;
    }

    const label = document.createElement("label");
    label.className = "field";
    label.htmlFor = id;
    label.textContent = param.name;

    if (!param.isOptional && param.type !== "boolean") {
      const span = document.createElement("span");
      span.style.color = "red";
      span.textContent = "*";

      label.appendChild(span);
    }

    div.appendChild(label);

    if (!param.isArray) {
      fieldset.appendChild(div);

      // Add input element to end
      addFormElement(param.type, option, param, div, fieldset, id);
      continue;
    }

    const values = document.createElement("div");
    values.className = "values";
    div.appendChild(values);

    // Optional literals don't need first option
    if (param.isOptional && param.type === "literal")
      values.style.display = "none"; // Remove flex gap
    else addFormElement(param.type, option, param, values, fieldset, id);

    // + and - buttons
    const more = document.createElement("button");
    more.type = "button";
    more.className = "more";
    more.textContent = "+";
    more.onclick = () =>
      addFormElement(param.type, option, param, values, fieldset);

    const less = document.createElement("button");
    less.type = "button";
    less.className = "less";
    less.textContent = "-";
    // Remove last input but always leave one when required
    less.onclick = () => {
      if (values.childElementCount > (param.isOptional ? 0 : 1))
        values.lastElementChild?.remove();

      // Add "display: none" to remove flex gap
      if (values.childElementCount === 0) values.style.display = "none";

      // Cleanup of conditions isn't really needed
      updateConditional();
    };

    div.appendChild(more);
    div.appendChild(less);

    fieldset.appendChild(div);
  }

  for (const input of fieldset.querySelectorAll<types.FormElement>(
    "input, select"
  )) {
    const field = input.name.split(".")[1];
    const contextParam = context.params.find((param) => param.param === field);

    if (contextParam && "condition" in contextParam) {
      conditions[option] ??= {};
      conditions[option][field] ??= [];
      conditions[option][field].push(input);
    }
  }

  updateConditional(fieldset);
  return fieldset;
}

export function generatePairs(
  data: types.ParsedFormData,
  isArg: boolean = false
): string[][] {
  let result = [];

  for (const [name, content] of Object.entries(data)) {
    for (const params of content) {
      if (!isArg) {
        const context = options.container[name];
        // Default context.format to {value} => value
        const format = context.format || (({ value }) => value);
        result.push([name, format(params)]);
        continue;
      }

      const context = options.container[name];
      // Try to use argFormat
      const format =
        context.argFormat || context.format || (({ value }) => value);

      // Seperate seperable args
      let addedPair = false;
      for (const [param, value] of Object.entries(params)) {
        // Check if value is object (object = pair)
        if (!(value && typeof value === "object" && !Array.isArray(value)))
          continue;

        addedPair = true;
        for (const [key, val] of Object.entries(value))
          result.push([
            context.arg,
            // Make a shallow copy and overwrite the pair
            format({ ...params, [param]: { [key]: val } }),
          ]);

        // Only one pair param (previous step will fail when multiple)
        break;
      }

      if (!addedPair) result.push([context.arg, format(params)]);
    }
  }

  return result;
}

export function generateQuadlet(data: types.ParsedFormData): string {
  const pairs = generatePairs(data);

  // TODO ini sections and description/name etc
  return pairs.map(([key, value]) => `${key}=${value}`).join("\n");
}

export function generatePodmanRun(data: types.ParsedFormData): string {
  const pairs = generatePairs(data, true);

  // TODO (!) fix arguments with spaces and other characters
  let globalArgs = [];
  let args = [];
  let image, exec;
  for (let [key, value] of pairs) {
    switch (key) {
      case "image":
        image = value;
        break;
      case "exec":
        exec = value;
        break;
      case "module":
        globalArgs.push(value);
        break;
      default:
        if (value) args.push(`--${key}=${value}`);
        else args.push(`--${key}=`);
    }
  }

  return ["podman", ...globalArgs, "run", ...args, image, exec]
    .filter(Boolean)
    .join(" ");
}
