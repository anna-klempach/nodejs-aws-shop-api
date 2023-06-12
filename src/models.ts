import { JsonSchemaType } from "aws-cdk-lib/aws-apigateway";

export type ProductBase = {
  count: number,
  description: string,
  price: number,
  title: string
}

export type Product = ProductBase & {
  id: string
};

export type GetProductsByIdEvent = {
  pathParameters: {
    productId: string
  }
};

const PRODUCT_PROPERTIES_BASE = {
  title: { type: JsonSchemaType.STRING },
  description: { type: JsonSchemaType.STRING },
  count: { type: JsonSchemaType.NUMBER, minimum: 0 },
  price: { type: JsonSchemaType.NUMBER, minimum: 0 }
}

const PRODUCT_PROPERTIES = {
  ...PRODUCT_PROPERTIES_BASE,
  id: { type: JsonSchemaType.STRING }
};

export const ProductBaseSchema = {
  type: JsonSchemaType.OBJECT,
  properties: PRODUCT_PROPERTIES_BASE,
  required: ['title', 'count', 'price', 'description']
}

export const ProductSchema = {
  type: JsonSchemaType.OBJECT,
  properties: PRODUCT_PROPERTIES
};

export const ProductListSchema = {
  type: JsonSchemaType.ARRAY,
  items: ProductSchema
};

export const ErrorSchema = {
  type: JsonSchemaType.OBJECT,
  properties: {
    message: {
      type: JsonSchemaType.STRING
    }
  }
};