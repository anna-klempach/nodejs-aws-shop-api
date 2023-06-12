import * as Joi from 'joi';
export const productBaseSchema = Joi.object({
  count: Joi.number().required().min(0),
  price: Joi.number().required().min(0),
  title: Joi.string().required(),
  description: Joi.string()
});