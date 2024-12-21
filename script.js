// ==UserScript==
// @name         Arcaea Online Enhancer
// @namespace    https://github.com/saicaca
// @version      1.0
// @description  Show the rating of each play and the average rating on the Arcaea Online page.
// @author       saicaca
// @match        https://arcaea.lowiro.com/*
// @homepageURL  https://github.com/saicaca/arcaea-online-enhancer
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const queryAPI = '/score/rating/me';

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._url = url;
        return originalOpen.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('load', function() {
            if (this._url.includes(queryAPI)) {
                const data = JSON.parse(this.responseText);
                modify(data);
            }
        });
        return originalSend.apply(this, args);
    };

    function modify(data) {
        const cardListEl = document.querySelector('.card-list');
        const cardEls = Array.from(cardListEl.children).filter(child =>
            child.classList.contains('card')
        );

        const best30Scores = data.value.best_rated_scores;
        const bestRecentScores = data.value.recent_rated_scores;

        const best30Avg = best30Scores.length === 0 ? 0 : best30Scores.reduce((sum, score) => sum + score.rating, 0) / best30Scores.length;
        const bestRecentAvg = bestRecentScores.length === 0 ? 0 : bestRecentScores.reduce((sum, score) => sum + score.rating, 0) / bestRecentScores.length;

        cardListEl.querySelector('.line-dark').insertAdjacentHTML('afterend', `
            <div class="aoe-info-card">
            <div>
                <div>Best 30 Avg.</div>
                <div class="aoe-rating-text">${best30Avg.toFixed(3)}</div>
            </div>
            <span>
                <div>Best Recent Avg.</div>
                <div class="aoe-rating-text">${bestRecentAvg.toFixed(3)}</div>
            </span>
            </div>
        `);


        const scores = [...best30Scores, ...bestRecentScores];

        for (let i= 0; i < scores.length; i++) {
            let card = cardEls[i];
            const section = card.querySelector('.section-1');
            if (section) {
                section.insertAdjacentHTML('afterbegin', `
                    <div class="aoe-rating-text">${scores[i].rating.toFixed(3)}</div>
                `);
            }
        }
    }

})();

GM_addStyle(`
    .aoe-info-card {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        font-family: Titillium Web;
        font-size: 14px;
    }
    .aoe-rating-text {
        font-weight: bold;
        margin-bottom: 4px;
        font-family: Titillium Web;
        color: #882299;
        background: linear-gradient(to bottom, #882299, #5566AA);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 18px;
    }
`);
