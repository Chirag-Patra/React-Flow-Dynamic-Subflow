export enum MajorComponents {

  Board = "Job",
  Map = "Map",
  Js = "Js",
  Aws = "Aws",
  Db = "Db",
  Execute_Py = "Execute Py",
  Email_notification = "Email Notifiacation",
  Run_Lamda = "Run Lamda",
  Run_GlueJob = "Run GlueJob",
  Run_Eks = "Run Eks",
  Run_StepFunction = "Run StepFunction",
  Ingestion = "Ingestion",
}

export enum MajorComponentsState {
  Add = "add",
  NotAdd = "notAdd",
}

export type MajorComponentsData = {
  reusableComponenttype?: string;
  value?: number;
  type?: MajorComponents;
  rotation?: number;
  state?: MajorComponentsState;
  isAttachedToGroup?: boolean;
  visible?: boolean;
  connectable?: boolean;
  processingType?: string;
  etlConfig?: string;
  jobConfig?: string;
  isDragOver?: boolean;
  // Added optional componentType and universal config storage used in RightSideBar
  componentType?: string;
  config?: ComponentConfig;
};

// Generic configuration shape used by wizards / RightSideBar
export interface ComponentConfig {
  processingType?: string;
  etl_stp_job_nm?: string;
  componentType?: string;
  [key: string]: any;
}

export enum HistoryAction {
  AddNode = "addNode",
  RemoveNode = "removeNode",
  AddEdge = "addEdge",
  RemoveEdge = "removeEdge",
}
