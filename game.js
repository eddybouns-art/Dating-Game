import kaboom from "[unpkg.com](https://unpkg.com/kaboom/dist/kaboom.mjs)";

kaboom({
  global: true,
  canvas: document.querySelector("#game"),
  width: 384,
  height: 216,
  scale: 3,
  background: [24, 24, 32],
});

// Simple sprites (Platzhalter)
loadSprite("player", "[i.imgur.com](https://i.imgur.com/Wb1qfhK.png)"); // ersetze mit eigenem
loadSprite("heart", "[i.imgur.com](https://i.imgur.com/KP3Y6tJ.png)");
loadSprite("block", "[i.imgur.com](https://i.imgur.com/M6rwarW.png)");

const SPEED = 120;
const JUMP = 360;

let stats = {
  charms: 0,
  time: 0,
  lives: 3,
};

scene("level1", () => {
  stats.charms = 0;
  stats.time = 0;

  const level = addLevel([
    "========================",
    "=                      =",
    "=        h     ===     =",
    "=   ===            h   =",
    "=                      =",
    "=   p                  =",
    "========================",
  ], {
    tileWidth: 16,
    tileHeight: 16,
    tiles: {
      "=": () => [rect(16, 16), area(), solid(), color(100, 100, 120)],
      "p": () => [sprite("player"), area(), body(), anchor("center"), "player"],
      "h": () => [sprite("heart"), area(), "charm"],
      " ": () => [],
    },
  });

  const player = get("player")[0];

  onUpdate(() => {
    stats.time += dt();
  });

  // Movement
  onKeyDown("left", () => player.move(-SPEED, 0));
  onKeyDown("right", () => player.move(SPEED, 0));
  onKeyPress("space", () => {
    if (player.isGrounded()) player.jump(JUMP);
  });

  // Collect charms
  player.onCollide("charm", (c) => {
    destroy(c);
    stats.charms += 1;
  });

  // Ziel rechts oben erreichen -> Dialog
  onUpdate(() => {
    if (player.pos.x > width() - 24) {
      go("dialog");
    }
  });
});

scene("dialog", () => {
  add([
    text("Date-Time!\nDu hast " + stats.charms + " Charms gesammelt.", { size: 16 }),
    pos(20, 20),
  ]);

  const options = stats.charms >= 2
    ? ["Charmanter Witz erzählen", "Ehrlich über Hobbys reden"]
    : ["Smalltalk über Wetter", "Peinliche Stille akzeptieren"];

  let idx = 0;

  const redraw = () => {
    destroyAll("opt");
    options.forEach((o, i) => {
      add([
        text((i === idx ? "> " : "  ") + o, { size: 14 }),
        pos(20, 80 + i * 20),
        "opt",
      ]);
    });
  };
  redraw();

  onKeyPress("up", () => { idx = (idx + options.length - 1) % options.length; redraw(); });
  onKeyPress("down", () => { idx = (idx + 1) % options.length; redraw(); });
  onKeyPress("enter", () => {
    const success = (stats.charms >= 2 && idx === 0) || (stats.charms >= 1 && idx === 1);
    go(success ? "result", { ok: true }) : go("result", { ok: false });
  });
});

scene("result", ({ ok }) => {
  add([
    text(ok ? "Perfect Match! ❤️" : "Vielleicht nächstes Mal.", { size: 18 }),
    pos(20, 40),
  ]);
  add([
    text("Enter = Weiter, R = Neustart", { size: 12 }),
    pos(20, 80),
  ]);
  onKeyPress("enter", () => go("level1"));
  onKeyPress("r", () => go("level1"));
});

go("level1");
