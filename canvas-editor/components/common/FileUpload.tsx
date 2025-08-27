"use client";

import React, { useRef } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "@/store/canvas-store";

interface FileUploadProps {
  children: React.ReactNode;
  onUploadComplete?: () => void;
}

export default function FileUpload({
  children,
  onUploadComplete,
}: FileUploadProps) {
  const { canvas } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件！");
      return;
    }

    // 检查文件大小 (限制为 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("图片文件过大，请选择小于 10MB 的文件！");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;

      // 创建图片对象
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          // 计算合适的尺寸（限制最大宽高为 400px）
          const maxSize = 400;
          const scale = Math.min(
            maxSize / (img.width || 1),
            maxSize / (img.height || 1),
            1 // 不放大，只缩小
          );

          img.set({
            left: 100,
            top: 100,
            scaleX: scale,
            scaleY: scale,
            cornerColor: "#4F46E5",
            cornerStyle: "circle",
            transparentCorners: false,
            cornerSize: 10,
          });

          // 添加到画布
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          // 保存状态到历史记录
          const { saveState } = useCanvasStore.getState();
          setTimeout(saveState, 100);

          // 回调
          onUploadComplete?.();
        },
        {
          // 添加 CORS 支持
          crossOrigin: "anonymous",
        }
      );
    };

    reader.onerror = () => {
      alert("图片加载失败，请重试！");
    };

    reader.readAsDataURL(file);

    // 清空input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <div onClick={triggerFileSelect} style={{ display: "contents" }}>
        {children}
      </div>
    </>
  );
}
