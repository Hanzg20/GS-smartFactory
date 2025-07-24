import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AxisControlProps {
  deviceId: string;
  onCommand?: (command: string, parameters: any) => void;
}

export const AxisControl: React.FC<AxisControlProps> = ({ deviceId, onCommand }) => {
  const [selectedAxis, setSelectedAxis] = useState<'X' | 'Y' | 'Z'>('X');
  const [stepSize, setStepSize] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(50);

  const handleAxisMove = (direction: 'positive' | 'negative') => {
    const distance = direction === 'positive' ? stepSize : -stepSize;
    
    if (onCommand) {
      onCommand('move_axis', {
        axis: selectedAxis,
        distance,
        speed
      });
    } else {
      toast.error('控制功能未连接');
    }
  };

  const handleHome = () => {
    if (onCommand) {
      onCommand('home_axis', {
        axis: selectedAxis
      });
    } else {
      toast.error('控制功能未连接');
    }
  };

  const handleStop = () => {
    if (onCommand) {
      onCommand('stop', {
        immediate: true
      });
    } else {
      toast.error('控制功能未连接');
    }
  };

  return (
    <div className="axis-control space-y-6">
      {/* 轴选择 */}
      <div className="flex space-x-2">
        {['X', 'Y', 'Z'].map((axis) => (
          <button
            key={axis}
            onClick={() => setSelectedAxis(axis as 'X' | 'Y' | 'Z')}
            className={`px-4 py-2 rounded transition-all duration-300 ${
              selectedAxis === axis
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {axis}轴
          </button>
        ))}
      </div>

      {/* 步进设置 */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          步进大小 (mm)
        </label>
        <div className="flex space-x-2">
          {[0.1, 1, 10, 100].map((size) => (
            <button
              key={size}
              onClick={() => setStepSize(size)}
              className={`px-3 py-1 rounded transition-all duration-300 ${
                stepSize === size
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 速度设置 */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          速度 ({speed}%)
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* 控制按钮 */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleAxisMove('negative')}
          className="tech-button"
        >
          -{selectedAxis}
        </button>
        <button
          onClick={handleHome}
          className="tech-button bg-blue-600/20 text-blue-400 border border-blue-500/30"
        >
          归零
        </button>
        <button
          onClick={() => handleAxisMove('positive')}
          className="tech-button"
        >
          +{selectedAxis}
        </button>
      </div>

      {/* 急停按钮 */}
      <button
        onClick={handleStop}
        className="w-full py-3 px-4 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
      >
        急停
      </button>
    </div>
  );
};

export default AxisControl; 