export const tasksArraySchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      customerName: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      telNumber: {
        type: "string",
        pattern: "^(?!s*$).+",
        // pattern: "^(\+|)\d{1,15}$"
      },
      street: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      houseNumber: {
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
      customerNote: {
        type: "string",
      },
      postalCode: {
        type: "string",
      },
      deliverAfter: {
        type: "number",
      },
      deliverBefore: {
        type: "number",
      },
      quantity: {
        type: "number",
      },
    },
    required: [
      "customerName",
      "telNumber",
      "street",
      "houseNumber",
      "city",
      "country",
    ],
  },
};
