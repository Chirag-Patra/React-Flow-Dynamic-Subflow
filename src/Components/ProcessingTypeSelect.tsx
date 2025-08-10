import { Select, FormControl, FormLabel } from "@chakra-ui/react";
import React from "react";

export type ProcessingType = "run_glue" | "run_lambda" | "run_eks" | "run_sfn";

interface ProcessingTypeSelectProps {
  value: ProcessingType | "";
  onChange: (value: ProcessingType) => void;
}

export default function ProcessingTypeSelect({ value, onChange }: ProcessingTypeSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as ProcessingType;
    onChange(selectedValue);
  };

  return (
    <FormControl mt={3}>
      <FormLabel fontSize="sm">Processing Type</FormLabel>
      <Select
        size="sm"
        value={value}
        onChange={handleChange}
        placeholder="Select processing type"
      >
        <option value="run_glue">Run Glue Job</option>
        <option value="run_lambda">Run Lambda</option>
        <option value="run_eks">Run EKS Job</option>
        <option value="run_sfn">Run Step Function</option>
      </Select>
    </FormControl>
  );
}