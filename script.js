"use strict";
const resourceSelect = document.getElementById("resource-select");

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
  const sidebarResourceClone = sidebarResourceTemplate.content.cloneNode(true);
  const resourceButton = sidebarResourceClone.querySelector("button");
  resourceButton.id = `resource-sidebar-${id}`;
  resourceButton.setAttribute("aria-controls", `resource-page-${id}`);
  resourceButton.textContent = `Unnamed ${name}`;
  resourceButton.onclick = () => setPage(id);

  // Create the (hidden) resource page
  const pageClone = document.getElementById(`${type}-template`).content.cloneNode(true);
  const page = pageClone.querySelector(".resource");
  page.id = `resource-page-${id}`;
  page.setAttribute("aria-labelledby", `resource-sidebar-${id}`);
  page.style.display = "none";

  // Create the tabs with their navbar buttons
  let first = true;
  for (const tabButton of page.querySelector(".navbar-tabs").children) {
    const tabName = tabButton.getAttribute("data-tab");

    tabButton.id = `resource-navbar-${tabName}-${id}`;
    tabButton.setAttribute("aria-controls", `resource-tab-${tabName}-${id}`);
    tabButton.onclick = () => setTab(id, tabName);

    const tab = page.querySelector(`.content [data-tab="${tabName}"]`);
    tab.id = `resource-tab-${tabName}-${id}`;
    tab.setAttribute("aria-labelledby", `resource-navbar-${tabName}-${id}`);
    if (!first) tab.style.display = "none";
    first = false;
  }

  sidebarResourceList.appendChild(resourceButton);
  pages.appendChild(page);

  setPage(id);
}

// element: data-when, type: 'enable'|'show'
function updateConditionalDo(optionGroup, element, type) {
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
    const optionElement = optionGroup.querySelector(`[data-option="${option}"]`).value;
    return evalValue(optionElement, rule);
  }

  const succeeded = evalCondition(condition);
  if (type === "show") element.style.display = succeeded ? "" : "none";
  element.disabled = !succeeded;

  // Reset the selection if it's disabled/hidden
  if (!succeeded && element.tagName === "OPTION" && element.selected) {
    const select = element.closest("select");
    for (const option of select.options) {
      option.selected = option.defaultSelected;
    }
  }
}

function selectConditional(optionGroup) {
  for (const element of optionGroup.querySelectorAll("[data-enable-when]")) {
    updateConditionalDo(optionGroup, element, "enable");
  }

  for (const element of optionGroup.querySelectorAll("[data-show-when]")) {
    updateConditionalDo(optionGroup, element, "show");
  }
}

function updateConditional(event) {
  if (event) selectConditional(event.target.closest("[data-option-group]"));
  else {
    for (const optionGroup of document.querySelectorAll("[data-option-group]")) {
      selectConditional(optionGroup);
    }
  }
}

document.addEventListener("input", updateConditional);
document.addEventListener("change", updateConditional);
updateConditional();

document.getElementById("add-resource").addEventListener("click", () => addResource(resourceSelect.value));
