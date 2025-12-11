export enum MajorComponents {

  Board = "Job",
  ETLO = "ETLO",
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
  mapSteps?: MapStepConfig[];
  [key: string]: any;
}

// Map step configuration interface
export interface MapStepConfig {
  id: string;
  etl_stp_job_nm: string;
  etl_stp_desc: string;
  etl_stp_sqnc_nbr: number;
  etl_stp_src_platfrm: string;
  etl_stp_src_schma: string;
  etl_stp_src_stg_schma: string;
  etl_stp_trgt_tbl_nm: string;
  etl_stp_trgt_platfrm: string;
  etl_stp_trgt_schma: string;
  etl_stp_trgt_stg_schma: string;
  etl_stp_parms: string;
  etl_stp_s3_code_bkt: string;
  etl_stp_s3_code_key: string;
  etl_stp_s3_log_bkt: string;
  actv_flag: boolean;
}

export enum HistoryAction {
  AddNode = "addNode",
  RemoveNode = "removeNode",
  AddEdge = "addEdge",
  RemoveEdge = "removeEdge",
}
