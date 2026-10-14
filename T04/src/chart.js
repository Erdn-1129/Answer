// 五边形分区地平线图 —— 5 个岗位指标各占一个三角形扇区
const svg = d3.select("#chart");

const cx = 450, cy = 425, R = 300;
const O = { x: cx, y: cy };

const axisMax = 20;                 // Y轴量程 = 每组数值跨度（bandSize）
const bandCount = 10;               // 组数
const colors = d3.range(bandCount).map(i => d3.interpolatePurples(0.15 + i * 0.07));

// 五边形顶点（72° 均分）与外五边形
const angles = { B: 54, A: -18, C: -90, D: -162, E: 126 };
const vertices = Object.fromEntries(
  Object.entries(angles).map(([n, d]) => {
    const r = d * Math.PI / 180;
    return [n, { x: cx + R * Math.cos(r), y: cy + R * Math.sin(r) }];
  })
);

// 5 个扇区：xEnd=半径方向, yStart→yEnd=切线方向(刻度), column=CSV 列
const systems = [
  { xEnd: "B", yStart: "B", yEnd: "A", column: "SoftwareEngineer" },
  { xEnd: "A", yStart: "A", yEnd: "C", column: "ProductManager" },
  { xEnd: "C", yStart: "C", yEnd: "D", column: "HRSpecialist" },
  { xEnd: "D", yStart: "D", yEnd: "E", column: "DataScientist" },
  { xEnd: "E", yStart: "E", yEnd: "B", column: "MarketingCoordinator" }
];

// 短辅助函数：D3 v7 的 .attr({...}) 对象写法不生效，改为逐键设置
const el = (tag, attrs) => {
  const sel = svg.append(tag);
  for (const k in attrs) sel.attr(k, attrs[k]);
  return sel;
};

// 外五边形框架
el("polygon", {
  points: ["B", "A", "C", "D", "E"].map(n => `${vertices[n].x},${vertices[n].y}`).join(" "),
  fill: "none", stroke: "white", "stroke-width": 2
});

// 1. 五个坐标系（X轴 / Y轴 / Y轴刻度）
systems.forEach(s => {
  const xE = vertices[s.xEnd], yS = vertices[s.yStart], yE = vertices[s.yEnd];

  el("line", { x1: O.x, y1: O.y, x2: xE.x, y2: xE.y, stroke: "white", "stroke-width": 2 });
  el("line", { x1: yS.x, y1: yS.y, x2: yE.x, y2: yE.y, stroke: "white", "stroke-width": 3 });

  const dx = yE.x - yS.x, dy = yE.y - yS.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;          // Y轴单位法向
  const step = axisMax / 5;

  for (let v = 0; v <= axisMax + 1e-6; v += step) {
    const t = v / axisMax, px = yS.x + dx * t, py = yS.y + dy * t;
    el("line", { x1: px - nx * 6, y1: py - ny * 6, x2: px + nx * 6, y2: py + ny * 6, stroke: "white" });
    el("text", {
      x: px + nx * 17, y: py + ny * 17, fill: "white", "font-size": 10,
      "text-anchor": "middle", "dominant-baseline": "middle"
    }).text(Math.round(v));
  }
});

// 2. 中心点
el("circle", { cx: O.x, cy: O.y, r: 5, fill: "white" });

// 3. 岗位标签（X轴外端，按方位选对齐避免溢出）
systems.forEach(s => {
  const v = vertices[s.xEnd];
  const ux = (v.x - O.x) / R, uy = (v.y - O.y) / R;
  const anchor = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
  el("text", {
    x: O.x + ux * (R + 26), y: O.y + uy * (R + 26),
    fill: "white", "font-size": 12, "font-weight": 600,
    "text-anchor": anchor, "dominant-baseline": "middle"
  }).text(s.column);
});

// 4. 图例（10 组，浅→深）
const lx0 = 26, ly0 = 64, sw = 26, sh = 19, gap = 2;
el("rect", {
  x: lx0 - 10, y: ly0 - 10, width: sw + 66, height: bandCount * (sh + gap) + 10,
  fill: "rgba(255,255,255,0.06)", rx: 6
});
d3.range(bandCount).forEach(i => {
  const sy = ly0 + i * (sh + gap);
  el("rect", { x: lx0, y: sy, width: sw, height: sh, fill: colors[i] });
  el("text", {
    x: lx0 + sw + 8, y: sy + sh / 2, fill: "white", "font-size": 11, "dominant-baseline": "middle"
  }).text(`${i * axisMax + 1}–${(i + 1) * axisMax}`);
});

// 5. 读取数据（需本地服务器；file:// 双击会被 CORS 拦截）
d3.csv("../src/DataSet.csv").then(data => {
  console.log("CSV读取成功:", data.length);

  // 数据体检
  const all = systems.flatMap(s => data.map(r => Number(r[s.column])));
  const bad = all.filter(v => !Number.isFinite(v)).length;
  if (bad) console.warn(`${bad} 个数值无法解析，会致图形空洞`);
  const coverMax = axisMax * bandCount;
  if (d3.max(all) > coverMax)
    console.warn(`最大值超出量程 ${coverMax}，超出部分被压在第 ${bandCount} 组`);

  // 6. 每个扇区：类正态排列 + Horizon 折叠叠加
  systems.forEach(s => {
    // 升序后从两端向中间交替填充 → 最小在两端、最大在 X轴中点
    const sorted = [...data].sort((a, b) => Number(a[s.column]) - Number(b[s.column]));
    const rows = new Array(sorted.length);
    let lo = 0, hi = sorted.length - 1;
    sorted.forEach((row, i) => { i % 2 ? (rows[hi--] = row) : (rows[lo++] = row); });

    const xE = vertices[s.xEnd], yS = vertices[s.yStart], yE = vertices[s.yEnd];
    const xV = { x: xE.x - O.x, y: xE.y - O.y };
    const yV = { x: yE.x - yS.x, y: yE.y - yS.y };
    const toScreen = (lx, ly) => ({
      x: O.x + xV.x * lx + yV.x * (ly / axisMax),
      y: O.y + xV.y * lx + yV.y * (ly / axisMax)
    });

    // 真正的 Horizon：每层管一段区间 lower~upper，折叠 + 叠加
    // 浅色贴 X轴、深色在外层，总值由「颜色深浅/叠到第几组」表达
    for (let layer = 0; layer < bandCount; layer++) {
      const lower = layer * axisMax, upper = lower + axisMax;

      const pts = rows.map((row, i) => {
        const v = Number(row[s.column]);
        const x = i / (rows.length - 1);
        let fill = 0;
        if (v > lower) fill = (Math.min(v, upper) - lower) / axisMax;  // 本组填充比例 0~1
        return { x, y: fill * (axisMax * x) };                          // 乘可用高度 = 三角形裁剪
      });

      const poly = pts.map(p => { const q = toScreen(p.x, p.y); return `${q.x},${q.y}`; });
      for (let i = pts.length - 1; i >= 0; i--) { const q = toScreen(pts[i].x, 0); poly.push(`${q.x},${q.y}`); }

      el("polygon", { points: poly.join(" "), fill: colors[layer], opacity: 0.55 });
    }
  });

  // 7. 均值雷达（橙色线框，无填充、无坐标轴；半径 = 均值/满量程 × R）
  const radar = systems.map(s => {
    const mean = d3.mean(data, r => Number(r[s.column]));
    const v = vertices[s.xEnd];
    const ux = (v.x - O.x) / R, uy = (v.y - O.y) / R;
    const r = mean / (axisMax * bandCount) * R;
    return { mean, ux, uy, x: O.x + ux * r, y: O.y + uy * r };
  });
  el("polygon", {
    points: radar.map(p => `${p.x},${p.y}`).join(" "),
    fill: "none", stroke: "#ffab3d", "stroke-width": 2, "stroke-linejoin": "round"
  });
  radar.forEach(p => {
    el("circle", { cx: p.x, cy: p.y, r: 4, fill: "#ffc266", stroke: "#ffab3d", "stroke-width": 1.5 });
    el("text", {
      x: p.x + p.ux * 16, y: p.y + p.uy * 16, fill: "#ffc266", "font-size": 10,
      "text-anchor": "middle", "dominant-baseline": "middle"
    }).text(Math.round(p.mean));
  });

}).catch(error => {
  console.error("CSV读取失败:", error);
  el("text", {
    x: cx, y: cy, fill: "#ff6b6b", "font-size": 16,
    "text-anchor": "middle", "dominant-baseline": "middle"
  }).text("CSV 读取失败：请用本地服务器打开，不要直接双击 html");
});
