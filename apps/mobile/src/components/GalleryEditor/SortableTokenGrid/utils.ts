export type Positions = {
  [id: string]: number;
};

export const getPosition = (order: number, columns: number, size: number) => {
  'worklet';

  return {
    x: (order % columns) * size,
    y: Math.floor(order / columns) * size,
  };
};

export const getOrder = (x: number, y: number, columns: number, size: number) => {
  'worklet';

  const col = Math.round(x / size);
  const row = Math.round(y / size);

  return row * columns + col;
};
