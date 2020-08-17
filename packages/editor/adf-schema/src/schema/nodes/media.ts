import { NodeSpec, Node as PMNode } from 'prosemirror-model';
import { N30 } from '../../utils/colors';

export type MediaType = 'file' | 'link' | 'external';
export type DisplayType = 'file' | 'thumbnail';

export type DefaultAttributes<T> = {
  [P in keyof T]: {
    default?: T[P] | null;
  };
};

/**
 * @name media_node
 */
export interface MediaDefinition {
  type: 'media';
  /**
   * @minItems 1
   */
  attrs: MediaAttributes | ExternalMediaAttributes;
}

export interface MediaBaseAttributes {
  /**
   * @minLength 1
   */
  id: string;
  collection: string;
  height?: number;
  width?: number;
  /**
   * @minLength 1
   */
  occurrenceKey?: string;
  /**
   * @stage 0
   */
  alt?: string;
  // For both CQ and JIRA
  __fileName?: string | null;
  // For CQ
  __fileSize?: number | null;
  __fileMimeType?: string | null;
  // For JIRA
  __displayType?: DisplayType | null;
  // For copy & paste
  __contextId?: string;

  // is set to true when new external media is inserted, false for external media in existing documents
  __external?: boolean;
}

export interface MediaAttributes extends MediaBaseAttributes {
  type: 'file' | 'link';
}

export interface ExternalMediaAttributes {
  type: 'external';
  url: string;
  width?: number;
  height?: number;
  __external?: boolean;
}

export const defaultAttrs: DefaultAttributes<
  MediaAttributes | ExternalMediaAttributes
> = {
  id: { default: '' },
  type: { default: 'file' },
  collection: { default: '' },
  occurrenceKey: { default: null },
  width: { default: null },
  height: { default: null },
  url: { default: null },
  __fileName: { default: null },
  __fileSize: { default: null },
  __fileMimeType: { default: null },
  __displayType: { default: null },
  __contextId: { default: null },
  __external: { default: false },
};

export const defaultAttrsWithAltText: DefaultAttributes<
  MediaAttributes | ExternalMediaAttributes
> = {
  ...defaultAttrs,
  alt: { default: null },
};

interface MutableMediaAttributes extends MediaAttributes {
  [key: string]: string | number | undefined | null | boolean;
}

export const createMediaSpec = (
  attributes: Partial<NodeSpec['attrs']>,
): NodeSpec => ({
  selectable: true,
  attrs: attributes as NodeSpec['attrs'],
  parseDOM: [
    {
      tag: 'div[data-node-type="media"]',
      getAttrs: dom => {
        const attrs = {} as MutableMediaAttributes;

        if (attributes) {
          Object.keys(attributes).forEach(k => {
            const key = camelCaseToKebabCase(k).replace(/^__/, '');
            const value =
              (dom as HTMLElement).getAttribute(`data-${key}`) || '';
            if (value) {
              attrs[k] = value;
            }
          });
        }

        // Need to do validation & type conversion manually
        if (attrs.__fileSize) {
          attrs.__fileSize = +attrs.__fileSize;
        }

        const width = Number(attrs.width);
        if (typeof width !== 'undefined' && !isNaN(width)) {
          attrs.width = width;
        }

        const height = Number(attrs.height);
        if (typeof height !== 'undefined' && !isNaN(height)) {
          attrs.height = height;
        }

        return attrs as MediaAttributes;
      },
    },
    // Don't match data URI
    {
      tag: 'img[src^="data:image"]',
      ignore: true,
    },
    {
      tag: 'img',
      getAttrs: dom => {
        return {
          type: 'external',
          url: (dom as HTMLElement).getAttribute('src') || '',
        } as ExternalMediaAttributes;
      },
    },
  ],
  toDOM(node: PMNode) {
    const attrs = {
      'data-id': node.attrs.id,
      'data-node-type': 'media',
      'data-type': node.attrs.type,
      'data-collection': node.attrs.collection,
      'data-occurrence-key': node.attrs.occurrenceKey,
      'data-width': node.attrs.width,
      'data-height': node.attrs.height,
      'data-url': node.attrs.url,
      'data-alt': node.attrs.alt,
      // toDOM is used for static rendering as well as editor rendering. This comes into play for
      // emails, copy/paste, etc, so the title and styling here *is* useful (despite a React-based
      // node view being used for editing).
      title: 'Attachment',
      // Manually kept in sync with the style of media cards. The goal is to render a plain gray
      // rectangle that provides an affordance for media.
      style: `display: inline-block; border-radius: 3px; background: ${N30}; box-shadow: 0 1px 1px rgba(9, 30, 66, 0.2), 0 0 1px 0 rgba(9, 30, 66, 0.24);`,
    };

    copyPrivateAttributes(
      node.attrs,
      attrs,
      key => `data-${camelCaseToKebabCase(key.slice(2))}`,
    );

    return ['div', attrs];
  },
});

export const media: NodeSpec = createMediaSpec(defaultAttrs);
export const mediaWithAltText: NodeSpec = createMediaSpec(
  defaultAttrsWithAltText,
);

export const camelCaseToKebabCase = (str: string) =>
  str.replace(/([^A-Z]+)([A-Z])/g, (_, x, y) => `${x}-${y.toLowerCase()}`);

export const copyPrivateAttributes = (
  from: Record<string, any>,
  to: Record<string, any>,
  map?: (str: string) => string,
) => {
  if (media.attrs) {
    Object.keys(media.attrs).forEach(key => {
      if (key[0] === '_' && key[1] === '_' && from[key]) {
        to[map ? map(key) : key] = from[key];
      }
    });
  }
};

/**
 * There's no concept of optional property in ProseMirror. It sets value as `null`
 * when there's no use of any property. We are filtering out all private & optional attrs here.
 */
const optionalAttributes = ['occurrenceKey', 'width', 'height', 'url', 'alt'];
const externalOnlyAttributes = ['type', 'url', 'width', 'height'];

export const toJSON = (node: PMNode) => ({
  attrs: Object.keys(node.attrs)
    .filter(key => !(key[0] === '_' && key[1] === '_'))
    .reduce<Record<string, any>>((obj, key) => {
      if (
        node.attrs.type === 'external' &&
        externalOnlyAttributes.indexOf(key) === -1
      ) {
        return obj;
      }
      if (
        optionalAttributes.indexOf(key) > -1 &&
        (node.attrs[key] === null || node.attrs[key] === '')
      ) {
        return obj;
      }
      if (['width', 'height'].indexOf(key) !== -1) {
        obj[key] = Number(node.attrs[key]);
        return obj;
      }
      obj[key] = node.attrs[key];
      return obj;
    }, {}),
});
