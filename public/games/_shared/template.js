// DOM for the game view. Everything is scoped under .pl-game; ids are data-id attributes so several mounts can't collide.
export const template = (texts) => `
<section class="pl-gate" data-id="gate" hidden>
  <h2>${texts.title}</h2>
  <p>${texts.gate}</p>
  <div class="row"><button type="button" class="btn ghost" data-id="gateSignin">Sign in</button><button type="button" class="btn" data-id="gateSignup">Sign up free</button></div>
</section>
<div class="pl-stage" data-id="stage" hidden>
  <div class="game-top">
    <h2 class="title">${texts.title}</h2>
    <div class="cta-row">
      <span class="savestate" data-id="savestate" hidden aria-live="polite"></span>
      <button type="button" class="btn small ghost fs-btn" data-id="fsTop" hidden>Full screen</button>
      <button type="button" class="btn small ghost" data-id="restart">Restart scene</button>
      <button type="button" class="btn small alt" data-id="exit">Back to games</button>
    </div>
  </div>
  <div class="stage">
    <div class="screen">
      <div class="statusbar"><span data-id="score">Score: 0</span><span data-id="roomtxt"></span><span class="clock" data-id="clock" hidden></span><span data-id="hints">Hints: 0</span></div>
      <div class="view" data-id="view">
        <canvas data-id="canvas" width="320" height="180" aria-label="Game screen"></canvas>
      </div>
    </div>
    <div class="hover-label" data-id="hover" aria-live="polite">&nbsp;</div>
  </div>
  <div class="controls">
    <div class="side-actions">
      <button type="button" class="btn items" data-id="sideItems">Items <span class="inv-count" data-id="invcount">0</span></button>
      <button type="button" class="btn stuck" data-id="sideStuck">Stuck?</button>
      <button type="button" class="btn ghost" data-id="sideType">Type</button>
      <button type="button" class="btn ghost fs-btn" data-id="sideFs" hidden>Full screen</button>
      <button type="button" class="btn ghost" data-id="sideRestart">Restart</button>
      <button type="button" class="btn ghost" data-id="sideExit">Exit</button>
    </div>
    <div class="panel"><h4>Action</h4><div class="verbs" data-id="verbs"></div></div>
    <div class="panel inv-panel"><h4>Inventory</h4><div class="inv" data-id="inv"></div></div>
    <form class="parser" data-id="parser" autocomplete="off">
      <label>&gt;</label>
      <input data-id="cmd" name="cmd" placeholder="${texts.placeholder}" spellcheck="false" aria-label="Command">
      <button type="submit" class="btn small alt">Enter</button>
    </form>
  </div>
</div>
<div class="rotate-hint" data-id="rotateHint" role="dialog" aria-label="Turn your phone sideways">
  <div class="inner">
    <div class="phone-icon" aria-hidden="true"></div>
    <h3>Turn your phone sideways</h3>
    <p>${texts.rotate}</p>
    <div class="cta-row">
      <button type="button" class="btn fs-btn" data-id="rotFs" hidden>Play full screen</button>
      <button type="button" class="btn ghost" data-id="rotAnyway">Play upright anyway</button>
    </div>
  </div>
</div>
<button type="button" class="stuck-tab" data-id="stucktab">Stuck?</button>
<div class="drawer-veil" data-id="drawerveil" hidden></div>
<aside class="drawer" data-id="drawer" hidden aria-label="Hints and walkthrough"></aside>
<div data-id="modalroot"></div>
<div class="toast" data-id="toast" hidden></div>
`;
