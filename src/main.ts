import * as types from "./types.ts";
import { options } from "./data/options.ts";

import {
  parseFormData,
  generateOption,
  generateQuadlet,
  generatePodmanRun,
} from "./utils/generate.ts";

const optionSelect = document.getElementById(
  "select-option"
) as HTMLSelectElement;
const optionsFieldset = document.getElementById(
  "options"
) as HTMLFieldSetElement;

// Event listener for calling generateOption
(document.getElementById("add-option") as HTMLFormElement).addEventListener(
  "submit",
  (event) => {
    event.preventDefault();
    const fieldset = generateOption(optionSelect.value);

    optionsFieldset.appendChild(fieldset);
  }
);

// Event listener for generating output
const form = document.getElementById("generate") as HTMLFormElement;
form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const formData = new FormData(form, event.submitter);
  const output =
    formData.get("submit") === "quadlet"
      ? generateQuadlet(parseFormData(formData))
      : formData.get("submit") === "podman-run"
      ? generatePodmanRun(parseFormData(formData))
      : "";

  const outputElement = document.getElementById("quadlet") as HTMLPreElement;
  outputElement.textContent = output;
});

// Populate options
for (const option in options.container) {
  const element = document.createElement("option");
  element.value = option;
  element.textContent = option;
  optionSelect.appendChild(element);
}

// Add image option (required container key)
optionsFieldset.appendChild(generateOption("Image", false));
