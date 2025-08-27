"use client";

import { useCanvasStore } from "@/store/canvas-store";
import { useFloatingToolbar } from "@/hooks/useFloatingToolbar";
import ObjectControls from "./ObjectControls";
import TextControls from "./TextControls";
import ImageControls from "./ImageControls";
import { fabric } from "fabric";

export default function FloatingToolbar() {
  const { selectedObject } = useCanvasStore();
  const { position, scheduleHide, cancelHide } = useFloatingToolbar();

  if (!selectedObject || !position.visible) {
    return null;
  }

  // 根据对象类型渲染不同的控制组件
  const renderControls = () => {
    if (!selectedObject) return null;

    const objectType = selectedObject.type;

    // 文本类型的特殊处理
    if (objectType === "textbox" || objectType === "i-text") {
      return (
        <div className="flex items-center">
          <TextControls object={selectedObject as fabric.Textbox} />
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <ObjectControls object={selectedObject} />
        </div>
      );
    }

    // 图片类型的特殊处理
    if (objectType === "image") {
      return (
        <div className="flex items-center">
          <ImageControls object={selectedObject as fabric.Image} />
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <ObjectControls object={selectedObject} />
        </div>
      );
    }

    // 其他类型只显示通用控制
    return <ObjectControls object={selectedObject} />;
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 floating-toolbar"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
      }}
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
    >
      {/* 小箭头指向对象 */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        <div className="absolute -top-px left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200"></div>
        </div>
      </div>

      {/* 工具栏内容 */}
      <div className="min-w-0">{renderControls()}</div>
    </div>
  );
}
