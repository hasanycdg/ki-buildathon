import React from "react";

const COLORS = {
  wall: "#f4f7fc",
  floor: "#e2e9f4",
  surface: "#ffffff",
  panel: "#e9eef8",
  panel2: "#dce6f4",
  line: "#b9c8e0",
  text: "#304564",
  muted: "#8fa0bd",
  accent: "#2468f2",
  green: "#42b766",
  red: "#e0405d",
  orange: "#e2a24a",
  yellow: "#f5c869",
  blueSoft: "#dbeafe"
};

const SHAPES = new Set(["rect", "circle", "ellipse", "line", "path", "polyline", "polygon", "text"]);
const MOTIONS = new Set(["focus", "open", "close", "remove", "insert", "wipe", "check"]);

function color(value, fallback = "panel") {
  if (!value) return COLORS[fallback];
  if (COLORS[value]) return COLORS[value];
  return /^#[0-9a-f]{6}$/i.test(value) ? value : COLORS[fallback];
}

function number(value, fallback = 0, min = -1000, max = 1000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function text(value) {
  return String(value ?? "").slice(0, 42);
}

function svgData(value) {
  return String(value ?? "").slice(0, 320);
}

function visibleAt(element, frame) {
  const from = Number.isFinite(Number(element.showFrom)) ? Number(element.showFrom) : 0;
  const until = Number.isFinite(Number(element.hideAfter)) ? Number(element.hideAfter) : Infinity;
  return frame >= from && frame <= until;
}

function commonProps(element, frame) {
  const motion = MOTIONS.has(element.motion) ? element.motion : "focus";
  return {
    opacity: number(element.opacity, visibleAt(element, frame) ? 1 : 0, 0, 1),
    fill: element.fill === "none" ? "none" : color(element.fill, "panel"),
    stroke: element.stroke === "none" ? "none" : color(element.stroke, "line"),
    strokeWidth: number(element.strokeWidth, 2, 0, 12),
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `generated-scene-part motion-${motion}`
  };
}

function renderElement(element, index, frame) {
  if (!SHAPES.has(element.type) || !visibleAt(element, frame)) return null;
  const props = commonProps(element, frame);

  if (element.type === "rect") {
    return <rect key={index} {...props} x={number(element.x)} y={number(element.y)} width={number(element.width, 40, 0, 600)} height={number(element.height, 40, 0, 400)} rx={number(element.rx, 4, 0, 80)} />;
  }
  if (element.type === "circle") {
    return <circle key={index} {...props} cx={number(element.cx)} cy={number(element.cy)} r={number(element.r, 12, 0, 180)} />;
  }
  if (element.type === "ellipse") {
    return <ellipse key={index} {...props} cx={number(element.cx)} cy={number(element.cy)} rx={number(element.rx, 18, 0, 240)} ry={number(element.ry, 10, 0, 180)} />;
  }
  if (element.type === "line") {
    return <line key={index} {...props} x1={number(element.x1)} y1={number(element.y1)} x2={number(element.x2)} y2={number(element.y2)} />;
  }
  if (element.type === "path") {
    return <path key={index} {...props} d={svgData(element.d).replace(/[^\dA-Za-z.,\s-]/g, "")} />;
  }
  if (element.type === "polyline") {
    return <polyline key={index} {...props} points={svgData(element.points).replace(/[^\d.,\s-]/g, "")} />;
  }
  if (element.type === "polygon") {
    return <polygon key={index} {...props} points={svgData(element.points).replace(/[^\d.,\s-]/g, "")} />;
  }
  return (
    <text key={index} x={number(element.x)} y={number(element.y)} fill={color(element.fill, "text")}
      fontSize={number(element.fontSize, 12, 8, 28)} fontWeight={element.fontWeight === "700" ? "700" : "600"}
      textAnchor={element.textAnchor === "middle" ? "middle" : "start"}>
      {text(element.value)}
    </text>
  );
}

export default function GeneratedScene({ scene, frame = 0, dim = false }) {
  const elements = Array.isArray(scene?.elements) ? scene.elements.slice(0, 48) : [];
  return (
    <svg viewBox="0 0 480 300" className={"scene generated-scene" + (dim ? " dim" : "")} role="img" aria-label={scene?.label || "Generierte Lernszene"}>
      <rect x="0" y="0" width="480" height="236" fill={color(scene?.background, "wall")} />
      <rect x="0" y="236" width="480" height="64" fill={color(scene?.floor, "floor")} />
      {elements.map((element, index) => renderElement(element, index, frame))}
    </svg>
  );
}
