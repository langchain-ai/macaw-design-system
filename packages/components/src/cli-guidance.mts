import * as fs from 'node:fs';
import * as path from 'node:path';

import ts from 'typescript';

import type { Component } from '../../cli/src/commands.mts';

type Guidance = NonNullable<Component['guidance']>;
type Entry = Guidance & {
  api?: {
    source: string;
    propsType: string;
    props: string[];
    implementation?: string;
  };
};

export function buildGuidance(root: string): Record<string, Guidance> {
  const file = path.join(root, 'docs/component-guidance.json');
  if (!fs.existsSync(file)) return {};
  const entries: Record<string, Entry> = JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
  return Object.fromEntries(
    Object.entries(entries).map(([name, { api, ...guidance }]) => {
      if (!api) return [name, guidance];
      const source = fs.readFileSync(path.join(root, api.source), 'utf8');
      const ast = ts.createSourceFile(
        api.source,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      const defaults = new Map<string, string>();
      const aliases = new Map<string, ts.TypeNode>();
      let members: ts.NodeArray<ts.TypeElement> | undefined;
      function renderFunction(
        node: ts.Node
      ):
        | ts.FunctionDeclaration
        | ts.FunctionExpression
        | ts.ArrowFunction
        | undefined {
        if (
          ts.isFunctionDeclaration(node) ||
          ts.isFunctionExpression(node) ||
          ts.isArrowFunction(node)
        )
          return node;
        return ts.forEachChild(node, renderFunction);
      }
      function visit(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node))
          aliases.set(node.name.text, node.type);
        if (
          ts.isInterfaceDeclaration(node) &&
          node.name.text === api!.propsType
        )
          members = node.members;
        if (
          ts.isTypeAliasDeclaration(node) &&
          node.name.text === api!.propsType &&
          ts.isTypeLiteralNode(node.type)
        )
          members = node.type.members;
        if (
          (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) &&
          node.name?.getText(ast) === (api!.implementation ?? name)
        ) {
          for (const parameter of renderFunction(node)?.parameters ?? []) {
            if (!ts.isObjectBindingPattern(parameter.name)) continue;
            for (const binding of parameter.name.elements) {
              if (binding.initializer)
                defaults.set(
                  (binding.propertyName ?? binding.name).getText(ast),
                  binding.initializer.getText(ast)
                );
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
      const supportedProps = Object.fromEntries(
        api.props.map((prop) => {
          const member = members?.find(
            (node): node is ts.PropertySignature =>
              ts.isPropertySignature(node) && node.name.getText(ast) === prop
          );
          if (!member?.type)
            throw new Error(
              `Missing documented prop ${name}.${prop} in ${api.source}`
            );
          const resolved = ts.isTypeReferenceNode(member.type)
            ? (aliases.get(member.type.typeName.getText(ast)) ?? member.type)
            : member.type;
          const types: readonly ts.TypeNode[] = ts.isUnionTypeNode(resolved)
            ? resolved.types
            : [resolved];
          const literals = types.filter(ts.isLiteralTypeNode);
          const values =
            literals.length === types.length
              ? literals.map((node) =>
                  node.literal.getText(ast).replace(/^['"]|['"]$/g, '')
                )
              : undefined;
          return [
            prop,
            {
              type: member.type.getText(ast),
              required: !member.questionToken,
              ...(values ? { values } : {}),
              ...(defaults.has(prop) ? { default: defaults.get(prop) } : {}),
            },
          ];
        })
      );
      return [
        name,
        {
          ...guidance,
          supportedProps,
          apiSource: api.source,
          apiCoverage:
            'Selected locally declared props only; inherited props and referenced types require the linked source.',
        },
      ];
    })
  );
}
