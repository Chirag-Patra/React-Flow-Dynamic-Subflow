// formLogic.ts
import { FormConfig, DynamicStep } from './dynamicFormTypes';

export const evaluateCondition = (
  config: FormConfig,
  condition: {
    field: string;
    operator: 'equals' | 'in' | 'not_equals' | 'not_in';
    value: any;
  }
): boolean => {
  const fieldValue = config[condition.field];

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'not_in':
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
    default:
      return true;
  }
};

export const evaluateStepCompletion = (
  config: FormConfig,
  step: DynamicStep
): boolean => {
  const { completionLogic } = step;

  if (completionLogic.type === 'all_required_filled') {
    const requiredFields = completionLogic.requiredFields || [];
    return requiredFields.every(field => {
      const value = config[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

  if (completionLogic.type === 'custom') {
    // Implement custom logic here based on the logic identifier
    return evaluateCustomLogic(config, step, completionLogic.logic || '');
  }

  return false;
};

const evaluateCustomLogic = (
  config: FormConfig,
  step: DynamicStep,
  logicId: string
): boolean => {
  switch (logicId) {
    case 'src_file_type_and_conditional_keys':
      const srcFileValid = !!config.src_file_type?.trim();
      const keyListValid = ['merge', 'distinct_merge'].includes(config.load_type)
        ? !!config.key_list?.trim()
        : true;
      const delKeyValid = config.load_type === 'delete_append'
        ? !!config.del_key_list?.trim()
        : true;
      return srcFileValid && keyListValid && delKeyValid;

    case 'unload_conditional':
      if (!config.need_unload_question) return true;
      return !!config.unld_file_type?.trim() &&
             !!config.unld_frqncy?.trim() &&
             !!config.unld_type?.trim();

    default:
      return true;
  }
};