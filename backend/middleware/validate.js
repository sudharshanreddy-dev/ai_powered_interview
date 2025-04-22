import { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  req.body = result.data;
  next();
};

export default validate;
