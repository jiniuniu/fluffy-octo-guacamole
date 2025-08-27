// lib/types.ts
// 仅从公开的 `types` 入口导入导出的类型
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";

// 方便在组件里用的别名
export type ExcalidrawAPI = ExcalidrawImperativeAPI;

// 🔑 关键点：通过 API 方法的返回值来“推断”元素与文件类型，避免直接依赖未导出的内部类型
export type SceneElements = ReturnType<
  ExcalidrawImperativeAPI["getSceneElements"]
>;
export type FilesMap = ReturnType<ExcalidrawImperativeAPI["getFiles"]>; // 等价于 BinaryFiles，但更稳妥

// 你传给 <Excalidraw initialData={...}> 或 updateScene(...) 的数据形状
export type InitialData = {
  elements?: SceneElements;
  appState?: Partial<AppState>;
  files?: FilesMap | BinaryFiles; // 两种都兼容
};

// 最小的空场景
export function emptyScene(): InitialData {
  return {
    elements: [] as unknown as SceneElements, // 空数组断言为正确的只读类型
    appState: { viewBackgroundColor: "#fff" },
    files: {} as FilesMap,
  };
}

// （可选）类型守卫
export function isInitialData(v: unknown): v is InitialData {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return "elements" in obj || "appState" in obj || "files" in obj;
}
