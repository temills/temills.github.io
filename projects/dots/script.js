
(() => {
  const display_element = document.getElementById("demo");
  if (!display_element) return;

  const CONFIG = {
    screen_fill: 0.99,
    default_dot_rad: 64,
    default_prev_pt_rad: 20,
    guess_rad: 50,
    default_feedback_dot_rad: 80,
    default_poss_region_inner_rad: 30,
    animate_interval_time: 900,
    before_feedback_time: 350,
    animate_feedback_time: 900,
    arrow_speed: 0.07,
    progress_prompt: "Nice work!",
    imagePaths: {
      bg: "/projects/dots/imgs/purp.png",
      guess: "/projects/dots/imgs/pnksprk.png",
      prev: "/projects/dots/imgs/star2.png",
      star: "/projects/dots/imgs/star.png"
    },
    audioPaths: {
      success: "/projects/dots/sounds/success_sound.mp3",
      fail: "/projects/dots/sounds/fail_sound.mp3",
      guess: "/projects/dots/sounds/guess_sound.mp3"
    }
  };

  let trial, staticCanvas, rotatingCanvas, ctx, rctx, canvasWrap;
  let images = {}, audio = {};
  let startTime, dotIdx, ignoreClick, clickX, clickY, successList, rts, scaleAtClick, nCorrect;

  let max_dots = 16;

  init(false);



  async function init(start_now=true) {
    trial = sampleStimulus();
    resetState();

    display_element.innerHTML = `
    <div class="dot-demo-shell">
        <button id="dot-action-button" class="dot-action-button">Click here to try the task - guess where the star will go next!</button>

        <div id="dot-canvas-wrap" class="dot-canvas-wrap">
        <canvas id="staticCanvas"></canvas>
        <canvas id="rotatingCanvas"></canvas>
        </div>

        <div id="dot-finish-panel" class="dot-finish-panel" hidden></div>
    </div>
    `;

    canvasWrap = document.getElementById("dot-canvas-wrap");
    staticCanvas = document.getElementById("staticCanvas");
    rotatingCanvas = document.getElementById("rotatingCanvas");
    ctx = staticCanvas.getContext("2d");
    rctx = rotatingCanvas.getContext("2d");

    preventHighlight(staticCanvas);
    preventHighlight(rotatingCanvas);

    images = await loadImages(CONFIG.imagePaths);
    audio = loadAudio(CONFIG.audioPaths);

    resetCanvas();
    addListeners();

    const pts = getDisplayDotPositions();
    const sfd = getScaleFromDefault();
    drawPrevPt([pts[0][dotIdx], pts[1][dotIdx]], CONFIG.default_prev_pt_rad * sfd, ctx);
    drawStar([pts[0][dotIdx], pts[1][dotIdx]], CONFIG.default_dot_rad * sfd, rctx);

    //animateStart();
    const actionButton = document.getElementById("dot-action-button");
    if (start_now) {
        actionButton.hidden = true;
        animateStart();
    } else {
        actionButton.onclick = () => {
            actionButton.hidden = true;
            animateStart();
        };
    }
  }

  function sampleStimulus() {
      var rand_key = Object.keys(stimuli_dct["funcs"])[Math.floor(Math.random() * Object.keys(stimuli_dct["funcs"]).length)];
      const stim = stimuli_dct["funcs"][rand_key]

      return {
        dot_positions: stim.true_coords,
        default_scale: stim.scale,
        default_shift: [stim.shift_x, stim.shift_y],
        default_width: stimuli_dct["params"]["width"],
        default_height: stimuli_dct["params"]["height"],
        n_to_animate: 2,
        progress_prompt: CONFIG.progress_prompt
      };
  }

  function resetState() {
    startTime = performance.now();
    dotIdx = 0;
    ignoreClick = true;
    nCorrect = 0;
    const n = trial.dot_positions[0].length;
    clickX = Array(n).fill(null);
    clickY = Array(n).fill(null);
    successList = Array(n).fill(null);
    rts = Array(n).fill(null);
    scaleAtClick = Array(n).fill(null);
  }

  function loadImages(paths) {
    return Promise.all(Object.entries(paths).map(([key, src]) => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve([key, img]);
      img.onerror = () => {
        console.warn("Could not load image:", src, "Using fallback drawing.");
        resolve([key, null]);
      };
      img.src = src;
    }))).then(Object.fromEntries);
  }

  function loadAudio(paths) {
    const out = {};
    for (const [key, src] of Object.entries(paths)) out[key] = new Audio(src);
    return out;
  }

  function getScaleFromDefault() {
    return Math.min(500,
        Math.min(
        (display_element.getBoundingClientRect().width * CONFIG.screen_fill) / trial.default_width,
        (display_element.getBoundingClientRect().height * CONFIG.screen_fill) / trial.default_height
    ));
  }

  function getCanvasDims() {
    const sfd = getScaleFromDefault();
    return [trial.default_width * sfd, trial.default_height * sfd];
  }

  function getDisplayDotPositions() {
    const scale = trial.default_scale * getScaleFromDefault();
    const [shiftX, shiftY] = trial.default_shift;
    return [
      trial.dot_positions[0].map(x => (x + shiftX) * scale),
      trial.dot_positions[1].map(y => (y + shiftY) * scale)
    ];
  }

  function resetCanvas() {
    const [w, h] = getCanvasDims();
    for (const c of [staticCanvas, rotatingCanvas]) {
      c.width = w;
      c.height = h;
    }
    canvasWrap.style.width = `${w}px`;
    canvasWrap.style.height = `${h}px`;

    ctx.clearRect(0, 0, w, h);
    rctx.clearRect(0, 0, w, h);
    drawBg(ctx, w, h);

    const pts = getDisplayDotPositions();
    const sfd = getScaleFromDefault();
    for (let i = 0; i <= dotIdx; i++) {
      drawPrevPt([pts[0][i], pts[1][i]], CONFIG.default_prev_pt_rad * sfd, ctx);
      if (i < dotIdx) drawLine([pts[0][i], pts[1][i]], [pts[0][i + 1], pts[1][i + 1]], ctx);
    }
    drawStar([pts[0][dotIdx], pts[1][dotIdx]], CONFIG.default_dot_rad * sfd, rctx);
  }

  function addListeners() {
    window.addEventListener("resize", resetCanvas);
    window.addEventListener("orientationchange", resetCanvas);
    rotatingCanvas.addEventListener("mousedown", onClick);
    rotatingCanvas.addEventListener("touchstart", onClick, { passive: false });
    //window.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    rotatingCanvas.addEventListener("touchmove", e => {
      if (!ignoreClick) e.preventDefault();
    }, { passive: false });
  }

  function removeListeners() {
    window.removeEventListener("resize", resetCanvas);
    window.removeEventListener("orientationchange", resetCanvas);
    rotatingCanvas.removeEventListener("mousedown", onClick);
    rotatingCanvas.removeEventListener("touchstart", onClick);
  }

  function animateStart() {
    let nAnimated = 0;
    const id = setInterval(() => {
      if (nAnimated === trial.n_to_animate) {
        clearInterval(id);
        resetCanvas();
        playAudio("guess");
        ignoreClick = false;
        startTime = performance.now();
        return;
      }

      const pts = getDisplayDotPositions();
      const sfd = getScaleFromDefault();
      scaleAtClick[dotIdx + 1] = trial.default_scale * sfd;

      animateOne(0, [pts[0][dotIdx], pts[1][dotIdx]], [pts[0][dotIdx + 1], pts[1][dotIdx + 1]], null, 0);
      dotIdx++;
      setTimeout(() => drawPrevPt([pts[0][dotIdx], pts[1][dotIdx]], CONFIG.default_prev_pt_rad * sfd, ctx), 700);
      nAnimated++;
    }, CONFIG.animate_interval_time);
  }

  function onClick(e) {
    if (ignoreClick) return;
    e.preventDefault?.();
    const [x, y] = getClickPos(e);
    clickFunc(x, y);
  }

  function getClickPos(e) {
    const rect = rotatingCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [
      (clientX - rect.left) * (rotatingCanvas.width / rect.width),
      (clientY - rect.top) * (rotatingCanvas.height / rect.height)
    ];
  }

  function clickFunc(x, y) {
    const pts = getDisplayDotPositions();
    const sfd = getScaleFromDefault();
    if (!checkValid(x, y, pts, sfd)) return;

    ignoreClick = true;
    rts[dotIdx + 1] = performance.now() - startTime;

    const scale = trial.default_scale * sfd;
    clickX[dotIdx + 1] = x / scale - trial.default_shift[0];
    clickY[dotIdx + 1] = y / scale - trial.default_shift[1];
    scaleAtClick[dotIdx + 1] = scale;

    const success = checkSuccess(x, y, pts, sfd);
    successList[dotIdx + 1] = success;
    if (success) nCorrect++;

    displayFeedback(success, x, y);
  }

  function checkValid(x, y, pts, sfd) {
    const d = Math.hypot(x - pts[0][dotIdx], y - pts[1][dotIdx]);
    return d > CONFIG.default_poss_region_inner_rad * sfd;
  }

  function checkSuccess(x, y, pts, sfd) {
    const d = Math.hypot(x - pts[0][dotIdx + 1], y - pts[1][dotIdx + 1]);
    return d < CONFIG.default_feedback_dot_rad * sfd;
  }

  function displayFeedback(success, x, y) {
    const pts = getDisplayDotPositions();
    const sfd = getScaleFromDefault();
    const guess = [x, y];

    drawGuess(guess, CONFIG.guess_rad * sfd, rctx);

    setTimeout(() => {
      animateOne(0, [pts[0][dotIdx], pts[1][dotIdx]], [pts[0][dotIdx + 1], pts[1][dotIdx + 1]], [guess], 0);
    }, 0);

    setTimeout(() => playAudio(success ? "success" : "fail"), CONFIG.before_feedback_time - 100);

    setTimeout(() => {
      if (success) {
        animateSuccess([pts[0][dotIdx + 1], pts[1][dotIdx + 1]]);
      }

      setTimeout(() => {
        if (dotIdx >= Math.min(max_dots, trial.dot_positions[0].length - 2)){
          animateEnd(dotIdx);
        } else {
          dotIdx++;
          resetCanvas();
          ignoreClick = false;
          startTime = performance.now();
        }
      }, CONFIG.animate_feedback_time);
    }, CONFIG.before_feedback_time);
  }

function animateEnd(dotIdx) {
  removeListeners();

  const panel = document.getElementById("dot-finish-panel");
  const actionButton = document.getElementById("dot-action-button");

  panel.hidden = true;

  actionButton.textContent = `You got ${nCorrect}/${dotIdx-3} close predictions — Try another pattern`;
  actionButton.hidden = false;
  actionButton.onclick = init;

  console.log("Dot demo data:", getData());
}

  function getCurrLoc(prev, loc, progress) {
    progress = Math.min(progress, 1);
    return [prev[0] + (loc[0] - prev[0]) * progress, prev[1] + (loc[1] - prev[1]) * progress];
  }

  function animateOne(progress, prev, loc, guesses, nCalls) {
    rctx.clearRect(0, 0, rotatingCanvas.width, rotatingCanvas.height);
    const sfd = getScaleFromDefault();
    if (guesses) guesses.forEach(g => drawGuess(g, CONFIG.guess_rad * sfd, rctx));

    const curr = getCurrLoc(prev, loc, progress);
    if (nCalls % 2 === 0) drawDot(curr, 2 * sfd, ctx);
    drawStar(progress >= 1 ? loc : curr, CONFIG.default_dot_rad * sfd, rctx);

    if (progress < 1) {
      requestAnimationFrame(() => animateOne(progress + CONFIG.arrow_speed, prev, loc, guesses, nCalls + 1));
    }
  }

  function animateSuccess(loc) {
    const sfd = getScaleFromDefault();
    let angle = 0;
    let rad = CONFIG.default_dot_rad * sfd;
    const maxRad = rad * 1.5;
    function frame() {
      rctx.clearRect(0, 0, rotatingCanvas.width, rotatingCanvas.height);
      rctx.save();
      rctx.translate(loc[0], loc[1]);
      rctx.rotate(angle);
      rctx.translate(-loc[0], -loc[1]);
      drawStar(loc, rad, rctx);
      rctx.restore();
      angle += 0.08;
      rad += 0.5;
      if (rad < maxRad) requestAnimationFrame(frame);
    }
    frame();
  }

  function drawBg(currCtx, w, h) {
    if (images.bg) currCtx.drawImage(images.bg, 0, 0, w, h);
    else {
      const grad = currCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#30245f");
      grad.addColorStop(1, "#8157c7");
      currCtx.fillStyle = grad;
      currCtx.fillRect(0, 0, w, h);
    }
  }

  function drawLine(a, b, currCtx) {
    currCtx.beginPath();
    currCtx.strokeStyle = "rgb(255,230,0)";
    currCtx.setLineDash([2, 2]);
    currCtx.moveTo(a[0], a[1]);
    currCtx.lineTo(b[0], b[1]);
    currCtx.stroke();
    currCtx.setLineDash([]);
  }

  function drawGuess(loc, rad, currCtx) {
    currCtx.globalAlpha = 0.3;
    currCtx.fillStyle = "pink";
    currCtx.beginPath();
    currCtx.arc(loc[0], loc[1], rad / 2, 0, 2 * Math.PI);
    currCtx.fill();
    currCtx.globalAlpha = 1;
    if (images.guess) currCtx.drawImage(images.guess, loc[0] - rad / 2, loc[1] - rad / 2, rad, rad);
  }

  function drawStar(loc, rad, currCtx) {
    if (images.star) currCtx.drawImage(images.star, loc[0] - rad / 2, loc[1] - rad / 2, rad, rad);
    else drawFallbackStar(currCtx, loc[0], loc[1], rad / 2, "#ffd43b");
  }

  function drawPrevPt(loc, rad, currCtx) {
    if (images.prev) currCtx.drawImage(images.prev, loc[0] - rad / 2, loc[1] - rad / 2, rad, rad);
    else drawFallbackStar(currCtx, loc[0], loc[1], rad / 2, "#fff3bf");
  }

  function drawDot(loc, rad, currCtx) {
    currCtx.fillStyle = "rgb(255,230,0)";
    currCtx.beginPath();
    currCtx.arc(loc[0], loc[1], rad, 0, 2 * Math.PI);
    currCtx.fill();
  }

  function drawFallbackStar(currCtx, cx, cy, r, color) {
    currCtx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rr = i % 2 === 0 ? r : r * 0.45;
      currCtx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    currCtx.closePath();
    currCtx.fillStyle = color;
    currCtx.fill();
  }

  function playAudio(key) {
    const a = audio[key];
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  function preventHighlight(el) {
    el.style.userSelect = "none";
    el.style.webkitUserSelect = "none";
    el.style.webkitTapHighlightColor = "transparent";
  }

  function getData() {
    return {
      stimulus: trial,
      rt: rts,
      response_x: clickX,
      response_y: clickY,
      response_success: successList,
      scale_at_response: scaleAtClick
    };
  }
})();
