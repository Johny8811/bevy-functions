// TODO: add test
export const csvToJSON = (data: string, delimiter = ",") => {
  const titles = data.slice(0, data.indexOf("\n")).split(delimiter);
  return data
      .slice(data.indexOf("\n") + 1)
      .split("\n")
      .map((v) => {
        const values = v.split(delimiter);
        return titles.reduce<{ [key:string]: string }>(
            (obj, title, index) => ((obj[title] = values[index]), obj),
            {}
        );
      });
};
