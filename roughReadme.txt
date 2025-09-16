{
    "success": true,
    "session_id": "b265cd82-a617-42d6-a0ef-78b2322057cb",
    "message": "Analysis completed",
    "analysis_results": {
        "success": true,
        "patient_data": {
            "first_name": "Barbara",
            "last_name": "Scehoenleber",
            "ssn": "391624332",
            "date_of_birth": "1956-06-28",
            "gender": "F",
            "zip_code": "54311",
            "calculated_age": 69
        },
        "api_outputs": {
            "mcid": {
                "status_code": 200,
                "body": {
                    "requestID": "1",
                    "processStatus": {
                        "completed": "true",
                        "isMemput": "false",
                        "errorCode": "OK",
                        "errorText": ""
                    },
                    "mcidList": "139407292",
                    "memkey": null,
                    "memidnum": "391709711-000002-003324975",
                    "matchScore": "120"
                },
                "service": "mcid",
                "timestamp": "2025-09-02T09:15:42.531740",
                "status": "success"
            },
            "medical": {
                "status_code": 200,
                "body": {
                    "REQUESTID": "77554079",
                    "MESSAGE": "User not found",
                    "MEDICAL_CLAIMS": []
                },
                "service": "medical",
                "timestamp": "2025-09-02T09:15:42.532033",
                "status": "success"
            },
            "pharmacy": {
                "status_code": 200,
                "body": {
                    "REQUESTID": "77554079",
                    "MESSAGE": "User not found",
                    "PHARMACY_CLAIMS": []
                },
                "service": "pharmacy",
                "timestamp": "2025-09-02T09:15:42.532037",
                "status": "success"
            },
            "token": {
                "status_code": 200,
                "body": {
                    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNpZ25pbmdDZXJ0IiwieDV0IjoiQ0ZzREJaVjdDQndvb-2EuwRSp8ir5WcI3HTBK39D_gF8gAoF_icQGBMR7PBHtN6MqSXijowL0Hnotncwmqx2kwlvN9rs0cQqynjzVYuScCNSSk1VghaYrvTYTaOaKoAP-i5R8Og8oLxIeqOJRWj4QM58wI2ygBWVQZwqySw-fS3pUFS0JITO_ivVoM6SMFg-AErbdUuPDYkEHsY6VA4EHVZc9zAYv_WW4FUZ98PC1rYuGn2B5XQ03ODf8Nte3JNAFYA6kJbd1yjX7rGQfiUTtUvlL58_EdVne3QRtROd4xlhX54-8fXRUcJgA",
                    "token_type": "Bearer",
                    "expires_in": 899
                },
                "service": "token",
                "timestamp": "2025-09-02T09:15:42.532040",
                "status": "success"
            }
        },
        "deidentified_data": {
            "medical": {
                "src_mbr_first_nm": "[MASKED_NAME]",
                "src_mbr_last_nm": "[MASKED_NAME]",
                "src_mbr_mid_init_nm": null,
                "src_mbr_age": "69 years (Senior)",
                "src_mbr_zip_cd": "54311",
                "medical_claims_data": {
                    "REQUESTID": "77554079",
                    "MESSAGE": "User not found",
                    "MEDICAL_CLAIMS": []
                },
                "original_structure_preserved": true,
                "deidentification_timestamp": "2025-09-02T09:15:42.533670",
                "data_type": "enhanced_medical_claims",
                "processing_method": "enhanced_with_provider_fields",
                "provider_fields_preserved": [
                    "billg_prov_nm",
                    "billg_prov_zip_cd"
                ]
            },
            "pharmacy": {
                "pharmacy_claims_data": {
                    "REQUESTID": "77554079",
                    "MESSAGE": "User not found",
                    "PHARMACY_CLAIMS": []
                },
                "original_structure_preserved": true,
                "deidentification_timestamp": "2025-09-02T09:15:42.533759",
                "data_type": "enhanced_pharmacy_claims",
                "processing_method": "enhanced_with_provider_fields",
                "name_fields_masked": [
                    "src_mbr_first_nm",
                    "scr_mbr_last_nm"
                ],
                "provider_fields_preserved": [
                    "billg_prov_nm",
                    "prscrbg_prov_nm"
                ]
            },
            "mcid": {
                "mcid_claims_data": {
                    "requestID": "1",
                    "processStatus": {
                        "completed": "true",
                        "isMemput": "false",
                        "errorCode": "OK",
                        "errorText": ""
                    },
                    "mcidList": "[MASKED_SSN]",
                    "memkey": null,
                    "memidnum": "[MASKED_SSN]-000002-[MASKED_SSN]",
                    "matchScore": "120"
                },
                "original_structure_preserved": true,
                "deidentification_timestamp": "2025-09-02T09:15:42.533837",
                "data_type": "enhanced_mcid_claims",
                "processing_method": "enhanced_with_provider_fields"
            }
        },
        "structured_extractions": {
            "medical": {
                "hlth_srvc_records": [],
                "extraction_summary": {
                    "total_hlth_srvc_records": 0,
                    "total_diagnosis_codes": 0,
                    "unique_service_codes": [],
                    "unique_diagnosis_codes": [],
                    "unique_billing_providers": [],
                    "unique_billing_zip_codes": [],
                    "total_billing_providers": 0,
                    "total_billing_zip_codes": 0
                },
                "code_meanings": {
                    "service_code_meanings": {},
                    "diagnosis_code_meanings": {},
                    "billing_provider_meanings": {},
                    "billing_zip_meanings": {}
                },
                "code_meanings_added": false,
                "stable_analysis": false,
                "llm_call_status": "skipped_no_codes",
                "batch_stats": {
                    "individual_calls_saved": 0,
                    "processing_time_seconds": 0.0,
                    "api_calls_made": 0,
                    "codes_processed": 0,
                    "provider_fields_extracted": 0
                },
                "provider_field_enhancement": true
            },
            "pharmacy": {
                "ndc_records": [],
                "extraction_summary": {
                    "total_ndc_records": 0,
                    "unique_ndc_codes": [],
                    "unique_label_names": [],
                    "unique_billing_providers": [],
                    "unique_prescribing_providers": [],
                    "total_billing_providers": 0,
                    "total_prescribing_providers": 0
                },
                "code_meanings": {
                    "ndc_code_meanings": {},
                    "medication_meanings": {},
                    "billing_provider_meanings": {},
                    "prescribing_provider_meanings": {}
                },
                "code_meanings_added": false,
                "stable_analysis": false,
                "llm_call_status": "skipped_no_codes",
                "batch_stats": {
                    "individual_calls_saved": 0,
                    "processing_time_seconds": 0.0,
                    "api_calls_made": 0,
                    "codes_processed": 0,
                    "provider_fields_extracted": 0
                },
                "provider_field_enhancement": true
            }
        },
        "entity_extraction": {
            "diabetics": "no",
            "age_group": "senior",
            "age": 69,
            "smoking": "no",
            "alcohol": "no",
            "blood_pressure": "unknown",
            "analysis_details": [
                "Age calculated: 69 years",
                "Clinical insights analysis completed"
            ],
            "medical_conditions": [],
            "medications_identified": [],
            "stable_analysis": true,
            "llm_analysis": "completed"
        },
        "health_trajectory": "# COMPREHENSIVE HEALTH TRAJECTORY ANALYSIS\n**Patient Profile: 69-Year-Old Senior with No Claims History**\n\n---\n\n## 🔮 RISK PREDICTION (Clinical Outcomes)\n\n### 1. Chronic Disease Risk Assessment\n**Risk Level: MODERATE-HIGH (65-75%)**\n- **Age-Related Risk**: At 69 years, this patient faces significantly elevated baseline risk for chronic conditions\n- \n\n**Recommended Action:** Implement immediate care coordination outreach with primary care engagement, comprehensive health risk assessment, and establishment of preventive care protocols to transition from zero-utilization status to appropriate senior-focused healthcare management.",
        "heart_attack_prediction": {
            "risk_display": "Heart Disease Risk: 39.0% (Low Risk)",
            "confidence_display": "Confidence: 39.0%",
            "combined_display": "Heart Disease Risk: 39.0% (Low Risk) | Confidence: 39.0%",
            "raw_risk_score": 0.3903,
            "raw_prediction": "Heart Disease Risk: 39.0% (Medium Risk)",
            "risk_category": "Low Risk",
            "fastapi_server_url": "http://localhost:8080",
            "prediction_method": "POST_JSON_SYNC",
            "prediction_endpoint": "http://localhost:8080/predict",
            "prediction_timestamp": "2025-09-02T09:16:24.563185",
            "enhanced_features_used": {
                "Age": "50 years old",
                "Gender": "Female",
                "Diabetes": "No",
                "High_BP": "No",
                "Smoking": "No"
            },
            "model_enhanced": true
        },
        "heart_attack_risk_score": 0.3903,
        "heart_attack_features": {
            "extracted_features": {
                "Age": 50,
                "Gender": 0,
                "Diabetes": 0,
                "High_BP": 0,
                "Smoking": 0
            },
            "feature_interpretation": {
                "Age": "50 years old",
                "Gender": "Female",
                "Diabetes": "No",
                "High_BP": "No",
                "Smoking": "No"
            },
            "data_sources": {
                "age_source": "deidentified_medical.src_mbr_age",
                "gender_source": "patient_data.gender",
                "diabetes_source": "entity_extraction.diabetics",
                "bp_source": "entity_extraction.blood_pressure",
                "smoking_source": "entity_extraction.smoking"
            },
            "extraction_enhanced": true
        },
        "chatbot_ready": true,
        "chatbot_context": {
            "deidentified_medical": {
                "src_mbr_first_nm": "[MASKED_NAME]",
                "src_mbr_last_nm": "[MASKED_NAME]",
                "src_mbr_mid_init_nm": null,
                "src_mbr_age": "69 years (Senior)",
                "src_mbr_zip_cd": "54311",
                "medical_claims_data": {
                    "REQUESTID": "77554079",
                    "MESSAGE": "User not found",
                    "MEDICAL_CLAIMS": []
                },
                "original_structure_preserved": true,
                "deidentification_timestamp": "2025-09-02T09:15:42.533670",
                "data_type": "enhanced_medical_claims",
                "processing_method": "enhanced_with_provider_fields",
                "provider_fields_preserved": [
                    "billg_prov_nm",
                    "billg_prov_zip_cd"
                ]
            },
            "deidentified_pharmacy": {
                "pharmacy_claims_data": {
                    "REQUESTID": "77554079",
                    "MESSAGE": "User not found",
                    "PHARMACY_CLAIMS": []
                },
                "original_structure_preserved": true,
                "deidentification_timestamp": "2025-09-02T09:15:42.533759",
                "data_type": "enhanced_pharmacy_claims",
                "processing_method": "enhanced_with_provider_fields",
                "name_fields_masked": [
                    "src_mbr_first_nm",
                    "scr_mbr_last_nm"
                ],
                "provider_fields_preserved": [
                    "billg_prov_nm",
                    "prscrbg_prov_nm"
                ]
            },
            "deidentified_mcid": {
                "mcid_claims_data": {
                    "requestID": "1",
                    "processStatus": {
                        "completed": "true",
                        "isMemput": "false",
                        "errorCode": "OK",
                        "errorText": ""
                    },
                    "mcidList": "[MASKED_SSN]",
                    "memkey": null,
                    "memidnum": "[MASKED_SSN]-000002-[MASKED_SSN]",
                    "matchScore": "120"
                },
                "original_structure_preserved": true,
                "deidentification_timestamp": "2025-09-02T09:15:42.533837",
                "data_type": "enhanced_mcid_claims",
                "processing_method": "enhanced_with_provider_fields"
            },
            "medical_extraction": {
                "hlth_srvc_records": [],
                "extraction_summary": {
                    "total_hlth_srvc_records": 0,
                    "total_diagnosis_codes": 0,
                    "unique_service_codes": [],
                    "unique_diagnosis_codes": [],
                    "unique_billing_providers": [],
                    "unique_billing_zip_codes": [],
                    "total_billing_providers": 0,
                    "total_billing_zip_codes": 0
                },
                "code_meanings": {
                    "service_code_meanings": {},
                    "diagnosis_code_meanings": {},
                    "billing_provider_meanings": {},
                    "billing_zip_meanings": {}
                },
                "code_meanings_added": false,
                "stable_analysis": false,
                "llm_call_status": "skipped_no_codes",
                "batch_stats": {
                    "individual_calls_saved": 0,
                    "processing_time_seconds": 0.0,
                    "api_calls_made": 0,
                    "codes_processed": 0,
                    "provider_fields_extracted": 0
                },
                "provider_field_enhancement": true
            },
            "pharmacy_extraction": {
                "ndc_records": [],
                "extraction_summary": {
                    "total_ndc_records": 0,
                    "unique_ndc_codes": [],
                    "unique_label_names": [],
                    "unique_billing_providers": [],
                    "unique_prescribing_providers": [],
                    "total_billing_providers": 0,
                    "total_prescribing_providers": 0
                },
                "code_meanings": {
                    "ndc_code_meanings": {},
                    "medication_meanings": {},
                    "billing_provider_meanings": {},
                    "prescribing_provider_meanings": {}
                },
                "code_meanings_added": false,
                "stable_analysis": false,
                "llm_call_status": "skipped_no_codes",
                "batch_stats": {
                    "individual_calls_saved": 0,
                    "processing_time_seconds": 0.0,
                    "api_calls_made": 0,
                    "codes_processed": 0,
                    "provider_fields_extracted": 0
                },
                "provider_field_enhancement": true
            },
             "entity_extraction": {
            "diabetics": "no",
            "age_group": "senior",
            "age": 69,
            "smoking": "no",
            "alcohol": "no",
            "blood_pressure": "diagnosed",
            "analysis_details": [
                "Age calculated: 69 years",
                "Clinical insights analysis completed"
            ],
            "medical_conditions": [
                "Hypertension (ICD-10 I10)",
                "BP medication: LISINOPRIL 5 MG TABLET",
                "BP medication: LISINOPRIL 5 MG TABLET",
                "BP medication: LISINOPRIL 5 MG TABLET",
                "BP medication: LISINOPRIL 5 MG TABLET",
                "BP medication: LISINOPRIL 5 MG TABLET"
            ],
            "medications_identified": [
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "43199001101",
                    "label_name": "HYOSCYAMINE 0.125 MG TAB SL",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "51862044610",
                    "label_name": "TAMOXIFEN    TAB 20MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "ERIC A.  DANIHEL",
                    "stable_processing": true
                },
                {
                    "ndc": "51862044610",
                    "label_name": "TAMOXIFEN    TAB 20MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "DAVID L MD  GROTELUSCHEN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "23155000810",
                    "label_name": "HYDROCHLOROT TAB 25MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "51862044610",
                    "label_name": "TAMOXIFEN    TAB 20MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "ALISHIA L  PARMA",
                    "stable_processing": true
                },
                {
                    "ndc": "23155000810",
                    "label_name": "HYDROCHLOROT TAB 25MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "00143980305",
                    "label_name": "DOXYCYCL HYC CAP 100MG",
                    "billing_provider": "WALGREENS",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "00406012305",
                    "label_name": "HYDROCO/APAP TAB 5-325MG",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "WILLIAM J MD  DIERBERG",
                    "stable_processing": true
                },
                {
                    "ndc": "00603459315",
                    "label_name": "METHYLPRED   TAB 4MG",
                    "billing_provider": "CVS PHARMACY #07656",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "68180051303",
                    "label_name": "LISINOPRIL 5 MG TABLET",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "68180051303",
                    "label_name": "LISINOPRIL 5 MG TABLET",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "23155000810",
                    "label_name": "HYDROCHLOROT TAB 25MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "51862044610",
                    "label_name": "TAMOXIFEN    TAB 20MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "ALISHIA L  PARMA",
                    "stable_processing": true
                },
                {
                    "ndc": "68180051303",
                    "label_name": "LISINOPRIL 5 MG TABLET",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "51862044610",
                    "label_name": "TAMOXIFEN    TAB 20MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "DAVID L MD  GROTELUSCHEN",
                    "stable_processing": true
                },
                {
                    "ndc": "23155000810",
                    "label_name": "HYDROCHLOROT TAB 25MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "23155000810",
                    "label_name": "HYDROCHLOROT TAB 25MG",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "68180051303",
                    "label_name": "LISINOPRIL 5 MG TABLET",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "29300012810",
                    "label_name": "HYDROCHLOROTHIAZIDE 25 MG TAB",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "68180051303",
                    "label_name": "LISINOPRIL 5 MG TABLET",
                    "billing_provider": "CVS CAREMARK ADVANCED TECHNOLOGY PHARMACY,  LLC",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                },
                {
                    "ndc": "16729013616",
                    "label_name": "CLONAZEPAM 0.5 MG TABLET",
                    "billing_provider": "WALGREENS #3253",
                    "prescribing_provider": "MOLLY MAY MD  KLEIMAN",
                    "stable_processing": true
                }
            ],
            "stable_analysis": true,
            "llm_analysis": "completed"
        },
            "health_trajectory": "# COMPREHENSIVE HEALTH TRAJECTORY ANALYSIS\n**Patient Profile: 69-Year-Old Senior with No Claims History**\n\n---\n\n## 🔮 RISK PREDICTION (Clinical Outcomes)\n\n### 1. Chronic Disease Risk Assessment\n Hospitalization & Readmission Risk\n**Risk Level: MODERATE (35-45%)**\n- **6-Month Risk**: 20-25% probability of hospitalization\n- **12-Month Risk**: 35-45% probability of hospitalization\n- **Risk Factors**: Advanced age (69 years) increases baseline hospitalization risk\n- **Protective Factor**: No current chronic conditions requiring management\n**Recommended Action:** Implement immediate care coordination outreach with primary care engagement, comprehensive health risk assessment, and establishment of preventive care protocols to transition from zero-utilization status to appropriate senior-focused healthcare management.",
            "heart_attack_prediction": {
                "risk_display": "Heart Disease Risk: 39.0% (Low Risk)",
                "confidence_display": "Confidence: 39.0%",
                "combined_display": "Heart Disease Risk: 39.0% (Low Risk) | Confidence: 39.0%",
                "raw_risk_score": 0.3903,
                "raw_prediction": "Heart Disease Risk: 39.0% (Medium Risk)",
                "risk_category": "Low Risk",
                "fastapi_server_url": "http://localhost:8080",
                "prediction_method": "POST_JSON_SYNC",
                "prediction_endpoint": "http://localhost:8080/predict",
                "prediction_timestamp": "2025-09-02T09:16:24.563185",
                "enhanced_features_used": {
                    "Age": "50 years old",
                    "Gender": "Female",
                    "Diabetes": "No",
                    "High_BP": "No",
                    "Smoking": "No"
                },
                "model_enhanced": true
            },
            "heart_attack_risk_score": 0.3903,
            "heart_attack_features": {
                "extracted_features": {
                    "Age": 50,
                    "Gender": 0,
                    "Diabetes": 0,
                    "High_BP": 0,
                    "Smoking": 0
                },
                "feature_interpretation": {
                    "Age": "50 years old",
                    "Gender": "Female",
                    "Diabetes": "No",
                    "High_BP": "No",
                    "Smoking": "No"
                },
                "data_sources": {
                    "age_source": "deidentified_medical.src_mbr_age",
                    "gender_source": "patient_data.gender",
                    "diabetes_source": "entity_extraction.diabetics",
                    "bp_source": "entity_extraction.blood_pressure",
                    "smoking_source": "entity_extraction.smoking"
                },
                "extraction_enhanced": true
            },
            "patient_overview": {
                "age": "69 years (Senior)",
                "zip": "54311",
                "analysis_timestamp": "2025-09-02T09:16:24.564139",
                "heart_attack_risk_level": "Low Risk",
                "model_type": "enhanced_ml_api_comprehensive",
                "deidentification_level": "comprehensive_claims_data",
                "claims_data_types": [
                    "medical",
                    "pharmacy",
                    "mcid"
                ],
                "graph_generation_supported": true,
                "batch_code_meanings_available": true
            }
        },
        "chat_history": [],
        "graph_generation_ready": true,
        "errors": [],
        "processing_steps_completed": 8,
        "step_status": {
            "fetch_api_data": "completed",
            "deidentify_claims_data": "completed",
            "extract_claims_fields": "completed",
            "extract_entities": "completed",
            "analyze_trajectory": "completed",
            "generate_summary": "completed",
            "predict_heart_attack": "completed",
            "initialize_chatbot": "completed"
        },
        "langgraph_used": true,
        "comprehensive_analysis": true,
        "enhanced_chatbot": true,
        "batch_code_meanings": true,
        "enhancement_version": "v8.0_graph_generation_comprehensive"
    }
}