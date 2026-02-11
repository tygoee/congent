"use strict";

import ini from "./ini.js?v6.0.0";

const sidebarList = document.getElementById("sidebar-list");
const pages = document.getElementById("pages");

let idCount = 1;

function setPage(id) {
  for (const resourceTab of sidebarList.children) {
    resourceTab.setAttribute("aria-selected", false);
  }

  const sidebarPage = document.getElementById(`resource-sidebar-${id}`);
  sidebarPage.setAttribute("aria-selected", true);

  const resourcePage = document.getElementById(`resource-page-${id}`);
  if (resourcePage.style.display !== "none") return;

  for (const element of pages.children) element.style.display = "none";
  resourcePage.style.display = "";
}

function setTab(id, tabName) {
  const currentPanel = document.getElementById(`resource-tab-${tabName}-${id}`);
  const panels = currentPanel.parentElement;
  const currentTab = document.getElementById(`resource-navbar-${tabName}-${id}`);
  const tabs = currentTab.parentElement;

  // All panels/tabs
  for (const panel of panels.children) {
    panel.style.display = "none";
  }

  for (const tab of tabs.children) {
    tab.classList.remove("selected");
    tab.setAttribute("aria-selected", false);
  }

  // Current panel/tab only
  currentPanel.style.display = "";
  currentTab.classList.add("selected");
  currentTab.setAttribute("aria-selected", true);
}

function addResource(type) {
  const id = idCount++;
  const name = type.substring(type.indexOf("-") + 1).replace("-", " ");

  // Create the sidebar resource button
  const sidebarTab = document.createElement("button");
  sidebarTab.id = `resource-sidebar-${id}`;
  sidebarTab.role = "tab";
  sidebarTab.setAttribute("aria-controls", `resource-page-${id}`);
  sidebarTab.textContent = `Unnamed ${name}`;
  sidebarTab.onclick = () => setPage(id);

  // Create the (hidden for now) resource page
  const pageClone = document.getElementById(`template-${type}`).content.cloneNode(true);
  const page = pageClone.querySelector(".resource");
  page.id = `resource-page-${id}`;
  page.setAttribute("aria-labelledby", `resource-sidebar-${id}`);
  page.style.display = "none";

  // Connect the tabs with their navbar buttons
  let first = true;
  for (const tab of page.querySelector(".tabs").children) {
    const tabName = tab.getAttribute("data-tab");

    tab.id = `resource-navbar-${tabName}-${id}`;
    tab.type = "button";
    tab.setAttribute("aria-controls", `resource-tab-${tabName}-${id}`);
    tab.onclick = () => setTab(id, tabName);

    const panel = page.querySelector(`.content [data-tab="${tabName}"]`);
    panel.id = `resource-tab-${tabName}-${id}`;
    panel.setAttribute("aria-labelledby", `resource-navbar-${tabName}-${id}`);

    panel.style.display = first ? "" : "none";
    tab.setAttribute("aria-selected", first);
    first = false;
  }

  // Connect the labels and information
  for (const option of page.querySelectorAll(".option")) {
    const input = option.querySelector("input, select");
    const inputId = `option-${option.getAttribute("data-option")}-${id}`;
    input.id = inputId;

    const label = option.querySelector("label");
    if (label) label.htmlFor = inputId;

    const small = option.querySelector("small");
    if (small) {
      small.id = `${inputId}-descriptor`;
      input.setAttribute("aria-describedby", small.id);
    }

    const info = option.querySelector(".info");
    const infoToggle = option.querySelector(".info-toggle");
    if (infoToggle) {
      info.id = `${inputId}-info`;
      info.hidden = true;

      infoToggle.id = `${inputId}-info-toggle`;
      infoToggle.type = "button";
      infoToggle.setAttribute("aria-label", "More information");
      infoToggle.setAttribute("aria-controls", info.id);
      infoToggle.setAttribute("aria-expanded", false);

      infoToggle.onclick = () => {
        info.hidden = !info.hidden;
        infoToggle.setAttribute("aria-expanded", !info.hidden);
      };

      info.setAttribute("aria-labelledby", infoToggle.id);
    }
  }

  sidebarList.appendChild(sidebarTab);
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
