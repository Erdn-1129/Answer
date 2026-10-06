# 代码实现思路

---

## 使用的技术栈

- HTMl
- SVG
- Javascript
- D3.js

## 数据结构

- 50个个体

- `CompanyId`：每家公司唯一的识别码（字符串）

- `Software Engineer`：软件工程师岗位的报名人数（数字）

- `Product Manager`：产品经理岗位的报名人数（数字）

- `HR Specialist`：人力资源专员岗位的报名人数（数字）

- `Data Scientist`：数据科学家岗位的报名人数（数字）

- `Marketing Coordinator`：市场协调员岗位的报名人数（数字）

经观察发现这个五个岗位的报名人数最大值均不超过200，最小值为20左右，平均值为110加减10的范围，通过excel的箱线图快速确定没有极端值，按照50的样本量，应该分为10组，也就是组距为20。
