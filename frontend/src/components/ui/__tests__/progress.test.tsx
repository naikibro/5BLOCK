/**
 * Tests pour Progress component
 */

import { render } from '@testing-library/react';
import { Progress } from '../progress';

describe('Progress', () => {
  it('should render with default props', () => {
    const { container } = render(<Progress />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should render with custom value', () => {
    const { container } = render(<Progress value={50} />);
    
    const progressBar = container.querySelector('div[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should render with custom max value', () => {
    const { container } = render(<Progress value={75} max={150} />);
    
    const progressBar = container.querySelector('div[style*="width"]');
    // 75/150 = 50%
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should cap value at 100%', () => {
    const { container } = render(<Progress value={150} max={100} />);
    
    const progressBar = container.querySelector('div[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('should handle negative values', () => {
    const { container } = render(<Progress value={-10} />);
    
    const progressBar = container.querySelector('div[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('should apply custom className', () => {
    const { container } = render(<Progress className="custom-class" />);
    
    const progressContainer = container.querySelector('[role="progressbar"]');
    expect(progressContainer).toHaveClass('custom-class');
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(<Progress value={50} max={100} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should accept custom aria-label', () => {
    const { container } = render(<Progress value={50} aria-label="Custom label" />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should calculate percentage correctly', () => {
    const testCases = [
      { value: 0, max: 100, expected: '0%' },
      { value: 25, max: 100, expected: '25%' },
      { value: 50, max: 100, expected: '50%' },
      { value: 75, max: 100, expected: '75%' },
      { value: 100, max: 100, expected: '100%' },
      { value: 35, max: 150, expected: '23.333333333333332%' },
      { value: 55, max: 150, expected: '36.666666666666664%' },
    ];

    testCases.forEach(({ value, max, expected }) => {
      const { container } = render(<Progress value={value} max={max} />);
      const progressBar = container.querySelector('div[style*="width"]');
      expect(progressBar).toHaveStyle({ width: expected });
    });
  });
});
