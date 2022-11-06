export const convertStringToDataType = function(value: string) {
  const v = Number(value);
  return !isNaN(v) ? v :
    value === "undefined" ? undefined :
      value === "null" ? null :
        value === "true" ? true :
          value === "false" ? false :
            value;
};
