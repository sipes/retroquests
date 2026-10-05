const CSS="\n.demo-shell { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }\n.demo-shell { margin: 0; }\nimg { max-width: 100%; }\n[hidden] { display: none !important; }\n.demo-shell { -webkit-text-size-adjust: 100%; overscroll-behavior: none; }\n\n\n/* Layout: an after-hours arcade cabinet. Portal shell in dark plum, the game screen framed like a CRT, EGA magenta + cyan as the only bright colours. Single dark theme by choice. */\n.demo-shell {\n  --bg: #120f22;\n  --panel: #1c1735;\n  --panel-2: #251f45;\n  --line: #3b3266;\n  --ink: #f2eeff;\n  --muted: #a99fcf;\n  --accent: #ff55ff;      /* EGA magenta */\n  --accent-2: #55ffff;    /* EGA cyan */\n  --gold: #ffff55;        /* EGA yellow */\n  --danger: #ff5555;\n  --ok: #55ff55;\n  --sierra-paper: #ffffff;\n  --sierra-ink: #000000;\n  --sierra-edge: #aa0000;\n  --sierra-edge-2: #0000aa;\n  --status: #aaaaaa;\n  --font-display: \"Pixelify Sans\", \"Courier New\", monospace;\n  --font-.demo-shell: \"Atkinson Hyperlegible\", system-ui, -apple-system, \"Segoe UI\", sans-serif;\n  --font-term: \"VT323\", \"Courier New\", monospace;\n  color-scheme: dark;\n}\n.demo-shell, .demo-shell { height: 100%; }\n.demo-shell {\n  background: var(--bg);\n  color: var(--ink);\n  font-family: var(--font-.demo-shell);\n  font-size: 16px;\n  line-height: 1.5;\n  padding-inline: 16px;\n  padding-block: 0 48px;\n}\n* { box-sizing: border-box; }\n[hidden] { display: none !important; }\nbutton { font: inherit; color: inherit; cursor: pointer; }\nbutton:focus-visible, input:focus-visible, a:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 2px; }\n.wrap { max-width: 1040px; margin: 0 auto; }\n\n/* Header */\n.top {\n  position: sticky; top: env(safe-area-inset-top, 0px); z-index: 20;\n  background: var(--bg);\n  border-bottom: 1px solid var(--line);\n  margin-inline: -16px; padding: 12px 16px;\n}\n.top .wrap { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }\n.logo { display: flex; align-items: baseline; gap: 10px; background: none; border: 0; padding: 0; }\n.logo b { font-family: var(--font-display); font-weight: 700; font-size: 22px; letter-spacing: .04em; color: var(--accent); }\n.logo b span { color: var(--accent-2); }\n.logo small { font-size: 12px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }\n.nav { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\n.btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 8px;\n  border: 2px solid var(--accent); background: var(--accent); color: #1a0020;\n  font-family: var(--font-display); font-weight: 700; font-size: 16px; letter-spacing: .03em;\n  padding: 9px 16px; border-radius: 2px;\n  box-shadow: 3px 3px 0 0 #000;\n  transition: transform .08s ease, box-shadow .08s ease;\n}\n.btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 0 #000; }\n.btn:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 #000; }\n.btn.alt { background: transparent; color: var(--accent-2); border-color: var(--accent-2); }\n.btn.ghost { background: transparent; color: var(--ink); border-color: var(--line); box-shadow: none; }\n.btn.small { font-size: 14px; padding: 6px 12px; }\n.btn[disabled] { opacity: .45; cursor: not-allowed; transform: none; }\n.chip { font-size: 13px; color: var(--muted); border: 1px solid var(--line); padding: 3px 9px; border-radius: 999px; }\n\n/* Home */\n.hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 32px; align-items: center; padding-block: 40px 24px; }\n.eyebrow { font-family: var(--font-display); color: var(--accent-2); text-transform: uppercase; letter-spacing: .14em; font-size: 13px; }\n.hero h1 { font-family: var(--font-display); font-weight: 700; font-size: clamp(34px, 5.4vw, 58px); line-height: 1.02; margin: 10px 0 14px; text-wrap: balance; color: var(--gold); text-shadow: 3px 3px 0 #aa00aa; }\n.hero p.pitch { font-size: 18px; color: var(--ink); max-width: 34ch; margin: 0 0 20px; }\n.hero .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }\n.cta-row { display: flex; gap: 12px; flex-wrap: wrap; }\n.crt {\n  position: relative; background: #000; padding: 10px; border-radius: 10px;\n  border: 2px solid var(--line);\n  box-shadow: 0 0 0 6px var(--panel), 0 18px 40px rgba(0,0,0,.5);\n}\n.crt canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; image-rendering: crisp-edges; border-radius: 4px; }\n.crt::after { content: \"\"; position: absolute; inset: 10px; pointer-events: none; border-radius: 4px;\n  background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,.14) 2px 3px); }\n\n.section-h { font-family: var(--font-display); font-size: 22px; margin: 36px 0 14px; color: var(--ink); }\n.steps { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }\n.step { background: var(--panel); border: 1px solid var(--line); padding: 16px; border-radius: 4px; }\n.step .n { font-family: var(--font-display); color: var(--accent); font-size: 14px; letter-spacing: .1em; }\n.step h3 { margin: 4px 0 6px; font-size: 17px; }\n.step p { margin: 0; color: var(--muted); font-size: 15px; }\n.step .price { font-family: var(--font-display); color: var(--gold); font-size: 18px; }\n.games { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }\n.card { background: var(--panel); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; }\n.card canvas { width: 100%; height: auto; display: block; image-rendering: pixelated; }\n.card ..demo-shell { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }\n.card h3 { font-family: var(--font-display); font-size: 19px; margin: 0; }\n.card p { margin: 0; color: var(--muted); font-size: 15px; flex: 1; }\n.card .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }\n.tag { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: var(--accent-2); }\n.foot { margin-top: 40px; color: var(--muted); font-size: 13px; border-top: 1px solid var(--line); padding-top: 16px; }\n\n/* Game screen */\n.game-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-block: 16px 12px; flex-wrap: wrap; }\n.game-top h2 { font-family: var(--font-display); margin: 0; font-size: 22px; color: var(--gold); }\n.stage { position: relative; }\n.screen { position: relative; background: #000; border: 2px solid var(--line); border-radius: 8px; padding: 8px; box-shadow: 0 0 0 5px var(--panel); }\n.statusbar { display: flex; justify-content: space-between; gap: 8px; background: var(--status); color: #000; font-family: var(--font-term); font-size: 20px; line-height: 1; padding: 4px 8px 3px; }\n.statusbar span:nth-child(2) { text-align: center; flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n.view { position: relative; }\n#gameCanvas { display: block; width: 100%; height: auto; aspect-ratio: 320 / 180; image-rendering: pixelated; image-rendering: crisp-edges; cursor: crosshair; touch-action: manipulation; }\n.hover-label { min-height: 26px; font-family: var(--font-term); font-size: 22px; color: var(--accent-2); padding: 4px 2px 0; }\n\n.sierra {\n  position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%);\n  width: min(88%, 560px); max-height: 86%; overflow: auto;\n  background: var(--sierra-paper); color: var(--sierra-ink);\n  border: 4px double var(--sierra-edge); outline: 3px solid var(--sierra-edge-2);\n  padding: 14px 18px; font-family: var(--font-term); font-size: clamp(19px, 2.5vw, 24px); line-height: 1.12;\n  z-index: 5; cursor: pointer;\n}\n.sierra .more { display: block; text-align: right; font-size: 17px; color: #555; margin-top: 8px; }\n.sierra.death { outline-color: var(--sierra-edge); border-color: #000; }\n.sierra .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; cursor: default; }\n.sierra .actions button { font-family: var(--font-term); font-size: 21px; background: #fff; color: #000; border: 2px solid #000; padding: 2px 12px; }\n.sierra .actions button:hover { background: #000; color: #fff; }\n.float { position: absolute; font-family: var(--font-display); font-weight: 700; color: var(--gold); text-shadow: 2px 2px 0 #000; pointer-events: none; font-size: 22px; animation: rise 1.3s ease-out forwards; z-index: 6; }\n@keyframes rise { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-40px); } }\n\n.controls { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; margin-top: 14px; }\n.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 4px; padding: 12px; min-width: 0; }\n.panel h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--muted); font-weight: 700; }\n.verbs { display: flex; gap: 6px; flex-wrap: wrap; }\n.verb { background: var(--panel-2); border: 2px solid var(--line); font-family: var(--font-display); font-size: 16px; padding: 6px 12px; border-radius: 2px; }\n.verb[aria-pressed=\"true\"] { border-color: var(--accent-2); color: var(--accent-2); }\n.inv { display: flex; gap: 6px; flex-wrap: wrap; min-height: 38px; align-items: center; }\n.inv .empty { color: var(--muted); font-size: 14px; }\n.item { display: inline-flex; align-items: center; gap: 6px; background: var(--panel-2); border: 2px solid var(--line); padding: 5px 10px; border-radius: 2px; font-size: 14px; }\n.item i { width: 10px; height: 10px; display: inline-block; }\n.item[aria-pressed=\"true\"] { border-color: var(--gold); color: var(--gold); }\n.parser { grid-column: 1 / -1; display: flex; gap: 8px; align-items: center; background: #000; border: 2px solid var(--line); border-radius: 4px; padding: 6px 10px; }\n.parser label { font-family: var(--font-term); font-size: 26px; color: var(--accent-2); }\n.parser input { flex: 1; min-width: 0; background: transparent; border: 0; color: var(--ink); font-family: var(--font-term); font-size: 24px; outline: none; }\n.parser input::placeholder { color: #6b6394; }\n\n/* Hint drawer */\n.stuck-tab {\n  position: fixed; right: 0; top: 42%; z-index: 30;\n  writing-mode: vertical-rl; transform: rotate(180deg);\n  background: var(--accent-2); color: #002222; border: 0; border-radius: 0 6px 6px 0;\n  font-family: var(--font-display); font-weight: 700; font-size: 16px; letter-spacing: .06em; padding: 14px 7px;\n  box-shadow: -3px 3px 0 #000;\n}\n.drawer-veil { position: fixed; inset: 0; background: rgba(5,3,15,.55); z-index: 40; }\n.drawer {\n  position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100%); z-index: 41;\n  background: var(--panel); border-left: 2px solid var(--accent-2);\n  padding: calc(16px + env(safe-area-inset-top, 0px)) 18px calc(18px + env(safe-area-inset-bottom, 0px));\n  overflow-y: auto; display: flex; flex-direction: column; gap: 14px;\n}\n.drawer header { display: flex; justify-content: space-between; align-items: start; gap: 12px; }\n.drawer h3 { font-family: var(--font-display); margin: 0; font-size: 22px; color: var(--accent-2); }\n.drawer .sub { color: var(--muted); font-size: 14px; margin: 2px 0 0; }\n.puzzle { border: 1px solid var(--line); border-radius: 4px; padding: 12px; background: var(--panel-2); display: flex; flex-direction: column; gap: 8px; }\n.puzzle .ph { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }\n.puzzle .ph b { font-size: 16px; }\n.status-pill { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); white-space: nowrap; }\n.status-pill.solved { color: var(--ok); border-color: var(--ok); }\n.levels { display: flex; gap: 6px; flex-wrap: wrap; }\n.lvl { font-size: 13px; padding: 4px 10px; border-radius: 2px; border: 1px solid var(--line); background: transparent; }\n.lvl.seen { border-color: var(--accent-2); color: var(--accent-2); }\n.lvl[disabled] { opacity: .4; cursor: not-allowed; }\n.hint-text { background: #000; border-left: 3px solid var(--accent-2); padding: 8px 10px; font-family: var(--font-term); font-size: 21px; line-height: 1.15; color: var(--ink); }\n.hint-text.l3 { border-left-color: var(--accent); }\n.locked { border: 1px dashed var(--line); padding: 14px; border-radius: 4px; color: var(--muted); display: flex; flex-direction: column; gap: 10px; }\n.locked strong { color: var(--ink); }\n.toggle { display: flex; gap: 10px; align-items: start; font-size: 14px; color: var(--muted); }\n.toggle input { margin-top: 3px; accent-color: var(--accent-2); }\n\n/* Modals */\n.modal-veil { position: fixed; inset: 0; z-index: 60; background: rgba(5,3,15,.7); display: grid; place-items: center; padding: 16px; }\n.modal { width: min(460px, 100%); background: var(--panel); border: 2px solid var(--accent); border-radius: 4px; padding: 20px; box-shadow: 6px 6px 0 #000; display: flex; flex-direction: column; gap: 12px; max-height: 100%; overflow: auto; }\n.modal h3 { font-family: var(--font-display); margin: 0; font-size: 22px; color: var(--gold); text-wrap: balance; }\n.modal p { margin: 0; color: var(--ink); }\n.modal .note { color: var(--muted); font-size: 14px; }\n.modal .row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; margin-top: 4px; }\n.field { display: flex; flex-direction: column; gap: 4px; }\n.field label { font-size: 13px; color: var(--muted); }\n.field input { background: var(--bg); border: 1px solid var(--line); color: var(--ink); padding: 9px 10px; border-radius: 2px; font: inherit; }\n.err { color: var(--danger); font-size: 14px; min-height: 1em; }\n.fakecard { border: 1px dashed var(--line); padding: 10px 12px; border-radius: 4px; font-size: 14px; color: var(--muted); display: flex; justify-content: space-between; gap: 8px; }\n.price-big { font-family: var(--font-display); font-size: 30px; color: var(--accent-2); }\n.overlay-card { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; background: rgba(0,0,40,.78); padding: 12px; }\n.overlay-card .modal { border-color: var(--accent-2); }\n\n.toast { position: fixed; left: 50%; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); background: var(--ok); color: #002200; font-weight: 700; padding: 10px 16px; border-radius: 2px; box-shadow: 3px 3px 0 #000; z-index: 80; max-width: calc(100% - 32px); }\n.menu { position: absolute; right: 16px; top: 100%; margin-top: 6px; background: var(--panel); border: 1px solid var(--line); border-radius: 4px; padding: 12px; width: min(280px, calc(100vw - 32px)); display: flex; flex-direction: column; gap: 8px; box-shadow: 4px 4px 0 #000; }\n.menu .owned { font-size: 14px; color: var(--muted); }\n.menu .owned b { color: var(--ink); font-weight: 700; }\n\n@media (max-width: 760px) {\n  .hero { grid-template-columns: minmax(0,1fr); padding-top: 24px; }\n  .steps, .games, .controls { grid-template-columns: minmax(0,1fr); }\n  .stuck-tab { top: auto; bottom: 90px; }\n}\n/* Item in hand banner (all sizes) */\n.using { position: absolute; left: 8px; right: 8px; top: 8px; z-index: 4; display: flex; align-items: center; gap: 10px; justify-content: space-between;\n  background: rgba(0,0,0,.82); border: 2px solid var(--gold); color: var(--gold); font-family: var(--font-term); font-size: clamp(17px, 2.4vw, 22px); line-height: 1.1; padding: 4px 6px 4px 10px; }\n.using button { background: transparent; border: 1px solid var(--gold); color: var(--gold); font-family: var(--font-display); font-size: 14px; padding: 4px 10px; flex: none; }\n/* Inventory sheet */\n.inv-sheet { width: min(640px, 100%); border-color: var(--gold); }\n.inv-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }\n.inv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; overflow-y: auto; min-height: 0; }\n.inv-card { display: flex; flex-direction: column; gap: 6px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 4px; padding: 10px; }\n.inv-card .nm { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; }\n.inv-card .nm i { width: 16px; height: 16px; flex: none; image-rendering: pixelated; }\n.inv-card .ds { color: var(--muted); font-size: 13px; line-height: 1.35; flex: 1; }\n.inv-card .acts { display: flex; gap: 6px; }\n.inv-card .acts .btn { flex: 1; font-size: 13px; padding: 7px 6px; box-shadow: 2px 2px 0 #000; }\n.inv-empty { color: var(--muted); }\n.inv-count { display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px; background: #1a0020; color: var(--gold); font-size: 12px; }\n@keyframes bump { 0% { transform: scale(1); } 40% { transform: scale(1.08); } 100% { transform: scale(1); } }\n.bump { animation: bump .5s ease-out 2; }\n@media (orientation: landscape) and (max-height: 540px) {\n  .inv-sheet { max-height: calc(100dvh - 24px); }\n  .inv-sheet h3 { font-size: 18px; }\n  .using { font-size: 16px; top: 4px; left: 4px; right: 4px; padding: 3px 4px 3px 8px; }\n  .using button { font-size: 12px; padding: 3px 8px; }\n}\n\n/* Mobile: side actions (only shown in landscape phone mode) */\n.side-actions { display: none; }\n.rotate-hint { display: none; }\nbutton, .verb, .item, canvas { touch-action: manipulation; }\n\n/* Phone held sideways while playing: game fills the screen, controls in a slim right column */\n@media (orientation: landscape) and (max-height: 540px) {\n  .demo-shell.in-game { padding: 0; overflow: hidden; height: 100%; }\n  .demo-shell.in-game .top, .demo-shell.in-game .game-top, .demo-shell.in-game .stuck-tab, .demo-shell.in-game .hover-label { display: none !important; }\n  .demo-shell.in-game #gameView {\n    max-width: none; height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));\n    display: grid; grid-template-columns: minmax(0, 1fr) 188px; gap: 8px;\n    padding: 6px max(8px, env(safe-area-inset-right, 0px)) 6px max(8px, env(safe-area-inset-left, 0px));\n  }\n  .demo-shell.in-game .stage { display: flex; align-items: center; justify-content: center; min-height: 0; min-width: 0; }\n  .demo-shell.in-game .screen { padding: 4px; box-shadow: none; border-width: 1px; border-radius: 4px; width: min(100%, calc((100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 12px - 30px) * 16 / 9)); }\n  .demo-shell.in-game .statusbar { font-size: 16px; padding: 3px 6px 2px; }\n  .demo-shell.in-game .sierra { font-size: clamp(15px, 4.6vh, 22px); padding: 10px 14px; width: min(92%, 520px); }\n  .demo-shell.in-game .sierra .more { font-size: 14px; }\n  .demo-shell.in-game .controls { margin: 0; grid-template-columns: minmax(0, 1fr); gap: 6px; align-content: start; overflow-y: auto; min-height: 0; }\n  .demo-shell.in-game .panel { padding: 8px; }\n  .demo-shell.in-game .panel h4 { font-size: 10px; margin-bottom: 6px; }\n  .demo-shell.in-game .verbs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }\n  .demo-shell.in-game .verb { font-size: 14px; padding: 7px 4px; }\n  .demo-shell.in-game .inv { min-height: 0; gap: 4px; }\n  .demo-shell.in-game .inv .empty { font-size: 12px; }\n  .demo-shell.in-game .item { font-size: 12px; padding: 4px 6px; }\n  .demo-shell.in-game .parser { display: none; }\n  .demo-shell.in-game.typing .parser { display: flex; position: fixed; z-index: 50; left: max(8px, env(safe-area-inset-left, 0px)); right: max(8px, env(safe-area-inset-right, 0px)); top: calc(6px + env(safe-area-inset-top, 0px)); }\n  .demo-shell.in-game .side-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }\n  .demo-shell.in-game .side-actions .btn { font-size: 13px; padding: 7px 4px; box-shadow: 2px 2px 0 #000; }\n  .demo-shell.in-game .side-actions .stuck { grid-column: 1 / -1; background: var(--accent-2); border-color: var(--accent-2); color: #002222; }\n  .demo-shell.in-game .side-actions .items { grid-column: 1 / -1; background: var(--gold); border-color: var(--gold); color: #1a1400; }\n  .demo-shell.in-game .panel.inv-panel { display: none; }\n}\n\n/* Phone held upright while playing: ask to rotate */\n@media (orientation: portrait) and (max-width: 600px) {\n  .demo-shell.in-game:not(.portrait-ok) .rotate-hint {\n    display: grid; position: fixed; inset: 0; z-index: 70; place-items: center; background: var(--bg);\n    padding: calc(24px + env(safe-area-inset-top, 0px)) 24px calc(24px + env(safe-area-inset-bottom, 0px));\n  }\n}\n.rotate-hint .inner { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; max-width: 320px; }\n.rotate-hint h3 { font-family: var(--font-display); color: var(--gold); font-size: 24px; margin: 0; }\n.rotate-hint p { margin: 0; color: var(--muted); }\n.phone-icon { width: 46px; height: 76px; border: 4px solid var(--accent-2); border-radius: 8px; position: relative; animation: turn 2.4s ease-in-out infinite; }\n.phone-icon::after { content: \"\"; position: absolute; left: 50%; bottom: 5px; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: var(--accent-2); }\n@keyframes turn { 0%, 30% { transform: rotate(0deg); } 60%, 100% { transform: rotate(-90deg); } }\n.rotate-hint .cta-row { justify-content: center; }\n\n@media (prefers-reduced-motion: reduce) {\n  .phone-icon { animation: none; transform: rotate(-90deg); }\n  .btn, .float { transition: none; animation: none; }\n}\n";
const HTML="<main class=\"wrap\" id=\"gameView\">\n  <div class=\"game-top\">\n    <div role=\"status\" id=\"saveStatus\">Not saved</div><button class=\"btn small ghost\" id=\"retrySave\">Retry pending save</button>\n    <h2 id=\"sceneTitle\">Last Night in Port Lucky</h2>\n    <div class=\"cta-row\">\n      <button class=\"btn small ghost fs-btn\" id=\"fsTopBtn\" hidden>Full screen</button>\n      <button class=\"btn small ghost\" id=\"restartBtn\">Restart scene</button>\n      <button class=\"btn small alt\" id=\"backBtn\">Back to games</button>\n    </div>\n  </div>\n  <div class=\"stage\">\n    <div class=\"screen\">\n      <div class=\"statusbar\"><span id=\"scoreTxt\">Score: 0 of 250</span><span id=\"roomTxt\">The Honeymoon Suite</span><span id=\"hintsTxt\">Hints: 0</span></div>\n      <div class=\"view\" id=\"view\">\n        <canvas id=\"gameCanvas\" width=\"320\" height=\"180\" aria-label=\"Game screen\"></canvas>\n      </div>\n    </div>\n    <div class=\"hover-label\" id=\"hoverLabel\" aria-live=\"polite\">&nbsp;</div>\n  </div>\n  <div class=\"controls\">\n    <div class=\"side-actions\">\n      <button class=\"btn items\" id=\"sideItems\">Items <span class=\"inv-count\" id=\"invCount\">0</span></button>\n      <button class=\"btn stuck\" id=\"sideStuck\">Stuck?</button>\n      <button class=\"btn ghost\" id=\"sideType\">Type</button>\n      <button class=\"btn ghost fs-btn\" id=\"sideFs\" hidden>Full screen</button>\n      <button class=\"btn ghost\" id=\"sideRestart\">Restart</button>\n      <button class=\"btn ghost\" id=\"sideExit\">Exit</button>\n    </div>\n    <div class=\"panel\"><h4>Action</h4><div class=\"verbs\" id=\"verbs\"></div></div>\n    <div class=\"panel inv-panel\"><h4>Inventory</h4><div class=\"inv\" id=\"inv\"></div></div>\n    <form class=\"parser\" id=\"parserForm\" autocomplete=\"off\">\n      <label for=\"cmd\">&gt;</label>\n      <input id=\"cmd\" name=\"cmd\" placeholder=\"Type a command, e.g. look at goat\" spellcheck=\"false\">\n      <button class=\"btn small alt\" type=\"submit\">Enter</button>\n    </form>\n  </div>\n</main>\n\n<div class=\"rotate-hint\" id=\"rotateHint\" role=\"dialog\" aria-label=\"Turn your phone sideways\">\n  <div class=\"inner\">\n    <div class=\"phone-icon\" aria-hidden=\"true\"></div>\n    <h3>Turn your phone sideways</h3>\n    <p>Port Lucky plays best in landscape, with the room filling your screen.</p>\n    <div class=\"cta-row\">\n      <button class=\"btn fs-btn\" id=\"rotFs\" hidden>Play full screen</button>\n      <button class=\"btn ghost\" id=\"rotAnyway\">Play upright anyway</button>\n    </div>\n  </div>\n</div>\n<button class=\"stuck-tab\" id=\"stuckTab\" hidden>Stuck?</button>\n<div class=\"drawer-veil\" id=\"drawerVeil\" hidden></div>\n<aside class=\"drawer\" id=\"drawer\" hidden aria-label=\"Hints and walkthrough\"></aside>\n<div id=\"modalRoot\"></div>\n<div class=\"toast\" id=\"toast\" hidden></div>\n";
// Extracted from the accepted frozen Scene 1 (c508239); see scripts/extract-free-scene.py.
// Suite art, puzzle text, parser and inventory are reused, never imported from paid modules.
export async function mount(container, adapter, options = {}) {
 const initial = await adapter.getState();
 if (!initial.user?.verified) throw new Error('A verified free account is required.');
 const shell = globalThis.document.createElement('div'); shell.className='demo-shell';
 container.replaceChildren(shell);
 const root = shell.attachShadow({mode:'open'});
 root.innerHTML = `<style>${CSS}</style><div class="demo-shell">${HTML}</div>`;
 const body=root.querySelector('.demo-shell');
 const listeners=[], timers=new Set(); let live=true, raf;
 const document = {
  body, documentElement: body,
  getElementById: id=>root.querySelector('#'+id),
  querySelector: s=>root.querySelector(s), querySelectorAll:s=>root.querySelectorAll(s),
  createElement: (...a)=>globalThis.document.createElement(...a),
  createTextNode: (...a)=>globalThis.document.createTextNode(...a),
  get activeElement(){return root.activeElement;},
  get fullscreenElement(){return globalThis.document.fullscreenElement;},
  get webkitFullscreenElement(){return globalThis.document.webkitFullscreenElement;},
  get fullscreenEnabled(){return globalThis.document.fullscreenEnabled;},
  exitFullscreen:()=>globalThis.document.exitFullscreen?.(),
  webkitExitFullscreen:()=>globalThis.document.webkitExitFullscreen?.(),
  addEventListener(type,fn,opts){globalThis.document.addEventListener(type,fn,opts);listeners.push([type,fn,opts]);},
  removeEventListener(...a){globalThis.document.removeEventListener(...a);}
 };
 const setTimeout=(fn,ms)=>{const id=globalThis.setTimeout(()=>{timers.delete(id);if(live)fn();},ms);timers.add(id);return id;};
 const clearTimeout=id=>{timers.delete(id);globalThis.clearTimeout(id);};
 const requestAnimationFrame=fn=>{if(live)raf=globalThis.requestAnimationFrame(fn);};
 const GAME_ID='port-lucky', SKU_GAME='port-lucky';
 const account=initial.user, catalog=initial.catalog || {};
 const price=sku=>catalog[sku]?.display_price || 'Unavailable';
 let game=initial.save ? structuredClone(initial.save) : newGame(), deathSnap;
 let pendingSave=null, saveTimer, saving, disposed=false;
 function persist(){if(disposed)return;pendingSave=structuredClone(game);clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveNow().catch(()=>{}),800);}
 async function saveNow(keepalive=false){
  clearTimeout(saveTimer); if(!pendingSave)return;
  if(saving && !keepalive)await saving;
  if(!pendingSave)return;
  const snapshot=structuredClone(pendingSave);
  $('saveStatus').textContent='Saving…';
  const work=adapter.save(GAME_ID,snapshot,{ownerId:account.id,keepalive}); saving=work;
  try{await work;if(!live)return;if(JSON.stringify(pendingSave)===JSON.stringify(snapshot))pendingSave=null;$('saveStatus').textContent='Saved';}
  catch(e){if(live)$('saveStatus').textContent='Not saved — '+e.message;throw e;}
  finally{if(saving===work)saving=null;}
 }
 function toast(t){$('toast').textContent=t;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,2600);}
 function closeDrawer(){ $('drawer').hidden=true; $('drawerVeil').hidden=true; }
 function openDrawer(){toast('Walkthrough is available in the full game. No hints are included in this demo.');}
/* ---------- Palette + pixel helpers ---------- */
const PAL = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'];
const SKIN = '#FFAA77', DARKWOOD = '#7A3C00', PLUM = '#331133';
const col = c => typeof c === 'number' ? PAL[c] : c;
function R(c, x, y, w, h, k) { c.fillStyle = col(k); c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function disc(c, cx, cy, r, k) { for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); R(c, cx - dx, cy + dy, dx * 2 + 1, 1, k); } }
function sparse(c, x, y, w, h, k, step = 4) { c.fillStyle = col(k); for (let j = 0; j < h; j += 2) for (let i = ((j / 2) % 2) * (step / 2); i < w; i += step) c.fillRect(x + i, y + j, 1, 1); }

function newGame() {
  return { room: 'suite', inv: [], flags: {}, scored: {}, score: 0, hintsUsed: 0, revealed: {}, px: 150, py: 160, dir: 1, started: false };
}

/* ---------- Text data ---------- */
const ITEMS = {
  crackers: { name: 'Crackers of Regret', color: 14, words: ['crackers','cracker','box','snack','snacks'], look: 'Crackers of Regret. $38 a box. Dry as a hotel towel.' },
  keycard:  { name: 'Room keycard', color: 9, words: ['keycard','card','key'], look: 'The keycard for Suite 702. Slightly chewed. Definitely damp.' },
  ticket:   { name: 'Valet ticket', color: 15, words: ['ticket','stub','paper','valet ticket'], look: 'PALMETTO ROYALE VALET. No. 42. 3:12 AM. On the back, in your handwriting: "NEVER AGAIN."' }
};
const ROOMS = {
  suite: {
    title: 'The Honeymoon Suite',
    walk: { x0: 10, x1: 310, y0: 122, y1: 176 },
    describe: 'The Honeymoon Suite at the Palmetto Royale. Somebody had a wonderful time here. A goat in a bow tie stands on the sofa. A tuba lies on the carpet. A blue cocktail fizzes on the coffee table.',
    spots: [
      { id: 'me', name: 'yourself', words: ['me','self','myself','dex','arm','arms','hand','shirt','yourself'], dyn: true },
      { id: 'cocktail', name: 'cocktail', rect: [146,114,16,20], at: [158,150], words: ['cocktail','drink','glass','umbrella','beverage'] },
      { id: 'keycard', name: 'keycard', rect: [184,56,12,10], at: [190,124], words: ['keycard','card','key'], when: s => !s.flags.goatFed },
      { id: 'goat', name: 'goat', rect: [132,44,60,54], at: [190,124], words: ['goat','billy'] },
      { id: 'phone', name: 'telephone', rect: [86,84,22,30], at: [100,124], words: ['phone','telephone','desk','reception','front desk','handset'] },
      { id: 'crackers', name: 'crackers', rect: [222,84,14,12], at: [232,124], words: ['crackers','cracker','box','snack'], when: s => s.flags.minibarOpen && !s.flags.gotCrackers },
      { id: 'minibar', name: 'minibar', rect: [214,78,46,34], at: [232,124], words: ['minibar','fridge','bar','mini-bar','mini bar'] },
      { id: 'painting', name: 'painting', rect: [126,16,64,40], words: ['painting','picture','flamingo','art','frame'] },
      { id: 'disco', name: 'disco ball', rect: [230,2,20,30], words: ['disco','ball','disco ball','discoball'] },
      { id: 'door', name: 'door', rect: [264,24,44,88], at: [284,124], words: ['door','lock','hallway','exit','out'] },
      { id: 'ticket', name: 'paper in the tuba', rect: [66,136,10,10], at: [92,160], words: ['ticket','paper','valet ticket'], when: s => !s.flags.gotTicket },
      { id: 'tuba', name: 'tuba', rect: [30,128,56,36], at: [92,160], words: ['tuba','horn','instrument','bell','brass'] },
      { id: 'table', name: 'coffee table', rect: [118,128,78,20], at: [158,152], words: ['table','coffee table'] },
      { id: 'window', name: 'balcony door', rect: [6,14,88,96], at: [50,124], words: ['window','balcony','view','sea','ocean','curtain','curtains','sun'] },
      { id: 'sofa', name: 'sofa', rect: [102,74,112,40], at: [158,124], words: ['sofa','couch'] }
    ]
  }
};
/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const cv = $('gameCanvas'), cx = cv.getContext('2d');
const bg = document.createElement('canvas'); bg.width = 320; bg.height = 180; const bx = bg.getContext('2d');
let bgKey = '';
let view = 'home';
let verb = 'walk', selItem = null;
let msgQueue = [], msgOpen = false, blocking = false;
let walkTarget = null, walkThen = null, frame = 0;

/* ---------- Drawing: Suite ---------- */
function drawSuiteBg(c, s) {
  R(c, 0, 0, 320, 112, 5);
  for (let y = 10, row = 0; y < 106; y += 10, row++) for (let x = (row % 2) * 8 + 4; x < 320; x += 16) { R(c, x, y, 2, 2, 13); }
  R(c, 0, 0, 320, 6, 13); R(c, 0, 6, 320, 1, 0);
  R(c, 0, 108, 320, 4, 6); R(c, 0, 108, 320, 1, 14);
  R(c, 0, 112, 320, 68, 4); sparse(c, 0, 112, 320, 68, 12, 6);
  // curtains + balcony door
  R(c, 6, 12, 10, 98, 12); R(c, 82, 12, 10, 98, 12);
  for (let i = 0; i < 3; i++) { R(c, 8 + i * 3, 14, 1, 94, 4); R(c, 84 + i * 3, 14, 1, 94, 4); }
  R(c, 14, 16, 70, 92, 15); R(c, 18, 20, 62, 84, 11);
  disc(c, 64, 34, 7, 14);
  R(c, 18, 62, 62, 16, 1); sparse(c, 18, 62, 62, 16, 9, 6);
  R(c, 18, 78, 62, 26, 14); sparse(c, 18, 78, 62, 26, 6, 8);
  R(c, 30, 44, 3, 36, 6);
  R(c, 22, 42, 14, 3, 2); R(c, 28, 38, 12, 3, 10); R(c, 32, 44, 10, 3, 2); R(c, 20, 46, 6, 2, 10);
  R(c, 18, 82, 62, 2, 15); for (let x = 20; x < 80; x += 6) R(c, x, 82, 1, 22, 15);
  R(c, 48, 20, 2, 84, 15);
  // painting
  R(c, 126, 18, 62, 36, 14); R(c, 129, 21, 56, 30, 3); sparse(c, 129, 21, 56, 30, 11, 6);
  disc(c, 154, 38, 6, 13); R(c, 159, 26, 2, 12, 13); R(c, 158, 24, 5, 3, 13); R(c, 162, 25, 3, 1, 0);
  R(c, 158, 27, 5, 1, 4); R(c, 153, 44, 1, 7, 12); R(c, 156, 44, 1, 7, 12);
  // disco ball
  R(c, 240, 6, 1, 10, 7); disc(c, 240, 22, 6, 7);
  for (let i = 0; i < 6; i++) R(c, 236 + (i % 3) * 3, 18 + Math.floor(i / 3) * 4, 1, 1, 15);
  R(c, 238, 26, 4, 1, 8);
  // door
  R(c, 266, 26, 40, 86, DARKWOOD); R(c, 270, 30, 32, 80, 6);
  R(c, 274, 36, 24, 28, DARKWOOD); R(c, 275, 37, 22, 26, 6); R(c, 274, 70, 24, 34, DARKWOOD); R(c, 275, 71, 22, 32, 6);
  R(c, 292, 60, 6, 10, 0); R(c, 294, 62, 2, 2, s.flags.leftSuite ? 10 : 12); disc(c, 297, 76, 1, 14);
  R(c, 278, 16, 16, 6, 2); R(c, 280, 18, 12, 2, 10);
  // minibar
  if (s.flags.minibarOpen) {
    R(c, 216, 80, 34, 30, 7); R(c, 218, 82, 30, 26, 0); R(c, 218, 95, 30, 1, 8);
    if (!s.flags.gotCrackers) { R(c, 224, 86, 11, 9, 14); R(c, 226, 89, 7, 1, 4); R(c, 226, 91, 5, 1, 4); }
    R(c, 250, 82, 8, 26, 15); R(c, 251, 84, 1, 22, 7);
  } else {
    R(c, 216, 80, 34, 30, 7); R(c, 218, 82, 30, 26, 15); R(c, 244, 90, 2, 8, 8); R(c, 222, 85, 12, 4, 7);
  }
  // side table + phone
  R(c, 86, 96, 20, 4, 6); R(c, 86, 96, 20, 1, 14); R(c, 89, 100, 2, 12, 6); R(c, 101, 100, 2, 12, 6);
  R(c, 90, 90, 13, 6, 12); R(c, 89, 87, 15, 3, 4); R(c, 94, 91, 5, 3, 15);
  // sofa
  R(c, 112, 76, 92, 22, 2); sparse(c, 112, 76, 92, 22, 10, 6);
  R(c, 157, 78, 1, 18, 0);
  R(c, 106, 96, 104, 14, 2); R(c, 108, 96, 100, 2, 10);
  R(c, 104, 84, 10, 26, 2); R(c, 104, 84, 10, 2, 10); R(c, 202, 84, 10, 26, 2); R(c, 202, 84, 10, 2, 10);
  R(c, 110, 110, 3, 3, 0); R(c, 203, 110, 3, 3, 0);
}
function drawGoat(c, s, t) {
  const j = (Math.floor(t / 18) % 2);
  R(c, 135, 66, 4, 3, 15);
  R(c, 138, 64, 34, 16, 15); R(c, 138, 78, 34, 2, 7); sparse(c, 140, 66, 30, 10, 7, 8);
  [140, 147, 162, 168].forEach(x => { R(c, x, 80, 3, 14, 7); R(c, x, 94, 3, 2, 0); });
  R(c, 168, 56, 8, 12, 15);
  R(c, 172, 50, 14, 11, 15); R(c, 182, 54, 6, 7, 15);
  R(c, 169, 51, 4, 3, 7); R(c, 174, 45, 2, 5, 8); R(c, 178, 45, 2, 5, 8); R(c, 173, 44, 2, 2, 8); R(c, 179, 44, 2, 2, 8);
  R(c, 178, 53, 3, 2, 14); R(c, 179, 54, 2, 1, 0);
  R(c, 167, 64, 3, 4, 12); R(c, 172, 64, 3, 4, 12); R(c, 170, 65, 2, 2, 4);
  R(c, 183, 61, 3, 5, 7);
  R(c, 184, 59 + j, 4, 1, 0);
  if (!s.flags.goatFed) { R(c, 186, 57 + j, 8, 5, 14); R(c, 187, 58 + j, 6, 1, 1); }
  else if (j) { R(c, 187, 60, 2, 1, 14); }
}
function drawTable(c, t) {
  R(c, 122, 132, 70, 6, 6); R(c, 122, 132, 70, 1, 14); R(c, 126, 138, 3, 8, 6); R(c, 185, 138, 3, 8, 6);
  R(c, 149, 122, 9, 4, 9); R(c, 150, 123, 7, 2, 11); R(c, 152, 126, 3, 5, 15); R(c, 150, 131, 7, 1, 15);
  R(c, 156, 117, 1, 6, 15); R(c, 153, 116, 7, 2, 13);
  const b = Math.floor(t / 10) % 4; R(c, 151 + (b % 2) * 3, 121 - b, 1, 1, 15);
}
function drawTuba(c, s) {
  R(c, 36, 150, 28, 6, 14); R(c, 36, 150, 28, 1, 15);
  R(c, 36, 136, 6, 20, 14); R(c, 38, 154, 24, 8, 6); R(c, 38, 154, 24, 1, 14);
  R(c, 47, 140, 3, 10, 7); R(c, 52, 140, 3, 10, 7); R(c, 57, 140, 3, 10, 7);
  R(c, 34, 132, 5, 4, 7);
  disc(c, 70, 145, 13, 14); disc(c, 70, 145, 10, 6); disc(c, 70, 145, 6, '#552200');
  if (!s.flags.gotTicket) { R(c, 69, 139, 4, 5, 15); R(c, 70, 140, 2, 1, 8); }
}
function drawPlayer(c, x, y, dir, step) {
  const lift = step ? 1 : 0;
  R(c, x - 6 + (step ? -1 : 0), y - 2, 5, 2, 15); R(c, x + 1 + (step ? 1 : 0), y - 2, 5, 2, 15);
  R(c, x - 5 + (step ? -1 : 0), y - 10, 3, 8 - lift, SKIN); R(c, x + 2 + (step ? 1 : 0), y - 10, 3, 8, SKIN);
  R(c, x - 6, y - 15, 12, 6, 1);
  R(c, x - 7, y - 26, 14, 12, 11); R(c, x - 4, y - 23, 2, 2, 13); R(c, x + 2, y - 20, 2, 2, 13); R(c, x - 2, y - 17, 2, 2, 13); R(c, x + 3, y - 25, 2, 1, 13);
  R(c, x - 9, y - 25, 2, 9, 11); R(c, x + 7, y - 25, 2, 9, 11); R(c, x - 9, y - 16, 2, 2, SKIN); R(c, x + 7, y - 16, 2, 2, SKIN);
  R(c, x - 1, y - 28, 3, 2, SKIN);
  R(c, x - 4, y - 36, 8, 8, SKIN); R(c, x - 4, y - 37, 8, 2, 6); R(c, x + (dir > 0 ? -4 : 3), y - 36, 1, 4, 6);
  R(c, x + (dir > 0 ? -2 : -4), y - 33, 6, 2, 0); R(c, x + (dir > 0 ? 1 : -3), y - 33, 1, 1, 8);
  R(c, x + (dir > 0 ? 4 : -5), y - 31, 1, 1, SKIN); R(c, x + (dir > 0 ? 0 : -2), y - 30, 3, 1, 4);
}

/* ---------- Drawing: Garage ---------- */
/* ---------- Game render loop ---------- */
function room() { return ROOMS[game.room]; }
function render() {
  frame++;
  if (view === 'game' && game) {
    const key = game.room + JSON.stringify(game.flags);
    if (key !== bgKey) { bx.clearRect(0, 0, 320, 180); drawSuiteBg(bx, game); bgKey = key; }
    cx.drawImage(bg, 0, 0);
    // movement
    if (walkTarget) {
      const dx = walkTarget[0] - game.px, dy = walkTarget[1] - game.py, d = Math.hypot(dx, dy), sp = 1.6;
      if (d <= sp) { game.px = walkTarget[0]; game.py = walkTarget[1]; walkTarget = null; const f = walkThen; walkThen = null; if (f) f(); }
      else { game.px += dx / d * sp; game.py += dy / d * sp; if (Math.abs(dx) > .5) game.dir = dx > 0 ? 1 : -1; }
    }
    const step = walkTarget ? Math.floor(frame / 6) % 2 : 0;
    const items = [];
    if (game.room === 'suite') {
      drawGoat(cx, game, frame);
      items.push({ y: 146, d: () => drawTable(cx, frame) }, { y: 162, d: () => drawTuba(cx, game) });
    }
    items.push({ y: game.py, d: () => drawPlayer(cx, game.px, game.py, game.dir, step) });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
  }
  requestAnimationFrame(render);
}
/* ---------- Messages ---------- */
function say(text, then) { msgQueue.push({ text, then }); if (!msgOpen) nextMsg(); }
function nextMsg() {
  const old = $('view').querySelector('.sierra:not(.death)'); if (old) old.remove();
  const m = msgQueue.shift();
  if (!m) { msgOpen = false; return; }
  msgOpen = true;
  const box = document.createElement('div');
  box.className = 'sierra'; box.setAttribute('role', 'dialog'); box.tabIndex = 0;
  box.innerHTML = '';
  const p = document.createElement('div'); p.textContent = m.text; box.appendChild(p);
  const more = document.createElement('span'); more.className = 'more'; more.textContent = 'Click or press Enter'; box.appendChild(more);
  const close = () => { box.remove(); msgOpen = false; if (m.then) m.then(); if (!msgOpen) nextMsg(); setTimeout(() => { if (!msgOpen && view === 'game' && (!coarse() || document.body.classList.contains('typing'))) $('cmd').focus({ preventScroll: true }); }, 0); };
  box.addEventListener('click', close);
  box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); close(); } });
  $('view').appendChild(box);
  box.focus({ preventScroll: true });
}
function points(key, n) {
  if (game.scored[key]) return;
  game.scored[key] = true; game.score += n; updateHud();
  const f = document.createElement('div'); f.className = 'float'; f.textContent = '+' + n;
  f.style.left = (game.px / 320 * 100) + '%'; f.style.top = ((game.py - 50) / 180 * 100) + '%';
  $('view').appendChild(f); setTimeout(() => f.remove(), 1400);
}
const has = id => game.inv.includes(id);
function give(id) { if (!has(id)) game.inv.push(id); renderInv(); }
function drop(id) { game.inv = game.inv.filter(i => i !== id); if (selItem === id) selItem = null; renderInv(); }

/* ---------- Puzzle logic ---------- */
function suiteAct(v, o, it) {
  const f = game.flags;
  if (it) {
    if (it === 'crackers' && (o === 'goat' || o === 'keycard')) {
      drop('crackers'); f.goatFed = true; give('keycard'); points('feed', 5);
      return say('You hold out the Crackers of Regret. The goat drops your keycard, inhales the whole box, and gives you a look of grudging respect. You pick up the keycard. It is warm. Don\'t think about it.');
    }
    if (it === 'keycard' && o === 'door') return useDoor();
    if (it === 'ticket' && o === 'goat') return say('The goat leans toward the ticket with interest. You snatch it back. That ticket is your only lead.');
    if (it === 'crackers' && o === 'cocktail') return say('Dunking crackers in a glowing drink is how villains are born. No.');
    return say(`Using the ${ITEMS[it].name.toLowerCase()} on the ${spotName(o)} does nothing useful.`);
  }
  switch (o) {
    case 'me':
      if (v === 'look') { points('arm', 1); return say('You are Dex Morrow, best man. You are wearing a Hawaiian shirt you have never seen before. On your arm, in marker: "DON\'T LET BENNY NEAR THE GOAT." Too late for that.'); }
      return say('You pat yourself down. Wallet: gone. Phone: gone. Dignity: also gone.');
    case 'goat':
      if (v === 'look') return say(f.goatFed ? 'The goat chews thoughtfully on the last of your crackers. It seems to have forgiven you for whatever happened last night.' : 'A goat. Wearing a tiny bow tie. It is standing on the sofa, chewing on your room keycard, and staring at you as if YOU are the one who doesn\'t belong here.');
      if (v === 'talk') return say(f.goatFed ? '"Meh," says the goat. It sounds friendlier now.' : '"Meh," says the goat. You feel judged.');
      if (v === 'take') return say('You try to pick up the goat. The goat headbutts your hangover. You decide to give it some space.');
      if (v === 'drink' || v === 'eat') return say('Absolutely not.');
      return say('The goat ignores you and keeps chewing.');
    case 'keycard':
      if (v === 'look') return say('Your room keycard, sticking out of the goat\'s mouth like a cigar.');
      return say('You reach for the keycard. The goat bites down harder. It is not giving up its breakfast without a trade.');
    case 'minibar':
      if (v === 'look') return say(f.minibarOpen ? (f.gotCrackers ? 'An empty minibar. Someone drank everything. That someone may have been you.' : 'The minibar is empty except for one box of Crackers of Regret, priced at $38.') : 'A minibar. Its little door is closed. Its little price list is terrifying.');
      if (!f.minibarOpen) { f.minibarOpen = true; points('minibar', 2); return say('You open the minibar. Every bottle is gone. Only a box of Crackers of Regret ($38) survived the night.'); }
      if (!f.gotCrackers && v === 'take') return takeCrackers();
      return say('The minibar is already open. It hums at you sadly.');
    case 'crackers':
      if (v === 'look') return say('Crackers of Regret. $38 a box. The tagline reads: "Because you deserve it?"');
      return takeCrackers();
    case 'cocktail':
      if (v === 'look') return say('A glowing blue cocktail with a tiny umbrella. It is bubbling. Drinks shouldn\'t bubble.');
      if (v === 'take') return say('You reach for it, then stop. Your hand is shaking. So is the drink.');
      if (v === 'use' || v === 'drink' || v === 'eat') return die('You take a sip of the blue cocktail. Your vision turns blue. Then your hearing turns blue. Then everything turns blue.\n\nYou have died of an unidentified cocktail. The wedding goes ahead without a best man.');
      return say('The cocktail fizzes menacingly.');
    case 'ticket':
      if (v === 'look') return say('Something papery is stuck deep inside the bell of the tuba.');
      return takeTicket();
    case 'tuba':
      if (v === 'look') return say(f.gotTicket ? 'A full-size tuba. You don\'t play the tuba. Your lips say otherwise.' : 'A full-size tuba. You don\'t play the tuba. Your lips say otherwise. Something papery is stuck deep inside the bell.');
      if (v === 'take' || v === 'search') return takeTicket();
      if (v === 'use' || v === 'play') { points('tuba', 2); return say('You blow into the tuba. A noise like a lovesick whale fills the suite. The goat applauds with one hoof. Someone next door bangs on the wall.'); }
      return say('The tuba gleams at you accusingly.');
    case 'phone':
      if (v === 'look') return say('A hotel phone. Someone has written "DO NOT CALL MOM" on the handset.');
      if (v === 'use' || v === 'talk' || v === 'take') {
        f.calledDesk = true; points('desk', 3);
        return say('You call the front desk. "Good morning, Mr. Morrow. Your friend Benny asked us to tell you he \'took the car.\' He seemed very proud of it. Also, the goat is not included in your room rate."');
      }
      return say('The phone sits there, ready to deliver bad news.');
    case 'door':
      if (v === 'look') return say('The door to the hallway. It has a keycard lock with an angry red light.');
      return useDoor();
    case 'window':
      if (v === 'look') return say('Morning sun, a glittering ocean and palm trees. It is 9:47 AM. The wedding is at four.');
      return say('You open the balcony door. The sunlight hits you like a frying pan. You close it again.');
    case 'painting':
      if (v === 'look') return say('A painting of a flamingo. Someone has drawn a mustache on it in lipstick. The handwriting looks suspiciously like yours.');
      return say('It is bolted to the wall. Smart hotel.');
    case 'disco':
      if (v === 'look') return say('Hotel suites don\'t come with disco balls. You checked the brochure. Twice.');
      return say('Out of reach. Like your dignity.');
    case 'sofa':
      if (v === 'look') return say('A green velvet sofa with a goat on it. There is a hoof-shaped dent in every cushion.');
      if (v === 'sit' || v === 'use') return say('You sit down. The goat sits on you. You stand up.');
      return say('The goat has claimed the sofa. You are not going to win this one.');
    case 'table':
      if (v === 'look') return say('A glass coffee table. Mostly intact. It holds a suspicious blue cocktail.');
      return say('The table is fine where it is. It is the only thing in this room that is.');
    default:
      return say("You can't do that here.");
  }
}
function takeCrackers() {
  if (!game.flags.minibarOpen) return say('What crackers? The minibar is closed.');
  if (game.flags.gotCrackers) return say('You already took them. They cost $38. You will be thinking about that for years.');
  game.flags.gotCrackers = true; give('crackers'); points('crackers', 2);
  say('You take the Crackers of Regret. $38 goes straight onto your room bill.');
}
function takeTicket() {
  if (game.flags.gotTicket) return say('The tuba has nothing left to give.');
  game.flags.gotTicket = true; give('ticket'); points('ticket', 5);
  say('The tuba is too heavy to lift, but you fish around inside the bell. You pull out a valet ticket: PALMETTO ROYALE VALET, No. 42, 3:12 AM.');
}
function useDoor() {
  if (!has('keycard')) return say('The lock blinks red. It wants a keycard. Your keycard is somewhere in this room. Inside a goat, specifically.');
  if (!has('ticket')) return say('You hold the keycard to the lock, then stop. Where would you even start looking for Benny? Search this room for clues about last night first.');
  game.flags.leftSuite = true; points('door', 5);
  say('The light turns green. You take one last look at the goat. It nods. You step into the hallway, take the lift down, and avoid eye contact with everyone.', () => leaveSuite());
}
function leaveSuite() {
  persist(); showPaywall();
}
function die(text) {
  deathSnap = JSON.parse(JSON.stringify(game));
  const box = document.createElement('div'); box.className = 'sierra death'; box.setAttribute('role', 'alertdialog');
  const p = document.createElement('div'); p.style.whiteSpace = 'pre-line'; p.textContent = text; box.appendChild(p);
  const a = document.createElement('div'); a.className = 'actions';
  const again = document.createElement('button'); again.textContent = 'Try again';
  const restart = document.createElement('button'); restart.textContent = 'Restart scene';
  a.append(again, restart); box.appendChild(a);
  again.onclick = e => { e.stopPropagation(); box.remove(); game = deathSnap; blocking = false; updateHud(); renderInv(); };
  restart.onclick = e => { e.stopPropagation(); box.remove(); blocking = false; restartScene(); };
  blocking = true; $('view').appendChild(box); again.focus();
}

/* ---------- Interaction plumbing ---------- */
function spotName(id) { const s = room().spots.find(x => x.id === id); return s ? s.name : id; }
function activeSpots() { return room().spots.filter(s => !s.when || s.when(game)); }
function hitTest(x, y) {
  for (const s of activeSpots()) {
    if (s.dyn) { if (Math.abs(x - game.px) < 9 && y > game.py - 38 && y < game.py) return s; continue; }
    const [rx, ry, rw, rh] = s.rect; if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) return s;
  }
  return null;
}
function clampWalk(x, y) { const w = room().walk; return [Math.max(w.x0, Math.min(w.x1, x)), Math.max(w.y0, Math.min(w.y1, y))]; }
function act(v, id, it) { suiteAct(v, id, it); persist(); }
function approach(spot, fn) {
  if (spot.at && !spot.dyn) { walkTarget = clampWalk(spot.at[0], spot.at[1]); walkThen = fn; }
  else fn();
}
function canvasPoint(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 320, (e.clientY - r.top) / r.height * 180]; }
cv.addEventListener('click', e => {
  if (msgOpen || blocking || !game) return;
  const [x, y] = canvasPoint(e);
  const spot = hitTest(x, y);
  if (spot) { $('hoverLabel').textContent = spot.name.charAt(0).toUpperCase() + spot.name.slice(1);  $('roomTxt').textContent = spot.name.charAt(0).toUpperCase() + spot.name.slice(1); clearTimeout(window.__lblT); window.__lblT = setTimeout(updateHud, 1600); }
  if (selItem && spot) { const it = selItem; selItem = null; renderInv(); return approach(spot, () => act('use', spot.id, it)); }
  if (selItem && !spot) { selItem = null; renderInv(); }
  if (!spot || verb === 'walk') {
    if (spot && spot.id === 'door' && game.room === 'suite') return approach(spot, () => act('use', 'door'));
    walkTarget = clampWalk(x, y); walkThen = null; return;
  }
  if (verb === 'look') return act('look', spot.id);
  approach(spot, () => act(verb, spot.id));
});
cv.addEventListener('mousemove', e => {
  if (!game) return;
  const [x, y] = canvasPoint(e); const s = hitTest(x, y);
  const vName = selItem ? `Use ${ITEMS[selItem].name} on` : ({ walk: 'Walk to', look: 'Look at', take: 'Take', use: 'Use', talk: 'Talk to' })[verb];
  $('hoverLabel').textContent = s ? `${vName} ${s.name}` : (selItem ? `${vName} …` : ' ');
});
cv.addEventListener('mouseleave', () => { $('hoverLabel').textContent = ' '; });

const VERBS = [['walk','Walk'],['look','Look'],['take','Take'],['use','Use'],['talk','Talk']];
function renderVerbs() {
  $('verbs').innerHTML = '';
  VERBS.forEach(([k, label]) => {
    const b = document.createElement('button'); b.className = 'verb'; b.textContent = label; b.setAttribute('aria-pressed', String(verb === k && !selItem));
    b.onclick = () => { verb = k; selItem = null; renderVerbs(); renderInv(); };
    $('verbs').appendChild(b);
  });
}
let lastInvLen = 0;
function renderUsing() {
  const old = $('view').querySelector('.using'); if (old) old.remove();
  if (!selItem || !game) return;
  const u = document.createElement('div'); u.className = 'using';
  const t = document.createElement('span'); t.textContent = `Using ${ITEMS[selItem].name}. Tap what to use it on.`;
  const c = document.createElement('button'); c.textContent = 'Cancel'; c.onclick = e => { e.stopPropagation(); selItem = null; renderInv(); renderVerbs(); };
  u.append(t, c); $('view').appendChild(u);
}
function renderInv() {
  renderUsing();
  const n = game ? game.inv.length : 0;
  $('invCount').textContent = n;
  if (n > lastInvLen) { const b = $('sideItems'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  lastInvLen = n;
  const box = $('inv'); box.innerHTML = '';
  if (!game || !game.inv.length) { const s = document.createElement('span'); s.className = 'empty'; s.textContent = 'Nothing yet. Your pockets are as empty as your memory.'; box.appendChild(s); return; }
  game.inv.forEach(id => {
    const b = document.createElement('button'); b.className = 'item'; b.setAttribute('aria-pressed', String(selItem === id));
    const i = document.createElement('i'); i.style.background = PAL[ITEMS[id].color]; b.append(i, document.createTextNode(ITEMS[id].name));
    b.title = 'Select to use on something. With Look selected, examines it.';
    b.onclick = () => {
      if (msgOpen || blocking) return;
      if (verb === 'look' && !selItem) return say(ITEMS[id].look);
      selItem = selItem === id ? null : id; renderInv(); renderVerbs();
    };
    box.appendChild(b);
  });
}
function updateHud() {
  if (!game) return;
  $('scoreTxt').textContent = `Score: ${game.score} of 250`;
  $('roomTxt').textContent = room().title;
  $('hintsTxt').textContent = `Hints: ${game.hintsUsed}`;
}

/* ---------- Text parser ---------- */
const STOP = new Set(['the','a','an','at','to','on','with','into','onto','up','from','my','some','this','that','of','for','please','around','about']);
const VMAP = {
  look: ['look','l','examine','x','inspect','read','check','view','watch','see','describe'],
  take: ['take','get','grab','pick','steal','remove','fish','collect'],
  use: ['use','open','unlock','push','pull','press','turn','apply','insert','swipe','put','dial','call','ring','unzip','operate'],
  talk: ['talk','speak','ask','chat','greet','hello','hi','say','shout'],
  give: ['give','feed','offer','hand','show','throw'],
  drink: ['drink','sip','taste','swallow'], eat: ['eat','chew','lick'],
  play: ['play','blow','toot'], search: ['search','rummage','dig'],
  sit: ['sit','lie','sleep','rest'], walk: ['go','walk','leave','exit','enter','move','run'],
  inv: ['inventory','inv','i','items','pockets'], help: ['help','?','commands'], score: ['score','points'],
  hints: ['hint','hints','stuck','walkthrough','clue']
};
function parse(raw) {
  const txt = raw.toLowerCase().trim();
  if (!txt) return;
  if (!game) return;
  let words = txt.replace(/[^a-z0-9\s'?-]/g, ' ').split(/\s+/).filter(Boolean);
  let v = Object.keys(VMAP).find(k => VMAP[k].includes(words[0]));
  if (!v) return say(`I don't understand "${raw}". Try a verb like LOOK, TAKE, USE, TALK, GIVE or OPEN.`);
  if (v === 'look' && (words[1] === 'in' || words[1] === 'inside' || words[1] === 'into')) v = 'search';
  const rest = words.slice(1).filter(w => !STOP.has(w) && w !== 'in' && w !== 'inside');
  const phrase = rest.join(' ');
  if (v === 'inv' && window.matchMedia('(orientation: landscape) and (max-height: 540px)').matches) return openInventory();
  if (v === 'inv') return say(game.inv.length ? 'You are carrying: ' + game.inv.map(i => ITEMS[i].name).join(', ') + '.' : 'You are carrying nothing. Not even a plan.');
  if (v === 'help') return say('Type simple commands: LOOK, LOOK GOAT, TAKE TICKET, OPEN MINIBAR, GIVE CRACKERS TO GOAT, USE KEYCARD ON DOOR, INVENTORY. Or click a verb, then click the room.');
  if (v === 'score') return say(`Your score is ${game.score} of 250.`);
  if (v === 'hints') return openDrawer();
  const matchIn = (list) => {
    let best = null, bestLen = 0;
    list.forEach(e => e.words.forEach(w => { if ((' ' + phrase + ' ').includes(' ' + w + ' ') && w.length > bestLen) { best = e; bestLen = w.length; } }));
    return best;
  };
  const invEntries = game.inv.map(id => ({ id, words: ITEMS[id].words }));
  const spots = activeSpots();
  let it = matchIn(invEntries);
  let restAfterItem = phrase;
  if (it) { const w = it.words.find(w => (' ' + phrase + ' ').includes(' ' + w + ' ')); restAfterItem = (' ' + phrase + ' ').replace(' ' + w + ' ', ' ').trim(); }
  const spotIn = (p) => { let best = null, bl = 0; spots.forEach(s => s.words.forEach(w => { if ((' ' + p + ' ').includes(' ' + w + ' ') && w.length > bl) { best = s; bl = w.length; } })); return best; };
  let sp = it ? spotIn(restAfterItem) : spotIn(phrase);
  if (!rest.length) {
    if (v === 'look') return say(room().describe);
    if (v === 'walk') return say('Click where you want to go, or USE the door to leave.');
    return say(`${words[0].toUpperCase()} what?`);
  }
  if (it && !sp) {
    if (v === 'look' || v === 'search') return say(ITEMS[it.id].look);
    if (v === 'give' || v === 'use') return say(`${v === 'give' ? 'Give' : 'Use'} the ${ITEMS[it.id].name.toLowerCase()} on what?`);
    if (v === 'eat' && it.id === 'crackers') return say('$38 crackers? You would rather frame them. Besides, someone else in this room looks hungrier.');
    if (v === 'take') return say('You already have it.');
    return say('Nothing happens.');
  }
  if (!sp) return say(`You don't see that here.`);
  const doIt = () => {
    if (it) return act('use', sp.id, it.id);
    let cv2 = v;
    if (cv2 === 'give') return say('Give what?');
    if (cv2 === 'walk') cv2 = sp.id === 'door' ? 'use' : 'look';
    if (cv2 === 'walk') return;
    act(cv2, sp.id);
  };
  if (v === 'look' || sp.dyn) return doIt();
  approach(sp, doIt);
}
$('parserForm').addEventListener('submit', e => {
  e.preventDefault();
  if (msgOpen || blocking) return;
  const v = $('cmd').value; $('cmd').value = '';
  parse(v);
});
/* ---------- Full screen + landscape (best effort: phones and some app views refuse) ---------- */
const fsEl = document.documentElement;
const canFs = !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen) && (document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false);
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
async function enterImmersive() {
  try {
    if (!isFs()) { if (fsEl.requestFullscreen) await fsEl.requestFullscreen({ navigationUI: 'hide' }); else if (fsEl.webkitRequestFullscreen) fsEl.webkitRequestFullscreen(); }
  } catch (e) { return false; }
  try { if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (e) {}
  return true;
}
function exitImmersive() {
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
  try { if (isFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
}
function syncFsButtons() {
  document.querySelectorAll('.fs-btn').forEach(b => {
    b.hidden = !canFs;
    if (b.id !== 'rotFs') b.textContent = isFs() ? (b.id === 'sideFs' ? 'Windowed' : 'Exit full screen') : 'Full screen';
  });
}
document.addEventListener('fullscreenchange', syncFsButtons);
document.addEventListener('webkitfullscreenchange', syncFsButtons);
const toggleFs = () => { if (isFs()) exitImmersive(); else enterImmersive(); };
const coarse = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

function showView(v){if(v==='home'){options.onExit?.('user');return;} view='game';document.body.classList.add('in-game');}
function startGame(){
 showView('game');bgKey='';selItem=null;verb='walk';renderVerbs();renderInv();updateHud();
 if(game.flags.leftSuite)return showPaywall();
 if(!game.started){game.started=true;persist();
    say('Port Lucky. 9:47 AM. You wake up face-down on the carpet of the Honeymoon Suite at the Palmetto Royale.');
    say('Your head is pounding. The wedding is at four. The groom, your best mate Benny, is nowhere to be seen. There is a goat.');
    say('Click a verb, then click something in the room. Or type commands like LOOK AT GOAT. Save often. This is that kind of game.');

 }else say('Welcome back. Your game was saved right where you left it.');
}
function restartScene(){game=newGame();game.started=true;msgQueue=[];walkTarget=null;walkThen=null;bgKey='';selItem=null;
 document.querySelectorAll('#view .sierra, #view .overlay-card').forEach(n=>n.remove());msgOpen=false;blocking=false;
 renderInv();updateHud();persist();say('You wake up face-down on the carpet. Again. The goat watches you with mild interest.');
}
function overlay(html) {
  const o = document.createElement('div'); o.className = 'overlay-card'; o.innerHTML = html;
  $('view').appendChild(o); blocking = true; return o;
}
function showPaywall() {
  document.querySelectorAll('#view .overlay-card').forEach(n => n.remove());
  const o = overlay(`<div class="modal" role="dialog" aria-labelledby="pwT"><h3 id="pwT">End of the free scene</h3>
    <p>Benny's still out there and the wedding is at four. Unlock the full game to keep playing. Check the save status above before leaving.</p>
    <div class="price-big">${price(SKU_GAME)}</div><p class="note">One-time purchase. Secure card payment by Stripe.</p>
    <div class="row"><button class="btn ghost" data-a="back">Back to games</button><button class="btn" data-a="buy">Unlock full game</button></div></div>`);
  o.querySelector('[data-a=buy]').onclick = () => adapter.checkout(SKU_GAME).catch(e=>toast(e.message));
  o.querySelector('[data-a=back]').onclick = () => { o.remove(); blocking = false; showView('home'); };
  o.querySelector('[data-a=buy]').disabled=!catalog[SKU_GAME]?.sale_enabled; o.querySelector('[data-a=back]').focus();
}
function modal(html, onClose) {
  const v = document.createElement('div'); v.className = 'modal-veil'; v.innerHTML = html;
  const close = () => { v.remove(); document.removeEventListener('keydown', esc); if (onClose) onClose(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  const observer = new MutationObserver(() => { if (!v.isConnected) { document.removeEventListener('keydown', esc); observer.disconnect(); } });
  observer.observe($('modalRoot'), { childList: true });
  v.addEventListener('click', e => { if (e.target === v) close(); });
  $('modalRoot').appendChild(v);
  return { el: v, close };
}
/* ---------- Inventory sheet (phones) ---------- */
function openInventory() {
  // Browsing/selecting items does not advance dialogue; scene actions remain gated.
  if (blocking || !game || document.querySelector('.inv-sheet')) return;
  const m = modal(`<div class="modal inv-sheet" role="dialog" aria-labelledby="invT"><div class="inv-head"><h3 id="invT">Inventory</h3><button class="btn small ghost" data-a="close">Close</button></div><div class="inv-grid" id="invGrid"></div></div>`);
  m.el.querySelector('[data-a=close]').onclick = () => m.close();
  const g = m.el.querySelector('#invGrid');
  if (!game.inv.length) { const e = document.createElement('p'); e.className = 'inv-empty'; e.textContent = 'Nothing yet. Your pockets are as empty as your memory.'; g.appendChild(e); }
  game.inv.forEach(id => {
    const it = ITEMS[id];
    const card = document.createElement('div'); card.className = 'inv-card';
    const nm = document.createElement('div'); nm.className = 'nm'; const i = document.createElement('i'); i.style.background = PAL[it.color]; nm.append(i, document.createTextNode(it.name));
    const ds = document.createElement('div'); ds.className = 'ds'; ds.textContent = it.look;
    const acts = document.createElement('div'); acts.className = 'acts';
    const use = document.createElement('button'); use.className = 'btn'; use.textContent = 'Use on…';
    use.onclick = () => { selItem = id; m.close(); renderInv(); renderVerbs(); };
    acts.append(use);
    card.append(nm, ds, acts); g.appendChild(card);
  });
  m.el.querySelector('[data-a=close]').focus();
}
$('backBtn').onclick = () => { persist(); showView('home'); };
$('restartBtn').onclick = () => { if (!blocking || document.querySelector('#view .death')) restartScene(); };
$('sideRestart').onclick = () => $('restartBtn').click();
$('sideExit').onclick = () => $('backBtn').click();
$('sideStuck').onclick = () => openDrawer();
$('sideItems').onclick = () => openInventory();
$('sideType').onclick = () => {
  const on = !document.body.classList.contains('typing');
  document.body.classList.toggle('typing', on);
  $('sideType').textContent = on ? 'Hide keys' : 'Type';
  if (on) $('cmd').focus(); else $('cmd').blur();
};
$('cmd').addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== $('cmd') && document.body.classList.contains('typing') && !$('cmd').value) { document.body.classList.remove('typing'); $('sideType').textContent = 'Type'; } }, 150); });
['fsTopBtn', 'sideFs'].forEach(id => $(id).onclick = toggleFs);
$('rotFs').onclick = async () => { await enterImmersive(); };
$('rotAnyway').onclick = () => document.body.classList.add('portrait-ok');
syncFsButtons();
$('stuckTab').onclick=openDrawer;
$('retrySave').onclick=()=>saveNow().catch(e=>toast(e.message));
const pagehide=()=>saveNow(true).catch(()=>{});window.addEventListener('pagehide',pagehide);
startGame();if(initial.save)$('saveStatus').textContent='Loaded server progress';requestAnimationFrame(render);
return {get state(){return structuredClone(game);}, refresh:()=>adapter.getState(),
 unmount(){if(disposed)return;disposed=true;exitImmersive();saveNow(true).catch(()=>{});live=false;globalThis.cancelAnimationFrame(raf);
 for(const id of timers)globalThis.clearTimeout(id);for(const args of listeners)globalThis.document.removeEventListener(...args);
 window.removeEventListener('pagehide',pagehide);root.querySelectorAll('[data-a="close"]').forEach(b=>b.click());root.replaceChildren();}
};
}
