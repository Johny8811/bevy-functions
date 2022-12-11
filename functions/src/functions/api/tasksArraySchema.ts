export const tasksArraySchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      Customer_name: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      Tel_number: {
        type: "string",
        pattern: "^(?!s*$).+",
        // pattern: "^(\+|)\d{1,15}$"
      },
      Street: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      House_number: {
        type: "string",
      },
      City: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      Country: {
        type: "string",
        pattern: "^(?!s*$).+",
      },
      // Not Required
      Notification: {
        type: "boolean",
      },
      Customer_note: {
        type: "string",
      },
      Postal_code: {
        type: "string",
      },
      Deliver_after: {
        type: "number",
      },
      Deliver_before: {
        type: "number",
      },
      Quantity: {
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
