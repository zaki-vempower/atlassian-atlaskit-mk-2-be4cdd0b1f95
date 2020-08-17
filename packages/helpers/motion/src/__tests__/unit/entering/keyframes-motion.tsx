import React from 'react';
import { render, act } from '@testing-library/react';
import KeyframesMotion from '../../../entering/keyframes-motion';
import ExitingPersistence from '../../../entering/exiting-persistence';
import StaggeredEntrance from '../../../entering/staggered-entrance';

window.matchMedia = (): any => ({ matches: false });

describe('<KeyframesMotion />', () => {
  const duration = 500;

  beforeEach(() => {
    jest.useRealTimers();
  });

  it('should respect reduced motion', () => {
    const { getByTestId } = render(
      <KeyframesMotion
        duration={duration}
        enteringAnimation={{}}
        animationTimingFunction={() => 'linear'}
      >
        {props => <div data-testid="target" {...props} />}
      </KeyframesMotion>,
    );

    expect(getByTestId('target')).toHaveStyleDeclaration('animation', 'none', {
      media: '(prefers-reduced-motion: reduce)',
    });
  });

  describe('entering', () => {
    it('should fill the animation backwards to prevent a frame of the element already being entered', () => {
      const { getByTestId } = render(
        <KeyframesMotion
          animationTimingFunction={direction =>
            direction === 'entering' ? 'ease-out' : 'ease-in'
          }
          duration={duration}
          enteringAnimation={{}}
        >
          {props => <div data-testid="target" {...props} />}
        </KeyframesMotion>,
      );

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-fill-mode',
        'backwards',
      );
    });

    it('should use the entering timing function', () => {
      const { getByTestId } = render(
        <KeyframesMotion
          animationTimingFunction={direction =>
            direction === 'entering' ? 'ease-out' : 'ease-in'
          }
          duration={duration}
          enteringAnimation={{}}
        >
          {props => <div data-testid="target" {...props} />}
        </KeyframesMotion>,
      );

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-timing-function',
        'ease-out',
      );
    });

    it('should animate in', () => {
      const { getByTestId } = render(
        <KeyframesMotion
          animationTimingFunction={direction =>
            direction === 'entering' ? 'ease-out' : 'ease-in'
          }
          duration={duration}
          enteringAnimation={{}}
        >
          {props => <div data-testid="target" {...props} />}
        </KeyframesMotion>,
      );

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-play-state',
        'running',
      );
    });

    it('should animate over {duration} ms', () => {
      const { getByTestId } = render(
        <KeyframesMotion
          animationTimingFunction={direction =>
            direction === 'entering' ? 'ease-out' : 'ease-in'
          }
          duration={duration}
          enteringAnimation={{}}
        >
          {props => <div data-testid="target" {...props} />}
        </KeyframesMotion>,
      );

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-duration',
        `${duration}ms`,
      );
    });

    it('should callback when entering on finish', () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      render(
        <KeyframesMotion
          animationTimingFunction={() => 'linear'}
          duration={duration}
          enteringAnimation={{}}
          onFinish={callback}
        >
          {props => <div {...props} />}
        </KeyframesMotion>,
      );

      jest.runTimersToTime(duration);

      expect(callback).toHaveBeenCalledWith('entering');
    });

    it('should callback when entering in a staggered list after finishing', () => {
      jest.useFakeTimers();
      const step = 50;
      const callback = jest.fn();
      render(
        <StaggeredEntrance delayStep={step} columns={1}>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div {...props} />}
          </KeyframesMotion>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
            onFinish={callback}
          >
            {props => <div {...props} />}
          </KeyframesMotion>
        </StaggeredEntrance>,
      );

      // Step is actually logarithmic so we add a little on to make sure it hits the timeout.
      jest.runTimersToTime(duration + step + 2);

      expect(callback).toHaveBeenCalledWith('entering');
    });

    it('should not callback if paused', () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
            onFinish={callback}
            isPaused
          >
            {props => <div {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );
      jest.runAllTimers();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should immediately appear', () => {
      const { getByTestId } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-play-state',
        'running',
      );
      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-duration',
        '0ms',
      );
    });

    it('should appear', () => {
      const { getByTestId } = render(
        <ExitingPersistence appear>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-play-state',
        'running',
      );
      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-duration',
        `${duration}ms`,
      );
    });
  });

  describe('exiting', () => {
    it('should take half the time to callback on finish', () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      const { rerender } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
            onFinish={callback}
          >
            {props => <div {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      rerender(<ExitingPersistence>{false}</ExitingPersistence>);
      act(() => jest.runTimersToTime(duration * 0.5));

      expect(callback).toHaveBeenCalledWith('exiting');
    });

    it('should not callback if the component is fully unmounted', () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      const { rerender } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={() => 'linear'}
            duration={duration}
            enteringAnimation={{}}
            onFinish={callback}
          >
            {props => <div {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );
      jest.runAllTimers();
      callback.mockReset();
      rerender(<span />);

      jest.runAllTimers();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should have no delay', () => {
      const { rerender, getByTestId } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={direction =>
              direction === 'entering' ? 'ease-out' : 'ease-in'
            }
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      rerender(<ExitingPersistence>{false}</ExitingPersistence>);

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-delay',
        '0ms',
      );
    });

    it('should fill the animation forwards to prevent a frame of the element already being exited', () => {
      const { rerender, getByTestId } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={direction =>
              direction === 'entering' ? 'ease-out' : 'ease-in'
            }
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      rerender(<ExitingPersistence>{false}</ExitingPersistence>);

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-fill-mode',
        'forwards',
      );
    });

    it('should run the animation', () => {
      const { rerender, getByTestId } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={direction =>
              direction === 'entering' ? 'ease-out' : 'ease-in'
            }
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      rerender(<ExitingPersistence>{false}</ExitingPersistence>);

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-play-state',
        'running',
      );
    });

    it('should take half the time it took when entering', () => {
      const { rerender, getByTestId } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={direction =>
              direction === 'entering' ? 'ease-out' : 'ease-in'
            }
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      rerender(<ExitingPersistence>{false}</ExitingPersistence>);

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-duration',
        `${duration * 0.5}ms`,
      );
    });

    it('should use its own timing function', () => {
      const { rerender, getByTestId } = render(
        <ExitingPersistence>
          <KeyframesMotion
            animationTimingFunction={direction =>
              direction === 'entering' ? 'ease-out' : 'ease-in'
            }
            duration={duration}
            enteringAnimation={{}}
          >
            {props => <div data-testid="target" {...props} />}
          </KeyframesMotion>
        </ExitingPersistence>,
      );

      rerender(<ExitingPersistence>{false}</ExitingPersistence>);

      expect(getByTestId('target')).toHaveStyleDeclaration(
        'animation-timing-function',
        'ease-in',
      );
    });
  });
});
