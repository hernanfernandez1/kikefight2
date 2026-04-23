const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hp1El = document.getElementById("hp1");
const hp2El = document.getElementById("hp2");
const statusEl = document.getElementById("status");

const FLOOR_Y = canvas.height - 90;
const GRAVITY = 0.72;

const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

const stageImage = new Image();
stageImage.src = "assets/stage_bg.svg";

const spriteDefinitions = {
  p1: {
    idle: {
      src: "assets/original/p1_idle_sheet.png",
      fallback: "assets/kurenai_idle.svg",
      frameW: 80,
      frameH: 128,
      frames: 6,
      fps: 8,
      y: 0,
    },
    attack: {
      src: "assets/original/p1_attack_sheet.png",
      fallback: "assets/kurenai_attack.svg",
      frameW: 96,
      frameH: 128,
      frames: 6,
      fps: 12,
      y: 0,
    },
  },
  p2: {
    idle: {
      src: "assets/original/p2_idle_sheet.png",
      fallback: "assets/viento_idle.svg",
      frameW: 80,
      frameH: 128,
      frames: 6,
      fps: 8,
      y: 0,
    },
    attack: {
      src: "assets/original/p2_attack_sheet.png",
      fallback: "assets/viento_attack.svg",
      frameW: 96,
      frameH: 128,
      frames: 6,
      fps: 12,
      y: 0,
    },
  },
};

function makeAnim(def) {
  const sheet = new Image();
  const fallback = new Image();
  sheet.src = def.src;
  fallback.src = def.fallback;

  sheet.onerror = () => {
    sheet.dataset.failed = "1";
  };

  return {
    sheet,
    fallback,
    frameW: def.frameW,
    frameH: def.frameH,
    frames: def.frames,
    fps: def.fps,
    y: def.y,
  };
}

const spriteAnims = {
  p1: {
    idle: makeAnim(spriteDefinitions.p1.idle),
    attack: makeAnim(spriteDefinitions.p1.attack),
  },
  p2: {
    idle: makeAnim(spriteDefinitions.p2.idle),
    attack: makeAnim(spriteDefinitions.p2.attack),
  },
};

let userAssetsAnnounced = false;

class Projectile {
  constructor(owner, x, y, vx, color, damage) {
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.radius = 10;
    this.life = 95;
    this.color = color;
    this.damage = damage;
  }

  update() {
    this.x += this.vx;
    this.life--;
  }

  draw() {
    const g = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, 18);
    g.addColorStop(0, "#fff");
    g.addColorStop(1, this.color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Fighter {
  constructor(config) {
    Object.assign(this, config);
    this.vx = 0;
    this.vy = 0;
    this.hp = 100;
    this.facing = this.id === 1 ? 1 : -1;
    this.onGround = true;
    this.attackTimer = 0;
    this.hitTimer = 0;
    this.specialCooldown = 0;
    this.combo = 0;
    this.animTime = 0;
  }

  get hitbox() {
    return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
  }

  control() {
    if (this.hp <= 0) return;
    this.vx = 0;
    if (keys.has(this.controls.left)) {
      this.vx = -this.speed;
      this.facing = -1;
    }
    if (keys.has(this.controls.right)) {
      this.vx = this.speed;
      this.facing = 1;
    }
    if (keys.has(this.controls.jump) && this.onGround) {
      this.vy = -13;
      this.onGround = false;
    }
    this.crouch = keys.has(this.controls.down);
  }

  tryAttack(type) {
    if (this.attackTimer > 0 || this.hp <= 0) return null;
    this.attackTimer = type === "special" ? 38 : 20;
    if (type === "special") {
      if (this.specialCooldown > 0) return null;
      this.specialCooldown = 80;
      return {
        kind: "projectile",
        projectile: new Projectile(
          this,
          this.x + this.facing * 38,
          this.y - 72,
          this.facing * 8,
          this.projectileColor,
          11
        ),
      };
    }
    const reach = type === "kick" ? 66 : 52;
    const dmg = type === "kick" ? 8 : 6;
    return { kind: "melee", reach, dmg };
  }

  update() {
    this.control();
    this.x += this.vx;
    this.x = Math.max(30, Math.min(canvas.width - 30, this.x));

    this.vy += GRAVITY;
    this.y += this.vy;
    if (this.y >= FLOOR_Y) {
      this.y = FLOOR_Y;
      this.vy = 0;
      this.onGround = true;
    }
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.specialCooldown > 0) this.specialCooldown--;
    this.animTime += 1;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.facing, 1);

    if (this.hitTimer > 0) ctx.globalAlpha = 0.62;

    const fighterSprites = this.id === 1 ? spriteAnims.p1 : spriteAnims.p2;
    const attackPhase = this.attackTimer > 8;
    const anim = attackPhase ? fighterSprites.attack : fighterSprites.idle;
    const frameIndex = Math.floor((this.animTime * anim.fps) / 60) % anim.frames;

    if (anim.sheet.complete && !anim.sheet.dataset.failed) {
      const sx = frameIndex * anim.frameW;
      ctx.drawImage(anim.sheet, sx, anim.y, anim.frameW, anim.frameH, -48, -128, 96, 128);
    } else if (anim.fallback.complete) {
      ctx.drawImage(anim.fallback, -48, -128, 96, 128);
    } else {
      ctx.fillStyle = this.main;
      ctx.fillRect(-24, -100, 48, 58);
    }

    ctx.restore();
  }
}

const p1 = new Fighter({
  id: 1,
  x: 250,
  y: FLOOR_Y,
  w: 46,
  h: 128,
  speed: 4,
  main: "#7f3bcf",
  shade: "#2d1d45",
  projectileColor: "#c76aff",
  fx: "#e1a7ff",
  controls: { left: "a", right: "d", jump: "w", down: "s", punch: "f", kick: "g", special: "h" },
});

const p2 = new Fighter({
  id: 2,
  x: 850,
  y: FLOOR_Y,
  w: 46,
  h: 128,
  speed: 4,
  main: "#2ea84d",
  shade: "#1b3f29",
  projectileColor: "#82ff90",
  fx: "#beffac",
  controls: { left: "arrowleft", right: "arrowright", jump: "arrowup", down: "arrowdown", punch: "k", kick: "l", special: ";" },
});

const projectiles = [];

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function meleeHit(attacker, defender, move) {
  const hb = defender.hitbox;
  const zone = {
    x: attacker.x + attacker.facing * 20 - (attacker.facing < 0 ? move.reach : 0),
    y: attacker.y - 92,
    w: move.reach,
    h: 42,
  };
  if (overlap(zone, hb) && defender.hitTimer === 0) {
    defender.hp = Math.max(0, defender.hp - move.dmg);
    defender.hitTimer = 16;
    defender.x += attacker.facing * 12;
    attacker.combo += 1;
    statusEl.textContent = `¡P${attacker.id} conecta combo x${attacker.combo}!`;
  }
}

function handleInputAttacks() {
  if (keys.has(p1.controls.punch)) {
    const move = p1.tryAttack("punch");
    if (move) meleeHit(p1, p2, move);
  }
  if (keys.has(p1.controls.kick)) {
    const move = p1.tryAttack("kick");
    if (move) meleeHit(p1, p2, move);
  }
  if (keys.has(p1.controls.special)) {
    const move = p1.tryAttack("special");
    if (move) projectiles.push(move.projectile);
  }

  if (keys.has(p2.controls.punch)) {
    const move = p2.tryAttack("punch");
    if (move) meleeHit(p2, p1, move);
  }
  if (keys.has(p2.controls.kick)) {
    const move = p2.tryAttack("kick");
    if (move) meleeHit(p2, p1, move);
  }
  if (keys.has(p2.controls.special)) {
    const move = p2.tryAttack("special");
    if (move) projectiles.push(move.projectile);
  }
}

function resetFight() {
  p1.hp = p2.hp = 100;
  p1.x = 250;
  p2.x = 850;
  p1.combo = p2.combo = 0;
  projectiles.length = 0;
  statusEl.textContent = "¡Round nuevo!";
}

function drawStage() {
  if (stageImage.complete) {
    ctx.drawImage(stageImage, 0, 0, canvas.width, canvas.height);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#101727");
  sky.addColorStop(1, "#28203d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.update();
    const target = p.owner === p1 ? p2 : p1;
    const hb = target.hitbox;
    const hit = p.x > hb.x && p.x < hb.x + hb.w && p.y > hb.y && p.y < hb.y + hb.h;
    if (hit && target.hitTimer === 0) {
      target.hp = Math.max(0, target.hp - p.damage);
      target.hitTimer = 18;
      p.owner.combo += 1;
      statusEl.textContent = `¡Especial de P${p.owner.id}! combo x${p.owner.combo}`;
      projectiles.splice(i, 1);
      continue;
    }
    if (p.life <= 0 || p.x < -20 || p.x > canvas.width + 20) projectiles.splice(i, 1);
  }
}

function render() {
  drawStage();
  p1.draw();
  p2.draw();
  projectiles.forEach((p) => p.draw());
}

function updateHUD() {
  hp1El.style.width = `${p1.hp}%`;
  hp2El.style.width = `${p2.hp}%`;
}

function checkUserSpritesLoaded() {
  if (userAssetsAnnounced) return;
  const ready = [
    spriteAnims.p1.idle.sheet,
    spriteAnims.p1.attack.sheet,
    spriteAnims.p2.idle.sheet,
    spriteAnims.p2.attack.sheet,
  ].every((img) => img.complete && !img.dataset.failed);

  if (ready) {
    statusEl.textContent = "Assets originales cargados (recortados desde spritesheet).";
    userAssetsAnnounced = true;
  }
}

function checkWin() {
  if (p1.hp <= 0 || p2.hp <= 0) {
    const winner = p1.hp > p2.hp ? "P1" : "P2";
    statusEl.textContent = `¡${winner} gana! Pulsa R para revancha.`;
  }
}

function tick() {
  if (keys.has("r")) resetFight();

  if (p1.hp > 0 && p2.hp > 0) {
    handleInputAttacks();
    p1.update();
    p2.update();
    updateProjectiles();
    checkUserSpritesLoaded();
    checkWin();
  }
  updateHUD();
  render();
  requestAnimationFrame(tick);
}

tick();
