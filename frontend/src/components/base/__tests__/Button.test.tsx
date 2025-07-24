import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Loader2 } from 'lucide-react';

describe('Button Component', () => {
  // 基础渲染测试
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  // 变体测试
  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Button</Button>);
      expect(container.firstChild).toHaveClass(`btn-${variant}`);
    });
  });

  // 尺寸测试
  it('renders with different sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach(size => {
      const { container } = render(<Button size={size}>Button</Button>);
      // 检查是否应用了正确的尺寸类名
      expect(container.firstChild).toHaveClass(`text-${size}`);
    });
  });

  // 加载状态测试
  it('shows loading state correctly', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  // 禁用状态测试
  it('handles disabled state correctly', () => {
    render(<Button isDisabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  // 点击事件测试
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 不触发禁用状态的点击事件
  it('does not trigger click events when disabled', () => {
    const handleClick = jest.fn();
    render(<Button isDisabled onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // 不触发加载状态的点击事件
  it('does not trigger click events when loading', () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // 图标测试
  it('renders with left and right icons', () => {
    const TestIcon = () => <span data-testid="test-icon">icon</span>;
    render(
      <Button
        leftIcon={<TestIcon />}
        rightIcon={<TestIcon />}
      >
        Button
      </Button>
    );
    const icons = screen.getAllByTestId('test-icon');
    expect(icons).toHaveLength(2);
  });

  // 全宽测试
  it('renders full width button', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    expect(container.firstChild).toHaveClass('w-full');
  });

  // 可访问性测试
  it('has correct accessibility attributes', () => {
    render(<Button aria-label="Test Button">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });

  // 键盘导航测试
  it('responds to keyboard events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    
    // 测试Enter键
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // 测试空格键
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
}); 