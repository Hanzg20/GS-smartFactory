import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/base/Button';
import { Mail, ArrowRight } from 'lucide-react';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'error'],
    },
    isLoading: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    leftIcon: {
      control: false,
    },
    rightIcon: {
      control: false,
    },
    onClick: {
      action: 'clicked',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础按钮
export const Primary: Story = {
  args: {
    children: '主要按钮',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: '次要按钮',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: '成功按钮',
    variant: 'success',
  },
};

export const Danger: Story = {
  args: {
    children: '危险按钮',
    variant: 'danger',
  },
};

export const Warning: Story = {
  args: {
    children: '警告按钮',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    children: '信息按钮',
    variant: 'info',
  },
};

// 不同尺寸
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Button size="xs">超小</Button>
      <Button size="sm">小型</Button>
      <Button size="md">中等</Button>
      <Button size="lg">大型</Button>
      <Button size="xl">超大</Button>
    </div>
  ),
};

// 带图标
export const WithIcon: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button leftIcon={<Mail className="w-4 h-4" />}>
          发送邮件
        </Button>
        <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
          下一步
        </Button>
      </div>
      <div className="flex space-x-4">
        <Button
          variant="secondary"
          leftIcon={<Mail className="w-4 h-4" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          带双图标
        </Button>
      </div>
    </div>
  ),
};

// 加载状态
export const Loading: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button isLoading>加载中</Button>
        <Button variant="secondary" isLoading>加载中</Button>
      </div>
      <div className="flex space-x-4">
        <Button variant="success" isLoading>加载中</Button>
        <Button variant="danger" isLoading>加载中</Button>
      </div>
    </div>
  ),
};

// 禁用状态
export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button isDisabled>禁用按钮</Button>
        <Button variant="secondary" isDisabled>禁用按钮</Button>
      </div>
      <div className="flex space-x-4">
        <Button variant="success" isDisabled>禁用按钮</Button>
        <Button variant="danger" isDisabled>禁用按钮</Button>
      </div>
    </div>
  ),
};

// 全宽按钮
export const FullWidth: Story = {
  args: {
    children: '全宽按钮',
    fullWidth: true,
  },
}; 