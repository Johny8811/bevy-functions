export type ParamsList = {
  param: string,
  value: string | number | boolean
}[]

// TODO: add test
export const buildUrlParams = (paramsList: ParamsList) =>
  paramsList.reduce((result, param) => {
    const isResultEmpty = result.length !== 0;
    return `${result}${isResultEmpty ? "&" : ""}${param.param}=${param.value}`;
  }, "");

