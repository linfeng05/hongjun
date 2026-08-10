(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 滚动时导航栏样式 */
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  /* 移动端菜单 */
  navToggle.addEventListener("click", function () {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
    });
  });

  /* ---------- 板块衔接过渡动画（可重复播放） ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".section").forEach(function (section) {
      section.classList.add("section-reveal");
    });

    function toggleRevealClass(entry, className) {
      var rect = entry.boundingClientRect;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var fullyOut = rect.bottom < 0 || rect.top > vh;

      if (entry.isIntersecting) {
        entry.target.classList.add(className);
      } else if (fullyOut) {
        entry.target.classList.remove(className);
      }
    }

    function createRevealObserver(className, options) {
      return new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          toggleRevealClass(entry, className);
        });
      }, options);
    }

    /* 整段板块入场 */
    var sectionObserver = createRevealObserver("is-inview", {
      threshold: 0.08,
      rootMargin: "0px 0px -8% 0px"
    });

    document.querySelectorAll(".section-reveal").forEach(function (el) {
      sectionObserver.observe(el);
    });

    /* 标题 / 图文块：左右交替 + 延迟 */
    var fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach(function (el, index) {
      if (el.classList.contains("section-intro")) {
        el.classList.add("scale-in");
      }
      el.style.setProperty("--delay", (index % 3) * 80 + "ms");
    });

    document.querySelectorAll(".feature-row .feature-image.fade-in").forEach(function (el) {
      var row = el.closest(".feature-row");
      el.classList.add(row.classList.contains("reverse") ? "from-left" : "from-right");
    });

    document.querySelectorAll(".feature-row .feature-text.fade-in").forEach(function (el) {
      var row = el.closest(".feature-row");
      el.classList.add(row.classList.contains("reverse") ? "from-right" : "from-left");
    });

    var fadeObserver = createRevealObserver("visible", {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px"
    });

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });

    /* 网格卡片错落入场 */
    var grids = document.querySelectorAll(
      ".cards-grid, .sites-grid, .works-grid, .spirit-grid, .stats-grid, .facts-grid"
    );

    grids.forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        child.style.setProperty("--stagger", i * 70 + "ms");
      });
    });

    var gridObserver = createRevealObserver("is-inview", {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    grids.forEach(function (grid) {
      gridObserver.observe(grid);
    });

    /* 时间线逐项滑入 */
    var timelineObserver = createRevealObserver("is-visible", {
      threshold: 0.25,
      rootMargin: "0px 0px -30px 0px"
    });

    document.querySelectorAll(".timeline-item").forEach(function (item) {
      timelineObserver.observe(item);
    });
  } else {
    document.querySelectorAll(".fade-in, .section, .timeline-item").forEach(function (el) {
      el.classList.add("visible", "is-inview", "is-visible");
    });
    document.querySelectorAll(
      ".cards-grid, .sites-grid, .works-grid, .spirit-grid, .stats-grid, .facts-grid"
    ).forEach(function (el) {
      el.classList.add("is-inview");
    });
  }

  /* Hero 视差效果（仅桌面端） */
  var heroBg = document.querySelector(".hero-bg img");
  if (heroBg && !reduceMotion && window.matchMedia("(min-width: 768px)").matches) {
    window.addEventListener("scroll", function () {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = "scale(1.05) translateY(" + scrollY * 0.3 + "px)";
      }
    }, { passive: true });
  }

  /* 知识问答 */
  var quizCards = document.querySelectorAll(".quiz-card");
  var quizScoreEl = document.getElementById("quizScore");
  var correctCount = 0;
  var answeredCount = 0;

  function updateScore() {
    if (!quizScoreEl) return;
    quizScoreEl.innerHTML = "已答对 <strong>" + correctCount + "</strong> / " + quizCards.length + " 题";
    if (answeredCount === quizCards.length) {
      quizScoreEl.innerHTML += correctCount === quizCards.length
        ? " · 太棒了，全部答对！"
        : " · 再复习一下时间线和英雄人物吧";
    }
  }

  quizCards.forEach(function (card) {
    var answer = card.getAttribute("data-answer");
    var feedback = card.querySelector(".quiz-feedback");
    var buttons = card.querySelectorAll(".quiz-options button");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (card.classList.contains("answered")) return;

        card.classList.add("answered");
        answeredCount += 1;
        var value = btn.getAttribute("data-value");
        var isCorrect = value === answer;

        buttons.forEach(function (b) {
          b.disabled = true;
          if (b.getAttribute("data-value") === answer) {
            b.classList.add("correct");
          }
        });

        if (isCorrect) {
          btn.classList.add("correct");
          correctCount += 1;
          feedback.hidden = false;
          feedback.textContent = "回答正确！";
          feedback.className = "quiz-feedback is-correct";
        } else {
          btn.classList.add("wrong");
          feedback.hidden = false;
          feedback.textContent = "再想想，正确答案已标出。";
          feedback.className = "quiz-feedback is-wrong";
        }

        updateScore();
      });
    });
  });
})();
