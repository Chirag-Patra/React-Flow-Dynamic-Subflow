// apiService.ts
const BASE_URL = 'https://aedl-dashboard-exp.edl.dev.awsdns.internal.das';

export interface JobParametersResponse {
  [key: string]: string[];
}

export class ApiService {
  private static readonly headers = {
    'Authorization': 'hhrsdd',
    'Content-Type': 'application/json',
  };

  static async fetchJobParameters(env: string = 'DEV'): Promise<JobParametersResponse | null> {
    try {
      const url = `${BASE_URL}/api/processing/return-job-params?env=${env}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: JobParametersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching job parameters:', error);
      return null;
    }
  }

  // Helper method to get options for a specific field
  static getFieldOptions(apiResponse: JobParametersResponse | null, fieldName: string): string[] {
    if (!apiResponse) return [];

    // Map JobConfig field names to API response keys
    const fieldMapping: Record<string, string> = {
      'processingType': 'prcsng_type',
      'trgt_pltfrm': 'trgt_pltfrm',
      'load_type': 'load_type',
      'src_file_type': 'src_file_type',
      'unld_file_type': 'unld_file_type',
      'unld_frqncy': 'load_frqncy', // Using load_frqncy for unload frequency
      'unld_type': 'unld_type',
      'unld_trgt_pltfrm': 'unld_trgt_pltfrm',
      'unld_zone_cd': 'unld_zone_cd',
      'unld_S3_bucket_set': 'unld_S3_bucket_set',
      'job_type': 'job_type',
      'load_frqncy': 'load_frqncy',
      'warehouse_size_suffix': 'warehouse_size_suffix',
      'actv_flag': 'actv_flag',
      'ownrshp_team': 'ownrshp_team',
      'post_load_mthd': 'post_load_mthd',
      'dlmtr': 'dlmtr',
    };

    const apiFieldName = fieldMapping[fieldName] || fieldName;
    return apiResponse[apiFieldName] || [];
  }

  // Helper method to format option values for display
  static formatOptionValue(value: string): string {
    // Handle special cases
    if (value === '--BLANK--') return '';
    if (value === 'na') return 'N/A';

    // Capitalize first letter for better display
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Helper method to get the raw value (for saving)
  static getRawOptionValue(displayValue: string, fieldName: string, apiResponse: JobParametersResponse | null): string {
    if (!apiResponse) return displayValue;

    const options = this.getFieldOptions(apiResponse, fieldName);

    // Find the original value that matches the display value
    const originalValue = options.find(option =>
      this.formatOptionValue(option).toLowerCase() === displayValue.toLowerCase()
    );

    return originalValue || displayValue;
  }
}