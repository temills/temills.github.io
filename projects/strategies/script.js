const rule_types = ["after_x_no_y", "at_least_x_y_before_z", "only_x_directly_after_y", "at_least_x_y_before_z", "after_x_no_y"]
const rule_args = [[1, 3], [1, 2, 4], [5, 3], [1, 2, 1], [4, 2]]
const rule_arg_tps = [['c', 'c'], ['c', 'n', 'c'], ['n', 'c', 'c'], ['c', 'c'], ['n', 'c', 'c'], ['c', 'c']]
function get_rule(ftype, args, arg_tps) {
    var int_to_str = {1:'orange', 2:'red', 3:'green', 4:'blue', 5:'purple'}

    var str = ""
    var rep = ""
    if (args.length > 0) {
        if (arg_tps[0] == 'n') {
            rep = args[0]
        } else {
            rep = int_to_str[args[0]]
        }
        str = ftype.replace(/_x_/g, "_" + rep + "_");
        str = str.replace(/^x_/g, rep + "_");
        str = str.replace(/_x$/g, "_" + rep);
    }
    if (args.length > 1) {
        if (arg_tps[1] == 'n') {
            rep = args[1]
        } else {
            rep = int_to_str[args[1]]
        }
        str = str.replace(/_y_/g, "_" + rep + "_");
        str = str.replace(/^y_/g, rep + "_");
        str = str.replace(/_y$/g, "_" + rep);
    }
    if (args.length > 2) {
        if (arg_tps[2] == 'n') {
            rep = args[2]
        } else {
            rep = int_to_str[args[2]]
        }
        str = str.replace(/_z_/g, "_" + rep + "_");
        str = str.replace(/^z_/g, rep + "_");
        str = str.replace(/_z$/g, "_" + rep);
    }
    str = str.replace(/_/g, " ");

    if (ftype == "if_x_no_y") {
        return(
            [function f1(seq) {
                return !((seq.indexOf(args[0]) >= 0) && (seq.indexOf(args[1]) >= 0))
            },
            str]
        )
    } else if (ftype == "only_x_after_y") {
        return(
            [function f2(seq) {
                var first_y = seq.indexOf(args[1])
                if ((first_y>=0) && (seq.length > first_y+1)) {
                    if (seq.slice(first_y+1).filter(x => x != args[0]).length > 0) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if (ftype == "at_least_x_y_before_z") {
        return(
            [function f3(seq) {
                //3 orange before blue
                var first_z = seq.indexOf(args[2]);
                if (first_z >= 0) {
                    var n_y_before_z = seq.slice(0, first_z).filter(x => x == args[1]).length
                    if (n_y_before_z < args[0]) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if (ftype == "if_x_only_x_or_y") {
        return(
            [function f4(seq) {
                if (seq.indexOf(args[0]) >= 0) {
                    if ([...new Set(seq)].length > 2) {
                        return false
                    }
                    if (seq.filter(x => ((x != args[0]) && (x!=args[1]))).length > 0) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if (ftype == "if_x_only_x_or_1_other") {
        return(
            [function f5(seq) {
                if (seq.indexOf(args[0]) >= 0) {
                    if ([...new Set(seq)].length > 2) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if (ftype == "if_x_at_most_y_z") {
        return(
            [function f6(seq) {
                if (seq.indexOf(args[0]) >= 0) {
                    var n_z = seq.filter(x => x == args[2]).length
                    if (n_z > args[1]) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if (ftype == "at_least_x_others_before_y") {
        return(
            [function f7(seq) {
                var first_y = seq.indexOf(args[1])
                if (first_y >= 0) {
                    if ([...new Set(seq.slice(0, first_y))].length < args[0]) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if (ftype == "after_x_no_y") {
        return(
            [function f8(seq) {
                var first_x = seq.indexOf(args[0])
                if (first_x >= 0) {
                    if (seq.slice(first_x+1).filter(x => x == args[1]).length > 0) {
                        return false
                    }
                }
                return true
            },
            str]
        )
    } else if(ftype == "only_x_directly_after_y") {
        return(
            [function f9(seq) {
                for (var i=0; i<seq.length; i++) {
                    if (seq[i] == args[0]) {
                        if ((i-1 < 0) || (seq[i-1] != args[1])) {
                            return false
                        }
                    }
                }
                return true
            },
            str]
        )
    }
}
var rules = []
for (var i=0; i<rule_types.length; i++) {
    ret = get_rule(rule_types[i], rule_args[i], rule_arg_tps[i])
    rules.push(ret[0])
}



const config = {
  title: "",
  grid_cols: 15,
  grid_rows: 8,
  time_limit: 40,
  sqr_size: 28,

  obj_types: [1, 2, 3, 4, 5],
  obj_probs: [[0.4, 0.2, 0.1, 0.1, 0.2], [0.4, 0.2, 0.1, 0.1, 0.2], [0.1, 0.1, 0.4, 0.15, 0.25]],
  rules: rules,
  // 👇 human-readable rules
  rule_text: ["After you touch orange, you cannot touch green", "You must touch at least 1 red before you touch blue", "When moving to purple, you must be moving from green", "You must touch at least 1 red before you touch orange", "After you touch blue, you cannot touch red"]
};


function startRiverCrossDemo(idx=0, containerId = "demo", trial = config) {

  const display_element = document.getElementById(containerId);

  let actions = [];
  let action_times = [];
  let allow_keydown = false;
  let last_key_up = true;
  let allow_restart = false;
  let game_active = false;
  let timer;

  const grid_cols = trial.grid_cols;
  const grid_rows = trial.grid_rows;
  const game_rows = grid_rows + 1 + 9;
  const grid_start = 1;
  let grid_steps = 0;

  let sqr_size = trial.sqr_size;
  //let sqr_size = Math.min((window.innerHeight * 0.75) / game_rows, trial.sqr_size);

  const color_map = {
    1: "#ff790f",
    2: "red",
    3: "green",
    4: "blue",
    5: "purple"
  };

  const bg_color = "#62cb71";
  const avatar_color = "black";

  let grid = generate_rand_grid(
    grid_rows,
    grid_cols + trial.time_limit * 4,
    trial.obj_types,
    trial.obj_probs[idx % trial.obj_probs.length]
  );

  let gamestate;
  let trial_start_time;
  let game_start_time;
  let rule_violated = -1;

  let rules_str = "<b>Rules:</b>";
  for (let i = 0; i < trial.rule_text.length; i++) {
    rules_str += `<br><b>${i + 1}.</b> ${trial.rule_text[i]}`;
  }
display_element.innerHTML = `
  <div style="text-align:center;">
    <h2>${trial.title}</h2>
    <h3 id="timer">Seconds remaining: ${trial.time_limit}</h3>
  </div>

  <div id="game-scroll">
    <div id="game-layout">
      <div id="game-canvas-wrapper">
        <canvas
          id="game-canvas"
          width="${sqr_size * grid_cols}"
          height="${sqr_size * game_rows}"
        ></canvas>
      </div>

      <div id="rules-box">
        ${rules_str}
        <br><br>
        <b>Controls:</b><br>
        Arrow keys to move.<br>
        Space to wait/restart.
      </div>
    </div>
  </div>

  <div style="text-align:center; margin-top:20px;">
    <button id="start" style="font-size:24px;">Start game</button>
  </div>
`;

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  setup_game();

  document.getElementById("start").addEventListener("click", start_game);
  document.addEventListener("keydown", handle_keydown);
  document.addEventListener("keyup", handle_keyup);

  function start_game() {
    game_start_time = Date.now() - trial_start_time;
    document.getElementById("start").style.display = "none";
    allow_keydown = true;
    game_active = true;
    timer = setInterval(tick, 1000);
  }

  function setup_game() {
    trial_start_time = Date.now();
    grid_steps = 0;
    actions = [];
    action_times = [];
    rule_violated = -1;
    allow_restart = false;
    game_active = false;
    gamestate = {
      xpos: Math.floor(grid_cols / 2),
      ypos: game_rows - 1,
      time: 0,
      seq: []
    };
    update_canvas();
  }

  function tick() {
    gamestate.time += 1;
    document.getElementById("timer").innerHTML =
      "Seconds remaining: " + (trial.time_limit - gamestate.time);

    if (gamestate.time >= trial.time_limit) {
      allow_keydown = false;
      end_game(false, "Time's up");
    }
  }

  function handle_keydown(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
    if (game_active && allow_keydown && last_key_up) {
      allow_keydown = false;
      last_key_up = false;

      if (event.key === "ArrowUp") {
        player_movement(0, -1);
      } else if (event.key === "ArrowDown") {
        player_movement(0, 1);
      } else if (event.key === "ArrowLeft") {
        player_movement(-1, 0);
      } else if (event.key === "ArrowRight") {
        player_movement(1, 0);
      } else if (event.key === " ") {
        player_movement(0, 0);
      } else {
        allow_keydown = true;
      }
    } else if (allow_restart && event.key === " ") {
      document.removeEventListener("keydown", handle_keydown);
      document.removeEventListener("keyup", handle_keyup);
      startRiverCrossDemo(idx+1,containerId, trial);
    }
  }

  function handle_keyup() {
    last_key_up = true;
  }

  function player_movement(dx, dy) {
    actions.push([dx, dy]);
    action_times.push(Date.now() - trial_start_time);

    const nx = gamestate.xpos + dx;
    const ny = gamestate.ypos + dy;

    if (nx >= 0 && nx < grid_cols && ny >= 0 && ny < game_rows) {
      gamestate.xpos = nx;
      gamestate.ypos = ny;
      update_canvas();

      if (avatar_in_grid() && (dx !== 0 || dy !== 0)) {
        const obj = avatar_on_obj();
        gamestate.seq.push(obj);

        if (rule_violation(gamestate.seq)) {
          end_game(false, "Rule violation:");
          return;
        }
      }

      if (avatar_in_endzone()) {
        end_game(true);
        return;
      }
    }

    if (game_active) {
      setTimeout(() => {
        step_grid();
        setTimeout(() => {
          allow_keydown = true;
        }, 200);
      }, 100);
    }
  }

  function step_grid() {
    grid_steps += 1;

    if (avatar_in_grid()) {
      const row = gamestate.ypos - grid_start;
      if ((row % 2) !== (grid_steps % 2)) {
        gamestate.xpos += row % 2 === 1 ? 1 : -1;
      }
    }

    update_canvas();

    if (!avatar_in_bounds()) {
      end_game(false, "Out of bounds");
    }
  }

  function avatar_in_grid() {
    return grid_start <= gamestate.ypos && gamestate.ypos < grid_start + grid_rows;
  }

  function avatar_in_bounds() {
    return (
      gamestate.ypos >= 0 &&
      gamestate.ypos < game_rows &&
      gamestate.xpos >= 0 &&
      gamestate.xpos < grid_cols
    );
  }

  function avatar_in_endzone() {
    return grid_start > gamestate.ypos;
  }

  function avatar_on_obj() {
    const vis_grid = get_visible_grid(grid, grid_steps);
    return vis_grid[gamestate.ypos - grid_start][gamestate.xpos];
  }

  function rule_violation(seq) {
    for (let i = 0; i < trial.rules.length; i++) {
      if (!trial.rules[i](seq)) {
        rule_violated = i;
        return true;
      }
    }
    return false;
  }

  function get_visible_grid(grid, step) {
    const vis_grid = [];

    for (let row = 0; row < grid.length; row++) {
      let vis_row;

      if (row % 2 === 1) {
        const s = Math.floor(step / 2);
        vis_row = grid[row].slice(s, s + grid_cols);
        vis_row.reverse();
      } else {
        const s = Math.ceil(step / 2);
        vis_row = grid[row].slice(s, s + grid_cols);
      }

      vis_grid.push(vis_row);
    }

    return vis_grid;
  }

  function update_canvas() {
    ctx.clearRect(0, 0, grid_cols * sqr_size, game_rows * sqr_size);
    draw_bg();
    draw_grid();
    draw_avatar();
  }

  function draw_bg() {
    ctx.fillStyle = bg_color;
    ctx.fillRect(0, 0, grid_cols * sqr_size, grid_start * sqr_size);

    ctx.fillStyle = "#D3D3D3";
    ctx.fillRect(
      0,
      grid_start * sqr_size,
      grid_cols * sqr_size,
      game_rows * sqr_size
    );
  }

  function draw_grid() {
    const vis_grid = get_visible_grid(grid, grid_steps);

    for (let row = 0; row < vis_grid.length; row++) {
      for (let col = 0; col < vis_grid[row].length; col++) {
        const number = vis_grid[row][col];
        const color = color_map[number];

        const x = col * sqr_size;
        const y = (row + grid_start) * sqr_size;

        const x_buffer = sqr_size / 30;
        const y_buffer = (sqr_size / 30) * 2;

        ctx.fillStyle = color;
        ctx.fillRect(
          x + x_buffer,
          y + y_buffer,
          sqr_size - x_buffer * 2,
          sqr_size - y_buffer * 2
        );
      }
    }
  }

  function draw_avatar() {
    if (!avatar_in_bounds()) return;

    const x = gamestate.xpos * sqr_size;
    const y = gamestate.ypos * sqr_size;
    const buffer = avatar_in_grid() ? (sqr_size / 30) * 2 : sqr_size / 30;

    ctx.beginPath();
    ctx.fillStyle = avatar_color;
    ctx.arc(
      x + sqr_size / 2,
      y + sqr_size / 2,
      sqr_size / 2 - buffer,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }

  function draw_text(text, size, color, y) {
    ctx.font = `${size}px sans-serif`;
    ctx.fillStyle = color;
    const text_width = ctx.measureText(text).width;
    ctx.fillText(text, (grid_cols / 2) * sqr_size - text_width / 2, y * sqr_size);
  }

  function end_game(won, reason = null) {
    clearInterval(timer);
    game_active = false;

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, grid_cols * sqr_size, game_rows * sqr_size);
    ctx.globalAlpha = 1;

    if (won) {
      draw_text("You win!", 50, "green", grid_start + grid_rows + 1.5);
      draw_text("Press space to play again", 20, "green", grid_start + grid_rows + 2.8);
    } else {
      let y = grid_start + grid_rows + 0.75;
      draw_text(reason, 20, "red", y);

      if (rule_violated >= 0) {
        y += 0.8;
        draw_text(trial.rule_text[rule_violated], 15, "red", y);
      }

      y += 1.5;
      draw_text("You lose!", 50, "red", y);
      y += 1.0;
      draw_text("Press space to play again", 20, "red", y);
    }

    console.log({
      won,
      seq: gamestate.seq,
      game_time: gamestate.time,
      actions,
      action_times,
      rule_violated,
      game_start_time,
      game_end_time: Date.now() - trial_start_time
    });

    setTimeout(() => {
      allow_restart = true;
    }, 500);
  }

  function generate_rand_grid(rows, cols, elements, probs) {
    const array = [];

    for (let i = 0; i < rows; i++) {
      const counts = probs.map(p => Math.round(p * cols));
      const total = counts.reduce((sum, count) => sum + count, 0);

      let adjustment = cols - total;
      while (adjustment !== 0) {
        for (let j = 0; j < counts.length; j++) {
          if (adjustment === 0) break;
          if (adjustment > 0) {
            counts[j]++;
            adjustment--;
          } else if (counts[j] > 0) {
            counts[j]--;
            adjustment++;
          }
        }
      }

      const row = [];
      for (let j = 0; j < elements.length; j++) {
        row.push(...Array(counts[j]).fill(elements[j]));
      }

      for (let k = row.length - 1; k > 0; k--) {
        const randIdx = Math.floor(Math.random() * (k + 1));
        [row[k], row[randIdx]] = [row[randIdx], row[k]];
      }

      array.push(row);
    }

    return array;
  }
}

startRiverCrossDemo(0, "demo");