export interface IngestionConfig {
  // Order 1
  prcsng_type?: string;

  // Order 2
  clnt_id?: string;
  domain_cd?: string;
  sor_cd?: string;

  // Order 3
  trgt_pltfrm?: string;

  // Order 4
  trgt_tbl_nm?: string;
  trgt_tbl_nm_desc?: string;
  load_type?: string;
  load_frmt_parms?: string;
  pre_load_mthd?: string;

  // Conditional fields
  key_list?: string; // conditional: load_type = merge, distinct_merge
  del_key_list?: string; // conditional: load_type = delete_append

  src_file_type?: string;
  need_unload_question?: boolean;

  // Unload conditional fields (when need_unload_question = yes)
  unld_file_type?: string;
  unld_partn_key?: string;
  unld_frqncy?: string;
  unld_type?: string;
  unld_frmt_parms?: string;
  unld_trgt_pltfrm?: string;
  unld_zone_cd?: string;
  unld_S3_bucket_set?: string;

  dlmtr?: string;
  post_load_mthd?: string;

  // Target platform conditional fields
  job_type?: string; // conditional: trgt_pltfrm = s3
  etl_job_parms?: string; // conditional: trgt_pltfrm = s3
  load_frqncy?: string; // conditional: trgt_pltfrm = stream

  warehouse_size_suffix?: string;
  actv_flag?: string;
  ownrshp_team?: string;
}