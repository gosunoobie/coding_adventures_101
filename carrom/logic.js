/**
 *
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x * energyLoss;
    particle.velocity.y = vFinal1.y * energyLoss;

    otherParticle.velocity.x = vFinal2.x * energyLoss;
    otherParticle.velocity.y = vFinal2.y * energyLoss;
  }
}
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
let fullWidth = window.innerWidth;
let fullHeight = window.innerHeight;
canvas.width = fullWidth;
canvas.height = fullHeight;

const energyLoss = 0.6;
const cornerEnergyLoss = 0.75;
const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function Arena(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = "#000000";
  this.draw = () => {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.stroke();
    c.closePath();
  };
}

function Particle(x, y, velocity, radius) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: velocity.x,
    y: velocity.y,
  };
  this.radius = radius;
  this.color = "#b1b1b1";
  this.mass = 1;
  this.friction = 0.6;
  this.initialPos = {
    x: 0,
    y: 0,
  };

  this.draw = () => {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  };

  this.drawTrajectory = () => {
    if (this.initialPos.x === 0 && this.initialPos.y === 0) return;
    c.beginPath();
    c.moveTo(this.initialPos.x, this.initialPos.y);
    c.lineTo(mouse.x, mouse.y);
    c.stroke();
    c.closePath();
  };

  this.update = (particles) => {
    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      if (
        distance(this.x, this.y, particles[i].x, particles[i].y) -
          this.radius -
          particles[i].radius <
        0
      ) {
        resolveCollision(this, particles[i]);
        /*         console.log("collieded"); */
      }
    }
    if (this.x + this.radius >= fullWidth || this.x - this.radius <= 0) {
      this.velocity.x = -this.velocity.x;
    }

    if (this.y + this.radius >= fullHeight || this.y - this.radius <= 0) {
      this.velocity.y = -this.velocity.y;
    }
    this.x += this.velocity.x * this.friction;
    this.y += this.velocity.y * this.friction;
    this.draw();
    this.drawTrajectory();
  };
  this.clicked = () => {
    console.log("clicked");
    const d = distance(mouse.x, mouse.y, this.x, this.y);
    if (d < this.radius) {
      this.color = "#234245";
      console.log("move");
      this.move();
      this.initialPos.x = this.x;
      this.initialPos.y = this.y;
    }
  };

  this.move = () => {
    window.addEventListener("pointerup", this.moveHandler);
  };

  this.moveHandler = (e) => {
    const x = this.initialPos.x;
    const y = this.initialPos.y;
    this.color = "#ea2127";
    const d = distance(x, y, e.clientX, e.clientY);
    console.log(d);
    const angle = Math.atan2(y - e.clientY, x - e.clientX);
    console.log(angle);
    const forceMagnitude = d / 15;
    const force = {
      x: forceMagnitude * Math.cos(angle),
      y: forceMagnitude * Math.sin(angle),
    };
    const acceleration = {
      x: force.x / this.mass,
      y: force.y / this.mass,
    };
    // Update velocity based on acceleration
    this.velocity.x += acceleration.x;
    this.velocity.y += acceleration.y;

    this.initialPos.x = 0;
    this.initialPos.y = 0;

    window.removeEventListener("pointerup", this.moveHandler);
  };
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const particles = [];
let arena = null;

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, fullWidth, fullHeight);

  particles.forEach((particle) => {
    particle.update(particles);
  });

  arena.draw();
}

function init() {
  for (let i = 0; i < 20; i++) {
    const radius = Math.random() * 10 + 30;
    /*     const radius = 30; */
    let x = Math.random() * (fullWidth - radius * 2) + radius;
    let y = Math.random() * (fullHeight - radius * 2) + radius;
    /* let velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    }; */

    /*     let { x, y } = getRandomPointInCircle(); */
    console.log(x, y);
    let velocity = {
      x: 0,
      y: 0,
    };
    if (i != 0) {
      for (let j = 0; j < particles.length; j++) {
        const d =
          distance(x, y, particles[j].x, particles[j].y) -
          radius -
          particles[j].radius;

        if (d < 0) {
          x = Math.random() * (fullWidth - radius * 2) + radius;
          y = Math.random() * (fullHeight - radius * 2) + radius;
          j = -1;
        }
      }
    }
    const particle = new Particle(x, y, velocity, radius);
    particles.push(particle);
  }
  arena = new Arena(fullWidth / 2, fullHeight / 2, fullHeight / 2.2);

  animate();
}

init();

window.addEventListener("pointerdown", () => {
  particles.forEach((ball) => {
    ball.clicked();
  });
});

function getRandomPointInCircle() {
  // Calculate the radius based on half the window's inner height
  const windowHeight = window.innerHeight;
  const radius = windowHeight / 2.2;

  // Generate random angle in radians
  const angle = Math.random() * 2 * Math.PI;

  // Generate random distance from center (0,0) to edge (radius)
  const distance = Math.sqrt(Math.random()) * radius;

  // Calculate the x and y coordinates of the point
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return { x, y };
}
