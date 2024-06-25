import { randomFloat, randomInt, randomPoint } from "./random";
import * as Simplex from "ts-perlin-simplex";

const CONFIG = {
  RESOLUTION: 0.0005,
  NUMBER_OF_PARTICLES: 50000,
  NUMBER_OF_ZONES: 10,
  HALF_WIDTH: window.innerWidth * 0.5,
  HALF_HEIGHT: window.innerHeight * 0.5,
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
};

interface CanvasAnimation {
  frame: number;
}

interface Point {
  x: number;
  y: number;
}

type Vector = Point;

interface Particle {
  previousPosition: Point;
  position: Point;
  velocity: Vector;
  acceleration: Vector;
  color: string;
  age: number;
}

interface Zone {
  center: Point;
  radius: number;
}

const simplex = new Simplex.SimplexNoise();

const prepareCanvas = ({ id }: { id: string }) => {
  const canvas = document.querySelector<HTMLCanvasElement>(id);
  canvas.width = CONFIG.WIDTH;
  canvas.height = CONFIG.HEIGHT;
  return canvas.getContext("2d");
};

const createParticle = (): Particle => {
  const position = randomPoint({
    x: { min: 0, max: CONFIG.WIDTH },
    y: { min: 0, max: CONFIG.HEIGHT },
  });
  const velocity = randomPoint({
    x: { min: -1, max: 1 },
    y: { min: -1, max: 1 },
  });

  return {
    previousPosition: position,
    position: { x: position.x + velocity.x, y: position.y + velocity.y },
    velocity: velocity,
    acceleration: { x: 0, y: 0 },
    color: "#aA2F52",
    age: randomInt({ min: 0, max: 80 }),
  };
};

const update = ({
  animation,
  particles,
  zones,
}: {
  animation: CanvasAnimation;
  particles: Particle[];
  zones: Zone[];
}) => {
  for (const particle of particles) {
    particle.previousPosition.x = particle.position.x;
    particle.previousPosition.y = particle.position.y;

    particle.position.x += particle.velocity.x;
    particle.position.y += particle.velocity.y;

    particle.velocity.x += particle.acceleration.x;
    particle.velocity.y += particle.acceleration.y;

    particle.age += 1;

    const angle =
      randomFloat({ min: -0.5, max: 0.5 }) +
      simplex.noise(
        CONFIG.RESOLUTION * particle.position.x,
        CONFIG.RESOLUTION * particle.position.y
      ) *
        Math.PI *
        2;

    const friction = 0.99;
    particle.velocity.x =
      friction * (0.9 * particle.velocity.x + 0.5 * Math.sin(angle));
    particle.velocity.y =
      friction * (0.9 * particle.velocity.y + 0.5 * Math.cos(angle));

    if (
      particle.position.x < 0 ||
      particle.position.y < 0 ||
      particle.position.x > CONFIG.WIDTH ||
      particle.position.y > CONFIG.HEIGHT ||
      particle.age > 100
    ) {
      const newParticle = createParticle();

      particle.previousPosition.x = newParticle.previousPosition.x;
      particle.previousPosition.y = newParticle.previousPosition.y;
      particle.position.x = newParticle.position.x;
      particle.position.y = newParticle.position.y;
      particle.velocity.x = newParticle.velocity.x;
      particle.velocity.y = newParticle.velocity.y;
      particle.acceleration.x = newParticle.acceleration.x;
      particle.acceleration.y = newParticle.acceleration.y;
      particle.age = newParticle.age;
    }
  }

  for (const zone of zones) {
  }
};

const renderParticle = ({
  animation,
  context,
  particle,
  zones,
}: {
  animation: CanvasAnimation;
  context: CanvasRenderingContext2D;
  particle: Particle;
  zones: Zone[];
}) => {
  context.lineWidth = 1;
  context.strokeStyle = particle.color;

  context.save();

  for (const zone of zones) {
    const distX = particle.position.x - zone.center.x;
    const distY = particle.position.y - zone.center.y;
    const distanceToCenter = Math.sqrt(distX * distX + distY * distY);

    if (distanceToCenter < zone.radius) {
      context.strokeStyle = "#3A6FC2";
      context.translate(zone.center.x, zone.center.y);
      const factor = distanceToCenter / zone.radius;
      context.scale(-1, -1);
      context.rotate(Math.PI + animation.frame * 0.01);
      context.translate(-zone.center.x, -zone.center.y);
    }
  }

  context.beginPath();
  context.moveTo(particle.previousPosition.x, particle.previousPosition.y);
  context.lineTo(particle.position.x, particle.position.y);
  context.stroke();

  context.restore();
};

const render = ({
  animation,
  context,
  particles,
  zones,
}: {
  animation: CanvasAnimation;
  context: CanvasRenderingContext2D;
  particles: Particle[];
  zones: Zone[];
}) => {
  update({ animation, particles, zones });

  context.fillStyle = "#0000000A";
  context.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

  for (const particle of particles) {
    renderParticle({ animation, context, particle, zones });
  }

  animation.frame += 1;

  requestAnimationFrame(() => render({ animation, context, particles, zones }));
};

const main = () => {
  const context = prepareCanvas({ id: "#canvas" });
  const animation = { frame: 0 } satisfies CanvasAnimation;
  const particles: Particle[] = [];
  const zones: Zone[] = [];

  for (let i = 0; i < CONFIG.NUMBER_OF_PARTICLES; i++) {
    particles.push(createParticle());
  }

  for (let i = 0; i < CONFIG.NUMBER_OF_ZONES; i++) {
    zones.push({
      center: randomPoint({
        x: { min: 250, max: CONFIG.WIDTH - 250 },
        y: { min: 250, max: CONFIG.HEIGHT - 250 },
      }),
      radius: randomFloat({ min: 50, max: 250 }),
    });
  }

  requestAnimationFrame(() => render({ animation, context, particles, zones }));
};

main();
