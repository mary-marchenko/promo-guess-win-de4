'use strict';

(function () {
  const SLIDE_WIDTH = 216;
  const SLIDE_MARGIN = 12;
  const SLIDE_STEP = SLIDE_WIDTH + SLIDE_MARGIN * 2;
  const SWIPE_THRESHOLD = 50;
  const TRANSITION_DURATION = 400;

  function initTableSlider() {
    const viewport = document.querySelector('.guessPage .table__wrapper-viewport');
    const track = document.querySelector('.guessPage .table__tabs');
    const arrows = document.querySelectorAll('.guessPage .table__arrow');
    if (!viewport || !track) return;

    if (track.hasAttribute('data-table-slider-inited')) return;

    const items = Array.from(track.querySelectorAll('.table__tabs-item'));
    const total = items.length;
    if (total === 0) return;

    // for 2 teams
    if (total === 2) {
      track.setAttribute('data-table-slider-inited', 'true');
      track.style.transition = 'none';
      track.style.transform = 'none';
      track.style.justifyContent = 'center';

      arrows.forEach((btn) => {
        btn.style.display = 'none';
      });

      let current = 0;
      const initiallyActive = items.findIndex((el) => el.classList.contains('active'));
      if (initiallyActive >= 0) current = initiallyActive;

      function updateTabs() {
        items.forEach((slide, i) => {
          slide.classList.toggle('active', i === current);
          slide.classList.add('visible');
        });
      }

      function goToIndex(index) {
        if (index < 0 || index >= total || index === current) return;
        current = index;
        updateTabs();
      }

      track.addEventListener('click', (e) => {
        const slide = e.target.closest('.table__tabs-item');
        if (!slide) return;
        const idx = items.indexOf(slide);
        if (idx !== -1) goToIndex(idx);
      });

      updateTabs();
      return { next: () => {}, prev: () => {} };
    }


    track.setAttribute('data-table-slider-inited', 'true');

    const count = total;

    let current = 0;
    const initiallyActive = items.findIndex((el) => el.classList.contains('active'));
    if (initiallyActive >= 0) current = initiallyActive;

    function getTranslateX(index) {
      const vw = viewport.getBoundingClientRect().width;
      // Центр слайду: лівий margin (12px) + позиція слайду + половина ширини
      const slideCenterX = SLIDE_MARGIN + index * SLIDE_STEP + SLIDE_WIDTH / 2;
      return vw / 2 - slideCenterX;
    }

    function isSingleTabMode() {
      return window.innerWidth < 1050;
    }

    // Активний по центру; справа — наступні матчі (visible), зліва — попередні
    function setClasses() {
      const singleTabMode = isSingleTabMode();
      const leftVisible = current - 1;
      const rightVisible = current + 1;

      items.forEach((el, i) => {
        el.classList.toggle('active', i === current);
        el.classList.toggle('visible', !singleTabMode && (i === leftVisible || i === rightVisible));
      });
    }

    function updateArrows() {
      arrows.forEach((btn) => {
        if (btn.classList.contains('table__arrow--left')) {
          btn.style.visibility = current === 0 ? 'hidden' : 'visible';
        } else {
          btn.style.visibility = current === count - 1 ? 'hidden' : 'visible';
        }
      });
    }

    function update(useTransition = true) {
      track.style.transition = useTransition
        ? `transform ${TRANSITION_DURATION}ms ease`
        : 'none';
      track.style.transform = `translate3d(${getTranslateX(current)}px, 0, 0)`;
      setClasses();
      updateArrows();
    }

    function next() {
      if (current >= count - 1) return;
      current += 1;
      update();
    }

    function prev() {
      if (current <= 0) return;
      current -= 1;
      update();
    }

    function goToIndex(index) {
      if (index < 0 || index >= count || index === current) return;
      current = index;
      update();
    }

    // arrows
    arrows.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('table__arrow--left')) prev();
        else next();
      });
    });

    // click
    track.addEventListener('click', (e) => {
      const slide = e.target.closest('.table__tabs-item');
      if (!slide || slide.classList.contains('active')) return;
      const match = slide.getAttribute('data-match');
      if (match) {
        const idx = parseInt(match, 10) - 1;
        if (idx >= 0 && idx < count) goToIndex(idx);
      }
    });

    // swipe
    let startX = 0;
    viewport.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
    }, { passive: true });
    viewport.addEventListener('pointerup', (e) => {
      const diff = e.clientX - startX;
      if (diff > SWIPE_THRESHOLD) prev();
      if (diff < -SWIPE_THRESHOLD) next();
    }, { passive: true });

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (e.changedTouches.length !== 1) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > SWIPE_THRESHOLD) prev();
      if (diff < -SWIPE_THRESHOLD) next();
    }, { passive: true });

    // resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => update(false), 100);
    });

    update(false);

    return { next, prev };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTableSlider);
  } else {
    initTableSlider();
  }
})();
