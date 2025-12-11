// UniversalFormField.tsx
import React, { useState } from 'react';
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
  Button,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import OrchConfigJsonEditor from './OrchConfigJsonEditor';
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
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
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

      case 'jsonorch':
        // Special handling for Orchestrator JSON configuration
        return (
            <Box>
              <HStack spacing={3} mb={2}>
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJsonEditorOpen(true)}
                >
                  Open JSON Editor
                </Button>
                {value && (
                  <Text fontSize="sm" color="gray.600">
                    Configuration loaded
                  </Text>
                )}
              </HStack>
              <Textarea
                value={typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleChange(parsed);
                  } catch {
                    handleChange(e.target.value);
                  }
                }}
                placeholder={placeholder || 'Enter JSON configuration or use the editor above'}
                rows={rows || 6}
                fontFamily="mono"
                fontSize="sm"
              />
              <OrchConfigJsonEditor
                isOpen={isJsonEditorOpen}
                onClose={(data) => {
                  setIsJsonEditorOpen(false);
                  if (data) {
                    handleChange(data);
                  }
                }}
                initialData={typeof value === 'string' ? 
                  (() => {
                    try {
                      return JSON.parse(value);
                    } catch {
                      return {};
                    }
                  })() : 
                  value || {}
                }
              />
            </Box>
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