import { useRef, useEffect, useCallback } from "react";
import { DetectedDefect } from "../../types/index";
import { DEFECT_COLORS, DEFECT_BBOX_COLORS } from "../../services/ai-model-service";

interface Props {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  defects: DetectedDefect[];
  showSegmentation: boolean;
  showBBox: boolean;
}

export default function SegmentationCanvas({
  imageUrl, imageWidth, imageHeight, defects, showSegmentation, showBBox
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const scaleX = img.naturalWidth / imageWidth;
      const scaleY = img.naturalHeight / imageHeight;

      defects.forEach(d => {
        const color = DEFECT_COLORS[d.defectType] || "rgba(100,116,139,0.4)";
        const bboxColor = DEFECT_BBOX_COLORS[d.defectType] || "#64748B";
        const [x1, y1, x2, y2] = d.bbox.map((v, i) => v * (i % 2 === 0 ? scaleX : scaleY));

        // 像素级分割掩码
        if (showSegmentation && d.polygon && d.polygon.length >= 3) {
          ctx.beginPath();
          d.polygon.forEach(([px, py], i) => {
            const sx = px * scaleX, sy = py * scaleY;
            i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
          });
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = bboxColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // BBox 检测框
        if (showBBox) {
          ctx.strokeStyle = bboxColor;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          // 标签背景
          const label = `${d.defectType} ${Math.round(d.confidence * 100)}%`;
          ctx.font = `bold ${Math.max(12, canvas.width * 0.013)}px "Noto Sans", sans-serif`;
          const metrics = ctx.measureText(label);
          const labelH = Math.max(16, canvas.width * 0.018);
          const paddingH = 6, paddingV = 4;
          const labelW = metrics.width + paddingH * 2;
          const labelY = Math.max(y1 - labelH - paddingV, 0);

          ctx.fillStyle = bboxColor;
          ctx.beginPath();
          ctx.roundRect(x1, labelY, labelW, labelH + paddingV * 2, 4);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(label, x1 + paddingH, labelY + paddingV + labelH * 0.8);
        }
      });
    };
    img.src = imageUrl;
  }, [imageUrl, defects, showSegmentation, showBBox, imageWidth, imageHeight]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain rounded-xl"
      style={{ maxHeight: "420px", objectFit: "contain" }}
    />
  );
}
