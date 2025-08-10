export enum MajorComponents {
  Resistor = "resistor",
  Capacitor = "capacitor",
  Bulb = "bulb",
  Inductor = "inductor",
  Battery = "battery",
  Board = "board",
  Js = "Js",
  Aws = "Aws",
  Db = "Db",
  Python = "Python",
  Email = "Email",
  Lamda = "Lamda",
  GlueJob = "GlueJob",
  Eks = "Eks",
  StepFunction = "StepFunction",
}

export enum MajorComponentsState {
  Add = "add",
  NotAdd = "notAdd",
}

export type MajorComponentsData = {
  value?: number;
  type?: MajorComponents;
  rotation?: number;
  state?: MajorComponentsState;
  isAttachedToGroup?: boolean;
  visible?: boolean;
  connectable?: boolean;
  processingType?: "run_glue" | "run_lambda" | "run_eks" | "run_sfn";
};

export enum HistoryAction {
  AddNode = "addNode",
  RemoveNode = "removeNode",
  AddEdge = "addEdge",
  RemoveEdge = "removeEdge",
}
