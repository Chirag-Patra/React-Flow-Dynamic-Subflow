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
  VStack,
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
            variant="filled"
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
            _focus={{ borderColor: 'purple.300', shadow: 'md' }}
            transition="all 0.2s"
            fontSize="sm"
          />
        );

      case 'number':
        return (
          <NumberInput
            value={value || 1}
            onChange={(_, num) => handleChange(num || 1)}
            min={1}
          >
            <NumberInputField 
              placeholder={placeholder}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
              _focus={{ borderColor: 'purple.300', shadow: 'md' }}
              transition="all 0.2s"
              fontSize="sm"
            />
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
            variant="filled"
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
            _focus={{ borderColor: 'purple.300', shadow: 'md' }}
            transition="all 0.2s"
            fontSize="sm"
          >
            {renderSelectOptions()}
          </Select>
        );

      case 'jsonorch':
        // Special handling for Orchestrator JSON configuration
        return (
            <VStack spacing={3} align="stretch">
              <HStack 
                spacing={3} 
                p={3} 
                bg="#f4f5f7" 
                borderRadius="md" 
                border="1px solid" 
                borderColor="gray.200"
                _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                transition="all 0.2s"
              >
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="purple"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJsonEditorOpen(true)}
                  _hover={{ bg: 'purple.50', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  fontSize="xs"
                  fontWeight="medium"
                >
                  Open JSON Editor
                </Button>
                {value && (
                  <Text 
                    fontSize="xs" 
                    color="green.600" 
                    fontWeight="medium"
                    bg="green.50"
                    px={2}
                    py={1}
                    borderRadius="sm"
                  >
                    ✓ Configuration loaded
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
                fontSize="xs"
                variant="filled"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                _focus={{ borderColor: 'purple.300', shadow: 'md' }}
                transition="all 0.2s"
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
            </VStack>
          );

      case 'textarea':
        return (
          <Textarea
            value={value || (key.includes('parms') ? '{}' : '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={rows || 3}
            variant="filled"
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
            _focus={{ borderColor: 'purple.300', shadow: 'md' }}
            transition="all 0.2s"
            fontSize="sm"
          />
        );

      case 'switch':
        return (
          <Switch
            isChecked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
            colorScheme="purple"
            size="md"
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
      p={4}
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      _hover={{ 
        borderColor: 'purple.200', 
        shadow: 'sm',
        transform: 'translateY(-1px)'
      }}
      transition="all 0.2s"
      mb={3}
    >
      <FormLabel 
        mb={type === 'switch' ? 0 : 2}
        fontSize="sm"
        fontWeight="semibold"
        color="gray.700"
      >
        {label}
        {required && (
          <Text as="span" color="red.500" ml={1}>
            *
          </Text>
        )}
      </FormLabel>
      {renderField()}
      {helperText && (
        <FormHelperText 
          fontSize="xs" 
          color="gray.500"
          mt={2}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default UniversalFormField;