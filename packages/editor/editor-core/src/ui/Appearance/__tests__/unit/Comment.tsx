import * as React from 'react';
import {
  createEditorFactory,
  doc,
  p,
  mountWithIntl,
} from '@atlaskit/editor-test-helpers';
import Comment from '../../Comment';
import { getDefaultMediaClientConfig } from '@atlaskit/media-test-helpers/fakeMediaClient';
import { ProviderFactory } from '@atlaskit/editor-common';
import { getMediaPluginState } from '../../../../plugins/media/pm-plugins/main';
import { ReactWrapper } from 'enzyme';
import EditorContext from '../../../EditorContext';
import EditorActions from '../../../../actions';

describe('comment editor', () => {
  const createEditor = createEditorFactory();

  const editor = (doc: any) =>
    createEditor({
      doc,
      editorProps: { allowExtension: true },
    });
  it('should create empty terminal empty paragraph when clicked outside editor', () => {
    const { editorView } = editor(doc(p('Hello world'), p('Hello world')));
    const fullPage = mountWithIntl(
      <Comment
        editorView={editorView}
        providerFactory={{} as any}
        editorDOMElement={<div />}
      />,
    );
    fullPage
      .findWhere(elm => elm.name() === 'ClickWrapper')
      .simulate('click', { clientY: 200 });
    expect(editorView.state.doc).toEqualDocument(
      doc(p('Hello world'), p('Hello world'), p('')),
    );
  });

  it('should not create empty terminal empty paragraph if it is already present at end', () => {
    const { editorView } = editor(doc(p('Hello world'), p('')));
    const fullPage = mountWithIntl(
      <Comment
        editorView={editorView}
        providerFactory={{} as any}
        editorDOMElement={<div />}
      />,
    );
    fullPage
      .findWhere(elm => elm.name() === 'ClickWrapper')
      .simulate('click', { clientY: 200 })
      .simulate('click', { clientY: 200 });
    expect(editorView.state.doc).toEqualDocument(doc(p('Hello world'), p('')));
  });

  it('should not create empty terminal paragraph when clicked inside editor', () => {
    const { editorView } = editor(doc(p('Hello world')));
    const fullPage = mountWithIntl(
      <Comment
        editorView={editorView}
        providerFactory={{} as any}
        editorDOMElement={<div />}
      />,
    );
    fullPage
      .findWhere(elm => elm.name() === 'ContentArea')
      .childAt(0)
      .simulate('click');
    expect(editorView.state.doc).toEqualDocument(doc(p('Hello world')));
  });

  describe('with media', () => {
    const mediaProvider = Promise.resolve({
      viewMediaClientConfig: getDefaultMediaClientConfig(),
    });
    const providerFactory = ProviderFactory.create({
      mediaProvider,
    });

    function getSaveButton(wrapper: ReactWrapper<any, any>) {
      return wrapper.find('button[data-testid="comment-save-button"]');
    }

    it('should not be disabled when mediaPluginState.allowUploadFinished is false', async () => {
      const { editorView, eventDispatcher } = createEditor({
        doc: doc(p('')),
        providerFactory,
        editorProps: {
          allowExtension: true,
          media: { allowMediaSingle: true },
          appearance: 'comment',
        },
      });
      const mediaPluginState = getMediaPluginState(editorView.state);

      mediaPluginState.updateAndDispatch({
        allUploadsFinished: false,
      });

      const comment = mountWithIntl(
        <EditorContext
          editorActions={EditorActions.from(editorView, eventDispatcher)}
        >
          <Comment
            onSave={jest.fn()}
            editorView={editorView}
            providerFactory={{} as any}
            editorDOMElement={<div />}
          />
        </EditorContext>,
      );

      await new Promise(resolve => setTimeout(resolve, 3000));
      expect(getSaveButton(comment).prop('disabled')).toBe(false);
    });
  });
});
