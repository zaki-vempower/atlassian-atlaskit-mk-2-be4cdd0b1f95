import React, { FunctionComponent } from 'react';
import { create, act, ReactTestRenderer } from 'react-test-renderer';
import { useProvider, ProviderFactoryProvider } from '../../context';
import ProviderFactory from '../../provider-factory';
import { MediaProvider } from '../../media-provider';

const Child: FunctionComponent<{
  mediaProvider: Promise<MediaProvider> | undefined;
}> = () => {
  return <div />;
};

function TestUseProvider() {
  const mediaProvider = useProvider('mediaProvider');
  return <Child mediaProvider={mediaProvider} />;
}

function setupFactory() {
  let testRenderer: ReactTestRenderer;

  afterEach(() => {
    testRenderer.unmount();
  });

  return (providerFactory = new ProviderFactory()): ReactTestRenderer => {
    testRenderer = create(
      <ProviderFactoryProvider value={providerFactory}>
        <TestUseProvider />
      </ProviderFactoryProvider>,
    );

    return testRenderer;
  };
}

describe('useProvider', () => {
  let providerFactory: ProviderFactory;
  const setup = setupFactory();

  afterEach(() => {
    if (providerFactory) {
      providerFactory.destroy();
    }
  });

  it('should pass media provider to child after been set', () => {
    const mediaProvider = {};
    providerFactory = new ProviderFactory();
    const testRenderer = setup(providerFactory);

    let child = testRenderer.root.findByType(Child);
    expect(child.props.mediaProvider).toBeUndefined();

    // Set the provider
    act(() => {
      providerFactory.setProvider(
        'mediaProvider',
        Promise.resolve(mediaProvider),
      );
    });

    child = testRenderer.root.findByType(Child);
    expect(child.props.mediaProvider).resolves.toBe(mediaProvider);
  });

  it('should unsubscribe when unmount ', () => {
    const mediaProvider = {};
    providerFactory = new ProviderFactory();
    providerFactory.setProvider(
      'mediaProvider',
      Promise.resolve(mediaProvider),
    );
    const unsubscribeSpy = jest.spyOn(providerFactory, 'unsubscribe');
    const testRenderer = setup(providerFactory);

    expect(unsubscribeSpy).not.toHaveBeenCalled();

    // Unmount the component
    act(() => {
      testRenderer.unmount();
    });

    expect(unsubscribeSpy).toHaveBeenCalledWith(
      'mediaProvider',
      expect.any(Function),
    );
  });

  it('should pass media provider to child when already exist', () => {
    const mediaProvider = {};
    providerFactory = new ProviderFactory();
    providerFactory.setProvider(
      'mediaProvider',
      Promise.resolve(mediaProvider),
    );

    let testRenderer: ReactTestRenderer | null = null;

    act(() => {
      testRenderer = setup(providerFactory);
    });

    const child = testRenderer!.root.findByType(Child);
    expect(child.props.mediaProvider).resolves.toBe(mediaProvider);
  });
});
