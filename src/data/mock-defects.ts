import { Defect } from "../types/index";

const makeDefect = (
  id: string,
  projectId: string,
  serialNo: number,
  data: Partial<Defect>
): Defect => ({
  id,
  projectId,
  serialNo,
  type: "纵向裂缝",
  severity: "中等",
  status: "待处理",
  location: "K12+340",
  description: "",
  detectedAt: "2026-03-10T09:00:00Z",
  updatedAt: "2026-03-10T09:00:00Z",
  inspector: "张工",
  ...data,
});

export const mockDefects: Defect[] = [
  makeDefect("d-001","proj-001",1,{type:"纵向裂缝",severity:"中等",status:"已修复",location:"K12+340~K12+360",description:"路面中央出现连续纵向裂缝，缝宽约3-5mm，延伸长度约20m",width:4,length:20,area:0.08,detectedAt:"2026-03-05T08:30:00Z",imageUrl:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300"}),
  makeDefect("d-002","proj-001",2,{type:"横向裂缝",severity:"轻微",status:"已修复",location:"K13+180",description:"横向裂缝，缝宽约2mm，横贯整个行车道",width:2,length:7.5,detectedAt:"2026-03-05T08:45:00Z"}),
  makeDefect("d-003","proj-001",3,{type:"坑槽",severity:"严重",status:"已修复",location:"K14+620",description:"路面坑槽，深约5cm，面积约0.8m²，严重影响行车安全",area:0.8,detectedAt:"2026-03-06T10:15:00Z",imageUrl:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300"}),
  makeDefect("d-004","proj-001",4,{type:"网状裂缝",severity:"严重",status:"处理中",location:"K15+100~K15+150",description:"大面积网状裂缝，路面结构性破坏，需大修",area:25,detectedAt:"2026-03-06T11:00:00Z"}),
  makeDefect("d-005","proj-001",5,{type:"车辙",severity:"中等",status:"待处理",location:"K16+200~K16+400",description:"右行车道明显车辙，最大深度约18mm",length:200,width:18,detectedAt:"2026-03-07T09:00:00Z"}),
  makeDefect("d-006","proj-001",6,{type:"沉陷",severity:"极严重",status:"处理中",location:"K17+350",description:"局部沉陷，最大沉降约8cm，范围约4m×3m",area:12,detectedAt:"2026-03-07T10:30:00Z",imageUrl:"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300"}),
  makeDefect("d-007","proj-002",1,{type:"纵向裂缝",severity:"轻微",status:"待处理",location:"K2+120",description:"右侧路缘带纵向裂缝，缝宽约2mm",width:2,length:15,detectedAt:"2026-03-16T09:00:00Z",inspector:"李工"}),
  makeDefect("d-008","proj-002",2,{type:"坑槽",severity:"中等",status:"待处理",location:"K3+580",description:"坑槽直径约40cm，深约3cm",area:0.12,detectedAt:"2026-03-17T10:00:00Z",inspector:"李工"}),
  makeDefect("d-009","proj-003",1,{type:"网状裂缝",severity:"严重",status:"待处理",location:"解放路与中山路交叉口",description:"交叉口范围内大面积网状裂缝",area:18,detectedAt:"2026-04-02T08:00:00Z",inspector:"王工"}),
  makeDefect("d-010","proj-003",2,{type:"沉陷",severity:"严重",status:"处理中",location:"西湖大道K1+200",description:"沉陷面积约6m²，与地下管线施工有关",area:6,detectedAt:"2026-04-02T09:30:00Z",inspector:"王工"}),
];

export const defectTypeDistribution = [
  { name: "纵向裂缝", value: 35, color: "#EF4444" },
  { name: "横向裂缝", value: 20, color: "#F97316" },
  { name: "网状裂缝", value: 18, color: "#EAB308" },
  { name: "坑槽",     value: 12, color: "#8B5CF6" },
  { name: "车辙",     value: 8,  color: "#3B82F6" },
  { name: "沉陷",     value: 5,  color: "#EC4899" },
  { name: "其他",     value: 2,  color: "#6B7280" },
];

export const severityDistribution = [
  { name: "轻微",  value: 42, color: "#22C55E" },
  { name: "中等",  value: 35, color: "#F59E0B" },
  { name: "严重",  value: 18, color: "#EF4444" },
  { name: "极严重",value: 5,  color: "#7F1D1D" },
];
