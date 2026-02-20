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

    function switchToScore() {
        tabScore?.classList.add('active');
        tabGoal?.classList.remove('active');
        containerScore?.classList.remove('hide');
        containerGoal?.classList.add('hide');
        lastScore?.classList.remove('hide');
        lastGoal?.classList.add('hide');
    }

    function switchToGoal() {
        tabGoal?.classList.add('active');
        tabGoal?.classList.remove('unactive');
        tabScore?.classList.remove('active');
        containerGoal?.classList.remove('hide');
        containerScore?.classList.add('hide');
        lastGoal?.classList.remove('hide');
        lastScore?.classList.add('hide');
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


    const btnUnactiveGoal = document.querySelector('.menu-test .unactiveGoal');
    const btnTooltip = document.querySelector('.menu-test .tooltip');

    btnUnactiveGoal?.addEventListener('click', () => {
        switchToScore();
        tabGoal?.classList.add('unactive');
    });

    btnTooltip?.addEventListener('click', () => {
        tabGoal?.classList.toggle('_tooltip-visible');
    });
}


