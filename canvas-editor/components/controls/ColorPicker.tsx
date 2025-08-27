"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
  "#ffc0cb",
  "#a52a2a",
  "#808080",
  "#008000",
  "#000080",
  "#800000",
  "#808000",
  "#008080",
  "#c0c0c0",
  "#ff6b6b",
];

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(color);

  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-3">
      {/* 当前颜色显示 */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded border border-gray-300 shadow-sm"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1">
          <Label htmlFor="color-input" className="text-sm font-medium">
            颜色值
          </Label>
          <Input
            id="color-input"
            type="text"
            value={currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="mt-1 font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* HTML5 颜色选择器 */}
      <div>
        <Label className="text-sm font-medium">选择颜色</Label>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="mt-1 w-full h-10 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      {/* 预设颜色 */}
      <div>
        <Label className="text-sm font-medium mb-2 block">预设颜色</Label>
        <div className="grid grid-cols-10 gap-1">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                currentColor.toLowerCase() === presetColor.toLowerCase()
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: presetColor }}
              onClick={() => handleColorChange(presetColor)}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      {/* 透明度控制 (可选) */}
      <div>
        <Label className="text-sm font-medium">快速选择</Label>
        <div className="flex gap-2 mt-1">
          <button
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={() => handleColorChange("#000000")}
          >
            黑色
          </button>
          <button
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={() => handleColorChange("#ffffff")}
          >
            白色
          </button>
          <button
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={() => handleColorChange("transparent")}
          >
            透明
          </button>
        </div>
      </div>
    </div>
  );
}
