import * as types from "../types.ts";
import { options } from "../data/options.ts";
import { conditions, parseFormData } from "./generate.ts";

export function updateConditional(fieldset?: HTMLFieldSetElement) {
  const formData = new FormData(
    document.getElementById("generate") as HTMLFormElement
  );
  if (fieldset) {
    // Add all fields from passed fieldset (not yet added to DOM)
    for (const input of fieldset.querySelectorAll<types.FormElement>(
      "input, select"
    )) {
      if (input.name) formData.append(input.name, input.value);
    }
  }

  const data = parseFormData(formData);
  for (const [option, conditionParams] of Object.entries(conditions)) {
    for (const [conditionParam, elements] of Object.entries(conditionParams)) {
      // Find the param (for the condition)
      const contextParam = options.container[option].params.find(
        (param) => param.param === conditionParam
      );

      if (typeof contextParam?.condition !== "function") continue;

      // Evaluate the condition and disable/enable
      const disabled = !contextParam.condition(data);
      for (const element of elements) {
        // Doesn't matter if element isn't connected to DOM
        element.disabled = disabled;
      }
    }
  }
}
