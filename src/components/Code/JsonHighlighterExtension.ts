import type { Extension } from '@codemirror/state';
import type {
  Decoration,
  DecorationSet,
  EditorView,
  ViewUpdate,
} from '@codemirror/view';
import type { SyntaxNodeRef } from '@lezer/common';

import type { CMBundle } from '../../utils/lazy-codemirror-loader';

type NodeInfo = { from: number; to: number; name: string };
type DecoratedRange = { from: number; to: number; decoration: Decoration };

type PathSegment = {
  type: 'property' | 'index' | 'wildcard';
  value: string | number;
};

/** Highlights JSON values referenced by variable mappings. */
export function createJsonHighlighterExtension(
  cm: CMBundle,
  variableMapping: Record<string, string | null>,
  dataType: 'input' | 'output' | 'referenceOutput',
  activeVariable: string | null
): Extension {
  const { Decoration, ViewPlugin, syntaxTree } = cm;
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.getDecorations(view);
      }

      getDecorations(view: EditorView): DecorationSet {
        // Match the full data type or a path nested beneath it.
        const relevantMappings = Object.entries(variableMapping).filter(
          ([, path]) => path === dataType || path?.startsWith(`${dataType}.`)
        );

        if (relevantMappings.length === 0) {
          return Decoration.none;
        }

        const ranges: DecoratedRange[] = [];

        for (const [variableName, path] of relevantMappings) {
          if (!path) continue;

          const isActiveVariable = activeVariable === variableName;

          const highlightClass = isActiveVariable
            ? 'bg-yellow-200 dark:bg-yellow-800'
            : 'bg-green-100 dark:bg-green-950';

          if (path === dataType) {
            this.addDecoration(
              ranges,
              0,
              view.state.doc.length,
              highlightClass
            );
            continue;
          }

          // Strip the data type and separator from the stored path.
          const actualPath = path.substring(dataType.length + 1);
          const pathSegments = this.parseJsonPath(actualPath);

          this.findMatchingNodes(view, pathSegments, ranges, highlightClass);
        }

        return Decoration.set(
          ranges.map(({ from, to, decoration }) =>
            Decoration.mark({
              class: decoration.spec.class as string,
            }).range(from, to)
          )
        );
      }

      /** Parses property, array-index, and wildcard path segments. */
      parseJsonPath(path: string): PathSegment[] {
        const segments: PathSegment[] = [];
        let currentSegment = '';
        let inBracket = false;

        for (let i = 0; i < path.length; i++) {
          const char = path[i];

          if (char === '.' && !inBracket) {
            if (currentSegment) {
              segments.push({ type: 'property', value: currentSegment });
              currentSegment = '';
            }
          } else if (char === '[') {
            if (currentSegment) {
              segments.push({ type: 'property', value: currentSegment });
              currentSegment = '';
            }
            inBracket = true;
          } else if (char === ']' && inBracket) {
            if (currentSegment) {
              if (currentSegment === '*') {
                segments.push({ type: 'wildcard', value: '*' });
              } else {
                const index = parseInt(currentSegment, 10);
                segments.push({
                  type: 'index',
                  value: isNaN(index) ? currentSegment : index,
                });
              }
              currentSegment = '';
            }
            inBracket = false;
          } else {
            currentSegment += char;
          }
        }

        if (currentSegment) {
          const numericIndex = parseInt(currentSegment, 10);
          if (currentSegment === '*') {
            segments.push({ type: 'wildcard', value: '*' });
          } else if (
            !isNaN(numericIndex) &&
            numericIndex.toString() === currentSegment
          ) {
            segments.push({ type: 'index', value: numericIndex });
          } else {
            segments.push({ type: 'property', value: currentSegment });
          }
        }

        return segments;
      }

      findMatchingNodes(
        view: EditorView,
        pathSegments: PathSegment[],
        ranges: DecoratedRange[],
        highlightClass: string,
        currentDepth = 0,
        parentFrom = 0,
        parentTo = view.state.doc.length
      ): void {
        const currentSegment = pathSegments[currentDepth];
        if (!currentSegment) return;

        const tree = syntaxTree(view.state);

        tree.iterate({
          from: parentFrom,
          to: parentTo,
          enter: (node) => {
            if (
              currentSegment.type === 'property' &&
              node.name === 'Property'
            ) {
              const { keyNode, valueNode } = this.extractPropertyNodes(node);

              if (!keyNode) return;

              const keyName = this.extractKeyName(view, keyNode);

              if (keyName !== currentSegment.value) return;

              if (currentDepth === pathSegments.length - 1 && valueNode) {
                this.addDecoration(
                  ranges,
                  valueNode.from,
                  valueNode.to,
                  highlightClass
                );
              } else if (currentDepth < pathSegments.length - 1 && valueNode) {
                if (valueNode.name === 'Object' || valueNode.name === 'Array') {
                  this.findMatchingNodes(
                    view,
                    pathSegments,
                    ranges,
                    highlightClass,
                    currentDepth + 1,
                    valueNode.from,
                    valueNode.to
                  );
                }
              }
            } else if (
              (currentSegment.type === 'index' ||
                currentSegment.type === 'wildcard') &&
              node.name === 'Array'
            ) {
              const elements = this.extractArrayElements(node);
              if (currentSegment.type === 'index') {
                const targetIndex = currentSegment.value as number;

                // Negative indices address elements from the end of the array.
                const resolvedIndex =
                  targetIndex >= 0
                    ? targetIndex
                    : elements.length + targetIndex;

                if (resolvedIndex < 0 || resolvedIndex >= elements.length) {
                  return;
                }

                const targetElement = elements[resolvedIndex];

                if (currentDepth === pathSegments.length - 1) {
                  this.addDecoration(
                    ranges,
                    targetElement.from,
                    targetElement.to,
                    highlightClass
                  );
                } else if (currentDepth < pathSegments.length - 1) {
                  this.findMatchingNodes(
                    view,
                    pathSegments,
                    ranges,
                    highlightClass,
                    currentDepth + 1,
                    targetElement.from,
                    targetElement.to
                  );
                }
              } else if (currentSegment.type === 'wildcard') {
                elements.forEach((element) => {
                  if (currentDepth === pathSegments.length - 1) {
                    this.addDecoration(
                      ranges,
                      element.from,
                      element.to,
                      highlightClass
                    );
                  } else if (currentDepth < pathSegments.length - 1) {
                    this.findMatchingNodes(
                      view,
                      pathSegments,
                      ranges,
                      highlightClass,
                      currentDepth + 1,
                      element.from,
                      element.to
                    );
                  }
                });
              }
            }
          },
        });
      }

      private extractArrayElements(arrayNode: SyntaxNodeRef): NodeInfo[] {
        const elements: NodeInfo[] = [];

        const cursor = arrayNode.node.cursor();

        if (cursor.firstChild()) {
          if (cursor.nextSibling()) {
            do {
              if (
                cursor.name === 'Expression' ||
                cursor.name === 'Number' ||
                cursor.name === 'String' ||
                cursor.name === 'True' ||
                cursor.name === 'False' ||
                cursor.name === 'Null' ||
                cursor.name === 'Array' ||
                cursor.name === 'Object'
              ) {
                elements.push({
                  from: cursor.from,
                  to: cursor.to,
                  name: cursor.name,
                });
              }
            } while (cursor.nextSibling());
          }
        }

        return elements;
      }

      private extractPropertyNodes(node: SyntaxNodeRef): {
        keyNode?: NodeInfo;
        valueNode?: NodeInfo;
      } {
        let keyNode: NodeInfo | undefined;
        let valueNode: NodeInfo | undefined;

        const cursor = node.node.cursor();
        if (cursor.firstChild()) {
          do {
            if (cursor.name === 'PropertyName') {
              keyNode = {
                from: cursor.from,
                to: cursor.to,
                name: cursor.name,
              };
            } else if (
              cursor.name === 'Expression' ||
              cursor.name === 'Number' ||
              cursor.name === 'String' ||
              cursor.name === 'True' ||
              cursor.name === 'False' ||
              cursor.name === 'Null' ||
              cursor.name === 'Array' ||
              cursor.name === 'Object'
            ) {
              valueNode = {
                from: cursor.from,
                to: cursor.to,
                name: cursor.name,
              };
            }
          } while (cursor.nextSibling());
        }

        return { keyNode, valueNode };
      }

      private extractKeyName(view: EditorView, keyNode: NodeInfo): string {
        const keyText = view.state.doc.sliceString(keyNode.from, keyNode.to);
        return keyText.replace(/^["'](.*)["']$/, '$1');
      }

      private addDecoration(
        ranges: DecoratedRange[],
        from: number,
        to: number,
        highlightClass: string
      ): void {
        const decoration = Decoration.mark({
          class: highlightClass,
        });

        ranges.push({
          from,
          to,
          decoration,
        });
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.getDecorations(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}
