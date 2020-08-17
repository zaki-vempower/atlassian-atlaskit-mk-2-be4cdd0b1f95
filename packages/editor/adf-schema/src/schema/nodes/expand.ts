import { NodeSpec, Node as PMNode } from 'prosemirror-model';
import { ExtensionContent } from './doc';
import { BreakoutMarkDefinition } from '../marks';

/**
 * @name expand_node
 * @stage 0
 */
export interface ExpandDefinition {
  type: 'expand';
  attrs: {
    title?: string;
  };
  content: ExtensionContent;
  marks?: Array<BreakoutMarkDefinition>;
}

function getExpandAttrs(domNode: Node | string) {
  const dom = domNode as HTMLElement;
  return {
    title: dom.getAttribute('data-title'),
    __expanded: true,
  };
}

export const expand: NodeSpec = {
  inline: false,
  group: 'block',
  content:
    '(paragraph | panel | blockquote | orderedList | bulletList | rule | heading | codeBlock | mediaGroup | mediaSingle | decisionList | taskList | table | blockCard | extension | unsupportedBlock)+',
  isolating: true,
  selectable: true,
  attrs: {
    title: { default: '' },
    __expanded: { default: true },
  },
  parseDOM: [
    {
      context: 'table//',
      tag: 'div[data-node-type="expand"]',
      getAttrs: getExpandAttrs,
    },
    {
      context: 'expand//',
      tag: '[data-node-type="expand"]',
      skip: true,
    },
    {
      context: 'nestedExpand//',
      tag: '[data-node-type="expand"]',
      skip: true,
    },
    {
      tag: '[data-node-type="nestedExpand"] button',
      ignore: true,
    },
    {
      tag: '[data-node-type="expand"] button',
      ignore: true,
    },
    {
      tag: 'div[data-node-type="expand"]',
      getAttrs: getExpandAttrs,
    },
  ],
  toDOM(node: PMNode) {
    const attrs = {
      'data-node-type': 'expand',
      'data-title': node.attrs.title,
      'data-expanded': node.attrs.__expanded,
    };
    return ['div', attrs, 0];
  },
};

export const toJSON = (node: PMNode) => ({
  attrs: Object.keys(node.attrs)
    .filter(key => !key.startsWith('__'))
    .reduce<typeof node.attrs>((obj, key) => {
      obj[key] = node.attrs[key];
      return obj;
    }, {}),
});
