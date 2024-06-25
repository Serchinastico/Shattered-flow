type Range = { min: number; max: number };

export const randomFloat = ({ min, max }: { min: number; max: number }) =>
  Math.random() * (max - min) + min;

export const randomInt = ({ min, max }: { min: number; max: number }) =>
  Math.round(randomFloat({ min, max }));

export const randomPoint = ({ x, y }: { x: Range; y: Range }) => ({
  x: randomFloat({ min: x.min, max: x.max }),
  y: randomFloat({ min: y.min, max: y.max }),
});
