---
title: "Agent-Centered Problem Solving"
excerpt: ""
collection: portfolio
---

<div class="project-intro">
  <h2>
    This project investigates how people hierarchically select and solve problems, from a first-person point of view.
  </h2>

   <p class="authors">
     Joint work with Laurie Paul, Tomer Ullman, Julian De Freitas, Cédric Colas, and Josh Tenenbaum
   </p>

   <p class="project-links">
       <a href="/projects/self/figs/reverse_self_06_2026.pdf" target="_blank">Paper</a> ·
        <a href="https://osf.io/48gav/overview" target="_blank">Data & code</a>
    </p>


  <p class="description">
      Standard models of intelligent problem solving often involve specifying an agent's <i>problem representation</i>. However, an important feature of human problem solving is the ability to represent oneself as solving <i>many different problems</i>, and choose between them through rational inference and decision making. We instantiate this hierarchical approach to problem solving as a "meta-ePOMDP agent," and compare it and other models to human behavior on two sets of tasks that highlight problem selection. Read a more complete summary of the theory behind the work <a href="https://www.growkudos.com/articles/10.1037/rev0000623?utm_medium=widget&utm_source=publication-widget">here</a>, or check out the tasks below. 
  </p>

  <h3>The Avatar Games</h3>
  <p class="description">
     A very basic version of determining which problem to solve involves specifying a representation of oneself as the problem solving agent, including who and where one is and what one can do, independent of other problem features. The first set of tasks tests how people make these basic inferences about physical embodiment. Games adapted from <a href="https://www.nature.com/articles/s41562-023-01696-5">De Freitas et al. (2023)</a>.
      
  </p>

  <div id="demo"></div>

  <p class="description">    
    <br><br>
    The meta-ePOMDP agent solves these games hierarchically, first determining its avatar, before solving the problem from that perspective. People seem to do something similar. Two meta-ePOMDP agent models (including one with plausible limits on attention and memory) capture variation in human solve times across games, while a simpler, non-hierarchical heuristic approach does not.
    
    <br><br><image src="/projects/self/figs/scatter.png" style="width:100%"></image><br><br>
  </p>

  <h3>Baba is You</h3>
  <p class="description">    
  While the Avatar Games test how people locate themselves physically within a problem, the second set of tasks highlights a more radical kind of self-location: deciding <i>which problem to locate oneself within</i>, from an abstract space of possible problems. Participants played a version of the puzzle video game <a href="https://hempuli.com/baba/">Baba Is You</a>, which externalizes this problem selection process. Players change the problem at hand by literally changing the rules of the game. Click play to watch participants solve the levels below. 
  <br><br>
  </p>

<div style="display:flex; gap:20px; justify-content:center;">
<video class="demo-video" style="width:45%;">
    <source src="/projects/self/figs/wall_is_stop.mp4" type="video/mp4">
</video>
<video class="demo-video" style="width:45%;">
    <source src="/projects/self/figs/rock_is_you.mp4" type="video/mp4">
</video>
</div>

<script>
    document.querySelectorAll(".demo-video").forEach(video => {
    video.addEventListener("mouseenter", () => {
        video.setAttribute("controls", "");
    });

    video.addEventListener("mouseleave", () => {
        video.removeAttribute("controls");
    });
    });
</script>

<p class="description">
    <br><br>
    Participants played each of the levels below, as well as more challenging variants with additional distractor objects and rules.

    <br><br><image src="/projects/self/figs/all_envs_0.png" style="width:100%"></image><br><br>

    The meta-ePOMDP agent solves the puzzles hierarchically. It first considers possible problems to solve (sets of rules defining the avatar identity, win condition, and world dynamics), and then reasons about how to solve them. In contrast, a non-hierarchical "Flat" agent simply searches through sequences of low-level actions, such as moving or pushing blocks to certain locations. We compared the amount of time people spent solving each puzzle (y-axis) to the costliness of solution search for the models (x-axis).

    <br><br><image src="/projects/self/figs/all_model_vs_human_solving_times.png" style="width:80%"></image><br><br>

    As the number of low-level actions in a puzzle's solution increases, search becomes costly for the Flat agent. The meta-ePOMDP agent avoids combinatorial explosions in search by factoring the search space hierarchically within possible problems, with the costliest puzzles presenting many candidate problems. The meta-ePOMDP agent best captures variation in human solve times, suggesting that people take an efficient, hierarchical approach to problem selection and solving. Check out the paper for lots of additional discussion!
  </p>

</div>



<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link rel="stylesheet" href="/projects/self/sty.css">
<link rel="stylesheet" href="/projects/shared.css">
<script src="/projects/self/game.js"></script>
<script src="/projects/self/script.js"></script>