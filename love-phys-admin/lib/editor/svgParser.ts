// lib/editor/svgParser.ts
import { fabric } from "fabric";
import { SVGParseResult } from "./types";

export class SVGParser {
  /**
   * 将 SVG 字符串解析为 Fabric.js 对象
   */
  static async parseSVGToFabric(svgString: string): Promise<SVGParseResult> {
    try {
      // 清理 SVG 字符串
      const cleanSvg = this.cleanSVGString(svgString);

      // 解析 SVG 文档
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanSvg, "image/svg+xml");

      // 检查解析错误
      const parseError = doc.querySelector("parsererror");
      if (parseError) {
        throw new Error("SVG 解析失败: 格式不正确");
      }

      const svgElement = doc.querySelector("svg");
      if (!svgElement) {
        throw new Error("未找到有效的 SVG 元素");
      }

      // 获取 SVG 尺寸
      const canvasSize = this.extractCanvasSize(svgElement);

      // 解析所有 SVG 元素
      const objects = await this.parseElements(svgElement);

      return {
        objects,
        canvasSize,
        success: true,
      };
    } catch (error) {
      console.error("SVG 解析错误:", error);
      return {
        objects: [],
        canvasSize: { width: 1000, height: 600 },
        success: false,
        error: error instanceof Error ? error.message : "未知解析错误",
      };
    }
  }

  /**
   * 清理 SVG 字符串，移除可能导致解析问题的内容
   */
  private static cleanSVGString(svgString: string): string {
    // 移除 XML 声明和 DOCTYPE
    let cleaned = svgString.replace(/<\?xml[^>]*\?>/g, "");
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/g, "");

    // 移除注释
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

    // 移除动画元素（第一阶段不支持）
    cleaned = cleaned.replace(/<animate[^>]*>[\s\S]*?<\/animate>/g, "");
    cleaned = cleaned.replace(
      /<animateTransform[^>]*>[\s\S]*?<\/animateTransform>/g,
      ""
    );
    cleaned = cleaned.replace(
      /<animateMotion[^>]*>[\s\S]*?<\/animateMotion>/g,
      ""
    );

    return cleaned.trim();
  }

  /**
   * 提取 SVG 画布尺寸
   */
  private static extractCanvasSize(svgElement: SVGSVGElement): {
    width: number;
    height: number;
  } {
    const width = parseInt(svgElement.getAttribute("width") || "1000");
    const height = parseInt(svgElement.getAttribute("height") || "600");

    return { width, height };
  }

  /**
   * 解析 SVG 元素并转换为 Fabric.js 对象
   */
  private static async parseElements(
    svgElement: SVGSVGElement
  ): Promise<fabric.Object[]> {
    const objects: fabric.Object[] = [];

    // 遍历直接子元素
    for (const element of Array.from(svgElement.children)) {
      const fabricObject = await this.parseElement(element);
      if (fabricObject) {
        objects.push(fabricObject);
      }
    }

    return objects;
  }

  /**
   * 解析单个 SVG 元素
   */
  private static async parseElement(
    element: Element
  ): Promise<fabric.Object | null> {
    try {
      switch (element.tagName.toLowerCase()) {
        case "rect":
          return this.parseRect(element as SVGRectElement);
        case "circle":
          return this.parseCircle(element as SVGCircleElement);
        case "ellipse":
          return this.parseEllipse(element as SVGEllipseElement);
        case "line":
          return this.parseLine(element as SVGLineElement);
        case "text":
          return this.parseText(element as SVGTextElement);
        case "path":
          return await this.parsePath(element as SVGPathElement);
        case "g":
          return await this.parseGroup(element as SVGGElement);
        default:
          console.warn(`不支持的 SVG 元素: ${element.tagName}`);
          return null;
      }
    } catch (error) {
      console.error(`解析 ${element.tagName} 元素失败:`, error);
      return null;
    }
  }

  /**
   * 解析矩形元素
   */
  private static parseRect(element: SVGRectElement): fabric.Rect {
    const x = parseFloat(element.getAttribute("x") || "0");
    const y = parseFloat(element.getAttribute("y") || "0");
    const width = parseFloat(element.getAttribute("width") || "100");
    const height = parseFloat(element.getAttribute("height") || "100");

    return new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      ...this.parseCommonAttributes(element),
    });
  }

  /**
   * 解析圆形元素
   */
  private static parseCircle(element: SVGCircleElement): fabric.Circle {
    const cx = parseFloat(element.getAttribute("cx") || "0");
    const cy = parseFloat(element.getAttribute("cy") || "0");
    const r = parseFloat(element.getAttribute("r") || "50");

    return new fabric.Circle({
      left: cx - r, // Fabric.js 使用边界框左上角
      top: cy - r,
      radius: r,
      ...this.parseCommonAttributes(element),
    });
  }

  /**
   * 解析椭圆元素
   */
  private static parseEllipse(element: SVGEllipseElement): fabric.Ellipse {
    const cx = parseFloat(element.getAttribute("cx") || "0");
    const cy = parseFloat(element.getAttribute("cy") || "0");
    const rx = parseFloat(element.getAttribute("rx") || "50");
    const ry = parseFloat(element.getAttribute("ry") || "30");

    return new fabric.Ellipse({
      left: cx - rx,
      top: cy - ry,
      rx,
      ry,
      ...this.parseCommonAttributes(element),
    });
  }

  /**
   * 解析直线元素
   */
  private static parseLine(element: SVGLineElement): fabric.Line {
    const x1 = parseFloat(element.getAttribute("x1") || "0");
    const y1 = parseFloat(element.getAttribute("y1") || "0");
    const x2 = parseFloat(element.getAttribute("x2") || "100");
    const y2 = parseFloat(element.getAttribute("y2") || "100");

    return new fabric.Line([x1, y1, x2, y2], {
      ...this.parseCommonAttributes(element),
    });
  }

  /**
   * 解析文本元素
   */
  private static parseText(element: SVGTextElement): fabric.Text {
    const x = parseFloat(element.getAttribute("x") || "0");
    const y = parseFloat(element.getAttribute("y") || "0");
    const text = element.textContent || "";
    const fontSize = parseFloat(element.getAttribute("font-size") || "16");

    return new fabric.Text(text, {
      left: x,
      top: y - fontSize, // SVG text baseline vs Fabric.js top
      fontSize,
      fontFamily: element.getAttribute("font-family") || "Arial",
      ...this.parseCommonAttributes(element),
    });
  }

  /**
   * 解析路径元素（使用 Fabric.js 内置方法）
   */
  private static async parsePath(
    element: SVGPathElement
  ): Promise<fabric.Path | null> {
    const d = element.getAttribute("d");
    if (!d) return null;

    return new Promise((resolve) => {
      fabric.loadSVGFromString(`<svg><path d="${d}"/></svg>`, (objects) => {
        if (objects && objects.length > 0) {
          const path = objects[0] as fabric.Path;
          // 应用通用属性
          Object.assign(path, this.parseCommonAttributes(element));
          resolve(path);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * 解析群组元素
   */
  private static async parseGroup(
    element: SVGGElement
  ): Promise<fabric.Group | null> {
    const objects: fabric.Object[] = [];

    for (const child of Array.from(element.children)) {
      const fabricObject = await this.parseElement(child);
      if (fabricObject) {
        objects.push(fabricObject);
      }
    }

    if (objects.length === 0) return null;

    const group = new fabric.Group(objects, {
      ...this.parseCommonAttributes(element),
    });

    // 解析 transform 属性
    const transform = element.getAttribute("transform");
    if (transform) {
      this.applyTransform(group, transform);
    }

    return group;
  }

  /**
   * 解析通用属性
   */
  private static parseCommonAttributes(
    element: Element
  ): Partial<fabric.Object> {
    const attrs: Partial<fabric.Object> = {};

    // 填充和描边
    const fill = element.getAttribute("fill");
    if (fill && fill !== "none") {
      attrs.fill = fill;
    } else if (fill === "none") {
      attrs.fill = "transparent";
    }

    const stroke = element.getAttribute("stroke");
    if (stroke && stroke !== "none") {
      attrs.stroke = stroke;
    }

    const strokeWidth = element.getAttribute("stroke-width");
    if (strokeWidth) {
      attrs.strokeWidth = parseFloat(strokeWidth);
    }

    // 透明度
    const opacity = element.getAttribute("opacity");
    if (opacity) {
      attrs.opacity = parseFloat(opacity);
    }

    // ID 用于追踪
    const id = element.getAttribute("id");
    if (id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (attrs as any).id = id;
    }

    return attrs;
  }

  /**
   * 应用 transform 属性（简化版）
   */
  private static applyTransform(
    object: fabric.Object,
    transform: string
  ): void {
    // 这里只处理最基本的 translate
    const translateMatch = transform.match(/translate\(([^)]+)\)/);
    if (translateMatch) {
      const values = translateMatch[1]
        .split(",")
        .map((v) => parseFloat(v.trim()));
      if (values.length >= 2) {
        object.left = (object.left || 0) + values[0];
        object.top = (object.top || 0) + values[1];
      }
    }

    // 可以后续扩展支持 rotate, scale 等
  }
}
