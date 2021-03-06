import { Node as PMNode } from 'prosemirror-model';
import { Token, TokenType, TokenParser } from './';
import { commonFormatter } from './common-formatter';
import { parseString } from '../text';

export const monospace: TokenParser = ({
  input,
  position,
  schema,
  context,
}) => {
  /**
   * The following token types will be ignored in parsing
   * the content
   */
  const ignoreTokenTypes = [
    TokenType.DOUBLE_DASH_SYMBOL,
    TokenType.TRIPLE_DASH_SYMBOL,
    TokenType.QUADRUPLE_DASH_SYMBOL,
    TokenType.ISSUE_KEY,
    TokenType.CITATION,
    TokenType.DELETED,
    TokenType.EMPHASIS,
    TokenType.INSERTED,
    TokenType.LINK_FORMAT,
    TokenType.STRONG,
    TokenType.SUBSCRIPT,
    TokenType.SUPERSCRIPT,
    TokenType.TABLE,
    TokenType.CITATION,
    TokenType.DELETED,
    TokenType.EMPHASIS,
    TokenType.INSERTED,
    TokenType.LINK_FORMAT,
    TokenType.LIST,
    TokenType.RULER,
    TokenType.STRONG,
    TokenType.SUBSCRIPT,
    TokenType.SUPERSCRIPT,
  ];
  // Add code mark to each text
  const contentDecorator = (n: PMNode) => {
    const mark = schema.marks.code.create();
    // We don't want to mix `code` mark with others
    if (n.type.name === 'text' && n.marks.length) {
      return n;
    }
    return n.mark([mark]);
  };

  const rawContentProcessor = (raw: string, length: number): Token => {
    const content = parseString({
      ignoreTokenTypes,
      schema,
      context,
      input: raw,
    });
    const decoratedContent = content.map(contentDecorator);

    return {
      type: 'pmnode',
      nodes: decoratedContent,
      length,
    };
  };

  return commonFormatter(input, position, schema, {
    opening: '{{',
    closing: '}}',
    context,
    rawContentProcessor,
  });
};
