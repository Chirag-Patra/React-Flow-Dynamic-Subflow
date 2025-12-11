// configKeyMapper.ts
export enum ConfigKey {
  JOB = 'job',
  MAP = 'map',
  ETLO = 'etlo',
  LAMDA = 'lamda',
  GLUE_JOB = 'glue_job',
  STEP_FUNCTION = 'step_function',
  EKS = 'eks'
}

export const getConfigKeyForComponent = (componentType: string): string | null => {
  switch (componentType) {
    case 'Job':
      return ConfigKey.JOB;
    case 'Map':
      return ConfigKey.MAP;
    case 'ETLO':
    case 'etlo':
      return ConfigKey.ETLO;
    case 'Run_Lamda':
      return ConfigKey.LAMDA;
    case 'Run_GlueJob':
      return ConfigKey.GLUE_JOB;
    case 'Run_StepFunction':
      return ConfigKey.STEP_FUNCTION;
    case 'Run_Eks':
      return ConfigKey.EKS;
    default:
      return null;
  }
};

export const isConfigurableComponent = (componentType: string): boolean => {
  return getConfigKeyForComponent(componentType) !== null;
};