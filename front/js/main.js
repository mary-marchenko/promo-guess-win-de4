(function () {
    const apiURL = 'https://allwin-prom.pp.ua/api_test_predictor'

    const mainPage = document.querySelector(".verify-page"),
        ukLeng = document.querySelector('#ukLeng'),
        enLeng = document.querySelector('#enLeng');

    // let locale = 'uk';
    let locale = sessionStorage.getItem("locale") || "uk"

    if (ukLeng) locale = 'uk';
    if (enLeng) locale = 'en';

    let i18nData = {};
    const translateState = true;

    const request = function (link, extraOptions) {
        return fetch(apiURL + link, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            ...(extraOptions || {})
        }).then(res => res.json())
            .catch(err => {
                console.error('API request failed:', err);

                return Promise.reject(err);
            });
    }

    function loadTranslations() {
        return request(`/new-translates/${locale}`)
            .then(json => {
                i18nData = json;
                translate();

                const guessPageEl = document.querySelector(".guessPage");
                if (!guessPageEl) return;

                let translateScheduled = false;
                const shouldIgnoreMutationTarget = (targetNode) => {
                    const el = targetNode?.nodeType === 1 ? targetNode : targetNode?.parentElement;
                    return Boolean(el?.closest?.('.predict__team-control'));
                };

                const scheduleTranslate = () => {
                    if (translateScheduled) return;
                    translateScheduled = true;

                    requestAnimationFrame(() => {
                        translateScheduled = false;
                        translate();
                    });
                };

                const mutationObserver = new MutationObserver((mutations) => {
                    if (!mutations || !mutations.length) return;

                    const allIgnored = mutations.every(m => shouldIgnoreMutationTarget(m.target));
                    if (allIgnored) return;

                    scheduleTranslate();
                });

                mutationObserver.observe(guessPageEl, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                });
            });
    }

    function translate() {
        const elems = document.querySelectorAll('[data-translate]')
        if (elems && elems.length) {

            if(translateState){
                elems.forEach(elem => {
                    const key = elem.getAttribute('data-translate');
                    const translated = i18nData[key];
                    if (translated) {
                        if (elem.innerHTML !== translated) {
                            elem.innerHTML = translated;
                        }
                        elem.removeAttribute('data-translate');
                    } else {
                        const fallback = '*----NEED TO BE TRANSLATED----*   key:  ' + key;
                        if (elem.innerHTML !== fallback) {
                            elem.innerHTML = fallback;
                        }
                    }
                })
            }else{
                console.log("translation works!")
            }
        }
        if (locale === 'en') {
            mainPage?.classList.add('en');
        }
        refreshLocalizedClass();



    }
    function refreshLocalizedClass(element, baseCssClass) {
        if (!element) {
            return;
        }
        for (const lang of ['uk','en']) {
            element.classList.remove(baseCssClass + lang);
        }
        element.classList.add(baseCssClass + locale);
    }

    function reportError(err) {
        const reportData = {
            origin: window.location.href,
            userid: userId,
            errorText: err?.error || err?.text || err?.message || 'Unknown error',
            type: err?.name || 'UnknownError',
            stack: err?.stack || ''
        };
    }

    loadTranslations();

    // select match in drop
    document.querySelectorAll('.dropdown.select').forEach(drop => {
        const summaryText = drop.querySelector('.select__current');
        const items = drop.querySelectorAll('.select__item input');

        items.forEach(input => {
            input.addEventListener('change', () => {
                // змінюємо текст у summary
                const text = input.nextElementSibling.textContent;
                summaryText.textContent = text;

                // закриваємо dropdown
                drop.removeAttribute('open');
            });
        });
    });

// predict tabs: goal / score
    const predictBlock = document.querySelector('.guessPage #predict');
    if (predictBlock) {
        const tabScore = predictBlock.querySelector('.predict__tabs-item.score');
        const tabGoal = predictBlock.querySelector('.predict__tabs-item.goal');
        const containerScore = predictBlock.querySelector('.predict__container.score');
        const containerGoal = predictBlock.querySelector('.predict__container.goal');
        const lastScore = predictBlock.querySelector('.predict__last-item.score');
        const lastGoal = predictBlock.querySelector('.predict__last-item.goal');
        const calcBlock = predictBlock.querySelector('.predict__calc');

        function switchToScore() {
            tabScore?.classList.add('active');
            tabGoal?.classList.remove('active');
            containerScore?.classList.remove('hide');
            containerGoal?.classList.add('hide');
            lastScore?.classList.remove('hide');
            lastGoal?.classList.add('hide');
            calcBlock?.classList.remove('hide');
        }

        function switchToGoal() {
            tabGoal?.classList.add('active');
            tabGoal?.classList.remove('unactive');
            tabScore?.classList.remove('active');
            containerGoal?.classList.remove('hide');
            containerScore?.classList.add('hide');
            lastGoal?.classList.remove('hide');
            lastScore?.classList.add('hide');
            calcBlock?.classList.add('hide');
        }

        tabScore?.addEventListener('click', switchToScore);
        tabGoal?.addEventListener('click', (e) => {
            if (tabGoal?.classList.contains('unactive')) return;
            switchToGoal();
        });

        // popups

        const popupWrap = document.querySelector('.popups');

        function openPopupByAttr(popupAttr, popupClass) {
            document.body.style.overflow = 'hidden';
            const targetPopup = document.querySelector(`.popup[data-popup="${popupAttr}"]`);
            if (targetPopup) {
                targetPopup.classList.add('active');
                document.querySelector('.popups').classList.remove('_opacity');
                document.querySelector('.popups').classList.add(`${popupClass}`);
            }
        }

        function closeAllPopups() {
            const popupsClass = ['_confirmPopup', '_bonusPopup'];

            popupWrap.classList.add('_opacity');
            popupsClass.forEach(popup => {
                popupWrap.classList.remove(popup);
            });
            document.body.style.overflow = 'auto';
        }

        popupWrap.addEventListener('click', function(e) {
            if (e.target.closest(".popups__item-close")) {
                closeAllPopups();
            }
        });

// Відкрити попап по кліку на будь-який елемент з data-popup (наприклад .btn-thanks, .bonus__btn)
        document.addEventListener('click', function(e) {
            const opener = e.target.closest('[data-popup]');
            if (!opener) return;
            // не відкривати при кліку всередині попапа (наприклад по кнопці закриття)
            if (opener.classList.contains('popup')) return;
            const attr = opener.dataset.popup;
            if (!attr) return;
            const popupClass = '_' + attr;
            openPopupByAttr(attr, popupClass);

            // У блоці вітання (confirmPopup): показувати score або goal залежно від data-variant кнопки
            if (attr === 'confirmPopup') {
                const variant = opener.dataset.variant || 'score';
                const popup = document.querySelector('.popup[data-popup="confirmPopup"]');
                if (popup) {
                    const scoreBlock = popup.querySelector('.predict__last-item.score');
                    const goalBlock = popup.querySelector('.predict__last-item.goal');
                    if (variant === 'goal') {
                        scoreBlock?.classList.add('hide');
                        goalBlock?.classList.remove('hide');
                    } else {
                        scoreBlock?.classList.remove('hide');
                        goalBlock?.classList.add('hide');
                    }
                }
            }
        });

        // radio: "Перший гол" — один контейнер на матч (.predict__container.goal), пункти — .predict__radio
        const radioGoalContainers = document.querySelectorAll('.predict__container.goal');

        radioGoalContainers.forEach(goalBlock => {
            const radioItems = goalBlock.querySelectorAll('.predict__radio');

            radioItems.forEach(radioEl => {
                const input = radioEl.querySelector('input[type="radio"]');
                if (!input) return;

                input.addEventListener('change', function() {
                    radioItems.forEach(item => item.classList.remove('_active'));
                    radioEl.classList.add('_active');

                });
            });

            const checkedInput = goalBlock.querySelector('.predict__radio input:checked');
            if (checkedInput) {
                checkedInput.closest('.predict__radio').classList.add('_active');
            }
        })

        // predict__team-control: плюс/мінус окремо для кожного блоку, мін. 0
        predictBlock.addEventListener('click', function(e) {
            const control = e.target.closest('.predict__team-control');
            if (!control) return;
            const numberEl = control.querySelector('.predict__team-number');
            if (!numberEl) return;
            let value = parseInt(numberEl.textContent, 10) || 0;
            if (e.target.closest('.predict__team-increase')) {
                numberEl.textContent = value + 1;
            } else if (e.target.closest('.predict__team-decrease')) {
                if (value > 0) numberEl.textContent = value - 1;
            }
        });

        //calc
        document.querySelectorAll('.predict__calc-forecasts--item').forEach((item) => {
            item.addEventListener('click', function () {
                document.querySelectorAll('.predict__calc-forecasts--item').forEach((el) => el.classList.remove('active'));
                this.classList.toggle('active');
            });
        });


        // !!! TEST !!!

        document.addEventListener("DOMContentLoaded", () => {
            document.querySelector(".menu-btn")?.addEventListener("click", () => {
                document.querySelector(".menu-test")?.classList.toggle("hide");
            });
        });

        const lngBtn = document.querySelector(".lng-btn")

        lngBtn.addEventListener("click", () => {
            if (sessionStorage.getItem("locale")) {
                sessionStorage.removeItem("locale");
            } else {
                sessionStorage.setItem("locale", "en");
            }
            window.location.reload();
        });


        const btnUnactiveGoal = document.querySelector('.menu-test .unactiveGoal');
        const btnTooltip = document.querySelector('.menu-test .tooltip');

        btnUnactiveGoal?.addEventListener('click', () => {
            switchToScore();
            tabGoal?.classList.add('unactive');
        });

        const bonusBlock = document.querySelector('.bonus');
        const btnConfirmed = document.querySelector('button.btn-confirmed');
        const resultConfirmed = document.querySelector('.predict__last-result.confirmed');
        const resultUnconfirmed = document.querySelector('.predict__last-result.unconfirmed');
        btnConfirmed?.addEventListener('click', () => {
            resultConfirmed?.classList.toggle('hide');
            resultUnconfirmed?.classList.toggle('hide');
        });
        const btnAfter = document.querySelector('button.btn-after');
        btnAfter?.addEventListener('click', () => {
            containerScore?.classList.toggle('_lock');
            containerGoal?.classList.toggle('_lock');
            if (containerGoal?.classList.contains('_lock')) {
                const radioItems = containerGoal.querySelectorAll('.predict__radio');
                const checkedInput = containerGoal.querySelector('.predict__radio input:checked');
                if (!checkedInput && radioItems.length) {
                    const firstInput = radioItems[0].querySelector('input[type="radio"]');
                    if (firstInput) {
                        firstInput.checked = true;
                        radioItems.forEach(item => item.classList.remove('_active'));
                        radioItems[0].classList.add('_active');
                    }
                }
            }
        });
        const btnZeroBonuses = document.querySelector('button.btn-zeroBonuses');
        btnZeroBonuses?.addEventListener('click', () => {
            bonusBlock?.classList.toggle('hide');
            const bonusPopupTableBody = document.querySelector('.popup[data-popup="bonusPopup"] .popups__item-body .table__body');
            if (bonusPopupTableBody) {
                const rows = bonusPopupTableBody.querySelectorAll('.table__row');
                rows.forEach((row, i) => {
                    if (i === 0) row.classList.remove('hide');
                    else row.classList.add('hide');
                });
            }
        });
        const bonusInfoTool = document.querySelector('.bonus__left-title-infoTool');
        const bonusTooltipEl = document.querySelector('.bonus__left-title-tooltip');
        const mobileQuery = window.matchMedia('(max-width: 600px)');

        function positionBonusTooltip() {
            if (!bonusTooltipEl) return;
            if (!mobileQuery.matches) {
                bonusTooltipEl.style.position = '';
                bonusTooltipEl.style.left = '';
                bonusTooltipEl.style.top = '';
                bonusTooltipEl.style.transform = '';
                return;
            }
            if (!bonusInfoTool) return;
            const rect = bonusInfoTool.getBoundingClientRect();
            const gap = 10;
            bonusTooltipEl.style.position = 'fixed';
            bonusTooltipEl.style.left = (rect.left + rect.width / 2) + 'px';
            bonusTooltipEl.style.top = (rect.top - gap) + 'px';
            bonusTooltipEl.style.transform = 'translate(-50%, -100%)';
        }

        if (bonusInfoTool && bonusTooltipEl) {
            bonusInfoTool.addEventListener('mouseenter', () => {
                if (mobileQuery.matches) requestAnimationFrame(positionBonusTooltip);
            });
            window.addEventListener('resize', positionBonusTooltip);
            window.addEventListener('scroll', positionBonusTooltip, true);
        }

        btnTooltip?.addEventListener('click', () => {
            tabGoal?.classList.toggle('_tooltip-visible');
            bonusBlock?.classList.toggle('_tooltip-visible');
            if (bonusBlock?.classList.contains('_tooltip-visible') && mobileQuery.matches) {
                requestAnimationFrame(positionBonusTooltip);
            }
        });
    }


})();



