---
title: "Spatiotemporal Program Learning"
excerpt: ""
collection: portfolio
---


<div class="project-intro">
  <h2>
    This project investigates how human adults, young children, and macaque monkeys
    learn abstract patterns from sparse data.
  </h2>

  <p class="authors">
    Joint work with Nicole Coates, Alessandra Silva, Kaylee Ji, Stephen Ferrigno,
    Laura Schulz, Josh Tenenbaum, and Sam Cheyette
  </p>

  <p class="project-links">
    <a href="https://doi.org/10.31234/osf.io/2n85j_v2" target="_blank">Preprint (2026)</a> ·
    <a href="https://proceedings.neurips.cc/paper_files/paper/2023/hash/aa5c083f9d387c49514eb5c4dc2dc16b-Abstract-Conference.html" target="_blank">NeurIPS paper (2023)</a> ·
    <a href="https://osf.io/7m6xa/overview" target="_blank">Data & code</a>
</p>


 <p class="description">
    People learn languages, music, games, mathematics, and a seemingly limitless assortment of other structures across domains. How do we <i>efficiently</i> learn such a large variety of richly structured representations? To answer this question, we investigate structure learning mechanisms in human adults, children, and nonhuman primates using a highly unconstrained sequence prediction task.
 </p>

  <div id="demo"></div>

 <p class="description">
     One hypothesis is that people learn through <i>program induction</i>, synthesizing data-generating algorithms to explain what they observe. To instantiate this theory, we implemented a model that learns programs in a "Language of Thought" (LoT) with motor and geometry primitives. It predicts that people will (1) learn a large variety of programs from just a few datapoints, and (2) exhibit structured, multimodal uncertainty reflecting a distribution over programs that are consistent with the data.
     <br><br><image src="/projects/dots/figs/programs.png" style="width:80%"></image><br><br>


    The task revealed strikingly different inductive biases across groups. Adults and older (4-7 year-old) children show early multimodal uncertainty, before quickly converging on the true pattern for many richly structured sequencs. 
     <br><br><image src="/projects/dots/figs/example_predictions.png" style="width:80%"></image><br><br>

    In contrast, despite extensive training, two rhesus macaques succeeded mostly on linear and smoothly varying patterns, consistent with relying on local linear extrapolation. Three-year-olds' accuracy across patterns correlated with monkeys much more than with adults.

    <br><br><image src="/projects/dots/figs/human_vs_monkeys.png" style="width:80%"></image><br><br>

    We compared multiple learning models to each group. While adults and children as young as four are best captured by sophisticated LoT program learning, monkeys and three-year-olds behave most like simple local linear extrapolation models.
     
    <br><br><image src="/projects/dots/figs/models.png" style="width:80%; align:center"></image><br><br>

    Our results suggest that program induction is a powerful, early-emerging and perhaps <i>distinctive</i> mechanism of human structure learning. Open questions include how young children acquire and learn to flexibly deploy this mechanism, and what specific circumstances or capacities differentiate the development of program-learning abilities in humans and nonhuman animals. For further discussion see associated papers!
    <br><br>
 </p>

</div>




<link rel="stylesheet" href="/projects/dots/sty.css">
<link rel="stylesheet" href="/projects/shared.css">
<script src="/projects/dots/stimuli.js"></script>
<script src="/projects/dots/script.js"></script>