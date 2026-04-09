// ==UserScript==
// @name         Player State Toggle (kinda draggable thing)
// @version      0.69
// @match        *://kirka.io/*
// @author       Fat Logic
// @grant        none
// ==/UserScript==

(function() {

	var KEYBINDS = {
		toggle_visibility: 'Delete',
	};

	var gridSize = 16;

	var isDragging = false;
	var offsetX = 0,
		offsetY = 0;

	var isVisible = localStorage.getItem('pst_visible') !== 'false';

	var lastLeft = localStorage.getItem('pst_left') ? parseFloat(localStorage.getItem('pst_left')) : null;
	var lastTop = localStorage.getItem('pst_top') ? parseFloat(localStorage.getItem('pst_top')) : null;

	var currentPanel = null;

	var retryCount = 0;

	function snapToGrid(val) {
		return Math.round(val / gridSize) * gridSize;
	}

	function keepInBounds(val, min, max) {
		if (val < min) return min;
		if (val > max) return max;
		return val;
	}

	function removePanel() {
		if (currentPanel && currentPanel.parentNode) {
			currentPanel.parentNode.removeChild(currentPanel);
		}
		currentPanel = null;
	}

	function setupPanel() {
		var el = document.querySelector('.team-players-state');

		if (!el) {
			retryCount++;
			if (retryCount < 120) setTimeout(setupPanel, 500);
			return;
		}

		if (el === currentPanel) return;

		removePanel();
		currentPanel = el;

		var bounds = currentPanel.getBoundingClientRect();

		currentPanel.style.position = 'fixed';
		currentPanel.style.left = (lastLeft !== null ? lastLeft : bounds.left) + 'px';
		currentPanel.style.top = (lastTop !== null ? lastTop : bounds.top) + 'px';
		currentPanel.style.zIndex = '2147483647';
		currentPanel.style.cursor = 'grab';
		currentPanel.style.userSelect = 'none';
		currentPanel.style.display = '';
		currentPanel.style.opacity = isVisible ? '1' : '0';
		currentPanel.style.pointerEvents = isVisible ? 'auto' : 'none';

		document.body.appendChild(currentPanel);

		currentPanel.addEventListener('mousedown', function(evt) {
			isDragging = true;
			currentPanel.style.transition = 'none';
			currentPanel.style.cursor = 'grabbing';
			offsetX = evt.clientX - parseFloat(currentPanel.style.left);
			offsetY = evt.clientY - parseFloat(currentPanel.style.top);
			evt.preventDefault();
			evt.stopPropagation();
		});

		var timer = null;

		new MutationObserver(function() {
			clearTimeout(timer);
			timer = setTimeout(function() {
				var gameUI = document.querySelector('.desktop-game-interface');
				if (!gameUI) {
					if (currentPanel) currentPanel.style.display = 'none';
					removePanel();
					return;
				}
				var newPanel = document.querySelector('.team-players-state');
				if (newPanel && newPanel !== currentPanel) {
					retryCount = 0;
					setupPanel();
				}
			}, 0);
		}).observe(document.body, {
			childList: true,
			subtree: true
		});

	}

	document.addEventListener('mousemove', function(e) {
		if (!isDragging || !currentPanel) return;
		var newLeft = keepInBounds(e.clientX - offsetX, 0, window.innerWidth - currentPanel.offsetWidth);
		var newTop = keepInBounds(e.clientY - offsetY, 0, window.innerHeight - currentPanel.offsetHeight);
		currentPanel.style.left = newLeft + 'px';
		currentPanel.style.top = newTop + 'px';
	});

	document.addEventListener('mouseup', function() {
		if (!isDragging || !currentPanel) return;
		isDragging = false;
		currentPanel.style.cursor = 'grab';
		currentPanel.style.transition = 'left 0.12s ease, top 0.12s ease';
		var finalLeft = keepInBounds(snapToGrid(parseFloat(currentPanel.style.left)), 0, window.innerWidth - currentPanel.offsetWidth);
		var finalTop = keepInBounds(snapToGrid(parseFloat(currentPanel.style.top)), 0, window.innerHeight - currentPanel.offsetHeight);
		lastLeft = finalLeft;
		lastTop = finalTop;
		localStorage.setItem('pst_left', finalLeft);
		localStorage.setItem('pst_top', finalTop);
		currentPanel.style.left = finalLeft + 'px';
		currentPanel.style.top = finalTop + 'px';
	});

	document.addEventListener('keydown', function(e) {
		if (e.key !== KEYBINDS.toggle_visibility || !currentPanel) return;
		isVisible = !isVisible;
		localStorage.setItem('pst_visible', isVisible);
		currentPanel.style.transition = 'opacity 0.15s ease';
		currentPanel.style.opacity = isVisible ? '1' : '0';
		currentPanel.style.pointerEvents = isVisible ? 'auto' : 'none';
	});

	setupPanel();

})();