const svg = d3.select("#chart");

const cx = 450;
const cy = 425;
const R = 300;


// ============================================================
// Y轴量程
//
// = 每一组的数值跨度（bandSize）
//
// 纵坐标表示"某一组内数值的大小"，
// 所以量程就是组跨度：
//
//   组跨度 20 → Y轴 0~20
//   组跨度 40 → Y轴 0~40
//
// 该组填满时正好吃满整条 Y轴
// ============================================================

const axisMax = 20;


// ============================================================
// Horizon 组数与颜色（顶层定义，绘图与图例共用）
// ============================================================

const bandCount = 10;

const colors = d3.range(bandCount).map(i =>
  d3.interpolatePurples(
    0.15 + i * 0.07
  )
);


// ============================================================
// 1. 五边形顶点
// ============================================================

const angles = {
  B: 54,
  A: -18,
  C: -90,
  D: -162,
  E: 126
};

const vertices = {};

for (const [name, degree] of Object.entries(angles)) {
  const rad = degree * Math.PI / 180;

  vertices[name] = {
    x: cx + R * Math.cos(rad),
    y: cy + R * Math.sin(rad)
  };
}

const O = {
  x: cx,
  y: cy
};


// ============================================================
// 2. 五个坐标系
// ============================================================

const systems = [

  {
    xEnd: "B",
    yStart: "B",
    yEnd: "A",
    column: "SoftwareEngineer"
  },

  {
    xEnd: "A",
    yStart: "A",
    yEnd: "C",
    column: "ProductManager"
  },

  {
    xEnd: "C",
    yStart: "C",
    yEnd: "D",
    column: "HRSpecialist"
  },

  {
    xEnd: "D",
    yStart: "D",
    yEnd: "E",
    column: "DataScientist"
  },

  {
    xEnd: "E",
    yStart: "E",
    yEnd: "B",
    column: "MarketingCoordinator"
  }

];


// ============================================================
// 3. 绘制五边形
// ============================================================

svg.append("polygon")
  .attr(
    "points",
    ["B", "A", "C", "D", "E"]
      .map(name =>
        `${vertices[name].x},${vertices[name].y}`
      )
      .join(" ")
  )
  .attr("fill", "none")
  .attr("stroke", "white")
  .attr("stroke-width", 2);


// ============================================================
// 4. 绘制五个坐标系
// ============================================================

systems.forEach(system => {

  const xEnd = vertices[system.xEnd];
  const yStart = vertices[system.yStart];
  const yEnd = vertices[system.yEnd];


  // ----------------------------------------------------------
  // X轴
  // ----------------------------------------------------------

  svg.append("line")
    .attr("x1", O.x)
    .attr("y1", O.y)
    .attr("x2", xEnd.x)
    .attr("y2", xEnd.y)
    .attr("stroke", "white")
    .attr("stroke-width", 2);


  // ----------------------------------------------------------
  // Y轴
  // ----------------------------------------------------------

  svg.append("line")
    .attr("x1", yStart.x)
    .attr("y1", yStart.y)
    .attr("x2", yEnd.x)
    .attr("y2", yEnd.y)
    .attr("stroke", "white")
    .attr("stroke-width", 3);


  // ----------------------------------------------------------
  // Y轴单位方向
  // ----------------------------------------------------------

  const dx = yEnd.x - yStart.x;
  const dy = yEnd.y - yStart.y;

  const length =
    Math.sqrt(dx * dx + dy * dy);

  const nx = -dy / length;
  const ny = dx / length;


  // ========================================================
  // Horizon Y轴
  //
  // 纵坐标 = 某一组内数值的大小，量程 0~axisMax
  // （不是总值 0~200：
  //   总值由"叠到第几组 / 颜色深浅"表达）
  // ========================================================

  const tickStep = axisMax / 5;

  for (
    let value = 0;
    value <= axisMax + 0.001;
    value += tickStep
  ) {

    const t = value / axisMax;

    const px =
      yStart.x + dx * t;

    const py =
      yStart.y + dy * t;


    // ------------------------------------------------------
    // 刻度线
    // ------------------------------------------------------

    const tickLength = 6;

    svg.append("line")
      .attr(
        "x1",
        px - nx * tickLength
      )
      .attr(
        "y1",
        py - ny * tickLength
      )
      .attr(
        "x2",
        px + nx * tickLength
      )
      .attr(
        "y2",
        py + ny * tickLength
      )
      .attr(
        "stroke",
        "white"
      )
      .attr(
        "stroke-width",
        1
      );


    // ------------------------------------------------------
    // 刻度数字
    // ------------------------------------------------------

    svg.append("text")
      .attr(
        "x",
        px + nx * 17
      )
      .attr(
        "y",
        py + ny * 17
      )
      .attr(
        "fill",
        "white"
      )
      .attr(
        "font-size",
        10
      )
      .attr(
        "text-anchor",
        "middle"
      )
      .attr(
        "dominant-baseline",
        "middle"
      )
      .text(Math.round(value));

  }

});


// ============================================================
// 5. 中心点
// ============================================================

svg.append("circle")
  .attr("cx", O.x)
  .attr("cy", O.y)
  .attr("r", 5)
  .attr("fill", "white");


// ============================================================
// 5.5 岗位标签（每个扇区 X轴 的外端 = 五边形顶点外）
// ============================================================

systems.forEach(system => {

  const v =
    vertices[system.xEnd];

  // 沿半径向外偏移到 R + 26
  const labelR =
    R + 26;

  const ux =
    (v.x - O.x) / R;

  const uy =
    (v.y - O.y) / R;

  const lx =
    O.x + ux * labelR;

  const ly =
    O.y + uy * labelR;

  // 根据顶点方位决定对齐方式，
  // 避免文字跑出画布
  let anchor =
    "middle";

  if (ux > 0.3) {
    anchor = "start";
  } else if (ux < -0.3) {
    anchor = "end";
  }

  svg.append("text")
    .attr("x", lx)
    .attr("y", ly)
    .attr("fill", "white")
    .attr("font-size", 12)
    .attr("font-weight", 600)
    .attr("text-anchor", anchor)
    .attr("dominant-baseline", "middle")
    .text(system.column);

});


// ============================================================
// 5.6 图例（10组颜色 → 数值区间）
//
// 参考：竖排色块，浅色在上、深色在下，
// 每块右侧标注该组覆盖的数值区间
// ============================================================

const legendX = 26;
const legendY = 64;
const swatchW = 26;
const swatchH = 19;
const swatchGap = 2;

// 图例底板
svg.append("rect")
  .attr("x", legendX - 10)
  .attr("y", legendY - 10)
  .attr(
    "width",
    swatchW + 66
  )
  .attr(
    "height",
    bandCount * (swatchH + swatchGap)
    + 10
  )
  .attr("fill", "rgba(255,255,255,0.06)")
  .attr("rx", 6);

for (let i = 0; i < bandCount; i++) {

  const sy =
    legendY + i * (swatchH + swatchGap);

  svg.append("rect")
    .attr("x", legendX)
    .attr("y", sy)
    .attr("width", swatchW)
    .attr("height", swatchH)
    .attr("fill", colors[i]);

  const lower =
    i * axisMax + 1;

  const upper =
    (i + 1) * axisMax;

  svg.append("text")
    .attr("x", legendX + swatchW + 8)
    .attr("y", sy + swatchH / 2)
    .attr("fill", "white")
    .attr("font-size", 11)
    .attr("dominant-baseline", "middle")
    .text(lower + "\u2013" + upper);

}


// ============================================================
// 6. 读取数据
//
// 两种打开方式都能用：
//
//   http://  （本地服务器）→ d3.csv 读 src/DataSet.csv
//   file://  （直接双击）  → fetch 会被 CORS 拦掉，
//                            改用 src/data.js 里的内嵌副本
// ============================================================

function loadData() {

  if (
    location.protocol === "file:"
    && window.EMBEDDED_CSV
  ) {

    console.log(
      "本地打开，使用内嵌 CSV 数据"
    );

    return Promise.resolve(
      d3.csvParse(
        // trim 掉首尾空行：
        // 开头若留空行，表头会被当成数据行
        window.EMBEDDED_CSV.trim()
      )
    );

  }

  return d3.csv("../src/DataSet.csv");

}

loadData()
  .then(data => {

    console.log(
      "CSV读取成功:",
      data.length
    );


    // ========================================================
    // 数据体检
    //
    // 1. 有没有解析失败的数值（空值 / 非数字）
    // 2. 有没有超出图例量程的值
    //    （会被静默压在最后一组，看不出来）
    // ========================================================

    const allValues =
      systems.flatMap(system =>
        data.map(row =>
          Number(row[system.column])
        )
      );

    const badCount =
      allValues.filter(
        v =>
          !Number.isFinite(v)
      ).length;

    if (badCount > 0) {

      console.warn(
        "有",
        badCount,
        "个数值无法解析，会导致图形出现空洞"
      );

    }

    const dataMax =
      d3.max(allValues);

    const coverMax =
      axisMax * bandCount;

    if (dataMax > coverMax) {

      console.warn(
        "最大值",
        dataMax,
        "超出量程",
        coverMax,
        "→ 超出部分会被压在第",
        bandCount,
        "组，看不出差别"
      );

    }


    // ========================================================
    // 遍历 5个指标（5个三角形扇区），逐个绘制
    //
    // SoftwareEngineer → O-B-A
    // ProductManager   → O-A-C
    // HRSpecialist     → O-C-D
    // DataScientist    → O-D-E
    // MarketingCoord.  → O-E-B
    //
    // 每个扇区都用自己那一列做类正态排序，
    // 各自独立计算坐标系与 Horizon 层
    // ========================================================

    systems.forEach((system) => {


    // ========================================================
    // 类正态排列：
    //
    // 先按数值升序排序，
    // 再从两端往中间交替填充，
    // 于是最小的落在 X轴两端，
    // 最大的汇聚到 X轴中点，向两侧递减
    // ========================================================

    const sorted =
      [...data].sort(
        (a, b) =>
          Number(a[system.column])
          - Number(b[system.column])
      );

    const rows =
      new Array(sorted.length);

    let left = 0;
    let right =
      sorted.length - 1;

    sorted.forEach((row, index) => {

      if (index % 2 === 0) {

        rows[left] = row;
        left++;

      } else {

        rows[right] = row;
        right--;

      }

    });

    const xEnd =
      vertices[system.xEnd];

    const yStart =
      vertices[system.yStart];

    const yEnd =
      vertices[system.yEnd];


    // ========================================================
    // X轴向量
    //
    // O → B
    // ========================================================

    const xVector = {
      x: xEnd.x - O.x,
      y: xEnd.y - O.y
    };


    // ========================================================
    // Y轴向量
    //
    // B → A
    // ========================================================

    const yVector = {
      x: yEnd.x - yStart.x,
      y: yEnd.y - yStart.y
    };


    // ========================================================
    // 局部坐标 → SVG坐标
    //
    // localX : 0~1
    // localY : 0~axisMax（每组跨度）
    // ========================================================

    function toScreen(localX, localY) {

      return {

        x:
          O.x
          + xVector.x * localX
          + yVector.x * (localY / axisMax),

        y:
          O.y
          + xVector.y * localX
          + yVector.y * (localY / axisMax)

      };

    }


    // ========================================================
    // 真正的 Horizon：折叠 + 叠加
    //
    // 每层只负责 20 个单位的数值区间，
    // 超出部分折回下一层，用更深的颜色表示
    //
    // 高度被压扁，数值大小靠"颜色深浅 / 叠加层数"编码
    // ========================================================

    // 每组跨度必须等于 Y轴量程，
    // 否则图形吃不满三角形（看着像被截断）
    const bandSize = axisMax;

    for (let layer = 0; layer < bandCount; layer++) {

      const lower =
        layer * bandSize;

      const upper =
        lower + bandSize;


      // ======================================================
      // 保存当前层的所有点
      // ======================================================

      const points = [];


      rows.forEach((row, index) => {

        const value =
          Number(row[system.column]);


        // ----------------------------------------------------
        // 50个 Company 按类正态排列在 X轴
        // （数值最大的在中间，向两端递减）
        // ----------------------------------------------------

        const x =
          index / (rows.length - 1);


        // ----------------------------------------------------
        // 折叠 + 归一化：
        //
        // 本组只画 lower~upper 这一段数值（跨度 = bandSize）
        //
        // 这一段里的数值大小
        //   fill = (v - lower) / bandSize   →   0~1
        //
        // 再乘以该位置的可用高度（axisMax × x），
        // 于是满格时正好落在 Y轴顶端 axisMax
        //
        // 总值大小改由"叠到第几组（颜色深浅）"表达
        // ----------------------------------------------------

        let fill = 0;

        if (value > lower) {

          fill =
            (
              Math.min(
                value,
                upper
              ) - lower
            ) / bandSize;

        }


        // ----------------------------------------------------
        // 三角形裁剪：该位置最大高度 = axisMax × x
        //
        // fill ∈ 0~1，所以天然不会溢出，
        // 且该组填满时正好贴满三角形边界
        // ----------------------------------------------------

        const y =
          fill * (axisMax * x);


        // ----------------------------------------------------
        // 每层都从 X轴（Y=0）起画，层层叠加
        // 这正是 Horizon 压缩高度的方式
        // ----------------------------------------------------

        points.push({
          x,
          y
        });

      });


      // ======================================================
      // 构造当前 Horizon 层
      // ======================================================

      const polygon = [];


      // ------------------------------------------------------
      // 上边界
      // 左 → 右
      // ------------------------------------------------------

      points.forEach(point => {

        const p =
          toScreen(
            point.x,
            point.y
          );

        polygon.push(
          `${p.x},${p.y}`
        );

      });


      // ------------------------------------------------------
      // 下边界
      // 右 → 左
      //
      // 所有 Horizon 层都从 Y=0（X轴）开始
      // ======================================================

      for (
        let i = points.length - 1;
        i >= 0;
        i--
      ) {

        const point =
          points[i];

        const p =
          toScreen(
            point.x,
            0
          );

        polygon.push(
          `${p.x},${p.y}`
        );

      }


      // ======================================================
      // 绘制当前层
      // ======================================================

      svg.append("polygon")
        .attr(
          "points",
          polygon.join(" ")
        )
        .attr(
          "fill",

          // 浅色贴 X轴，深色在外层
          // 最深色只出现在数值高的峰值区域，
          // 形成"悬浮在扇区中部"的深色块
          colors[layer]
        )
        .attr(
          "opacity",
          0.55
        );

    }

    });


    // ========================================================
    // 均值雷达图
    //
    // 在原图上方再堆叠一层"大小一致"的雷达图：
    // 同一个中心 O、同一个半径 R，只是不画坐标轴
    //
    // 5个顶点 = 5个岗位各自的均值
    // 沿各自扇区中心方向按半径定位，连成灰色五边形
    // ========================================================

    const radarPoints =
      systems.map(system => {

        const mean =
          d3.mean(
            data,
            row =>
              Number(
                row[system.column]
              )
          );

        const v =
          vertices[system.xEnd];

        const ux =
          (v.x - O.x) / R;

        const uy =
          (v.y - O.y) / R;

        // 均值 → 半径
        // 满量程 = axisMax × bandCount = 200 → R
        const r =
          (
            mean
            / (axisMax * bandCount)
          ) * R;

        return {
          mean,
          ux,
          uy,
          x: O.x + ux * r,
          y: O.y + uy * r
        };

      });


    // --------------------------------------------------------
    // 灰色五边形
    // --------------------------------------------------------

    svg.append("polygon")
      .attr(
        "points",
        radarPoints
          .map(
            p => `${p.x},${p.y}`
          )
          .join(" ")
      )
      .attr(
        "fill",
        "none"
      )
      .attr("stroke", "#ffab3d")
      .attr("stroke-width", 2)
      .attr(
        "stroke-linejoin",
        "round"
      );


    // --------------------------------------------------------
    // 均值点 + 数值
    // --------------------------------------------------------

    radarPoints.forEach(p => {

      svg.append("circle")
        .attr("cx", p.x)
        .attr("cy", p.y)
        .attr("r", 4)
        .attr("fill", "#ffc266")
        .attr("stroke", "#ffab3d")
        .attr("stroke-width", 1.5);

      svg.append("text")
        .attr("x", p.x + p.ux * 16)
        .attr("y", p.y + p.uy * 16)
        .attr("fill", "#ffc266")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(Math.round(p.mean));

    });

  })
  .catch(error => {

    console.error(
      "CSV读取失败:",
      error
    );


    // --------------------------------------------------------
    // 页面上给个提示
    //
    // 否则只会看到五边形骨架，
    // 不知道是数据没加载进来
    //
    // 最常见原因：直接双击 html 打开（file://），
    // d3.csv 用 fetch 会被 CORS 拦掉
    // --------------------------------------------------------

    svg.append("text")
      .attr("x", cx)
      .attr("y", cy)
      .attr("fill", "#ff6b6b")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(
        "CSV 读取失败：请用本地服务器打开，不要直接双击 html"
      );

  });