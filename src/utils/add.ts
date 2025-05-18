import * as types from "../types.ts";
import { updateConditional } from "./update.ts";

function addInput(
  option: string,
  param: types.StringParam,
  element: HTMLElement,
  fieldset?: HTMLFieldSetElement,
  id?: string
): HTMLInputElement {
  const input = document.createElement("input");
  if (id) input.id = id;
  input.className = "value";
  input.name = `${option}.${param.param}`;
  input.type = "text";
  input.required = !param.isOptional;
  input.onchange = () => updateConditional(fieldset);
  if (param.placeholder) input.placeholder = param.placeholder;
  if (param.isArray) input.name += `[${element.childElementCount}]`;

  element.appendChild(input);
  return input;
}

function addSelect(
  option: string,
  param: types.LiteralParam,
  element: HTMLElement,
  fieldset?: HTMLFieldSetElement,
  id?: string
): HTMLSelectElement {
  const select = document.createElement("select");
  if (id) select.id = id;
  select.className = "value";
  select.name = `${option}.${param.param}`;
  select.required = param.isArray || !param.isOptional;
  select.onchange = () => updateConditional(fieldset);
  if (param.isArray) select.name += `[${element.childElementCount}]`;

  // Add empty option
  if (!param.default) {
    const option = document.createElement("option");
    option.value = "";
    option.selected = true;
    option.disabled = param.isArray || !param.isOptional;
    select.appendChild(option);
  }

  if (Array.isArray(param.options)) {
    for (const opt of param.options) {
      const option = document.createElement("option");
      option.value = opt;
      option.selected = param.default === opt;
      option.textContent = opt;
      select.appendChild(option);
    }
  } else {
    for (const opt of Object.keys(param.options)) {
      const option = document.createElement("option");
      option.value = opt;
      option.selected = param.default === opt;
      option.textContent = param.options[opt];
      select.appendChild(option);
    }
  }

  element.appendChild(select);
  return select;
}

function addBoolean(
  option: string,
  param: types.BooleanParam,
  element: HTMLElement,
  fieldset?: HTMLFieldSetElement,
  id?: string
): HTMLInputElement {
  // Hidden input for formdata (so it doesn't omit when false)
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = `${option}.${param.param}.boolean`;
  hiddenInput.value = "false";
  hiddenInput.checked = true;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "value";
  input.name = `${option}.${param.param}.boolean`;
  input.value = "true";
  if (param.default) input.checked = param.default;
  input.onchange = () => updateConditional(fieldset);

  element.appendChild(hiddenInput);
  element.appendChild(input);
  return input;
}

function addPair(
  option: string,
  param: types.PairParam,
  element: HTMLElement,
  fieldset?: HTMLFieldSetElement,
  id?: string
): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "pair";

  const key = document.createElement("input");
  if (id) key.id = id;
  key.type = "text";
  key.className = "value";
  key.name = `${option}.${param.param}.keys[${element.childElementCount}]`;
  key.required = !param.isOptional;
  key.onchange = () => updateConditional(fieldset);
  if (Array.isArray(param.placeholder)) key.placeholder = param.placeholder[0];

  const span = document.createElement("span");
  span.textContent = "=";

  const value = document.createElement("input");
  value.type = "text";
  value.className = "value";
  value.name = `${option}.${param.param}.values[${element.childElementCount}]`;
  value.required = !param.isOptional;
  value.onchange = () => updateConditional(fieldset);
  if (Array.isArray(param.placeholder))
    value.placeholder = param.placeholder[1];

  div.appendChild(key);
  div.appendChild(span);
  div.appendChild(value);
  element.appendChild(div);
  return div;
}

export function addFormElement(
  type: "path" | "string" | "literal" | "boolean" | "pair",
  option: string,
  param: types.Param,
  element: HTMLElement,
  fieldset?: HTMLFieldSetElement,
  id?: string
) {
  // Remove "display: none"
  if (element.style.display === "none") element.style.removeProperty("display");

  switch (type) {
    case "path": // fall through
    case "string":
      param = param as types.StringParam;
      return addInput(option, param, element, fieldset, id);
    case "literal":
      param = param as types.LiteralParam;
      return addSelect(option, param, element, fieldset, id);
    case "boolean":
      param = param as types.BooleanParam;
      return addBoolean(option, param, element, fieldset, id);
    case "pair":
      param = param as types.PairParam;
      return addPair(option, param, element, fieldset, id);
  }
}
