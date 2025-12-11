// configApiService.ts
import { DynamicFormSchema } from './dynamicFormTypes';

const DUMMY_API_BASE_URL = 'https://api.example.com/config';

export interface ConfigApiResponse {
  success: boolean;
  data?: DynamicFormSchema;
  error?: string;
}

export class ConfigApiService {
  private static readonly headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy-token',
  };

  /**
   * Dummy API service that accepts a key parameter for configuration type
   * @param key - The configuration type ('job' or 'map')
   * @param timeout - Optional timeout in milliseconds (default: 5000)
   * @returns Promise<ConfigApiResponse>
   */
  static async fetchConfig(key: string, timeout: number = 5000): Promise<ConfigApiResponse> {
    try {
      // Simulate API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const url = `${DUMMY_API_BASE_URL}?key=${encodeURIComponent(key)}`;
      
      console.log(`Attempting to fetch config from API: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: DynamicFormSchema = await response.json();
      
      console.log(`Successfully fetched config from API for key: ${key}`);
      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.warn(`API call failed for config key '${key}':`, error);
      
      // Return fallback data from local JSON files
      return await this.getFallbackConfig(key);
    }
  }

  /**
   * Fallback method that returns local JSON configuration when API fails
   * @param key - The configuration type ('job', 'map', or 'etlo')
   * @returns ConfigApiResponse with local data
   */
  private static async getFallbackConfig(key: string): Promise<ConfigApiResponse> {
    try {
      let config: DynamicFormSchema;

      switch (key.toLowerCase()) {
        case 'job': {
          // Dynamically import the JSON configuration
          const jobModule = await import('./configs/jobConfig.json');
          config = jobModule.default as DynamicFormSchema;
          console.log('Using fallback job configuration from local JSON');
          break;
        }
        
        case 'map': {
          // Dynamically import the JSON configuration
          const mapModule = await import('./configs/mapConfig.json');
          config = mapModule.default as DynamicFormSchema;
          console.log('Using fallback map configuration from local JSON');
          break;
        }
        
        case 'etlo': {
          // Dynamically import the JSON configuration
          const etloModule = await import('./configs/etloConfig.json');
          config = etloModule.default as DynamicFormSchema;
          console.log('Using fallback ETLO configuration from local JSON');
          break;
        }
        
        default:
          console.error(`Unknown configuration key: ${key}`);
          return {
            success: false,
            error: `Unknown configuration type: ${key}. Supported types: 'job', 'map', 'etlo'`
          };
      }

      return {
        success: true,
        data: config
      };

    } catch (error) {
      console.error('Error loading fallback configuration:', error);
      return {
        success: false,
        error: `Failed to load fallback configuration for key: ${key}`
      };
    }
  }

  /**
   * Get available configuration keys
   * @returns Array of available configuration keys
   */
  static getAvailableKeys(): string[] {
    return ['job', 'map', 'etlo'];
  }

  /**
   * Validate if a key is supported
   * @param key - The configuration key to validate
   * @returns boolean indicating if the key is valid
   */
  static isValidKey(key: string): boolean {
    return this.getAvailableKeys().includes(key.toLowerCase());
  }

  /**
   * Simulate API delay for testing purposes
   * @param ms - Milliseconds to delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ConfigApiService;