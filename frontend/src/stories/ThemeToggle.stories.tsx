import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../components/base/ThemeToggle';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-8 bg-slate-800 rounded-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    showLabel: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础主题切换器
export const Basic: Story = {
  args: {},
};

// 带标签的主题切换器
export const WithLabel: Story = {
  args: {
    showLabel: true,
  },
};

// 不同主题状态
export const AllStates: Story = {
  render: () => (
    <div className="flex space-x-4">
      <ThemeToggle />
      <ThemeToggle showLabel />
    </div>
  ),
}; 