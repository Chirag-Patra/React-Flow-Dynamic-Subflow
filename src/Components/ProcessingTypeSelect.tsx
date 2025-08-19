import { Select, FormControl, FormLabel } from "@chakra-ui/react";
import React from "react";

export type ProcessingType = "ingest" | "etl" | "ingest_etl" | "stream" | "stream_etl";

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
        <option value="ingest">Ingest</option>
        <option value="etl">ETL</option>
        <option value="ingest_etl">Ingest-ETL</option>
        <option value="stream">Stream</option>
        <option value="stream_etl">Stream-ETL</option>
      </Select>
    </FormControl>
  );
}