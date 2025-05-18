import * as types from "../types.ts";
import { Format } from "../data/format.ts";
import { options } from "../data/options.ts";
import { parseFormData, generatePairs } from "../utils/generate.ts";

// TODO Make this an automated test (Github actions)

// When testing a single test, just comment out the rest for now
// Add this script tag at the bottom of the body
// <script type="module" src="src/tests/test.ts"></script>

function generateFormData(obj: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    const index = key.indexOf("/");
    formData.append(index === -1 ? key : key.substring(0, index), value);
  }

  return formData;
}

// Add x/1 x/2 etc for duplicate form items
const formDataAssertions: [Record<string, string>, types.ParsedFormData][] = [
  // One option, single
  [
    { "AddDevice.host": "/dev/device" },
    { AddDevice: [{ host: "/dev/device" }] },
  ],
  // One option, multiple
  [
    { "AddDevice.host": "/dev/device", "AddDevice.container": "/dev/device" },
    { AddDevice: [{ host: "/dev/device", container: "/dev/device" }] },
  ],
  // One option, including empty
  [
    { "AddDevice.host": "/dev/device", "AddDevice.container": "" },
    { AddDevice: [{ host: "/dev/device", container: "" }] },
  ],
  // Different options, different fields
  [
    {
      "AddDevice.host": "/dev/device",
      "AddDevice.container": "/dev/device",
      "AddHost.hostname": "example.com",
      "AddHost.ip": "192.168.1.0",
    },
    {
      AddDevice: [{ host: "/dev/device", container: "/dev/device" }],
      AddHost: [{ hostname: "example.com", ip: "192.168.1.0" }],
    },
  ],
  // One option, overlapping fields
  [
    { "AddDevice.host/1": "/dev/device", "AddDevice.host/2": "/dev/device" },
    { AddDevice: [{ host: "/dev/device" }, { host: "/dev/device" }] },
  ],
  // One option, overlapping fields, including empty
  [
    { "AddDevice.host/1": "/dev/device", "AddDevice.host/2": "" },
    { AddDevice: [{ host: "/dev/device" }, { host: "" }] },
  ],
  // Different options, overlapping fields
  [
    {
      "AddDevice.host/1": "/dev/device",
      "AddDevice.container": "/dev/device",
      "AddDevice.host/2": "/dev/device",
    },
    {
      AddDevice: [
        { host: "/dev/device", container: "/dev/device" },
        { host: "/dev/device" },
      ],
    },
  ],
  // Array, single, one field
  [
    { "AddCapability.options[0]": "CAP_NET_BIND_SERVICE" },
    { AddCapability: [{ options: ["CAP_NET_BIND_SERVICE"] }] },
  ],
  // Array, multiple, one field
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[1]": "CAP_SYSLOG",
    },
    {
      AddCapability: [{ options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"] }],
    },
  ],
  // Array, single, different fields
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddCapability.dummy": "dummy",
    },
    { AddCapability: [{ options: ["CAP_NET_BIND_SERVICE"], dummy: "dummy" }] },
  ],
  // Array, multiple, different fields
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[1]": "CAP_SYSLOG",
      "AddCapability.dummy": "dummy",
    },
    {
      AddCapability: [
        { options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"], dummy: "dummy" },
      ],
    },
  ],
  // Array, overlapping index, one field
  [
    {
      "AddCapability.options[0]/1": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[0]/2": "CAP_SYSLOG",
    },
    {
      AddCapability: [
        { options: ["CAP_NET_BIND_SERVICE"] },
        { options: ["CAP_SYSLOG"] },
      ],
    },
  ],
  // Array, overlapping index, multiple fields
  [
    {
      "AddCapability.options[0]/1": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[0]/2": "CAP_SYSLOG",
      "AddCapability.dummy": "dummy",
    },
    {
      AddCapability: [
        { options: ["CAP_NET_BIND_SERVICE"] },
        { options: ["CAP_SYSLOG"], dummy: "dummy" },
      ],
    },
  ],
  // Array, different options
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddDevice.host": "/dev/device",
    },
    {
      AddCapability: [{ options: ["CAP_NET_BIND_SERVICE"] }],
      AddDevice: [{ host: "/dev/device" }],
    },
  ],
  // Pair, single, one option
  [
    { "Annotation.values.keys[0]": "A", "Annotation.values.values[0]": "B" },
    { Annotation: [{ values: { A: "B" } }] },
  ],
  // Pair, multiple, one option
  [
    {
      "Annotation.values.keys[0]": "A",
      "Annotation.values.values[0]": "B",
      "Annotation.values.keys[1]": "C",
      "Annotation.values.values[1]": "D",
    },
    { Annotation: [{ values: { A: "B", C: "D" } }] },
  ],
  // Pair, different options
  [
    {
      "Annotation.values.keys[0]": "A",
      "Annotation.values.values[0]": "B",
      "Annotation.values.keys[1]": "C",
      "Annotation.values.values[1]": "D",
      "AddDevice.host": "/dev/device",
    },
    {
      Annotation: [{ values: { A: "B", C: "D" } }],
      AddDevice: [{ host: "/dev/device" }],
    },
  ],
  // Boolean (false), one option
  [
    {
      "AddDevice.ifExists.boolean": "false",
    },
    { AddDevice: [{ ifExists: false }] },
  ],
  // Boolean (true), one option
  [
    {
      "AddDevice.ifExists.boolean/1": "false",
      "AddDevice.ifExists.boolean/2": "true",
    },
    { AddDevice: [{ ifExists: true }] },
  ],
  // Boolean (false), double false
  [
    {
      "AddDevice.ifExists.boolean/1": "false",
      "AddDevice.ifExists.boolean/2": "false",
    },
    { AddDevice: [{ ifExists: false }, { ifExists: false }] },
  ],
  // Boolean (false), different fields
  [
    {
      "AddDevice.ifExists.boolean": "false",
      "AddDevice.host": "/dev/device",
    },
    { AddDevice: [{ ifExists: false, host: "/dev/device" }] },
  ],
  // Boolean (true), different fields
  [
    {
      "AddDevice.ifExists.boolean/1": "false",
      "AddDevice.ifExists.boolean/2": "true",
      "AddDevice.host": "/dev/device",
    },
    { AddDevice: [{ ifExists: true, host: "/dev/device" }] },
  ],
  // Boolean (false), different options
  [
    {
      "AddDevice.ifExists.boolean": "false",
      "AddHost.hostname": "example.com",
      "AddHost.ip": "192.168.1.0",
    },
    {
      AddDevice: [{ ifExists: false }],
      AddHost: [{ hostname: "example.com", ip: "192.168.1.0" }],
    },
  ],
  // Boolean (true), different options
  [
    {
      "AddDevice.ifExists.boolean/1": "false",
      "AddDevice.ifExists.boolean/2": "true",
      "AddHost.hostname": "example.com",
      "AddHost.ip": "192.168.1.0",
    },
    {
      AddDevice: [{ ifExists: true }],
      AddHost: [{ hostname: "example.com", ip: "192.168.1.0" }],
    },
  ],
  // Ignore submit option
  [
    {
      submit: "quadlet",
    },
    {},
  ],
];

const assertions: [any, any][] = [
  [Format.boolean({ value: true }), "true"],
  [Format.boolean({ value: false }), "false"],
  [Format.sepSpace({ values: ["A"] }), "A"],
  [Format.sepSpace({ values: ["A", "B"] }), "A B"],
  [Format.mapping({ host: "/dev/host" }), "/dev/host"],
  [
    Format.mapping({ host: "/dev/host", container: "/dev/container" }),
    "/dev/host:/dev/container",
  ],
  [
    Format.mapping({
      host: "/dev/host",
      container: "/dev/container",
      permissions: ["r", "w", "m"],
    }),
    "/dev/host:/dev/container:rwm",
  ],
  [
    Format.mapping({ host: "/dev/host", permissions: ["r", "w", "m"] }),
    "/dev/host:rwm",
  ],
  [
    Format.mapping({ host: "/dev/host", permissions: ["r", "w", "r"] }),
    "/dev/host:rw",
  ],
  [Format.pair({ values: { A: "B" } }), "A=B"],
  [Format.pair({ values: { A: "B", C: "D" } }), "A=B C=D"],
  [Format.pair({ values: { A: "B C" } }), '"A=B C"'],
  [Format.pair({ values: { A: "B C", D: "E" } }), '"A=B C" D=E'],
  // One field, arg false
  [
    generatePairs({ AutoUpdate: [{ value: "registry" }] }),
    [["AutoUpdate", "registry"]],
  ],
  // Multiple fields, arg false
  [
    generatePairs({
      AddDevice: [{ host: "/dev/device" }],
      AutoUpdate: [{ value: "registry" }],
    }),
    [
      ["AddDevice", "/dev/device"],
      ["AutoUpdate", "registry"],
    ],
  ],
  // Arg true, default format
  [
    generatePairs({ AddDevice: [{ host: "/dev/device" }] }, true),
    [["device", "/dev/device"]],
  ],
  // Arg true, non-default argFormat
  [
    generatePairs({ AutoUpdate: [{ value: "registry" }] }, true),
    [["label", "io.containers.autoupdate=registry"]],
  ],
  // Arg false, seperable field
  [
    generatePairs({ Annotation: [{ values: { A: "B", C: "D" } }] }),
    [["Annotation", "A=B C=D"]],
  ],
  // Arg true, seperable field
  [
    generatePairs({ Annotation: [{ values: { A: "B", C: "D" } }] }, true),
    [
      ["annotation", "A=B"],
      ["annotation", "C=D"],
    ],
  ],

  // TODO tests for generateQuadlet and generatePodmanRun
];

function assert(key: any, value: any) {
  [key, value] = [JSON.stringify(key), JSON.stringify(value)];

  console.debug("asserting", key, "equals", value);
  console.assert(key === value, `${key} !== ${value}`);
}

function assertType(key: any, value: any) {
  console.assert(
    typeof key === value,
    `typeof ${JSON.stringify(key)} !== ${value}`
  );
}

// Typescript does most of this already
function testOptions() {
  for (const option of Object.values(options.container)) {
    assertType(option.arg, "string");
    if ("allowMultiple" in option) assertType(option.allowMultiple, "boolean");
    if ("format" in option) assertType(option.format, "function");
    if ("argFormat" in option) assertType(option.argFormat, "function");
    console.assert(
      Array.isArray(option.params),
      `Array.isArray(option.params (${JSON.stringify(
        option.params
      )})) === false`
    );

    for (const param of option.params) {
      assertType(param.param, "string");
      assertType(param.name, "string");
      assertType(param.type, "string");
      console.assert(
        ["path", "string", "literal", "boolean", "pair"].includes(param.type),
        `param.type (${param.type}) !== path | string | literal | boolean | pair`
      );

      if ("isArray" in param) assertType(param.isArray, "boolean");
      if ("isOptional" in param) assertType(param.isOptional, "boolean");
      if ("condition" in param) assertType(param.condition, "function");

      if (param.type === "literal") {
        // literal needs options
        console.assert(
          "options" in param && param.options != null,
          `param.type (${
            param.type
          }) === literal && param.options (${JSON.stringify(
            param.options
          )}) === undefined | null`
        );

        // verify options is object or array
        assertType(param.options, "object");

        // all values have to be strings
        if (Array.isArray(param.options))
          param.options.forEach((option) => assertType(option, "string"));
        else
          for (const [key, value] of Object.entries(param.options)) {
            assertType(key, "string");
            assertType(value, "string");
          }
      }

      if ("default" in param)
        switch (typeof param.default) {
          case "string":
            // has to be literal
            console.assert(
              param.type === "literal",
              `typeof param.default (${param.default}) === string && param.type !== literal (${param.type})`
            );
            break;
          case "boolean":
            // has to be boolean (checkbox)
            console.assert(
              param.type === "boolean",
              `typeof param.default (${param.default}) === boolean && param.type (${param.type}) !== boolean`
            );
            break;
          default:
            // when neither string or boolean
            console.error(
              `Assertion failed: param.default (${param.default}) !== string | boolean`
            );
        }

      if ("placeholder" in param)
        switch (typeof param.placeholder) {
          case "string":
            // has to be path or string
            console.assert(
              ["path", "string"].includes(param.type),
              `typeof param.placeholder (${param.placeholder}) === string && param.type (${param.type}) !== path | string`
            );
            break;
          case "object":
            // has to be pair
            console.assert(
              param.type === "pair",
              `typeof param.placeholder (${param.placeholder}) === object && param.type (${param.type}) !== pair`
            );
            // object has to be array
            console.assert(
              Array.isArray(param.placeholder),
              `typeof param.placeholder (${param.placeholder}) === object && Array.isArray(param.placeholder) === false`
            );
            // array has to be of length 2
            console.assert(
              param.placeholder.length === 2,
              `typeof param.placeholder (${param.placeholder}) === object && param.placeholder.length (${param.placeholder.length}) !== 2`
            );
            // both have to be strings
            param.placeholder.forEach((placeholder) =>
              assertType(placeholder, "string")
            );
            break;
          default:
            console.error(
              `Assertion failed: param.placeholder (${param.placeholder}) !== string | object`
            );
        }
    }
  }
}

for (const assertion of formDataAssertions) {
  assert(parseFormData(generateFormData(assertion[0])), assertion[1]);
}

for (const assertion of assertions) assert(assertion[0], assertion[1]);

testOptions();
