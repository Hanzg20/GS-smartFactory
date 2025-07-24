import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../components/base/Input';
import { Search, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'error'],
    },
    disabled: {
      control: 'boolean',
    },
    isFullWidth: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    leftIcon: {
      control: false,
    },
    rightIcon: {
      control: false,
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础输入框
export const Basic: Story = {
  args: {
    placeholder: '请输入内容',
  },
};

// 带标签
export const WithLabel: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
  },
};

// 不同尺寸
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input size="xs" placeholder="超小输入框" />
      <Input size="sm" placeholder="小型输入框" />
      <Input size="md" placeholder="中等输入框" />
      <Input size="lg" placeholder="大型输入框" />
      <Input size="xl" placeholder="超大输入框" />
    </div>
  ),
};

// 带图标
export const WithIcon: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        placeholder="搜索..."
      />
      <Input
        leftIcon={<User className="w-4 h-4 text-slate-400" />}
        placeholder="用户名"
      />
      <Input
        leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
        rightIcon={<Eye className="w-4 h-4 text-slate-400" />}
        type="password"
        placeholder="密码"
      />
    </div>
  ),
};

// 密码输入框
export const Password: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <Input
        type={showPassword ? 'text' : 'password'}
        leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
        rightIcon={
          showPassword ? (
            <EyeOff
              className="w-4 h-4 text-slate-400 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              className="w-4 h-4 text-slate-400 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )
        }
        placeholder="请输入密码"
      />
    );
  },
};

// 错误状态
export const WithError: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
    error: '用户名不能为空',
  },
};

// 帮助文本
export const WithHelperText: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
    helperText: '用户名长度应在 3-20 个字符之间',
  },
};

// 禁用状态
export const Disabled: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
    disabled: true,
  },
};

// 全宽输入框
export const FullWidth: Story = {
  args: {
    label: '标题',
    placeholder: '请输入标题',
    isFullWidth: true,
  },
}; 