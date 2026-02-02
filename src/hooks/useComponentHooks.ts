import { useMemo } from 'react';
import { MajorComponents } from '../types';

// Icon component mappings for performance
const COMPONENT_TYPE_CONFIGS = {
  [MajorComponents.Execute_Py]: { 
    label: 'Execute Py', 
    category: 'processing' 
  },
  [MajorComponents.Email_notification]: { 
    label: 'Email Notification', 
    category: 'notification' 
  },
  [MajorComponents.Run_Lamda]: { 
    label: 'Run Lambda', 
    category: 'processing' 
  },
  [MajorComponents.Run_GlueJob]: { 
    label: 'Run Glue Job', 
    category: 'processing' 
  },
  [MajorComponents.Run_Eks]: { 
    label: 'Run EKS', 
    category: 'processing' 
  },
  [MajorComponents.Run_StepFunction]: { 
    label: 'Run Step Function', 
    category: 'processing' 
  },
  [MajorComponents.Ingestion]: { 
    label: 'Ingestion', 
    category: 'data' 
  },
  [MajorComponents.Board]: { 
    label: 'Job', 
    category: 'container' 
  },
  [MajorComponents.Map]: { 
    label: 'Map', 
    category: 'transformation' 
  },
  [MajorComponents.Js]: { 
    label: 'JavaScript', 
    category: 'processing' 
  },
  [MajorComponents.Aws]: { 
    label: 'AWS', 
    category: 'cloud' 
  },
  [MajorComponents.Db]: { 
    label: 'Database', 
    category: 'data' 
  },
  [MajorComponents.ETLO]: { 
    label: 'ETLO', 
    category: 'container' 
  },
  [MajorComponents.BatchETLO]: { 
    label: 'BatchETLO', 
    category: 'container' 
  },
  [MajorComponents.PlaceholderNode]: { 
    label: 'Placeholder', 
    category: 'utility' 
  },
} as const;

// Processing component types for quick lookup
const ETL_PROCESSING_TYPES = new Set([
  MajorComponents.Run_Lamda,
  MajorComponents.Run_GlueJob,
  MajorComponents.Run_Eks,
  MajorComponents.Run_StepFunction
]);

/**
 * Hook for component type information and utilities
 * Provides memoized lookups for component metadata
 */
export function useComponentTypeInfo(componentType?: MajorComponents) {
  return useMemo(() => {
    if (!componentType) {
      return {
        label: 'Component',
        category: 'unknown',
        isETLProcessing: false,
        isIngestion: false,
        isContainer: false
      };
    }

    const config = COMPONENT_TYPE_CONFIGS[componentType];
    
    return {
      label: config?.label || 'Component',
      category: config?.category || 'unknown',
      isETLProcessing: ETL_PROCESSING_TYPES.has(componentType),
      isIngestion: componentType === MajorComponents.Ingestion,
      isContainer: config?.category === 'container'
    };
  }, [componentType]);
}

/**
 * Hook for getting optimized component label with reusable component type handling
 */
export function useComponentLabel(
  componentType?: MajorComponents,
  reusableComponentType?: string
) {
  const typeInfo = useComponentTypeInfo(componentType);

  return useMemo(() => {
    // For ETL processing types, show reusable component type if available
    if (typeInfo.isETLProcessing && reusableComponentType && reusableComponentType !== 'Custom') {
      return reusableComponentType;
    }
    
    return typeInfo.label;
  }, [typeInfo.isETLProcessing, typeInfo.label, reusableComponentType]);
}

/**
 * Hook for component categorization and filtering
 */
export function useComponentCategories() {
  return useMemo(() => {
    const categories = {
      processing: [] as MajorComponents[],
      data: [] as MajorComponents[],
      container: [] as MajorComponents[],
      cloud: [] as MajorComponents[],
      notification: [] as MajorComponents[],
      transformation: [] as MajorComponents[],
      utility: [] as MajorComponents[]
    };

    Object.entries(COMPONENT_TYPE_CONFIGS).forEach(([type, config]) => {
      const componentType = type as MajorComponents;
      categories[config.category].push(componentType);
    });

    return categories;
  }, []);
}

/**
 * Hook for component validation and compatibility checking
 */
export function useComponentValidation() {
  const isValidComponentType = useMemo(() => (type: string): type is MajorComponents => {
    return type in COMPONENT_TYPE_CONFIGS;
  }, []);

  const getCompatibleTypes = useMemo(() => (sourceType: MajorComponents) => {
    const sourceCategory = COMPONENT_TYPE_CONFIGS[sourceType]?.category;
    
    return Object.entries(COMPONENT_TYPE_CONFIGS)
      .filter(([, config]) => config.category !== sourceCategory) // Basic compatibility rule
      .map(([type]) => type as MajorComponents);
  }, []);

  return {
    isValidComponentType,
    getCompatibleTypes
  };
}