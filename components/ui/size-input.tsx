"use client";

import React from "react";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ProductSizeInputProps {
    size: any;
    control: any;
    loading: boolean;
}

const ProductSizeInput : React.FC<ProductSizeInputProps> = ({ size, control, loading }) => {
  return (
    <FormField
      control={control}
      name={`productSizes.${size.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{size.name}</FormLabel>
          <FormControl>
            <Input type="number" disabled={loading} placeholder="0" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductSizeInput;