"use strict";

const sidebarResourceTemplate = document.getElementById("sidebar-resource-template");
const sidebarResourceList = document.getElementById("sidebar-resource-list");
const pages = document.getElementById("pages");

let idCount = 1;

function setPage(id) {
  const resourcePage = document.getElementById(`resource-page-${id}`);
  if (resourcePage.style.display !== "none") return;

  for (const element of pages.children) element.style.display = "none";
  resourcePage.style.display = "";
}

function setTab(id, tabName) {
  const tab = document.getElementById(`resource-tab-${tabName}-${id}`);
  const tabs = tab.parentElement;

  if (tab.style.display !== "none") return;

  for (const element of tabs.children) element.style.display = "none";
  tab.style.display = "";
}

function addResource(type) {
  const id = idCount++;
  const name = type.substring(type.indexOf("-") + 1).replace("-", " ");

  // Create the sidebar resource button
  const resourceButton = document.createElement("button");
  resourceButton.id = `resource-sidebar-${id}`;
  resourceButton.role = "tab";
  resourceButton.setAttribute("aria-controls", `resource-page-${id}`);
  resourceButton.textContent = `Unnamed ${name}`;
  resourceButton.onclick = () => setPage(id);

  // Create the (hidden for now) resource page
  const pageClone = document.getElementById(`template-${type}`).content.cloneNode(true);
  const page = pageClone.querySelector(".resource");
  page.id = `resource-page-${id}`;
  page.setAttribute("aria-labelledby", `resource-sidebar-${id}`);
  page.style.display = "none";

  // Connect the tabs with their navbar buttons
  let first = true;
  for (const tabButton of page.querySelector(".navbar-tabs").children) {
    const tabName = tabButton.getAttribute("data-tab");

    tabButton.id = `resource-navbar-${tabName}-${id}`;
    tabButton.type = "button";
    tabButton.setAttribute("aria-controls", `resource-tab-${tabName}-${id}`);
    tabButton.onclick = () => setTab(id, tabName);

    const tab = page.querySelector(`.content [data-tab="${tabName}"]`);
    tab.id = `resource-tab-${tabName}-${id}`;
    tab.setAttribute("aria-labelledby", `resource-navbar-${tabName}-${id}`);

    if (!first) tab.style.display = "none";
    first = false;
  }

  // Connect the labels and information
  for (const option of page.querySelectorAll(".option")) {
    const input = option.querySelector("input, select");
    const inputId = `option-${input.name}-${id}`;
    input.id = inputId;

    const label = option.querySelector("label");
    if (label) label.htmlFor = inputId;

    const small = option.querySelector("small");
    if (small) {
      small.id = `${inputId}-descriptor`;
      input.setAttribute("aria-describedby", small.id);
    }

    const paragraph = option.querySelector("p");
    const info = option.querySelector(".info");
    if (info) {
      paragraph.id = `${inputId}-info`;
      info.id = `${inputId}-info-toggle`;
      info.role = "button";
      info.tabIndex = 0;
      info.setAttribute("aria-label", "More information");
      info.setAttribute("aria-controls", paragraph.id);
      info.setAttribute("aria-expanded", false);
      info.onclick = () => {
        paragraph.hidden = !paragraph.hidden;
        info.setAttribute("aria-expanded", !paragraph.hidden);
      };

      paragraph.setAttribute("aria-labelledby", info.id);
    }
  }

  sidebarResourceList.appendChild(resourceButton);
  pages.appendChild(page);

  setPage(id);
}

// element: data-when, type: 'enable'|'show'
function updateConditional(form, element, type) {
  const condition = JSON.parse(element.getAttribute(`data-${type}-when`));

  // Eval single option value
  function evalValue(value, rule) {
    if (typeof rule === "string") return value === rule;
    if (rule.not !== undefined) return !evalValue(value, rule.not);
    if (rule.any) return rule.any.some((r) => evalValue(value, r));
    if (rule.all) return rule.all.every((r) => evalValue(value, r));

    if (rule.contains !== undefined) {
      const c = rule.contains;
      if (typeof c === "string") return value.includes(c);
      if (c.any) return c.any.some((v) => value.includes(v));
      if (c.all) return c.all.every((v) => value.includes(v));
    }
  }

  // Eval condition tree
  function evalCondition(cond) {
    if (cond.not) return !evalCondition(cond.not);
    if (cond.all) return cond.all.every(evalCondition);
    if (cond.any) return cond.any.some(evalCondition);

    const option = Object.keys(cond)[0];
    const rule = cond[option];
    const optionElement = form.querySelector(`[name="${option}"]`).value;
    return evalValue(optionElement, rule);
  }

  const matched = evalCondition(condition);
  if (type === "show") {
    element.hidden = !matched;
    element.style.display = matched ? "" : "none";
  }
  element.disabled = !matched;

  // Reset the selection if it's disabled/hidden
  if (!matched && element.tagName === "OPTION" && element.selected) {
    const select = element.closest("select");
    for (const option of select.options) {
      option.selected = option.defaultSelected;
    }
  }
}

function selectConditional(form) {
  for (const element of form.querySelectorAll("[data-enable-when]")) {
    updateConditional(form, element, "enable");
  }

  for (const element of form.querySelectorAll("[data-show-when]")) {
    updateConditional(form, element, "show");
  }
}

function updateConditionals(event) {
  if (event) selectConditional(event.target.closest("form"));
  else {
    for (const form of document.querySelectorAll("form")) {
      selectConditional(form);
    }
  }
}

document.addEventListener("input", updateConditionals);
document.addEventListener("change", updateConditionals);
updateConditionals();

const addResourceForm = document.forms["add-resource"];
addResourceForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const type = addResourceForm.elements.namedItem("resource").value;
  if (document.getElementById(`template-${type}`)) addResource(type);
});
