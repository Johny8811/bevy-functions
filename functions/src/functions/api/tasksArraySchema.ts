export const tasksArraySchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      customer_name: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      tel_number: {
        type: "string",
        pattern: "^(?!s*$).+",
        // pattern: "^(\+|)\d{1,15}$"
      },
      street: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      house_number: {
        type: "string",
      },
      city: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      country: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      // Not Required
      notification: {
        type: "boolean",
      },
      customer_note: {
        type: "string",
      },
      postal_code: {
        type: "string",
      },
      deliver_after: {
        type: "number",
      },
      deliver_before: {
        type: "number",
      },
      quantity: {
        type: "number",
      },
    },
    required: [
      "Customer_name",
      "Tel_number",
      "Street",
      "House_number",
      "City",
      "Country",
    ],
  },
};
