// UniversalFormField.tsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Textarea,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { DynamicField, FormConfig } from './dynamicFormTypes';
import { evaluateCondition } from './formLogic';
import { ApiService, JobParametersResponse } from '../../apiService';

interface UniversalFormFieldProps {
  fieldConfig: DynamicField;
  value: any;
  onChange: (field: string, value: any) => void;
  apiData?: JobParametersResponse | null;
  config: FormConfig;
}

const UniversalFormField: React.FC<UniversalFormFieldProps> = ({
  fieldConfig,
  value,
  onChange,
  apiData = null,
  config
}) => {
  const {
    key,
    label,
    type,
    required,
    placeholder,
    helperText,
    rows,
    options,
    apiField,
    visibility
  } = fieldConfig;

  // Check if field should be shown based on visibility condition
  if (visibility?.type === 'conditional' && visibility.condition) {
    if (!evaluateCondition(config, visibility.condition)) {
      return null;
    }
  }

  // Helper function to render select options
  const renderSelectOptions = () => {
    const apiOptions = apiField && apiData ? ApiService.getFieldOptions(apiData, apiField) : [];
    const finalOptions = apiOptions.length > 0 ? apiOptions : (options || []);

    return finalOptions.map((option) => (
      <option key={option} value={option}>
        {apiData ? ApiService.formatOptionValue(option) : option}
      </option>
    ));
  };

  const handleChange = (newValue: any) => {
    onChange(key, newValue);
  };

  const renderField = () => {
    switch (type) {
      case 'input':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          />
        );

      case 'number':
        return (
          <NumberInput
            value={value || 1}
            onChange={(_, num) => handleChange(num || 1)}
            min={1}
          >
            <NumberInputField placeholder={placeholder} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          >
            {renderSelectOptions()}
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={value || (key.includes('parms') ? '{}' : '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={rows || 3}
          />
        );

      case 'switch':
        return (
          <Switch
            isChecked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FormControl
      key={key}
      isRequired={required}
      display={type === 'switch' ? 'flex' : 'block'}
      alignItems={type === 'switch' ? 'center' : 'initial'}
    >
      <FormLabel mb={type === 'switch' ? 0 : undefined}>
        {label}
      </FormLabel>
      {renderField()}
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default UniversalFormField;