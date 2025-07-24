import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../components/base/Card';
import { Button } from '../components/base/Button';
import { MoreVertical, Edit, Trash } from 'lucide-react';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
    },
    isHoverable: {
      control: 'boolean',
    },
    isClickable: {
      control: 'boolean',
    },
    noPadding: {
      control: 'boolean',
    },
    onClick: {
      action: 'clicked',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础卡片
export const Basic: Story = {
  args: {
    children: (
      <div className="text-center">
        <h3 className="text-lg font-semibold">基础卡片</h3>
        <p className="mt-2 text-slate-400">这是一个基础的卡片组件</p>
      </div>
    ),
  },
};

// 带标题和副标题
export const WithTitleAndSubtitle: Story = {
  args: {
    title: '卡片标题',
    subtitle: '这是卡片的副标题',
    children: (
      <p className="text-slate-400">
        这是卡片的内容区域，可以放置任何内容。
      </p>
    ),
  },
};

// 带操作按钮
export const WithActions: Story = {
  args: {
    title: '带操作按钮的卡片',
    subtitle: '这是一个带有操作按钮的卡片示例',
    actions: (
      <div className="flex items-center space-x-2">
        <Button variant="secondary" size="sm">
          编辑
        </Button>
        <Button variant="danger" size="sm">
          删除
        </Button>
      </div>
    ),
    children: (
      <p className="text-slate-400">
        这是卡片的内容区域，可以放置任何内容。
      </p>
    ),
  },
};

// 带底部
export const WithFooter: Story = {
  args: {
    title: '带底部的卡片',
    children: (
      <p className="text-slate-400">
        这是卡片的内容区域，可以放置任何内容。
      </p>
    ),
    footer: (
      <div className="flex justify-end space-x-2">
        <Button variant="secondary">取消</Button>
        <Button>确定</Button>
      </div>
    ),
  },
};

// 可悬停
export const Hoverable: Story = {
  args: {
    title: '可悬停的卡片',
    isHoverable: true,
    children: (
      <p className="text-slate-400">
        将鼠标悬停在此卡片上会有特效。
      </p>
    ),
  },
};

// 可点击
export const Clickable: Story = {
  args: {
    title: '可点击的卡片',
    isClickable: true,
    isHoverable: true,
    onClick: () => alert('卡片被点击了！'),
    children: (
      <p className="text-slate-400">
        点击此卡片会触发事件。
      </p>
    ),
  },
};

// 不同变体
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Card variant="primary" title="主要卡片">
        这是一个主要卡片
      </Card>
      <Card variant="secondary" title="次要卡片">
        这是一个次要卡片
      </Card>
      <Card variant="success" title="成功卡片">
        这是一个成功卡片
      </Card>
      <Card variant="danger" title="危险卡片">
        这是一个危险卡片
      </Card>
      <Card variant="warning" title="警告卡片">
        这是一个警告卡片
      </Card>
      <Card variant="info" title="信息卡片">
        这是一个信息卡片
      </Card>
    </div>
  ),
};

// 复杂示例
export const Complex: Story = {
  render: () => (
    <Card
      variant="primary"
      isHoverable
      title="项目统计"
      subtitle="最近30天的项目数据"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<MoreVertical className="w-4 h-4" />}
        >
          更多
        </Button>
      }
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-400">
            更新于: 2023-12-25 12:00:00
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit className="w-4 h-4" />}
            >
              编辑
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash className="w-4 h-4" />}
            >
              删除
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400">总项目数</div>
            <div className="text-2xl font-bold mt-1">128</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400">进行中</div>
            <div className="text-2xl font-bold mt-1 text-blue-500">64</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400">已完成</div>
            <div className="text-2xl font-bold mt-1 text-green-500">32</div>
          </div>
        </div>
        <div className="h-40 bg-slate-800/50 rounded-lg flex items-center justify-center">
          图表区域
        </div>
      </div>
    </Card>
  ),
}; 