"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
(function () {
  var apiURL = 'https://allwin-prom.pp.ua/api_test_predictor';
  var mainPage = document.querySelector(".verify-page"),
    ukLeng = document.querySelector('#ukLeng'),
    enLeng = document.querySelector('#enLeng');

  // let locale = 'uk';
  var locale = sessionStorage.getItem("locale") || "uk";
  if (ukLeng) locale = 'uk';
  if (enLeng) locale = 'en';
  var i18nData = {};
  var translateState = true;
  var request = function request(link, extraOptions) {
    return fetch(apiURL + link, _objectSpread({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, extraOptions || {})).then(function (res) {
      return res.json();
    })["catch"](function (err) {
      console.error('API request failed:', err);
      return Promise.reject(err);
    });
  };
  function loadTranslations() {
    return request("/new-translates/".concat(locale)).then(function (json) {
      i18nData = json;
      translate();
      var guessPageEl = document.querySelector(".guessPage");
      if (!guessPageEl) return;
      var translateScheduled = false;
      var shouldIgnoreMutationTarget = function shouldIgnoreMutationTarget(targetNode) {
        var _el$closest;
        var el = (targetNode === null || targetNode === void 0 ? void 0 : targetNode.nodeType) === 1 ? targetNode : targetNode === null || targetNode === void 0 ? void 0 : targetNode.parentElement;
        return Boolean(el === null || el === void 0 || (_el$closest = el.closest) === null || _el$closest === void 0 ? void 0 : _el$closest.call(el, '.predict__team-control'));
      };
      var scheduleTranslate = function scheduleTranslate() {
        if (translateScheduled) return;
        translateScheduled = true;
        requestAnimationFrame(function () {
          translateScheduled = false;
          translate();
        });
      };
      var mutationObserver = new MutationObserver(function (mutations) {
        if (!mutations || !mutations.length) return;
        var allIgnored = mutations.every(function (m) {
          return shouldIgnoreMutationTarget(m.target);
        });
        if (allIgnored) return;
        scheduleTranslate();
      });
      mutationObserver.observe(guessPageEl, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  }
  function translate() {
    var elems = document.querySelectorAll('[data-translate]');
    if (elems && elems.length) {
      if (translateState) {
        elems.forEach(function (elem) {
          var key = elem.getAttribute('data-translate');
          var translated = i18nData[key];
          if (translated) {
            if (elem.innerHTML !== translated) {
              elem.innerHTML = translated;
            }
            elem.removeAttribute('data-translate');
          } else {
            var fallback = '*----NEED TO BE TRANSLATED----*   key:  ' + key;
            if (elem.innerHTML !== fallback) {
              elem.innerHTML = fallback;
            }
          }
        });
      } else {
        console.log("translation works!");
      }
    }
    if (locale === 'en') {
      mainPage === null || mainPage === void 0 || mainPage.classList.add('en');
    }
    refreshLocalizedClass();
  }
  function refreshLocalizedClass(element, baseCssClass) {
    if (!element) {
      return;
    }
    for (var _i = 0, _arr = ['uk', 'en']; _i < _arr.length; _i++) {
      var lang = _arr[_i];
      element.classList.remove(baseCssClass + lang);
    }
    element.classList.add(baseCssClass + locale);
  }
  function reportError(err) {
    var reportData = {
      origin: window.location.href,
      userid: userId,
      errorText: (err === null || err === void 0 ? void 0 : err.error) || (err === null || err === void 0 ? void 0 : err.text) || (err === null || err === void 0 ? void 0 : err.message) || 'Unknown error',
      type: (err === null || err === void 0 ? void 0 : err.name) || 'UnknownError',
      stack: (err === null || err === void 0 ? void 0 : err.stack) || ''
    };
  }
  loadTranslations();

  // select match in drop
  document.querySelectorAll('.dropdown.select').forEach(function (drop) {
    var summaryText = drop.querySelector('.select__current');
    var items = drop.querySelectorAll('.select__item input');
    items.forEach(function (input) {
      input.addEventListener('change', function () {
        // змінюємо текст у summary
        var text = input.nextElementSibling.textContent;
        summaryText.textContent = text;

        // закриваємо dropdown
        drop.removeAttribute('open');
      });
    });
  });

  // predict tabs: goal / score
  var predictBlock = document.querySelector('.guessPage #predict');
  if (predictBlock) {
    var switchToScore = function switchToScore() {
      tabScore === null || tabScore === void 0 || tabScore.classList.add('active');
      tabGoal === null || tabGoal === void 0 || tabGoal.classList.remove('active');
      containerScore === null || containerScore === void 0 || containerScore.classList.remove('hide');
      containerGoal === null || containerGoal === void 0 || containerGoal.classList.add('hide');
      lastScore === null || lastScore === void 0 || lastScore.classList.remove('hide');
      lastGoal === null || lastGoal === void 0 || lastGoal.classList.add('hide');
      calcBlock === null || calcBlock === void 0 || calcBlock.classList.remove('hide');
    };
    var switchToGoal = function switchToGoal() {
      tabGoal === null || tabGoal === void 0 || tabGoal.classList.add('active');
      tabGoal === null || tabGoal === void 0 || tabGoal.classList.remove('unactive');
      tabScore === null || tabScore === void 0 || tabScore.classList.remove('active');
      containerGoal === null || containerGoal === void 0 || containerGoal.classList.remove('hide');
      containerScore === null || containerScore === void 0 || containerScore.classList.add('hide');
      lastGoal === null || lastGoal === void 0 || lastGoal.classList.remove('hide');
      lastScore === null || lastScore === void 0 || lastScore.classList.add('hide');
      calcBlock === null || calcBlock === void 0 || calcBlock.classList.add('hide');
    };
    var openPopupByAttr = function openPopupByAttr(popupAttr, popupClass) {
      document.body.style.overflow = 'hidden';
      var targetPopup = document.querySelector(".popup[data-popup=\"".concat(popupAttr, "\"]"));
      if (targetPopup) {
        targetPopup.classList.add('active');
        document.querySelector('.popups').classList.remove('_opacity');
        document.querySelector('.popups').classList.add("".concat(popupClass));
      }
    };
    var closeAllPopups = function closeAllPopups() {
      var popupsClass = ['_confirmPopup', '_bonusPopup'];
      popupWrap.classList.add('_opacity');
      popupsClass.forEach(function (popup) {
        popupWrap.classList.remove(popup);
      });
      document.body.style.overflow = 'auto';
    };
    var positionBonusTooltip = function positionBonusTooltip() {
      if (!bonusTooltipEl) return;
      if (!mobileQuery.matches) {
        bonusTooltipEl.style.position = '';
        bonusTooltipEl.style.left = '';
        bonusTooltipEl.style.top = '';
        bonusTooltipEl.style.transform = '';
        return;
      }
      if (!bonusInfoTool) return;
      var rect = bonusInfoTool.getBoundingClientRect();
      var gap = 10;
      bonusTooltipEl.style.position = 'fixed';
      bonusTooltipEl.style.left = rect.left + rect.width / 2 + 'px';
      bonusTooltipEl.style.top = rect.top - gap + 'px';
      bonusTooltipEl.style.transform = 'translate(-50%, -100%)';
    };
    var tabScore = predictBlock.querySelector('.predict__tabs-item.score');
    var tabGoal = predictBlock.querySelector('.predict__tabs-item.goal');
    var containerScore = predictBlock.querySelector('.predict__container.score');
    var containerGoal = predictBlock.querySelector('.predict__container.goal');
    var lastScore = predictBlock.querySelector('.predict__last-item.score');
    var lastGoal = predictBlock.querySelector('.predict__last-item.goal');
    var calcBlock = predictBlock.querySelector('.predict__calc');
    tabScore === null || tabScore === void 0 || tabScore.addEventListener('click', switchToScore);
    tabGoal === null || tabGoal === void 0 || tabGoal.addEventListener('click', function (e) {
      if (tabGoal !== null && tabGoal !== void 0 && tabGoal.classList.contains('unactive')) return;
      switchToGoal();
    });

    // popups

    var popupWrap = document.querySelector('.popups');
    popupWrap.addEventListener('click', function (e) {
      if (e.target.closest(".popups__item-close")) {
        closeAllPopups();
      }
    });

    // Відкрити попап по кліку на будь-який елемент з data-popup (наприклад .btn-thanks, .bonus__btn)
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-popup]');
      if (!opener) return;
      // не відкривати при кліку всередині попапа (наприклад по кнопці закриття)
      if (opener.classList.contains('popup')) return;
      var attr = opener.dataset.popup;
      if (!attr) return;
      var popupClass = '_' + attr;
      openPopupByAttr(attr, popupClass);

      // У блоці вітання (confirmPopup): показувати score або goal залежно від data-variant кнопки
      if (attr === 'confirmPopup') {
        var variant = opener.dataset.variant || 'score';
        var popup = document.querySelector('.popup[data-popup="confirmPopup"]');
        if (popup) {
          var scoreBlock = popup.querySelector('.predict__last-item.score');
          var goalBlock = popup.querySelector('.predict__last-item.goal');
          if (variant === 'goal') {
            scoreBlock === null || scoreBlock === void 0 || scoreBlock.classList.add('hide');
            goalBlock === null || goalBlock === void 0 || goalBlock.classList.remove('hide');
          } else {
            scoreBlock === null || scoreBlock === void 0 || scoreBlock.classList.remove('hide');
            goalBlock === null || goalBlock === void 0 || goalBlock.classList.add('hide');
          }
        }
      }
    });

    // radio: "Перший гол" — один контейнер на матч (.predict__container.goal), пункти — .predict__radio
    var radioGoalContainers = document.querySelectorAll('.predict__container.goal');
    radioGoalContainers.forEach(function (goalBlock) {
      var radioItems = goalBlock.querySelectorAll('.predict__radio');
      radioItems.forEach(function (radioEl) {
        var input = radioEl.querySelector('input[type="radio"]');
        if (!input) return;
        input.addEventListener('change', function () {
          radioItems.forEach(function (item) {
            return item.classList.remove('_active');
          });
          radioEl.classList.add('_active');
        });
      });
      var checkedInput = goalBlock.querySelector('.predict__radio input:checked');
      if (checkedInput) {
        checkedInput.closest('.predict__radio').classList.add('_active');
      }
    });

    // predict__team-control: плюс/мінус окремо для кожного блоку, мін. 0
    predictBlock.addEventListener('click', function (e) {
      var control = e.target.closest('.predict__team-control');
      if (!control) return;
      var numberEl = control.querySelector('.predict__team-number');
      if (!numberEl) return;
      var value = parseInt(numberEl.textContent, 10) || 0;
      if (e.target.closest('.predict__team-increase')) {
        numberEl.textContent = value + 1;
      } else if (e.target.closest('.predict__team-decrease')) {
        if (value > 0) numberEl.textContent = value - 1;
      }
    });

    //calc
    document.querySelectorAll('.predict__calc-forecasts--item').forEach(function (item) {
      item.addEventListener('click', function () {
        document.querySelectorAll('.predict__calc-forecasts--item').forEach(function (el) {
          return el.classList.remove('active');
        });
        this.classList.toggle('active');
      });
    });

    // !!! TEST !!!

    document.addEventListener("DOMContentLoaded", function () {
      var _document$querySelect;
      (_document$querySelect = document.querySelector(".menu-btn")) === null || _document$querySelect === void 0 || _document$querySelect.addEventListener("click", function () {
        var _document$querySelect2;
        (_document$querySelect2 = document.querySelector(".menu-test")) === null || _document$querySelect2 === void 0 || _document$querySelect2.classList.toggle("hide");
      });
    });
    var lngBtn = document.querySelector(".lng-btn");
    lngBtn.addEventListener("click", function () {
      if (sessionStorage.getItem("locale")) {
        sessionStorage.removeItem("locale");
      } else {
        sessionStorage.setItem("locale", "en");
      }
      window.location.reload();
    });
    var btnUnactiveGoal = document.querySelector('.menu-test .unactiveGoal');
    var btnTooltip = document.querySelector('.menu-test .tooltip');
    btnUnactiveGoal === null || btnUnactiveGoal === void 0 || btnUnactiveGoal.addEventListener('click', function () {
      switchToScore();
      tabGoal === null || tabGoal === void 0 || tabGoal.classList.add('unactive');
    });
    var bonusBlock = document.querySelector('.bonus');
    var btnConfirmed = document.querySelector('button.btn-confirmed');
    var resultConfirmed = document.querySelector('.predict__last-result.confirmed');
    var resultUnconfirmed = document.querySelector('.predict__last-result.unconfirmed');
    btnConfirmed === null || btnConfirmed === void 0 || btnConfirmed.addEventListener('click', function () {
      resultConfirmed === null || resultConfirmed === void 0 || resultConfirmed.classList.toggle('hide');
      resultUnconfirmed === null || resultUnconfirmed === void 0 || resultUnconfirmed.classList.toggle('hide');
    });
    var btnAfter = document.querySelector('button.btn-after');
    btnAfter === null || btnAfter === void 0 || btnAfter.addEventListener('click', function () {
      containerScore === null || containerScore === void 0 || containerScore.classList.toggle('_lock');
      containerGoal === null || containerGoal === void 0 || containerGoal.classList.toggle('_lock');
      if (containerGoal !== null && containerGoal !== void 0 && containerGoal.classList.contains('_lock')) {
        var radioItems = containerGoal.querySelectorAll('.predict__radio');
        var checkedInput = containerGoal.querySelector('.predict__radio input:checked');
        if (!checkedInput && radioItems.length) {
          var firstInput = radioItems[0].querySelector('input[type="radio"]');
          if (firstInput) {
            firstInput.checked = true;
            radioItems.forEach(function (item) {
              return item.classList.remove('_active');
            });
            radioItems[0].classList.add('_active');
          }
        }
      }
    });
    var btnZeroBonuses = document.querySelector('button.btn-zeroBonuses');
    btnZeroBonuses === null || btnZeroBonuses === void 0 || btnZeroBonuses.addEventListener('click', function () {
      bonusBlock === null || bonusBlock === void 0 || bonusBlock.classList.toggle('hide');
      var bonusPopupTableBody = document.querySelector('.popup[data-popup="bonusPopup"] .popups__item-body .table__body');
      if (bonusPopupTableBody) {
        var rows = bonusPopupTableBody.querySelectorAll('.table__row');
        rows.forEach(function (row, i) {
          if (i === 0) row.classList.remove('hide');else row.classList.add('hide');
        });
      }
    });
    var bonusInfoTool = document.querySelector('.bonus__left-title-infoTool');
    var bonusTooltipEl = document.querySelector('.bonus__left-title-tooltip');
    var mobileQuery = window.matchMedia('(max-width: 600px)');
    if (bonusInfoTool && bonusTooltipEl) {
      bonusInfoTool.addEventListener('mouseenter', function () {
        if (mobileQuery.matches) requestAnimationFrame(positionBonusTooltip);
      });
      window.addEventListener('resize', positionBonusTooltip);
      window.addEventListener('scroll', positionBonusTooltip, true);
    }
    btnTooltip === null || btnTooltip === void 0 || btnTooltip.addEventListener('click', function () {
      tabGoal === null || tabGoal === void 0 || tabGoal.classList.toggle('_tooltip-visible');
      bonusBlock === null || bonusBlock === void 0 || bonusBlock.classList.toggle('_tooltip-visible');
      if (bonusBlock !== null && bonusBlock !== void 0 && bonusBlock.classList.contains('_tooltip-visible') && mobileQuery.matches) {
        requestAnimationFrame(positionBonusTooltip);
      }
    });
  }
})();
'use strict';

(function () {
  var SLIDE_WIDTH = 216;
  var SLIDE_MARGIN = 12;
  var SLIDE_STEP = SLIDE_WIDTH + SLIDE_MARGIN * 2;
  var SWIPE_THRESHOLD = 50;
  var TRANSITION_DURATION = 400;
  function initTableSlider() {
    var viewport = document.querySelector('.guessPage .table__wrapper-viewport');
    var track = document.querySelector('.guessPage .table__tabs');
    var arrows = document.querySelectorAll('.guessPage .table__arrow');
    if (!viewport || !track) return;
    if (track.hasAttribute('data-table-slider-inited')) return;
    var items = Array.from(track.querySelectorAll('.table__tabs-item'));
    var total = items.length;
    if (total === 0) return;

    // for 2 teams
    if (total === 2) {
      var updateTabs = function updateTabs() {
        items.forEach(function (slide, i) {
          slide.classList.toggle('active', i === _current);
          slide.classList.add('visible');
        });
      };
      var _goToIndex = function _goToIndex(index) {
        if (index < 0 || index >= total || index === _current) return;
        _current = index;
        updateTabs();
      };
      track.setAttribute('data-table-slider-inited', 'true');
      track.style.transition = 'none';
      track.style.transform = 'none';
      track.style.justifyContent = 'center';
      arrows.forEach(function (btn) {
        btn.style.display = 'none';
      });
      var _current = 0;
      var _initiallyActive = items.findIndex(function (el) {
        return el.classList.contains('active');
      });
      if (_initiallyActive >= 0) _current = _initiallyActive;
      track.addEventListener('click', function (e) {
        var slide = e.target.closest('.table__tabs-item');
        if (!slide) return;
        var idx = items.indexOf(slide);
        if (idx !== -1) _goToIndex(idx);
      });
      updateTabs();
      return {
        next: function next() {},
        prev: function prev() {}
      };
    }
    track.setAttribute('data-table-slider-inited', 'true');
    var count = total;
    var current = 0;
    var initiallyActive = items.findIndex(function (el) {
      return el.classList.contains('active');
    });
    if (initiallyActive >= 0) current = initiallyActive;
    function getTranslateX(index) {
      var vw = viewport.getBoundingClientRect().width;
      // Центр слайду: лівий margin (12px) + позиція слайду + половина ширини
      var slideCenterX = SLIDE_MARGIN + index * SLIDE_STEP + SLIDE_WIDTH / 2;
      return vw / 2 - slideCenterX;
    }
    function isSingleTabMode() {
      return window.innerWidth < 1050;
    }

    // Активний по центру; справа — наступні матчі (visible), зліва — попередні
    function setClasses() {
      var singleTabMode = isSingleTabMode();
      var leftVisible = current - 1;
      var rightVisible = current + 1;
      items.forEach(function (el, i) {
        el.classList.toggle('active', i === current);
        el.classList.toggle('visible', !singleTabMode && (i === leftVisible || i === rightVisible));
      });
    }
    function updateArrows() {
      arrows.forEach(function (btn) {
        if (btn.classList.contains('table__arrow--left')) {
          btn.style.visibility = current === 0 ? 'hidden' : 'visible';
        } else {
          btn.style.visibility = current === count - 1 ? 'hidden' : 'visible';
        }
      });
    }
    function update() {
      var useTransition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      track.style.transition = useTransition ? "transform ".concat(TRANSITION_DURATION, "ms ease") : 'none';
      track.style.transform = "translate3d(".concat(getTranslateX(current), "px, 0, 0)");
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
    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('table__arrow--left')) prev();else next();
      });
    });

    // click
    track.addEventListener('click', function (e) {
      var slide = e.target.closest('.table__tabs-item');
      if (!slide || slide.classList.contains('active')) return;
      var match = slide.getAttribute('data-match');
      if (match) {
        var idx = parseInt(match, 10) - 1;
        if (idx >= 0 && idx < count) goToIndex(idx);
      }
    });

    // swipe
    var startX = 0;
    viewport.addEventListener('pointerdown', function (e) {
      startX = e.clientX;
    }, {
      passive: true
    });
    viewport.addEventListener('pointerup', function (e) {
      var diff = e.clientX - startX;
      if (diff > SWIPE_THRESHOLD) prev();
      if (diff < -SWIPE_THRESHOLD) next();
    }, {
      passive: true
    });
    viewport.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    }, {
      passive: true
    });
    viewport.addEventListener('touchend', function (e) {
      if (e.changedTouches.length !== 1) return;
      var diff = e.changedTouches[0].clientX - startX;
      if (diff > SWIPE_THRESHOLD) prev();
      if (diff < -SWIPE_THRESHOLD) next();
    }, {
      passive: true
    });

    // resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        return update(false);
      }, 100);
    });
    update(false);
    return {
      next: next,
      prev: prev
    };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTableSlider);
  } else {
    initTableSlider();
  }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJ0YWJsZS1zbGlkZXIuanMiXSwibmFtZXMiOlsiYXBpVVJMIiwibWFpblBhZ2UiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJ1a0xlbmciLCJlbkxlbmciLCJsb2NhbGUiLCJzZXNzaW9uU3RvcmFnZSIsImdldEl0ZW0iLCJpMThuRGF0YSIsInRyYW5zbGF0ZVN0YXRlIiwicmVxdWVzdCIsImxpbmsiLCJleHRyYU9wdGlvbnMiLCJmZXRjaCIsIl9vYmplY3RTcHJlYWQiLCJoZWFkZXJzIiwidGhlbiIsInJlcyIsImpzb24iLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJQcm9taXNlIiwicmVqZWN0IiwibG9hZFRyYW5zbGF0aW9ucyIsImNvbmNhdCIsInRyYW5zbGF0ZSIsImd1ZXNzUGFnZUVsIiwidHJhbnNsYXRlU2NoZWR1bGVkIiwic2hvdWxkSWdub3JlTXV0YXRpb25UYXJnZXQiLCJ0YXJnZXROb2RlIiwiX2VsJGNsb3Nlc3QiLCJlbCIsIm5vZGVUeXBlIiwicGFyZW50RWxlbWVudCIsIkJvb2xlYW4iLCJjbG9zZXN0IiwiY2FsbCIsInNjaGVkdWxlVHJhbnNsYXRlIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibXV0YXRpb25PYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJsZW5ndGgiLCJhbGxJZ25vcmVkIiwiZXZlcnkiLCJtIiwidGFyZ2V0Iiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJjaGFyYWN0ZXJEYXRhIiwiZWxlbXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImVsZW0iLCJrZXkiLCJnZXRBdHRyaWJ1dGUiLCJ0cmFuc2xhdGVkIiwiaW5uZXJIVE1MIiwicmVtb3ZlQXR0cmlidXRlIiwiZmFsbGJhY2siLCJsb2ciLCJjbGFzc0xpc3QiLCJhZGQiLCJyZWZyZXNoTG9jYWxpemVkQ2xhc3MiLCJlbGVtZW50IiwiYmFzZUNzc0NsYXNzIiwiX2kiLCJfYXJyIiwibGFuZyIsInJlbW92ZSIsInJlcG9ydEVycm9yIiwicmVwb3J0RGF0YSIsIm9yaWdpbiIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsInVzZXJpZCIsInVzZXJJZCIsImVycm9yVGV4dCIsInRleHQiLCJtZXNzYWdlIiwidHlwZSIsIm5hbWUiLCJzdGFjayIsImRyb3AiLCJzdW1tYXJ5VGV4dCIsIml0ZW1zIiwiaW5wdXQiLCJhZGRFdmVudExpc3RlbmVyIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwidGV4dENvbnRlbnQiLCJwcmVkaWN0QmxvY2siLCJzd2l0Y2hUb1Njb3JlIiwidGFiU2NvcmUiLCJ0YWJHb2FsIiwiY29udGFpbmVyU2NvcmUiLCJjb250YWluZXJHb2FsIiwibGFzdFNjb3JlIiwibGFzdEdvYWwiLCJjYWxjQmxvY2siLCJzd2l0Y2hUb0dvYWwiLCJvcGVuUG9wdXBCeUF0dHIiLCJwb3B1cEF0dHIiLCJwb3B1cENsYXNzIiwiYm9keSIsInN0eWxlIiwib3ZlcmZsb3ciLCJ0YXJnZXRQb3B1cCIsImNsb3NlQWxsUG9wdXBzIiwicG9wdXBzQ2xhc3MiLCJwb3B1cFdyYXAiLCJwb3B1cCIsInBvc2l0aW9uQm9udXNUb29sdGlwIiwiYm9udXNUb29sdGlwRWwiLCJtb2JpbGVRdWVyeSIsIm1hdGNoZXMiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJ0cmFuc2Zvcm0iLCJib251c0luZm9Ub29sIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImdhcCIsIndpZHRoIiwiZSIsImNvbnRhaW5zIiwib3BlbmVyIiwiYXR0ciIsImRhdGFzZXQiLCJ2YXJpYW50Iiwic2NvcmVCbG9jayIsImdvYWxCbG9jayIsInJhZGlvR29hbENvbnRhaW5lcnMiLCJyYWRpb0l0ZW1zIiwicmFkaW9FbCIsIml0ZW0iLCJjaGVja2VkSW5wdXQiLCJjb250cm9sIiwibnVtYmVyRWwiLCJ2YWx1ZSIsInBhcnNlSW50IiwidG9nZ2xlIiwiX2RvY3VtZW50JHF1ZXJ5U2VsZWN0IiwiX2RvY3VtZW50JHF1ZXJ5U2VsZWN0MiIsImxuZ0J0biIsInJlbW92ZUl0ZW0iLCJzZXRJdGVtIiwicmVsb2FkIiwiYnRuVW5hY3RpdmVHb2FsIiwiYnRuVG9vbHRpcCIsImJvbnVzQmxvY2siLCJidG5Db25maXJtZWQiLCJyZXN1bHRDb25maXJtZWQiLCJyZXN1bHRVbmNvbmZpcm1lZCIsImJ0bkFmdGVyIiwiZmlyc3RJbnB1dCIsImNoZWNrZWQiLCJidG5aZXJvQm9udXNlcyIsImJvbnVzUG9wdXBUYWJsZUJvZHkiLCJyb3dzIiwicm93IiwiaSIsIm1hdGNoTWVkaWEiLCJTTElERV9XSURUSCIsIlNMSURFX01BUkdJTiIsIlNMSURFX1NURVAiLCJTV0lQRV9USFJFU0hPTEQiLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwiaW5pdFRhYmxlU2xpZGVyIiwidmlld3BvcnQiLCJ0cmFjayIsImFycm93cyIsImhhc0F0dHJpYnV0ZSIsIkFycmF5IiwiZnJvbSIsInRvdGFsIiwidXBkYXRlVGFicyIsInNsaWRlIiwiY3VycmVudCIsImdvVG9JbmRleCIsImluZGV4Iiwic2V0QXR0cmlidXRlIiwidHJhbnNpdGlvbiIsImp1c3RpZnlDb250ZW50IiwiYnRuIiwiZGlzcGxheSIsImluaXRpYWxseUFjdGl2ZSIsImZpbmRJbmRleCIsImlkeCIsImluZGV4T2YiLCJuZXh0IiwicHJldiIsImNvdW50IiwiZ2V0VHJhbnNsYXRlWCIsInZ3Iiwic2xpZGVDZW50ZXJYIiwiaXNTaW5nbGVUYWJNb2RlIiwiaW5uZXJXaWR0aCIsInNldENsYXNzZXMiLCJzaW5nbGVUYWJNb2RlIiwibGVmdFZpc2libGUiLCJyaWdodFZpc2libGUiLCJ1cGRhdGVBcnJvd3MiLCJ2aXNpYmlsaXR5IiwidXBkYXRlIiwidXNlVHJhbnNpdGlvbiIsImFyZ3VtZW50cyIsInVuZGVmaW5lZCIsIm1hdGNoIiwic3RhcnRYIiwiY2xpZW50WCIsInBhc3NpdmUiLCJkaWZmIiwidG91Y2hlcyIsImNoYW5nZWRUb3VjaGVzIiwicmVzaXplVGltZXIiLCJjbGVhclRpbWVvdXQiLCJz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QztJQUNyQjFDLFFBQVEsQ0FBQ2xGLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFDcUMsQ0FBQyxFQUFLO01BQzNDLElBQUlBLENBQUMsQ0FBQzBGLGNBQWMsQ0FBQzlLLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDbkMsSUFBTTRLLElBQUksR0FBR3hGLENBQUMsQ0FBQzBGLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQ0osT0FBTyxHQUFHRCxNQUFNO01BQ2pELElBQUlHLElBQUksR0FBRzlDLGVBQWUsRUFBRXlCLElBQUksQ0FBQyxDQUFDO01BQ2xDLElBQUlxQixJQUFJLEdBQUcsQ0FBQzlDLGVBQWUsRUFBRXdCLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUMsRUFBRTtNQUFFcUIsT0FBTyxFQUFFO0lBQUssQ0FBQyxDQUFDOztJQUVyQjtJQUNBLElBQUlJLFdBQVc7SUFDZi9JLE1BQU0sQ0FBQ2UsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFlBQU07TUFDdENpSSxZQUFZLENBQUNELFdBQVcsQ0FBQztNQUN6QkEsV0FBVyxHQUFHRSxVQUFVLENBQUM7UUFBQSxPQUFNYixNQUFNLENBQUMsS0FBSyxDQUFDO01BQUEsR0FBRSxHQUFHLENBQUM7SUFDcEQsQ0FBQyxDQUFDO0lBRUZBLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFFYixPQUFPO01BQUVkLElBQUksRUFBSkEsSUFBSTtNQUFFQyxJQUFJLEVBQUpBO0lBQUssQ0FBQztFQUN2QjtFQUVBLElBQUlqTSxRQUFRLENBQUM0TixVQUFVLEtBQUssU0FBUyxFQUFFO0lBQ3JDNU4sUUFBUSxDQUFDeUYsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUVpRixlQUFlLENBQUM7RUFDaEUsQ0FBQyxNQUFNO0lBQ0xBLGVBQWUsQ0FBQyxDQUFDO0VBQ25CO0FBQ0YsQ0FBQyxFQUFFLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXBpVVJMID0gJ2h0dHBzOi8vYWxsd2luLXByb20ucHAudWEvYXBpX3Rlc3RfcHJlZGljdG9yJ1xuXG4gICAgY29uc3QgbWFpblBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnZlcmlmeS1wYWdlXCIpLFxuICAgICAgICB1a0xlbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdWtMZW5nJyksXG4gICAgICAgIGVuTGVuZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNlbkxlbmcnKTtcblxuICAgIC8vIGxldCBsb2NhbGUgPSAndWsnO1xuICAgIGxldCBsb2NhbGUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibG9jYWxlXCIpIHx8IFwidWtcIlxuXG4gICAgaWYgKHVrTGVuZykgbG9jYWxlID0gJ3VrJztcbiAgICBpZiAoZW5MZW5nKSBsb2NhbGUgPSAnZW4nO1xuXG4gICAgbGV0IGkxOG5EYXRhID0ge307XG4gICAgY29uc3QgdHJhbnNsYXRlU3RhdGUgPSB0cnVlO1xuXG4gICAgY29uc3QgcmVxdWVzdCA9IGZ1bmN0aW9uIChsaW5rLCBleHRyYU9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoKGFwaVVSTCArIGxpbmssIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAuLi4oZXh0cmFPcHRpb25zIHx8IHt9KVxuICAgICAgICB9KS50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQVBJIHJlcXVlc3QgZmFpbGVkOicsIGVycik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRUcmFuc2xhdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KGAvbmV3LXRyYW5zbGF0ZXMvJHtsb2NhbGV9YClcbiAgICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICAgICAgICAgIGkxOG5EYXRhID0ganNvbjtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGd1ZXNzUGFnZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ndWVzc1BhZ2VcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFndWVzc1BhZ2VFbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRyYW5zbGF0ZVNjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNob3VsZElnbm9yZU11dGF0aW9uVGFyZ2V0ID0gKHRhcmdldE5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0YXJnZXROb2RlPy5ub2RlVHlwZSA9PT0gMSA/IHRhcmdldE5vZGUgOiB0YXJnZXROb2RlPy5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihlbD8uY2xvc2VzdD8uKCcucHJlZGljdF9fdGVhbS1jb250cm9sJykpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzY2hlZHVsZVRyYW5zbGF0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zbGF0ZVNjaGVkdWxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVTY2hlZHVsZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtdXRhdGlvbnMgfHwgIW11dGF0aW9ucy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGxJZ25vcmVkID0gbXV0YXRpb25zLmV2ZXJ5KG0gPT4gc2hvdWxkSWdub3JlTXV0YXRpb25UYXJnZXQobS50YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbElnbm9yZWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZVRyYW5zbGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKGd1ZXNzUGFnZUVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZSgpIHtcbiAgICAgICAgY29uc3QgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10cmFuc2xhdGVdJylcbiAgICAgICAgaWYgKGVsZW1zICYmIGVsZW1zLmxlbmd0aCkge1xuXG4gICAgICAgICAgICBpZih0cmFuc2xhdGVTdGF0ZSl7XG4gICAgICAgICAgICAgICAgZWxlbXMuZm9yRWFjaChlbGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHJhbnNsYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZWQgPSBpMThuRGF0YVtrZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNsYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0uaW5uZXJIVE1MICE9PSB0cmFuc2xhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5pbm5lckhUTUwgPSB0cmFuc2xhdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdHJhbnNsYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWxsYmFjayA9ICcqLS0tLU5FRUQgVE8gQkUgVFJBTlNMQVRFRC0tLS0qICAga2V5OiAgJyArIGtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLmlubmVySFRNTCAhPT0gZmFsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLmlubmVySFRNTCA9IGZhbGxiYWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidHJhbnNsYXRpb24gd29ya3MhXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsZSA9PT0gJ2VuJykge1xuICAgICAgICAgICAgbWFpblBhZ2U/LmNsYXNzTGlzdC5hZGQoJ2VuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmVmcmVzaExvY2FsaXplZENsYXNzKCk7XG5cblxuXG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZnJlc2hMb2NhbGl6ZWRDbGFzcyhlbGVtZW50LCBiYXNlQ3NzQ2xhc3MpIHtcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBsYW5nIG9mIFsndWsnLCdlbiddKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYmFzZUNzc0NsYXNzICsgbGFuZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGJhc2VDc3NDbGFzcyArIGxvY2FsZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVwb3J0RXJyb3IoZXJyKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydERhdGEgPSB7XG4gICAgICAgICAgICBvcmlnaW46IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgdXNlcmlkOiB1c2VySWQsXG4gICAgICAgICAgICBlcnJvclRleHQ6IGVycj8uZXJyb3IgfHwgZXJyPy50ZXh0IHx8IGVycj8ubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicsXG4gICAgICAgICAgICB0eXBlOiBlcnI/Lm5hbWUgfHwgJ1Vua25vd25FcnJvcicsXG4gICAgICAgICAgICBzdGFjazogZXJyPy5zdGFjayB8fCAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGxvYWRUcmFuc2xhdGlvbnMoKTtcblxuICAgIC8vIHNlbGVjdCBtYXRjaCBpbiBkcm9wXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRyb3Bkb3duLnNlbGVjdCcpLmZvckVhY2goZHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnlUZXh0ID0gZHJvcC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0X19jdXJyZW50Jyk7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gZHJvcC5xdWVyeVNlbGVjdG9yQWxsKCcuc2VsZWN0X19pdGVtIGlucHV0Jyk7XG5cbiAgICAgICAgaXRlbXMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8g0LfQvNGW0L3RjtGU0LzQviDRgtC10LrRgdGCINGDIHN1bW1hcnlcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gaW5wdXQubmV4dEVsZW1lbnRTaWJsaW5nLnRleHRDb250ZW50O1xuICAgICAgICAgICAgICAgIHN1bW1hcnlUZXh0LnRleHRDb250ZW50ID0gdGV4dDtcblxuICAgICAgICAgICAgICAgIC8vINC30LDQutGA0LjQstCw0ZTQvNC+IGRyb3Bkb3duXG4gICAgICAgICAgICAgICAgZHJvcC5yZW1vdmVBdHRyaWJ1dGUoJ29wZW4nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuLy8gcHJlZGljdCB0YWJzOiBnb2FsIC8gc2NvcmVcbiAgICBjb25zdCBwcmVkaWN0QmxvY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3Vlc3NQYWdlICNwcmVkaWN0Jyk7XG4gICAgaWYgKHByZWRpY3RCbG9jaykge1xuICAgICAgICBjb25zdCB0YWJTY29yZSA9IHByZWRpY3RCbG9jay5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fdGFicy1pdGVtLnNjb3JlJyk7XG4gICAgICAgIGNvbnN0IHRhYkdvYWwgPSBwcmVkaWN0QmxvY2sucXVlcnlTZWxlY3RvcignLnByZWRpY3RfX3RhYnMtaXRlbS5nb2FsJyk7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lclNjb3JlID0gcHJlZGljdEJsb2NrLnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0X19jb250YWluZXIuc2NvcmUnKTtcbiAgICAgICAgY29uc3QgY29udGFpbmVyR29hbCA9IHByZWRpY3RCbG9jay5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fY29udGFpbmVyLmdvYWwnKTtcbiAgICAgICAgY29uc3QgbGFzdFNjb3JlID0gcHJlZGljdEJsb2NrLnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0X19sYXN0LWl0ZW0uc2NvcmUnKTtcbiAgICAgICAgY29uc3QgbGFzdEdvYWwgPSBwcmVkaWN0QmxvY2sucXVlcnlTZWxlY3RvcignLnByZWRpY3RfX2xhc3QtaXRlbS5nb2FsJyk7XG4gICAgICAgIGNvbnN0IGNhbGNCbG9jayA9IHByZWRpY3RCbG9jay5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fY2FsYycpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHN3aXRjaFRvU2NvcmUoKSB7XG4gICAgICAgICAgICB0YWJTY29yZT8uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgICB0YWJHb2FsPy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIGNvbnRhaW5lclNjb3JlPy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICBjb250YWluZXJHb2FsPy5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBsYXN0U2NvcmU/LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgIGxhc3RHb2FsPy5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBjYWxjQmxvY2s/LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN3aXRjaFRvR29hbCgpIHtcbiAgICAgICAgICAgIHRhYkdvYWw/LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGFiR29hbD8uY2xhc3NMaXN0LnJlbW92ZSgndW5hY3RpdmUnKTtcbiAgICAgICAgICAgIHRhYlNjb3JlPy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIGNvbnRhaW5lckdvYWw/LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgIGNvbnRhaW5lclNjb3JlPy5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBsYXN0R29hbD8uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgbGFzdFNjb3JlPy5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBjYWxjQmxvY2s/LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhYlNjb3JlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN3aXRjaFRvU2NvcmUpO1xuICAgICAgICB0YWJHb2FsPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFiR29hbD8uY2xhc3NMaXN0LmNvbnRhaW5zKCd1bmFjdGl2ZScpKSByZXR1cm47XG4gICAgICAgICAgICBzd2l0Y2hUb0dvYWwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcG9wdXBzXG5cbiAgICAgICAgY29uc3QgcG9wdXBXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvcHVwcycpO1xuXG4gICAgICAgIGZ1bmN0aW9uIG9wZW5Qb3B1cEJ5QXR0cihwb3B1cEF0dHIsIHBvcHVwQ2xhc3MpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnBvcHVwW2RhdGEtcG9wdXA9XCIke3BvcHVwQXR0cn1cIl1gKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXRQb3B1cCkge1xuICAgICAgICAgICAgICAgIHRhcmdldFBvcHVwLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wb3B1cHMnKS5jbGFzc0xpc3QucmVtb3ZlKCdfb3BhY2l0eScpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wb3B1cHMnKS5jbGFzc0xpc3QuYWRkKGAke3BvcHVwQ2xhc3N9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjbG9zZUFsbFBvcHVwcygpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVwc0NsYXNzID0gWydfY29uZmlybVBvcHVwJywgJ19ib251c1BvcHVwJ107XG5cbiAgICAgICAgICAgIHBvcHVwV3JhcC5jbGFzc0xpc3QuYWRkKCdfb3BhY2l0eScpO1xuICAgICAgICAgICAgcG9wdXBzQ2xhc3MuZm9yRWFjaChwb3B1cCA9PiB7XG4gICAgICAgICAgICAgICAgcG9wdXBXcmFwLmNsYXNzTGlzdC5yZW1vdmUocG9wdXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2F1dG8nO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9wdXBXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoXCIucG9wdXBzX19pdGVtLWNsb3NlXCIpKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VBbGxQb3B1cHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbi8vINCS0ZbQtNC60YDQuNGC0Lgg0L/QvtC/0LDQvyDQv9C+INC60LvRltC60YMg0L3QsCDQsdGD0LTRjC3Rj9C60LjQuSDQtdC70LXQvNC10L3RgiDQtyBkYXRhLXBvcHVwICjQvdCw0L/RgNC40LrQu9Cw0LQgLmJ0bi10aGFua3MsIC5ib251c19fYnRuKVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wZW5lciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLXBvcHVwXScpO1xuICAgICAgICAgICAgaWYgKCFvcGVuZXIpIHJldHVybjtcbiAgICAgICAgICAgIC8vINC90LUg0LLRltC00LrRgNC40LLQsNGC0Lgg0L/RgNC4INC60LvRltC60YMg0LLRgdC10YDQtdC00LjQvdGWINC/0L7Qv9Cw0L/QsCAo0L3QsNC/0YDQuNC60LvQsNC0INC/0L4g0LrQvdC+0L/RhtGWINC30LDQutGA0LjRgtGC0Y8pXG4gICAgICAgICAgICBpZiAob3BlbmVyLmNsYXNzTGlzdC5jb250YWlucygncG9wdXAnKSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgYXR0ciA9IG9wZW5lci5kYXRhc2V0LnBvcHVwO1xuICAgICAgICAgICAgaWYgKCFhdHRyKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBwb3B1cENsYXNzID0gJ18nICsgYXR0cjtcbiAgICAgICAgICAgIG9wZW5Qb3B1cEJ5QXR0cihhdHRyLCBwb3B1cENsYXNzKTtcblxuICAgICAgICAgICAgLy8g0KMg0LHQu9C+0YbRliDQstGW0YLQsNC90L3RjyAoY29uZmlybVBvcHVwKTog0L/QvtC60LDQt9GD0LLQsNGC0Lggc2NvcmUg0LDQsdC+IGdvYWwg0LfQsNC70LXQttC90L4g0LLRltC0IGRhdGEtdmFyaWFudCDQutC90L7Qv9C60LhcbiAgICAgICAgICAgIGlmIChhdHRyID09PSAnY29uZmlybVBvcHVwJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhcmlhbnQgPSBvcGVuZXIuZGF0YXNldC52YXJpYW50IHx8ICdzY29yZSc7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXBbZGF0YS1wb3B1cD1cImNvbmZpcm1Qb3B1cFwiXScpO1xuICAgICAgICAgICAgICAgIGlmIChwb3B1cCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzY29yZUJsb2NrID0gcG9wdXAucXVlcnlTZWxlY3RvcignLnByZWRpY3RfX2xhc3QtaXRlbS5zY29yZScpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBnb2FsQmxvY2sgPSBwb3B1cC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fbGFzdC1pdGVtLmdvYWwnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhcmlhbnQgPT09ICdnb2FsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVCbG9jaz8uY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29hbEJsb2NrPy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29yZUJsb2NrPy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnb2FsQmxvY2s/LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmFkaW86IFwi0J/QtdGA0YjQuNC5INCz0L7Qu1wiIOKAlCDQvtC00LjQvSDQutC+0L3RgtC10LnQvdC10YAg0L3QsCDQvNCw0YLRhyAoLnByZWRpY3RfX2NvbnRhaW5lci5nb2FsKSwg0L/Rg9C90LrRgtC4IOKAlCAucHJlZGljdF9fcmFkaW9cbiAgICAgICAgY29uc3QgcmFkaW9Hb2FsQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmVkaWN0X19jb250YWluZXIuZ29hbCcpO1xuXG4gICAgICAgIHJhZGlvR29hbENvbnRhaW5lcnMuZm9yRWFjaChnb2FsQmxvY2sgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmFkaW9JdGVtcyA9IGdvYWxCbG9jay5xdWVyeVNlbGVjdG9yQWxsKCcucHJlZGljdF9fcmFkaW8nKTtcblxuICAgICAgICAgICAgcmFkaW9JdGVtcy5mb3JFYWNoKHJhZGlvRWwgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gcmFkaW9FbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaW9JdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdfYWN0aXZlJykpO1xuICAgICAgICAgICAgICAgICAgICByYWRpb0VsLmNsYXNzTGlzdC5hZGQoJ19hY3RpdmUnKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrZWRJbnB1dCA9IGdvYWxCbG9jay5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fcmFkaW8gaW5wdXQ6Y2hlY2tlZCcpO1xuICAgICAgICAgICAgaWYgKGNoZWNrZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgIGNoZWNrZWRJbnB1dC5jbG9zZXN0KCcucHJlZGljdF9fcmFkaW8nKS5jbGFzc0xpc3QuYWRkKCdfYWN0aXZlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gcHJlZGljdF9fdGVhbS1jb250cm9sOiDQv9C70Y7RgS/QvNGW0L3Rg9GBINC+0LrRgNC10LzQviDQtNC70Y8g0LrQvtC20L3QvtCz0L4g0LHQu9C+0LrRgywg0LzRltC9LiAwXG4gICAgICAgIHByZWRpY3RCbG9jay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2wgPSBlLnRhcmdldC5jbG9zZXN0KCcucHJlZGljdF9fdGVhbS1jb250cm9sJyk7XG4gICAgICAgICAgICBpZiAoIWNvbnRyb2wpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IG51bWJlckVsID0gY29udHJvbC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fdGVhbS1udW1iZXInKTtcbiAgICAgICAgICAgIGlmICghbnVtYmVyRWwpIHJldHVybjtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KG51bWJlckVsLnRleHRDb250ZW50LCAxMCkgfHwgMDtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCcucHJlZGljdF9fdGVhbS1pbmNyZWFzZScpKSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyRWwudGV4dENvbnRlbnQgPSB2YWx1ZSArIDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJy5wcmVkaWN0X190ZWFtLWRlY3JlYXNlJykpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPiAwKSBudW1iZXJFbC50ZXh0Q29udGVudCA9IHZhbHVlIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9jYWxjXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmVkaWN0X19jYWxjLWZvcmVjYXN0cy0taXRlbScpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnByZWRpY3RfX2NhbGMtZm9yZWNhc3RzLS1pdGVtJykuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gISEhIFRFU1QgISEhXG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWJ0blwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtdGVzdFwiKT8uY2xhc3NMaXN0LnRvZ2dsZShcImhpZGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbG5nQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sbmctYnRuXCIpXG5cbiAgICAgICAgbG5nQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcImxvY2FsZVwiKSkge1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oXCJsb2NhbGVcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJsb2NhbGVcIiwgXCJlblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICBjb25zdCBidG5VbmFjdGl2ZUdvYWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudS10ZXN0IC51bmFjdGl2ZUdvYWwnKTtcbiAgICAgICAgY29uc3QgYnRuVG9vbHRpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51LXRlc3QgLnRvb2x0aXAnKTtcblxuICAgICAgICBidG5VbmFjdGl2ZUdvYWw/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoVG9TY29yZSgpO1xuICAgICAgICAgICAgdGFiR29hbD8uY2xhc3NMaXN0LmFkZCgndW5hY3RpdmUnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYm9udXNCbG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib251cycpO1xuICAgICAgICBjb25zdCBidG5Db25maXJtZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uYnRuLWNvbmZpcm1lZCcpO1xuICAgICAgICBjb25zdCByZXN1bHRDb25maXJtZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdF9fbGFzdC1yZXN1bHQuY29uZmlybWVkJyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdFVuY29uZmlybWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3RfX2xhc3QtcmVzdWx0LnVuY29uZmlybWVkJyk7XG4gICAgICAgIGJ0bkNvbmZpcm1lZD8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICByZXN1bHRDb25maXJtZWQ/LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGUnKTtcbiAgICAgICAgICAgIHJlc3VsdFVuY29uZmlybWVkPy5jbGFzc0xpc3QudG9nZ2xlKCdoaWRlJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBidG5BZnRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5idG4tYWZ0ZXInKTtcbiAgICAgICAgYnRuQWZ0ZXI/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29udGFpbmVyU2NvcmU/LmNsYXNzTGlzdC50b2dnbGUoJ19sb2NrJyk7XG4gICAgICAgICAgICBjb250YWluZXJHb2FsPy5jbGFzc0xpc3QudG9nZ2xlKCdfbG9jaycpO1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lckdvYWw/LmNsYXNzTGlzdC5jb250YWlucygnX2xvY2snKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhZGlvSXRlbXMgPSBjb250YWluZXJHb2FsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmVkaWN0X19yYWRpbycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWRJbnB1dCA9IGNvbnRhaW5lckdvYWwucXVlcnlTZWxlY3RvcignLnByZWRpY3RfX3JhZGlvIGlucHV0OmNoZWNrZWQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNoZWNrZWRJbnB1dCAmJiByYWRpb0l0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXJzdElucHV0ID0gcmFkaW9JdGVtc1swXS5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0SW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0l0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ19hY3RpdmUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0l0ZW1zWzBdLmNsYXNzTGlzdC5hZGQoJ19hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGJ0blplcm9Cb251c2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmJ0bi16ZXJvQm9udXNlcycpO1xuICAgICAgICBidG5aZXJvQm9udXNlcz8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBib251c0Jsb2NrPy5jbGFzc0xpc3QudG9nZ2xlKCdoaWRlJyk7XG4gICAgICAgICAgICBjb25zdCBib251c1BvcHVwVGFibGVCb2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvcHVwW2RhdGEtcG9wdXA9XCJib251c1BvcHVwXCJdIC5wb3B1cHNfX2l0ZW0tYm9keSAudGFibGVfX2JvZHknKTtcbiAgICAgICAgICAgIGlmIChib251c1BvcHVwVGFibGVCb2R5KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93cyA9IGJvbnVzUG9wdXBUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnLnRhYmxlX19yb3cnKTtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goKHJvdywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCkgcm93LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSByb3cuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYm9udXNJbmZvVG9vbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib251c19fbGVmdC10aXRsZS1pbmZvVG9vbCcpO1xuICAgICAgICBjb25zdCBib251c1Rvb2x0aXBFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ib251c19fbGVmdC10aXRsZS10b29sdGlwJyk7XG4gICAgICAgIGNvbnN0IG1vYmlsZVF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoJyhtYXgtd2lkdGg6IDYwMHB4KScpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHBvc2l0aW9uQm9udXNUb29sdGlwKCkge1xuICAgICAgICAgICAgaWYgKCFib251c1Rvb2x0aXBFbCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCFtb2JpbGVRdWVyeS5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgYm9udXNUb29sdGlwRWwuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgICAgICAgICAgICBib251c1Rvb2x0aXBFbC5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICAgICAgICAgICAgYm9udXNUb29sdGlwRWwuc3R5bGUudG9wID0gJyc7XG4gICAgICAgICAgICAgICAgYm9udXNUb29sdGlwRWwuc3R5bGUudHJhbnNmb3JtID0gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFib251c0luZm9Ub29sKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCByZWN0ID0gYm9udXNJbmZvVG9vbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IGdhcCA9IDEwO1xuICAgICAgICAgICAgYm9udXNUb29sdGlwRWwuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICAgICAgYm9udXNUb29sdGlwRWwuc3R5bGUubGVmdCA9IChyZWN0LmxlZnQgKyByZWN0LndpZHRoIC8gMikgKyAncHgnO1xuICAgICAgICAgICAgYm9udXNUb29sdGlwRWwuc3R5bGUudG9wID0gKHJlY3QudG9wIC0gZ2FwKSArICdweCc7XG4gICAgICAgICAgICBib251c1Rvb2x0aXBFbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC0xMDAlKSc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9udXNJbmZvVG9vbCAmJiBib251c1Rvb2x0aXBFbCkge1xuICAgICAgICAgICAgYm9udXNJbmZvVG9vbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChtb2JpbGVRdWVyeS5tYXRjaGVzKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9zaXRpb25Cb251c1Rvb2x0aXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcG9zaXRpb25Cb251c1Rvb2x0aXApO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHBvc2l0aW9uQm9udXNUb29sdGlwLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ0blRvb2x0aXA/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGFiR29hbD8uY2xhc3NMaXN0LnRvZ2dsZSgnX3Rvb2x0aXAtdmlzaWJsZScpO1xuICAgICAgICAgICAgYm9udXNCbG9jaz8uY2xhc3NMaXN0LnRvZ2dsZSgnX3Rvb2x0aXAtdmlzaWJsZScpO1xuICAgICAgICAgICAgaWYgKGJvbnVzQmxvY2s/LmNsYXNzTGlzdC5jb250YWlucygnX3Rvb2x0aXAtdmlzaWJsZScpICYmIG1vYmlsZVF1ZXJ5Lm1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9zaXRpb25Cb251c1Rvb2x0aXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxufSkoKTtcblxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgU0xJREVfV0lEVEggPSAyMTY7XG4gIGNvbnN0IFNMSURFX01BUkdJTiA9IDEyO1xuICBjb25zdCBTTElERV9TVEVQID0gU0xJREVfV0lEVEggKyBTTElERV9NQVJHSU4gKiAyO1xuICBjb25zdCBTV0lQRV9USFJFU0hPTEQgPSA1MDtcbiAgY29uc3QgVFJBTlNJVElPTl9EVVJBVElPTiA9IDQwMDtcblxuICBmdW5jdGlvbiBpbml0VGFibGVTbGlkZXIoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3Vlc3NQYWdlIC50YWJsZV9fd3JhcHBlci12aWV3cG9ydCcpO1xuICAgIGNvbnN0IHRyYWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmd1ZXNzUGFnZSAudGFibGVfX3RhYnMnKTtcbiAgICBjb25zdCBhcnJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ3Vlc3NQYWdlIC50YWJsZV9fYXJyb3cnKTtcbiAgICBpZiAoIXZpZXdwb3J0IHx8ICF0cmFjaykgcmV0dXJuO1xuXG4gICAgaWYgKHRyYWNrLmhhc0F0dHJpYnV0ZSgnZGF0YS10YWJsZS1zbGlkZXItaW5pdGVkJykpIHJldHVybjtcblxuICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuZnJvbSh0cmFjay5xdWVyeVNlbGVjdG9yQWxsKCcudGFibGVfX3RhYnMtaXRlbScpKTtcbiAgICBjb25zdCB0b3RhbCA9IGl0ZW1zLmxlbmd0aDtcbiAgICBpZiAodG90YWwgPT09IDApIHJldHVybjtcblxuICAgIC8vIGZvciAyIHRlYW1zXG4gICAgaWYgKHRvdGFsID09PSAyKSB7XG4gICAgICB0cmFjay5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGFibGUtc2xpZGVyLWluaXRlZCcsICd0cnVlJyk7XG4gICAgICB0cmFjay5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xuICAgICAgdHJhY2suc3R5bGUudHJhbnNmb3JtID0gJ25vbmUnO1xuICAgICAgdHJhY2suc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJztcblxuICAgICAgYXJyb3dzLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICBidG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgY3VycmVudCA9IDA7XG4gICAgICBjb25zdCBpbml0aWFsbHlBY3RpdmUgPSBpdGVtcy5maW5kSW5kZXgoKGVsKSA9PiBlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKTtcbiAgICAgIGlmIChpbml0aWFsbHlBY3RpdmUgPj0gMCkgY3VycmVudCA9IGluaXRpYWxseUFjdGl2ZTtcblxuICAgICAgZnVuY3Rpb24gdXBkYXRlVGFicygpIHtcbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoc2xpZGUsIGkpID0+IHtcbiAgICAgICAgICBzbGlkZS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBpID09PSBjdXJyZW50KTtcbiAgICAgICAgICBzbGlkZS5jbGFzc0xpc3QuYWRkKCd2aXNpYmxlJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnb1RvSW5kZXgoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0b3RhbCB8fCBpbmRleCA9PT0gY3VycmVudCkgcmV0dXJuO1xuICAgICAgICBjdXJyZW50ID0gaW5kZXg7XG4gICAgICAgIHVwZGF0ZVRhYnMoKTtcbiAgICAgIH1cblxuICAgICAgdHJhY2suYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBzbGlkZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy50YWJsZV9fdGFicy1pdGVtJyk7XG4gICAgICAgIGlmICghc2xpZGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgaWR4ID0gaXRlbXMuaW5kZXhPZihzbGlkZSk7XG4gICAgICAgIGlmIChpZHggIT09IC0xKSBnb1RvSW5kZXgoaWR4KTtcbiAgICAgIH0pO1xuXG4gICAgICB1cGRhdGVUYWJzKCk7XG4gICAgICByZXR1cm4geyBuZXh0OiAoKSA9PiB7fSwgcHJldjogKCkgPT4ge30gfTtcbiAgICB9XG5cblxuICAgIHRyYWNrLnNldEF0dHJpYnV0ZSgnZGF0YS10YWJsZS1zbGlkZXItaW5pdGVkJywgJ3RydWUnKTtcblxuICAgIGNvbnN0IGNvdW50ID0gdG90YWw7XG5cbiAgICBsZXQgY3VycmVudCA9IDA7XG4gICAgY29uc3QgaW5pdGlhbGx5QWN0aXZlID0gaXRlbXMuZmluZEluZGV4KChlbCkgPT4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSk7XG4gICAgaWYgKGluaXRpYWxseUFjdGl2ZSA+PSAwKSBjdXJyZW50ID0gaW5pdGlhbGx5QWN0aXZlO1xuXG4gICAgZnVuY3Rpb24gZ2V0VHJhbnNsYXRlWChpbmRleCkge1xuICAgICAgY29uc3QgdncgPSB2aWV3cG9ydC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIC8vINCm0LXQvdGC0YAg0YHQu9Cw0LnQtNGDOiDQu9GW0LLQuNC5IG1hcmdpbiAoMTJweCkgKyDQv9C+0LfQuNGG0ZbRjyDRgdC70LDQudC00YMgKyDQv9C+0LvQvtCy0LjQvdCwINGI0LjRgNC40L3QuFxuICAgICAgY29uc3Qgc2xpZGVDZW50ZXJYID0gU0xJREVfTUFSR0lOICsgaW5kZXggKiBTTElERV9TVEVQICsgU0xJREVfV0lEVEggLyAyO1xuICAgICAgcmV0dXJuIHZ3IC8gMiAtIHNsaWRlQ2VudGVyWDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1NpbmdsZVRhYk1vZGUoKSB7XG4gICAgICByZXR1cm4gd2luZG93LmlubmVyV2lkdGggPCAxMDUwO1xuICAgIH1cblxuICAgIC8vINCQ0LrRgtC40LLQvdC40Lkg0L/QviDRhtC10L3RgtGA0YM7INGB0L/RgNCw0LLQsCDigJQg0L3QsNGB0YLRg9C/0L3RliDQvNCw0YLRh9GWICh2aXNpYmxlKSwg0LfQu9GW0LLQsCDigJQg0L/QvtC/0LXRgNC10LTQvdGWXG4gICAgZnVuY3Rpb24gc2V0Q2xhc3NlcygpIHtcbiAgICAgIGNvbnN0IHNpbmdsZVRhYk1vZGUgPSBpc1NpbmdsZVRhYk1vZGUoKTtcbiAgICAgIGNvbnN0IGxlZnRWaXNpYmxlID0gY3VycmVudCAtIDE7XG4gICAgICBjb25zdCByaWdodFZpc2libGUgPSBjdXJyZW50ICsgMTtcblxuICAgICAgaXRlbXMuZm9yRWFjaCgoZWwsIGkpID0+IHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgaSA9PT0gY3VycmVudCk7XG4gICAgICAgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ3Zpc2libGUnLCAhc2luZ2xlVGFiTW9kZSAmJiAoaSA9PT0gbGVmdFZpc2libGUgfHwgaSA9PT0gcmlnaHRWaXNpYmxlKSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVBcnJvd3MoKSB7XG4gICAgICBhcnJvd3MuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICAgIGlmIChidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCd0YWJsZV9fYXJyb3ctLWxlZnQnKSkge1xuICAgICAgICAgIGJ0bi5zdHlsZS52aXNpYmlsaXR5ID0gY3VycmVudCA9PT0gMCA/ICdoaWRkZW4nIDogJ3Zpc2libGUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ0bi5zdHlsZS52aXNpYmlsaXR5ID0gY3VycmVudCA9PT0gY291bnQgLSAxID8gJ2hpZGRlbicgOiAndmlzaWJsZSc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSh1c2VUcmFuc2l0aW9uID0gdHJ1ZSkge1xuICAgICAgdHJhY2suc3R5bGUudHJhbnNpdGlvbiA9IHVzZVRyYW5zaXRpb25cbiAgICAgICAgPyBgdHJhbnNmb3JtICR7VFJBTlNJVElPTl9EVVJBVElPTn1tcyBlYXNlYFxuICAgICAgICA6ICdub25lJztcbiAgICAgIHRyYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgke2dldFRyYW5zbGF0ZVgoY3VycmVudCl9cHgsIDAsIDApYDtcbiAgICAgIHNldENsYXNzZXMoKTtcbiAgICAgIHVwZGF0ZUFycm93cygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICBpZiAoY3VycmVudCA+PSBjb3VudCAtIDEpIHJldHVybjtcbiAgICAgIGN1cnJlbnQgKz0gMTtcbiAgICAgIHVwZGF0ZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXYoKSB7XG4gICAgICBpZiAoY3VycmVudCA8PSAwKSByZXR1cm47XG4gICAgICBjdXJyZW50IC09IDE7XG4gICAgICB1cGRhdGUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnb1RvSW5kZXgoaW5kZXgpIHtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gY291bnQgfHwgaW5kZXggPT09IGN1cnJlbnQpIHJldHVybjtcbiAgICAgIGN1cnJlbnQgPSBpbmRleDtcbiAgICAgIHVwZGF0ZSgpO1xuICAgIH1cblxuICAgIC8vIGFycm93c1xuICAgIGFycm93cy5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKGJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYmxlX19hcnJvdy0tbGVmdCcpKSBwcmV2KCk7XG4gICAgICAgIGVsc2UgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBjbGlja1xuICAgIHRyYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHNsaWRlID0gZS50YXJnZXQuY2xvc2VzdCgnLnRhYmxlX190YWJzLWl0ZW0nKTtcbiAgICAgIGlmICghc2xpZGUgfHwgc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkgcmV0dXJuO1xuICAgICAgY29uc3QgbWF0Y2ggPSBzbGlkZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWF0Y2gnKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBpZHggPSBwYXJzZUludChtYXRjaCwgMTApIC0gMTtcbiAgICAgICAgaWYgKGlkeCA+PSAwICYmIGlkeCA8IGNvdW50KSBnb1RvSW5kZXgoaWR4KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHN3aXBlXG4gICAgbGV0IHN0YXJ0WCA9IDA7XG4gICAgdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCAoZSkgPT4ge1xuICAgICAgc3RhcnRYID0gZS5jbGllbnRYO1xuICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICB2aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgZGlmZiA9IGUuY2xpZW50WCAtIHN0YXJ0WDtcbiAgICAgIGlmIChkaWZmID4gU1dJUEVfVEhSRVNIT0xEKSBwcmV2KCk7XG4gICAgICBpZiAoZGlmZiA8IC1TV0lQRV9USFJFU0hPTEQpIG5leHQoKTtcbiAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG5cbiAgICB2aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09PSAxKSBzdGFydFggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAoZSkgPT4ge1xuICAgICAgaWYgKGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoICE9PSAxKSByZXR1cm47XG4gICAgICBjb25zdCBkaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRYO1xuICAgICAgaWYgKGRpZmYgPiBTV0lQRV9USFJFU0hPTEQpIHByZXYoKTtcbiAgICAgIGlmIChkaWZmIDwgLVNXSVBFX1RIUkVTSE9MRCkgbmV4dCgpO1xuICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblxuICAgIC8vIHJlc2l6ZVxuICAgIGxldCByZXNpemVUaW1lcjtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHJlc2l6ZVRpbWVyKTtcbiAgICAgIHJlc2l6ZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB1cGRhdGUoZmFsc2UpLCAxMDApO1xuICAgIH0pO1xuXG4gICAgdXBkYXRlKGZhbHNlKTtcblxuICAgIHJldHVybiB7IG5leHQsIHByZXYgfTtcbiAgfVxuXG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdFRhYmxlU2xpZGVyKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0VGFibGVTbGlkZXIoKTtcbiAgfVxufSkoKTtcbiJdfQ==
