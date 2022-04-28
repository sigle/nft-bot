export const microToStacks = (amountInMicroStacks: string | number) =>
  Number(amountInMicroStacks) / Math.pow(10, 6);
