// lib/types.ts
// 仅从公开的 `types` 入口导入导出的类型
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";

// 方便在组件里用的别名
export type ExcalidrawAPI = ExcalidrawImperativeAPI;

// 🔑 关键点：通过 API 方法的返回值来"推断"元素与文件类型，避免直接依赖未导出的内部类型
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

// 默认的空场景 - 确保始终返回稳定的对象结构
const DEFAULT_EMPTY_SCENE: InitialData = {
  elements: [] as unknown as SceneElements, // 空数组断言为正确的只读类型
  appState: {
    viewBackgroundColor: "#ffffff",
    theme: "light" as const,
    currentItemStrokeColor: "#000000",
    currentItemBackgroundColor: "transparent",
  },
  files: {} as FilesMap,
} as const;

// 最小的空场景 - 返回新的对象实例以避免引用问题
export function emptyScene(): InitialData {
  return {
    elements: [] as unknown as SceneElements,
    appState: {
      viewBackgroundColor: "#ffffff",
      theme: "light" as const,
      currentItemStrokeColor: "#000000",
      currentItemBackgroundColor: "transparent",
    },
    files: {} as FilesMap,
  };
}

// 获取默认空场景的静态版本
export function getDefaultEmptyScene(): InitialData {
  return { ...DEFAULT_EMPTY_SCENE };
}

// （可选）类型守卫
export function isInitialData(v: unknown): v is InitialData {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return "elements" in obj || "appState" in obj || "files" in obj;
}

// 验证 InitialData 的完整性
export function validateInitialData(data: InitialData): InitialData {
  return {
    elements: data.elements || ([] as unknown as SceneElements),
    appState: {
      viewBackgroundColor: "#ffffff",
      ...data.appState,
    },
    files: data.files || ({} as FilesMap),
  };
}

// 合并 InitialData，确保不会有 undefined 值
export function mergeInitialData(
  base: InitialData,
  override: Partial<InitialData>
): InitialData {
  return {
    elements:
      override.elements || base.elements || ([] as unknown as SceneElements),
    appState: {
      ...base.appState,
      ...override.appState,
    },
    files: override.files || base.files || ({} as FilesMap),
  };
}
