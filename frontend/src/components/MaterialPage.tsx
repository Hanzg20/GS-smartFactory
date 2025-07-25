import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tabs, Tag, Badge, Progress } from 'antd';
import type { TabsProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ResponsiveContainer } from './base/ResponsiveContainer';

const { Option } = Select;

interface Material {
  id: string;
  name: string;
  type: string;
  spec: string;
  unit: string;
  description: string;
  created_at: string;
}

interface InventoryItem {
  id: string;
  material_id: string;
  material_name?: string;
  quantity: number;
  location: string;
  batch_no: string;
  updated_at: string;
}

interface MaterialBatch {
  id: string;
  material_id: string;
  material_name?: string;
  batch_no: string;
  production_date: string;
  expiry_date: string;
  supplier: string;
  status: string;
  created_at: string;
}

interface MaterialTransaction {
  id: string;
  material_id: string;
  material_name?: string;
  batch_id: string;
  type: string;
  quantity: number;
  operator_id: string;
  timestamp: string;
}

const MaterialPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<MaterialBatch[]>([]);
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('materials');
  const [form] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setMaterials([
      { id: '1', name: '轴承钢', type: '原材料', spec: 'GCr15', unit: 'kg', description: '高碳铬轴承钢', created_at: '2024-01-01' },
      { id: '2', name: '精密轴承', type: '成品', spec: '6205', unit: 'pcs', description: '高精度球轴承', created_at: '2024-01-02' },
      { id: '3', name: '润滑油', type: '辅材', spec: 'SAE 20W-50', unit: 'L', description: '高性能润滑油', created_at: '2024-01-03' },
      { id: '4', name: '密封圈', type: '配件', spec: 'O-Ring 25x3', unit: 'pcs', description: '橡胶密封圈', created_at: '2024-01-04' }
    ]);

    setInventory([
      { id: '1', material_id: '1', material_name: '轴承钢', quantity: 1000, location: '原料库A', batch_no: 'BATCH-202401', updated_at: '2024-03-01' },
      { id: '2', material_id: '2', material_name: '精密轴承', quantity: 500, location: '成品库B', batch_no: 'BATCH-202402', updated_at: '2024-03-01' },
      { id: '3', material_id: '3', material_name: '润滑油', quantity: 200, location: '辅料库C', batch_no: 'BATCH-202403', updated_at: '2024-03-01' },
      { id: '4', material_id: '4', material_name: '密封圈', quantity: 800, location: '配件库D', batch_no: 'BATCH-202404', updated_at: '2024-03-01' }
    ]);

    setBatches([
      { id: '1', material_id: '1', material_name: '轴承钢', batch_no: 'BATCH-202401', production_date: '2024-01-01', expiry_date: '2025-01-01', supplier: '宝钢', status: '正常', created_at: '2024-01-01' },
      { id: '2', material_id: '2', material_name: '精密轴承', batch_no: 'BATCH-202402', production_date: '2024-02-01', expiry_date: '2025-02-01', supplier: 'SKF', status: '正常', created_at: '2024-02-01' }
    ]);

    setTransactions([
      { id: '1', material_id: '1', material_name: '轴承钢', batch_id: '1', type: '入库', quantity: 1000, operator_id: 'user1', timestamp: '2024-03-01 14:30:00' },
      { id: '2', material_id: '2', material_name: '精密轴承', batch_id: '2', type: '出库', quantity: 50, operator_id: 'user2', timestamp: '2024-03-01 15:45:00' }
    ]);
  };

  const materialColumns = [
    { title: '物料名称', dataIndex: 'name', key: 'name' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => {
        const color = type === '原材料' ? 'blue' : type === '成品' ? 'green' : type === '辅材' ? 'orange' : 'purple';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Material) => (
        <Space>
          <Button icon={<EditOutlined />} size="small">编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  const inventoryColumns = [
    { title: '物料名称', dataIndex: 'material_name', key: 'material_name' },
    { 
      title: '库存数量', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (quantity: number) => {
        const status = quantity > 500 ? 'success' : quantity > 100 ? 'warning' : 'error';
        const color = quantity > 500 ? '#52c41a' : quantity > 100 ? '#faad14' : '#ff4d4f';
        return (
          <Space>
            <Badge status={status} />
            <span style={{ color }}>{quantity}</span>
          </Space>
        );
      }
    },
    { title: '存储位置', dataIndex: 'location', key: 'location' },
    { title: '批次号', dataIndex: 'batch_no', key: 'batch_no' },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: InventoryItem) => (
        <Space>
          <Button size="small">盘点</Button>
          <Button size="small">调拨</Button>
          <Button icon={<WarningOutlined />} size="small" type="primary">预警设置</Button>
        </Space>
      ),
    },
  ];

  const batchColumns = [
    { title: '物料名称', dataIndex: 'material_name', key: 'material_name' },
    { title: '批次号', dataIndex: 'batch_no', key: 'batch_no' },
    { title: '生产日期', dataIndex: 'production_date', key: 'production_date' },
    { title: '有效期', dataIndex: 'expiry_date', key: 'expiry_date' },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '正常' ? 'green' : status === '过期' ? 'red' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MaterialBatch) => (
        <Space>
          <Button size="small">质检</Button>
          <Button size="small">追溯</Button>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    { title: '物料名称', dataIndex: 'material_name', key: 'material_name' },
    { 
      title: '操作类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '入库' ? 'green' : type === '出库' ? 'blue' : 'orange'}>
          {type}
        </Tag>
      )
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '操作员', dataIndex: 'operator_id', key: 'operator_id' },
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MaterialTransaction) => (
        <Space>
          <Button size="small">详情</Button>
          <Button size="small">撤销</Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      setModalVisible(false);
      // 这里添加保存逻辑
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const getStatsCards = () => {
    const totalMaterials = materials.length;
    const lowStockItems = inventory.filter(item => item.quantity < 100).length;
    const totalBatches = batches.length;
    const todayTransactions = transactions.filter(t => t.timestamp.includes('2024-03-01')).length;

    return [
      {
        title: '物料品种',
        value: totalMaterials,
        icon: <ExperimentOutlined style={{ color: '#1890ff' }} />,
        color: '#1890ff'
      },
      {
        title: '库存预警',
        value: lowStockItems,
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        color: '#faad14'
      },
      {
        title: '活跃批次',
        value: totalBatches,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        color: '#52c41a'
      },
      {
        title: '今日交易',
        value: todayTransactions,
        icon: <ExperimentOutlined style={{ color: '#722ed1' }} />,
        color: '#722ed1'
      }
    ];
  };

  return (
    <ResponsiveContainer>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">物料管理</h1>
            <p className="text-slate-400">管理原材料、半成品、成品的全生命周期</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={handleAdd}
          >
            新增物料
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsCards().map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
              <Progress 
                percent={Math.min(stat.value * 10, 100)} 
                showInfo={false} 
                strokeColor={stat.color}
                trailColor="rgba(255,255,255,0.1)"
                className="mt-4"
              />
            </Card>
          ))}
        </div>

        {/* 主要内容区域 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <Tabs 
            activeKey={currentTab} 
            onChange={setCurrentTab}
            items={[
              {
                key: 'materials',
                label: '物料台账',
                children: (
                  <Table
                    columns={materialColumns}
                    dataSource={materials}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total: any) => `共 ${total} 条记录`,
                    }}
                  />
                )
              },
              {
                key: 'inventory',
                label: '库存管理',
                children: (
                  <Table
                    columns={inventoryColumns}
                    dataSource={inventory}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total: any) => `共 ${total} 条记录`,
                    }}
                  />
                )
              },
              {
                key: 'batches',
                label: '批次管理',
                children: (
                  <Table
                    columns={batchColumns}
                    dataSource={batches}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total: any) => `共 ${total} 条记录`,
                    }}
                  />
                )
              },
              {
                key: 'transactions',
                label: '交易记录',
                children: (
                  <Table
                    columns={transactionColumns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total: any) => `共 ${total} 条记录`,
                    }}
                  />
                )
              }
            ]}
          />
        </Card>

        {/* 新增物料弹窗 */}
        <Modal
          title="新增物料"
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="物料名称" rules={[{ required: true }]}>
              <Input placeholder="请输入物料名称" />
            </Form.Item>
            <Form.Item name="type" label="物料类型" rules={[{ required: true }]}>
              <Select placeholder="请选择物料类型">
                <Option value="原材料">原材料</Option>
                <Option value="半成品">半成品</Option>
                <Option value="成品">成品</Option>
                <Option value="辅材">辅材</Option>
                <Option value="配件">配件</Option>
              </Select>
            </Form.Item>
            <Form.Item name="spec" label="规格型号">
              <Input placeholder="请输入规格型号" />
            </Form.Item>
            <Form.Item name="unit" label="计量单位" rules={[{ required: true }]}>
              <Select placeholder="请选择计量单位">
                <Option value="kg">千克(kg)</Option>
                <Option value="pcs">件(pcs)</Option>
                <Option value="L">升(L)</Option>
                <Option value="m">米(m)</Option>
                <Option value="box">箱(box)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea placeholder="请输入物料描述" rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ResponsiveContainer>
  );
};

export default MaterialPage; 