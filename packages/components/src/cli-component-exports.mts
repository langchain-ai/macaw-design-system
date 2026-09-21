import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Node } from 'oxc-parser';
import { parseSync, Visitor } from 'oxc-parser';

export class ComponentSourceError extends Error {
  readonly code = 'ERR_COMPONENT_SOURCE';
}

// These library exports are component aliases with no local implementation.
const EXTERNAL_COMPONENTS: Record<string, string[]> = {
  '@headlessui/react': ['TabGroup', 'TabPanels'],
  '@radix-ui/react-context-menu': ['Root', 'Trigger'],
  '@radix-ui/react-dropdown-menu': [
    'Trigger',
    'Portal',
    'Group',
    'Label',
    'Sub',
  ],
  '@radix-ui/react-hover-card': ['Root', 'Trigger'],
  '@radix-ui/react-popover': ['Root', 'Trigger', 'Anchor'],
  '@radix-ui/react-select': ['Value'],
};

function isRenderExpression(node: Node | null | undefined): boolean {
  if (!node) return false;
  switch (node.type) {
    case 'JSXElement':
    case 'JSXFragment':
      return true;
    case 'Literal':
      return node.value === null;
    case 'ConditionalExpression':
      return (
        isRenderExpression(node.consequent) ||
        isRenderExpression(node.alternate)
      );
    case 'LogicalExpression':
      return isRenderExpression(node.right);
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
    case 'ParenthesizedExpression':
      return isRenderExpression(node.expression);
    default:
      return false;
  }
}

function readModule(file: string) {
  const parsed = parseSync(file, fs.readFileSync(file, 'utf8'));
  if (parsed.errors.some(({ severity }) => severity === 'Error')) {
    throw new ComponentSourceError(
      `Could not parse component exports from ${file}.`
    );
  }
  function hasReactType(
    node: Node | null | undefined,
    names: string[]
  ): boolean {
    if (node?.type === 'TSTypeAnnotation')
      return hasReactType(node.typeAnnotation, names);
    if (node?.type === 'TSUnionType')
      return node.types.some((type) => hasReactType(type, names));
    if (node?.type !== 'TSTypeReference') return false;
    const typeName = node.typeName;
    const identifier =
      typeName.type === 'TSQualifiedName' ? typeName.left : typeName;
    if (identifier.type !== 'Identifier') return false;
    return parsed.module.staticImports.some(
      (declaration) =>
        declaration.moduleRequest.value === 'react' &&
        declaration.entries.some(
          (entry) =>
            entry.localName.value === identifier.name &&
            names.includes(
              typeName.type === 'TSQualifiedName' &&
                ['Default', 'NamespaceObject'].includes(entry.importName.kind)
                ? typeName.right.name
                : (entry.importName.name ?? '')
            )
        )
    );
  }
  const typedFunctions = new WeakSet<Node>();
  const bindings = new Map<string, Node>();
  for (const statement of parsed.program.body) {
    if (statement.type === 'ExportDefaultDeclaration') {
      bindings.set('default', statement.declaration);
    }
    const declaration =
      statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration'
        ? statement.declaration
        : statement;
    if (declaration?.type === 'VariableDeclaration') {
      for (const { id, init } of declaration.declarations) {
        if (id.type === 'Identifier' && init) {
          bindings.set(id.name, init);
          if (
            hasReactType(id.typeAnnotation, [
              'FC',
              'FunctionComponent',
              'ComponentType',
            ])
          )
            typedFunctions.add(init);
        }
      }
    } else if (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id
    ) {
      bindings.set(declaration.id.name, declaration);
    }
  }
  const renderFunctions = typedFunctions;
  const objectFunctions = new WeakSet<Node>();
  const functions: Node[] = [];
  function enterFunction(node: Node) {
    functions.push(node);
    if (
      (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression') &&
      hasReactType(node.returnType, ['ReactNode', 'ReactElement'])
    )
      renderFunctions.add(node);
    if (
      node.type === 'ArrowFunctionExpression' &&
      isRenderExpression(node.body)
    ) {
      renderFunctions.add(node);
    }
  }
  function exitFunction() {
    functions.pop();
  }
  new Visitor({
    FunctionDeclaration: enterFunction,
    FunctionExpression: enterFunction,
    ArrowFunctionExpression: enterFunction,
    'FunctionDeclaration:exit': exitFunction,
    'FunctionExpression:exit': exitFunction,
    'ArrowFunctionExpression:exit': exitFunction,
    ReturnStatement(node) {
      const owner = functions.at(-1);
      if (owner && isRenderExpression(node.argument))
        renderFunctions.add(owner);
      if (owner && isObjectExpression(node.argument))
        objectFunctions.add(owner);
    },
  }).visit(parsed.program);
  return { parsed, bindings, renderFunctions, objectFunctions };
}

function isObjectExpression(node: Node | null | undefined): boolean {
  if (!node) return false;
  switch (node.type) {
    case 'ObjectExpression':
    case 'NewExpression':
      return true;
    case 'ConditionalExpression':
      return (
        isObjectExpression(node.consequent) ||
        isObjectExpression(node.alternate)
      );
    case 'LogicalExpression':
      return isObjectExpression(node.left) || isObjectExpression(node.right);
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
    case 'ParenthesizedExpression':
      return isObjectExpression(node.expression);
    default:
      return false;
  }
}

export function componentExports(
  entrypoint: string,
  family: string,
  root: string
) {
  const modules = new Map<string, ReturnType<typeof readModule>>();
  function getModule(file: string) {
    let module = modules.get(file);
    if (!module) {
      module = readModule(file);
      modules.set(file, module);
    }
    return module;
  }
  function importedReference(file: string, node: Node | null | undefined) {
    if (!node) return undefined;
    const member = node.type === 'MemberExpression' && !node.computed;
    const identifier = member ? node.object : node;
    if (identifier.type !== 'Identifier') return undefined;
    for (const declaration of getModule(file).parsed.module.staticImports) {
      for (const entry of declaration.entries) {
        if (entry.isType || entry.localName.value !== identifier.name) continue;
        if (
          member &&
          !['Default', 'NamespaceObject'].includes(entry.importName.kind)
        )
          continue;
        const name =
          member && node.property.type === 'Identifier'
            ? node.property.name
            : entry.importName.kind === 'Default'
              ? 'default'
              : entry.importName.name;
        if (name) return { source: declaration.moduleRequest.value, name };
      }
    }
    return undefined;
  }
  function resolveSource(file: string, source: string) {
    if (!source.startsWith('.') && !source.startsWith('@/')) return undefined;
    const base = (
      source.startsWith('@/')
        ? path.join(root, 'src', source.slice(2))
        : path.resolve(path.dirname(file), source)
    ).replace(/\.[jt]sx?$/, '');
    const resolved = ['.ts', '.tsx', '/index.ts', '/index.tsx']
      .map((suffix) => `${base}${suffix}`)
      .find((candidate) => fs.existsSync(candidate));
    if (!resolved)
      throw new ComponentSourceError(
        `Could not resolve ${source} from ${file}.`
      );
    return resolved;
  }
  function resolveExport(
    file: string,
    source: string,
    name: string,
    seen: Set<string>
  ): boolean {
    const resolved = resolveSource(file, source);
    return resolved
      ? isComponentExport(resolved, name, seen)
      : (EXTERNAL_COMPONENTS[source]?.includes(name) ?? false);
  }
  function isComponent(
    file: string,
    node: Node | null | undefined,
    seen: Set<string>
  ): boolean {
    if (!node) return false;
    const key = `${file}:${node.start}:${node.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    const module = getModule(file);
    switch (node.type) {
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        return (
          module.renderFunctions.has(node) &&
          !module.objectFunctions.has(node) &&
          (node.type !== 'ArrowFunctionExpression' ||
            !isObjectExpression(node.body))
        );
      case 'ClassDeclaration':
      case 'ClassExpression': {
        const base = importedReference(file, node.superClass);
        return (
          base?.source === 'react' &&
          ['Component', 'PureComponent'].includes(base.name)
        );
      }
      case 'CallExpression': {
        const wrapper = importedReference(file, node.callee);
        return (
          wrapper?.source === 'react' &&
          ['forwardRef', 'memo'].includes(wrapper.name) &&
          isComponent(file, node.arguments[0], seen)
        );
      }
      case 'TSAsExpression':
      case 'TSSatisfiesExpression':
      case 'ParenthesizedExpression':
        return isComponent(file, node.expression, seen);
      case 'Identifier':
      case 'MemberExpression': {
        const imported = importedReference(file, node);
        if (imported) {
          return resolveExport(file, imported.source, imported.name, seen);
        }
        return (
          node.type === 'Identifier' &&
          isComponent(file, module.bindings.get(node.name), seen)
        );
      }
      default:
        return false;
    }
  }
  function isComponentExport(file: string, name: string, seen: Set<string>) {
    const key = `${file}:${name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (name === 'default') {
      return isComponent(file, getModule(file).bindings.get(name), seen);
    }
    for (const declaration of getModule(file).parsed.module.staticExports) {
      for (const entry of declaration.entries) {
        if (entry.isType || entry.exportName.name !== name) continue;
        if (entry.moduleRequest && entry.importName.name) {
          return resolveExport(
            file,
            entry.moduleRequest.value,
            entry.importName.name,
            seen
          );
        }
        return isComponent(
          file,
          getModule(file).bindings.get(entry.localName.name ?? ''),
          seen
        );
      }
    }
    return getModule(file).parsed.module.staticExports.some(({ entries }) =>
      entries.some(
        (entry) =>
          !entry.isType &&
          entry.importName.kind === 'AllButDefault' &&
          entry.moduleRequest &&
          resolveExport(file, entry.moduleRequest.value, name, new Set(seen))
      )
    );
  }
  function exportNames(file: string, seen = new Set<string>()): Set<string> {
    if (seen.has(file)) return new Set();
    seen.add(file);
    const names = new Set<string>();
    for (const { entries } of getModule(file).parsed.module.staticExports) {
      for (const entry of entries) {
        if (entry.isType) continue;
        if (entry.exportName.kind === 'Default') names.add('default');
        else if (entry.exportName.name) names.add(entry.exportName.name);
        else if (
          entry.importName.kind === 'AllButDefault' &&
          entry.moduleRequest
        ) {
          const resolved = resolveSource(file, entry.moduleRequest.value);
          if (resolved)
            for (const name of exportNames(resolved, seen)) {
              if (name !== 'default') names.add(name);
            }
        }
      }
    }
    return names;
  }
  const components = new Map<string, { name: string; exportName: string }>();
  const names = [...exportNames(entrypoint)].sort(
    (a, b) => Number(a === 'default') - Number(b === 'default')
  );
  for (const exportName of names) {
    const name = exportName === 'default' ? family : exportName;
    if (
      /^[A-Z][\w$]*$/.test(name) &&
      !components.has(name) &&
      isComponentExport(entrypoint, exportName, new Set())
    ) {
      components.set(name, { name, exportName });
    }
  }
  return [...components.values()];
}
