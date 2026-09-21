import type { Range } from '@codemirror/state';
import type {
  Decoration,
  DecorationSet,
  EditorView,
  ViewUpdate,
} from '@codemirror/view';

import type { CMBundle } from '../../utils/lazy-codemirror-loader';
import { getMimeTypeFromDataUrl, isValidUrl } from './utils';

export function getImageReplacerExtensions(cm: CMBundle) {
  const {
    StateEffect,
    StateField,
    Decoration,
    EditorView,
    ViewPlugin,
    WidgetType: WidgetTypeBase,
    syntaxTree,
  } = cm;

  class DataUrlWidget extends WidgetTypeBase {
    constructor(
      private src: string,
      private mimeType: string
    ) {
      super();
    }

    toDOM() {
      if (this.mimeType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = this.src;
        img.style.maxWidth = '100%';
        return img;
      }

      if (this.mimeType === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = this.src;
        iframe.style.width = '100%';
        iframe.style.maxWidth = '100%';
        iframe.style.height = '480px';
        iframe.style.border = '0';
        return iframe;
      }

      if (this.mimeType.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.style.width = '100%';

        const source = document.createElement('source');
        source.src = this.src;
        source.type = this.mimeType;
        audio.appendChild(source);
        return audio;
      }

      const fallback = document.createElement('span');
      fallback.textContent = this.src;
      return fallback;
    }
  }

  class UrlImageWidget extends WidgetTypeBase {
    constructor(
      private params: {
        src: string;
        isOpen: boolean;
        setOpen: (newState: boolean, nodePosition: number) => void;
        position: number;
      }
    ) {
      super();
    }

    positionTooltip(parent: HTMLElement, tooltip: HTMLElement) {
      const rect = parent.getBoundingClientRect();
      const parentRect = parent.offsetParent?.getBoundingClientRect() || {
        left: 0,
        right: window.innerWidth,
      };

      const leftSpace = rect.left - parentRect.left;
      const rightSpace = parentRect.right - rect.right;

      if (leftSpace > rightSpace) {
        tooltip.style.left = '100%';
        tooltip.style.transform = 'translateX(-100%)';
        tooltip.style.right = '';
      } else {
        tooltip.style.right = '100%';
        tooltip.style.transform = 'translateX(100%)';
        tooltip.style.left = '';
      }

      tooltip.style.bottom = '100%';
    }

    createTooltipElement() {
      const tooltip = document.createElement('div');
      tooltip.textContent = 'Click to render image';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'black';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px';
      tooltip.style.zIndex = '201';
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.visibility = 'hidden';
      tooltip.style.display = 'block';
      tooltip.style.fontFamily =
        '"Inter", -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
      tooltip.style.borderRadius = '8px';
      return tooltip;
    }

    createIconElement() {
      const imageIconElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      imageIconElement.setAttribute('width', '24');
      imageIconElement.setAttribute('height', '24');
      imageIconElement.setAttribute('viewBox', '0 0 24 24');
      imageIconElement.setAttribute('fill', 'none');

      const pathElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      pathElement.setAttribute(
        'd',
        'M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM19 19H5V5H19V19ZM8.5 13.5L11 17L14.5 12.5L18 17H6L8.5 13.5Z'
      );
      pathElement.setAttribute('fill', 'currentColor');
      imageIconElement.appendChild(pathElement);
      imageIconElement.style.display = 'inline';

      const tooltip = this.createTooltipElement();

      const iconContainer = document.createElement('span');
      iconContainer.appendChild(imageIconElement);
      iconContainer.appendChild(tooltip);
      iconContainer.style.cursor = 'pointer';
      iconContainer.style.position = 'relative';

      iconContainer.onmouseover = () => {
        this.positionTooltip(iconContainer, tooltip);
        tooltip.style.visibility = 'visible';
      };
      iconContainer.onmouseout = () => {
        tooltip.style.visibility = 'hidden';
      };
      return iconContainer;
    }

    createImageElement() {
      const imgElement = document.createElement('img');
      imgElement.src = this.params.src;
      imgElement.style.maxWidth = '100%';
      imgElement.style.display = this.params.isOpen ? 'block' : 'none';
      imgElement.style.cursor = 'pointer';
      imgElement.referrerPolicy = 'no-referrer';

      imgElement.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const imageEl = e.target as HTMLImageElement;
        if (imageEl.style.display === 'none') {
          imageEl.style.display = 'block';
          this.params.setOpen(true, this.params.position);
        } else {
          imageEl.style.display = 'none';
          this.params.setOpen(false, this.params.position);
        }
      };
      return imgElement;
    }

    toDOM() {
      const container = document.createElement('span');
      container.className = 'cm-image-widget';

      const iconContainer = this.createIconElement();
      const imgElement = this.createImageElement();
      iconContainer.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleImage(container);
      };

      container.appendChild(iconContainer);
      container.appendChild(imgElement);
      return container;
    }

    toggleImage(container: HTMLElement) {
      const imgElement = container.querySelector('img');
      if (imgElement) {
        if (imgElement.style.display === 'none') {
          imgElement.style.display = 'block';
          this.params.setOpen(true, this.params.position);
        } else {
          imgElement.style.display = 'none';
          this.params.setOpen(false, this.params.position);
        }
      }
    }
  }

  const updateDecorationState = StateEffect.define<{
    id: string;
    state: boolean;
  }>();

  const decorationStateField = StateField.define({
    create() {
      return new Map();
    },
    update(map, tr) {
      for (const effect of tr.effects) {
        if (effect.is(updateDecorationState)) {
          map.set(effect.value.id, effect.value.state);
        }
      }
      return map;
    },
  });

  function images(view: EditorView) {
    const widgets: Range<Decoration>[] = [];
    const state = view.state.field(decorationStateField);
    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          if (node.name === 'String' || node.name === 'Literal') {
            const start = node.name === 'Literal' ? node.from : node.from + 1;
            const end = node.name === 'Literal' ? node.to : node.to - 1;
            const text = view.state.doc.sliceString(start, end);
            const mimeType = getMimeTypeFromDataUrl(text);
            const shouldRenderDataUrl =
              mimeType != null &&
              (mimeType.startsWith('image/') ||
                mimeType === 'application/pdf' ||
                mimeType.startsWith('audio/'));

            if (shouldRenderDataUrl) {
              const deco = Decoration.replace({
                widget: new DataUrlWidget(text, mimeType),
                inclusive: true,
              });
              widgets.push(deco.range(node.from, node.to));
            } else if (isValidUrl(text)) {
              const deco = Decoration.widget({
                widget: new UrlImageWidget({
                  src: text,
                  isOpen: state.get(`${node.to}`),
                  setOpen: (newState: boolean, nodePosition: number) => {
                    view.dispatch({
                      effects: updateDecorationState.of({
                        id: `${nodePosition}`,
                        state: newState,
                      }),
                    });
                  },
                  position: node.to,
                }),
                inclusive: true,
              });
              widgets.push(deco.range(node.to));
            }
          }
        },
      });
    }
    return Decoration.set(widgets);
  }

  const imageReplacerPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = images(view);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          syntaxTree(update.startState) !== syntaxTree(update.state)
        ) {
          this.decorations = images(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    }
  );

  return { decorationStateField, imageReplacerPlugin };
}
