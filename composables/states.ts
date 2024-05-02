export const useCounter = () => useState<number>("counter", () => 0);
export const useColor = () => useState<string>("color", () => "pink");
export const useNavToggle = () => useState<boolean>("nav", () => false);
export const useSimpleCounter = (val: number) =>
  useState<number>("test", () => val);
export const useTranslateToggle = () =>
  useState<boolean>("translate", () => false);