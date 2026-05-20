const { z } = require('zod');
const schema = z.object({
  title: z.string().default("Agency Pitch"),
});
console.log(schema.parse({}));
