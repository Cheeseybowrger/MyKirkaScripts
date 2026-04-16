// ==UserScript==
// @name         Kirka Left Handed Weapons
// @version      0.69.420
// @description  Mirrors your arms and weapon
// @author       Fat Logic
// @match        https://kirka.io/*
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const _a = Object.defineProperty;
    Object.defineProperty = function(_b, _c, _d) {
        if (_c === 'WwWNmnw' && _d && _d.get) {
            window._e = _b;
        }
        return _a(_b, _c, _d);
    };

    let _h = null;

    function _i() {
        if (_h && _h.wmWMNwnW) {
            _h.wmWMNwnW.elements[0] = -Math.abs(_h.wmWMNwnW.elements[0]);
        }
        requestAnimationFrame(_i);
    }

    setInterval(() => {
        if (!window._e) return;
        const _g = window._e.WwWNmnw;
        if (!_g) return;
        const _newCam = _g.wnWWmMNw;
        if (_newCam && _newCam !== _h) {
            _h = _newCam;
        }
    }, 500);

    _i();

})();