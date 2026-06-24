const display_element = document.getElementById("demo");
display_element.innerHTML = `
  <div style="text-align:center;">
    <h2>${""}</h2>
    <div id="game_selector">
    <select id="game_choice">
        <option value="logic">Logic Game</option>
        <option value="contingency">Contingency Game</option>
        <option value="shuffle_keys">Switching Mappings Game</option>
        <option value="change_agent">Switching Embodiments Game</option>
        <option value="logic_u">Logic + Goal Uncertainty Game</option>
        <option value="contingency_u">Contingency + Goal Uncertainty Game</option>
        <option value="contingency_2">Contingency (2) Game</option>
        <option value="contingency_6">Contingency (6) Game</option>
        <option value="contingency_8">Contingency (8) Game</option>
        <option value="contingency_noisy">Noisy Contingency Game</option>
        <option value="shuffle_keys_u">Switching Mappings + Goal Uncertainty Game</option>
        <option value="change_agent_10">Switching Embodiments (Infrequent) Game</option>

    </select>
    </div>
  <div class="float-container">
    <div class="float-child" id="game-area">
      <div id="container"></div>
    </div>

    <div class="float-child" id="sidebar">
      <div id="step_count_text">Step: <b>0</b></div>
      <div class="vertical-bar-container">
        <div id="step_fill" class="fill-bar"></div>
      </div>
    </div>
  </div>
  <div id="instruction_card">
  </div>

  <div id="alert-container">!</div>
`;

function initGame() {

    var rt_lists = []
    var ignore_click=false
    var click_wait_time = 0
    var start_time = performance.now()
    // Construct the game
    const dropdown = document.getElementById("game_choice");
    let game_type = dropdown.value;

    let game = new Game(game_type);
    var dimensions = [game.getBoard().length, game.getBoard()[0].length];
    var board = game.getBoard();
    var rows = board.length;
    var cols = board[0].length;
    var cell_size = 100/cols
    var gridWidth = cols * (450 / Math.max(rows, cols));
    var gridHeight = rows * (450 / Math.max(rows, cols));
    container.innerHTML = `
    <div id="grid" style="width:${gridWidth}px; height:${gridHeight}px;">
        ${markup}
    </div>
    `;

    //container.style.width = size + "px";
    //container.style.height = size + "px";

    //const cellSize = size / cols;

    // document.querySelectorAll(".field").forEach(el => {
    //     el.style.width = cellSize + "px";
    //     el.style.height = cellSize + "px";
    // });
    document.querySelectorAll(".field").forEach(el => {
        el.style.width = "10%";
        //el.style.height = "px";
    });

    dropdown.addEventListener("change", function() {
        game_type = this.value;
        game = new Game(game_type);
        dimensions = [game.getBoard().length, game.getBoard()[0].length];
        board = game.getBoard();
        rows = board.length;
        cols = board[0].length;
        cell_size = 100/cols
        gridWidth = cols * (450 / Math.max(rows, cols));
        gridHeight = rows * (450 / Math.max(rows, cols));
        container.innerHTML = `
        <div id="grid" style="width:${gridWidth}px; height:${gridHeight}px;">
            ${markup}
        </div>
        `;
        // game_type = this.value;
        // game = new Game(game_type);
        paintBoard();

        document.getElementById("step_count_text").innerHTML = "Step: <b>0</b>";
        document.getElementById('step_fill').style.height = "100%";
        add_instructions()
        // document.getElementById("status_text").innerHTML = "";
    });



    function add_instructions() {
        var el = document.getElementById("instruction_card")
        el.innerHTML = '<b>Instructions:</b><br>On each level, you control a red square with the arrow keys.<br>'
        if (game_type.includes('change_agent')) {
            el.innerHTML += 'The square you are controlling may change within a level.<br>'
        } else if (game_type.includes('shuffle_keys')) {
            el.innerHTML += 'The way you control the square with these keys may change between levels.'
        } else if (game_type.includes('noisy')) {
            el.innerHTML += 'However, 1/3 of the time, the square will move randomly instead of responding to your keypress.'
        }
        el.innerHTML += 'You win a level by moving to a green goal square before your moves run out.'
    }
    add_instructions()

    var markup = game.getBoard().map(row => row.map(col => `<span class="field ${col === 8 ?
        "avatar" : col === 2 ?
            "goal" : col === 0 ?
                "grass" : "wall"}" style="width:${cell_size}%; height:${cell_size}%;" ></span>`).join("")).join("<span class='clear'></span>");

    //document.getElementById("container").innerHTML = markup;
    //document.getElementById("container").innerHTML = `<div id="grid">${markup}</div>`;
    container.innerHTML = `
    <div id="grid" style="width:${gridWidth}px; height:${gridHeight}px;">
        ${markup}
    </div>
    `;


    function paintBoard() {
        markup = game.getBoard().map(row => row.map(col => `<span class="field ${col === 8 ?
            "avatar" : col === 2 ?
                "goal" : col === 0 ?
                    "grass" : "wall"}" style="width:${cell_size}%; height:${cell_size}%;" ></span>`).join("")).join("<span class='clear'></span>");
       // document.getElementById("container").innerHTML = markup;
       //document.getElementById("container").innerHTML = `<div id="grid">${markup}</div>`;
       container.innerHTML = `
        <div id="grid" style="width:${gridWidth}px; height:${gridHeight}px;">
            ${markup}
        </div>
        `;
    }

    function showGameMessage(won) {
        if (won) {
            // put n steps below success

            var color = "green"
            container.innerHTML = `
            <div style="color:${color}; font-size: 24px;"><h3>Success!</h3><i>You won in ${game.getCurrentActionCount()} steps</div>
        `;
        } else {
            var color = "red"
             container.innerHTML = `
            <div style="color:${color}; font-size: 24px;"><h3>You Lost!</h3><i>Try again!</i></div>

        `;
        }
    }

    $(document).click(function(event) {
        var text = $(event.target).text();
    });

    function showAlert(message, color) {
        var alertBox= document.getElementById('alert-container');
        alertBox.style.display = 'block';
        alertBox.style.backgroundColor = color;
        alertBox.innerHTML = message;
        // Hide the alert after 1000 milliseconds (1 second)
        setTimeout(function() {
            alertBox.style.display = "none";
        }, 1500);
    }


    function showClickArrow(direction) {
        const arrow = document.getElementById("click_arrow");

        const rotations = {
            0: -90,  // up
            1: 90,   // down
            2: 180,  // left
            3: 0     // right
        };

        // set direction
        arrow.style.transform = `rotate(${rotations[direction]}deg)`;

        // blink
        arrow.style.opacity = 0;
        setTimeout(() => {
            arrow.style.opacity = 1;
        }, 75);
    }

    function step_game(tmp, keyHandler) {
        //step game after each key press
        var level_status = game.step(tmp); //0 if nothing, 1 if just won, 2 if just lost
        var wait_time = 0
        document.getElementById("step_count_text").innerHTML = "Step: <b>" + (game.getCurrentActionCount()) + "</b>";
        //document.getElementById("level_count").innerHTML = "Level: <b>" + (game.getLevelCount()+1) + "</b>/40";
        document.getElementById('step_fill').style.height = (100*(1-(game.getCurrentActionCount()/150))) + "%"
        paintBoard();
        ignore_click=true
        if (level_status==1) {
            showGameMessage(true);
            var wait_time = 1500;
        }
        else if (level_status==2) {
            showGameMessage(false);
            var wait_time = 1500;
        }
        //make stuff transparent
        setTimeout(function() {
            if (level_status==1 || level_status==2) {
                game.nextLevel()
            } if (level_status==2) {
                game.decrementLevelCount()
            }
            document.getElementById("step_count_text").innerHTML = "Step: <b>" + (game.getCurrentActionCount()) + "</b>";
            //document.getElementById("level_count").innerHTML = "Level: <b>" + (game.getLevelCount()+1) + "</b>/40";
            document.getElementById('step_fill').style.height = (100*(1-(game.getCurrentActionCount()/150))) + "%"
            paintBoard();
            if (game.getLevelCount() == game.getNumLevels()) {
                document.removeEventListener("keydown", keyHandler, false);
                window.removeEventListener("keydown", window_keyhandler, false);
                data = game.getData()["data"]
                data["rts"] = rt_lists
                data = JSON.stringify(data);
                //save the data!
                var event = new CustomEvent('dataReceived', { detail: data });
                document.dispatchEvent(event);
            }
            start_time = performance.now()
            //after first wait, another additional wait before we can click
            if (level_status==0) {
                setTimeout(function() {
                    ignore_click = false
                }, click_wait_time);
            } else {
                ignore_click = false
            }
        }, wait_time)
    }

    function keyHandler(event) {
        //don't allow held keys
        if (event.repeat) { return }
        if (ignore_click) { return }
        if (game.getLevelCount() !== game.getNumLevels() && document.readyState === 'complete' && // listen only if document is loaded
            (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd' ||
                event.key === 'W' || event.key === 'A' || event.key === 'S' || event.key === 'D'
                || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight')) { // move

            ignore_click=true

            var elapsed = performance.now() - start_time;
            if (game.getCurrentActionCount() == 0) {
                rt_lists.push([])
            }
            rt_lists[rt_lists.length-1].push(elapsed)
            start_time = performance.now()
            let tmp;
            switch (event.key) {
                case "w" || "W":
                    tmp = 0;
                    break;
                case "s" || "S":
                    tmp = 1;
                    break;
                case "a" || "A":
                    tmp = 2;
                    break;
                case "d" || "D":
                    tmp = 3;
                    break;
                case "ArrowUp":
                    tmp = 0;
                    break;
                case "ArrowDown":
                    tmp = 1;
                    break;
                case "ArrowLeft":
                    tmp = 2;
                    break;
                case "ArrowRight":
                    tmp = 3;
                    break;
            }
            //showClickArrow(tmp);
            step_game(tmp, keyHandler)
        }
    }

    $(document).ready(function () {
        //init start time on ready
        start_time = performance.now()
        $('div.alert-primary').fadeIn(100)//.delay(7000).fadeOut(700);

        document.addEventListener("keydown", keyHandler, false);
    });

    function window_keyhandler(e) {
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }
    window.addEventListener("keydown", window_keyhandler, false);


    // swipe-to-move on mobile: scoped to the game grid so swiping the rest of the page still scrolls normally
    var SWIPE_THRESHOLD = 20; // px, ignores small jitter/taps so they aren't read as moves
    container.addEventListener('touchstart', handleTouchStart, false);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, false);

    var xDown = null;
    var yDown = null;

    function getTouches(evt) {
        return evt.touches ||             // browser API
            evt.originalEvent.touches; // jQuery
    }

    function handleTouchStart(evt) {
        var firstTouch = getTouches(evt)[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchEnd(evt) {
        xDown = null;
        yDown = null;
    };

    //same thing but for touch screen
    function handleTouchMove(evt) {
        var tmp;
        if (xDown === null || yDown === null) {
            return;
        }

        // prevent the page from scrolling while a touch started on the grid is in progress.
        // must happen on every touchmove, not just once the swipe threshold is crossed -
        // the browser commits to scrolling on the first un-prevented touchmove of a gesture,
        // and calling preventDefault later can't undo that.
        evt.preventDefault();

        if (ignore_click) { return }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.max(Math.abs(xDiff), Math.abs(yDiff)) < SWIPE_THRESHOLD) {
            return;
        }

        if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
            if (xDiff > 0) {
                tmp = 2;
            } else {
                tmp = 3;
            }
        } else {
            if (yDiff > 0) {
                tmp = 0;
            } else {
                tmp = 1;
            }
        }
        //showClickArrow(tmp);
        step_game(tmp, keyHandler)

        /* reset values */
        xDown = null;
        yDown = null;
    };


    // let outer = document.getElementById('outer'),
    //     wrapper = document.getElementById('wrap'),
    //     maxWidth = screen.width,
    //     maxHeight = screen.height;

}

document.addEventListener("DOMContentLoaded", () => {
    initGame();
})