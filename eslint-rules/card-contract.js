const SLOTS = ["icon", "subtitle", "aside", "badges"];

const TONES = ["info", "success", "warning", "danger", "accent", "neutral"];
const STATES = ["online", "offline", "warning", "busy", "unknown"];

const VOCABULARIES = {
  tone: { values: TONES, owner: "assets/components/badges.scss" },
  state: { values: STATES, owner: "assets/components/status.scss" },
};

// Suffixes that opt a SCREAMING_CASE lookup table into a vocabulary.
const MAP_SUFFIXES = { _STATE: "state", _TONE: "tone" };

// Vue applies computed after methods, so redefining one of these silently
// replaces the mixin helper.
const MIXIN_NAMES = [
  "load",
  "fetch",
  "requireConfig",
  "connectionBadge",
  "reachabilityStatus",
  "versionSubtitle",
  "isValueShown",
  "initAutoUpdate",
  "getUpdateInterval",
];

const FORBIDDEN_STYLE = [
  {
    pattern: /\.status\b/,
    what: "`.status`, owned by assets/components/status.scss",
  },
  { pattern: /\.notifs?\b/, what: "`.notif`, replaced by the `badges` prop" },
  {
    pattern: /\.badge\b/,
    what: "`.badge`, owned by assets/components/badges.scss",
  },
  {
    pattern: /\.card-(content|body|lane|badges|aside)\b/,
    what: "a card layout class, owned by assets/components/base.scss",
  },
  {
    pattern: /\.(quicklinks|tag)\b/,
    what: "`.quicklinks` / `.tag`, owned by assets/components/base.scss",
  },
  { pattern: /position\s*:\s*(absolute|fixed)/, what: "absolute positioning" },
  { pattern: /\bfloat\s*:/, what: "`float`" },
];

function slotName(node) {
  for (const attr of node.startTag.attributes) {
    if (
      attr.directive &&
      attr.key.name.name === "slot" &&
      attr.key.argument?.type === "VIdentifier"
    ) {
      return attr.key.argument.name;
    }
  }
  return null;
}

function* elements(node) {
  for (const child of node.children ?? []) {
    if (child.type === "VElement") {
      yield child;
      yield* elements(child);
    }
  }
}

function keyName(property) {
  if (property.type !== "Property") {
    return null;
  }
  return property.key.type === "Identifier"
    ? property.key.name
    : property.key.type === "Literal"
      ? String(property.key.value)
      : null;
}

function optionValue(component, name) {
  return component.properties.find((p) => keyName(p) === name)?.value ?? null;
}

function optionKeys(component, name) {
  const value = optionValue(component, name);
  return value?.type === "ObjectExpression"
    ? value.properties.map(keyName).filter(Boolean)
    : [];
}

// data() comes as `() => ({...})` or `function () { return {...} }`.
function dataKeys(component) {
  const value = optionValue(component, "data");
  if (
    !value ||
    (value.type !== "ArrowFunctionExpression" &&
      value.type !== "FunctionExpression")
  ) {
    return [];
  }
  let object = value.body;
  if (object.type === "BlockStatement") {
    object = object.body.find((s) => s.type === "ReturnStatement")?.argument;
  }
  return object?.type === "ObjectExpression"
    ? object.properties.map(keyName).filter(Boolean)
    : [];
}

function usesServiceMixin(component) {
  const mixins = optionValue(component, "mixins");
  return (
    mixins?.type === "ArrayExpression" &&
    mixins.elements.some(
      (e) => e?.type === "Identifier" && e.name === "service",
    )
  );
}

function isPureWiring(created) {
  const body =
    created?.type === "FunctionExpression" ? (created.body?.body ?? []) : [];
  if (body.length !== 2) {
    return false;
  }
  const [assign, call] = body;
  return (
    assign.type === "ExpressionStatement" &&
    assign.expression.type === "AssignmentExpression" &&
    assign.expression.left.property?.name === "autoUpdateMethod" &&
    call.type === "ExpressionStatement" &&
    call.expression.type === "CallExpression"
  );
}

export default {
  meta: {
    type: "problem",
    docs: { description: "enforce the Homer service card anatomy" },
    schema: [],
  },
  create(context) {
    const fragment = context.sourceCode.parserServices?.getDocumentFragment?.();
    if (!fragment) {
      return {};
    }

    return {
      Property(node) {
        const name =
          node.key.type === "Identifier"
            ? node.key.name
            : node.key.type === "Literal"
              ? node.key.value
              : null;
        const vocabulary = VOCABULARIES[name];

        if (
          !vocabulary ||
          node.value.type !== "Literal" ||
          typeof node.value.value !== "string" ||
          vocabulary.values.includes(node.value.value)
        ) {
          return;
        }

        context.report({
          node: node.value,
          message: `Unknown ${name} "${node.value.value}". ${vocabulary.owner} defines ${vocabulary.values.join(", ")}; anything else renders without its colour.`,
        });
      },

      // Lookup tables are keyed by upstream names, so the check above misses them.
      VariableDeclarator(node) {
        if (
          node.id.type !== "Identifier" ||
          node.init?.type !== "ObjectExpression" ||
          node.id.name !== node.id.name.toUpperCase()
        ) {
          return;
        }

        const suffix = Object.keys(MAP_SUFFIXES).find((end) =>
          node.id.name.endsWith(end),
        );
        if (!suffix) {
          return;
        }

        const name = MAP_SUFFIXES[suffix];
        const vocabulary = VOCABULARIES[name];

        for (const { value } of node.init.properties) {
          if (
            value?.type === "Literal" &&
            typeof value.value === "string" &&
            !vocabulary.values.includes(value.value)
          ) {
            context.report({
              node: value,
              message: `Unknown ${name} "${value.value}" in ${node.id.name}. ${vocabulary.owner} defines ${vocabulary.values.join(", ")}; anything else renders without its colour.`,
            });
          }
        }
      },

      ExportDefaultDeclaration(node) {
        const component = node.declaration;
        if (
          component?.type !== "ObjectExpression" ||
          !usesServiceMixin(component)
        ) {
          return;
        }

        const text = context.sourceCode.getText();
        const data = dataKeys(component);
        const computed = optionKeys(component, "computed");

        if (optionKeys(component, "props").includes("item")) {
          context.report({
            node: optionValue(component, "props"),
            message:
              'The service mixin already declares the "item" prop; redeclaring it here duplicates the contract.',
          });
        }

        for (const option of ["data", "computed", "methods"]) {
          const keys = option === "data" ? data : optionKeys(component, option);
          for (const shadowed of keys.filter((k) => MIXIN_NAMES.includes(k))) {
            context.report({
              node: optionValue(component, option) ?? component,
              message: `"${shadowed}" in ${option}() shadows the service mixin's own ${shadowed}. Vue applies computed after methods, so the mixin helper becomes unreachable — rename this one.`,
            });
          }
        }

        const created = optionValue(component, "created");
        if (created && isPureWiring(created)) {
          context.report({
            node: created,
            message:
              "Name the loading method fetchData() and delete created(): the mixin calls fetchData on create and on the refresh schedule. Keep created() only to choose a method at runtime.",
          });
        }

        const showsServerError =
          /\b(connectionBadge|reachabilityStatus)\(/.test(text);
        const touchesServerError =
          showsServerError ||
          /\bthis\.(load|requireConfig)\(/.test(text) ||
          /\bthis\.serverError\b/.test(text);
        const ownsServerError =
          data.includes("serverError") || computed.includes("serverError");

        if (touchesServerError && !ownsServerError) {
          context.report({
            node: component,
            message:
              'This card reads or writes serverError — through connectionBadge(), reachabilityStatus(), load() or requireConfig() — but never declares it. Add "serverError: null" to data(): assigning an undeclared field is not reactive, so the chip and badge would never appear.',
          });
        }

        if (/\bthis\.fetch\(/.test(text) && !showsServerError) {
          const template = fragment.children.find(
            (block) => block.type === "VElement" && block.name === "template",
          );
          const templateText = template
            ? context.sourceCode.getText(template)
            : "";
          // A card that renders a list has no single card to hang a badge on.
          const rendersList = /v-for=/.test(templateText);
          // A chip nothing can move off its healthy value surfaces nothing.
          const ownStatus =
            /:status=/.test(templateText) &&
            /(\.catch\(|\bcatch\s*\()/.test(text);

          if (!ownStatus && !rendersList) {
            context.report({
              node: component,
              message:
                "This card calls an API but surfaces no failure. Add this.connectionBadge() to its badges, or a :status chip driven from a catch; otherwise an unreachable service looks identical to an idle one.",
            });
          }
        }
      },

      Program() {
        for (const block of fragment.children) {
          if (block.type !== "VElement") {
            continue;
          }

          if (block.name === "template") {
            const [root, ...extra] = [...(block.children ?? [])].filter(
              (child) => child.type === "VElement",
            );

            if (!root || root.rawName !== "Generic" || extra.length) {
              context.report({
                node: root ?? block,
                message:
                  "A service card must render a single <Generic> as its template root.",
              });
              continue;
            }

            for (const node of elements(root)) {
              const name = slotName(node);
              if (name && !SLOTS.includes(name)) {
                context.report({
                  node,
                  message: `Unknown slot "#${name}". Generic offers ${SLOTS.map((s) => `#${s}`).join(", ")}; counts go through the "badges" prop and the chip through "status".`,
                });
              }
            }
          }

          if (block.name === "style") {
            const css = (block.children ?? [])
              .map((child) => child.value ?? "")
              .join("");

            for (const { pattern, what } of FORBIDDEN_STYLE) {
              if (pattern.test(css)) {
                context.report({
                  node: block,
                  message: `A service card must not define ${what}. Card chrome lives in the shared stylesheets so every card stays aligned.`,
                });
              }
            }
          }
        }
      },
    };
  },
};
