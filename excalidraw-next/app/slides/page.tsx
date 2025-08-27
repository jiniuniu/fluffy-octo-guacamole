import ExcalidrawClient from "./ExcalidrawClient";
import { emptyScene } from "@/lib/types";

export default function SlidesPage() {
  // 初始数据：一个空画布
  const initialData = emptyScene();
  return <ExcalidrawClient initialData={initialData} />;
}
