// ==UserScript==
// @name         Ping & Info Helper
// @version      0.69.67
// @discription  Defaults ping info to the right side and allows you to drag it anywhere you want to place it.
// @match        *://kirka.io/*
// @author       Fat Logic
// @grant        none
// ==/UserScript==

(function() {

	var gridSize = 16;

	var isDragging = false;
	var offsetX = 0,
		offsetY = 0;

	
	var lastLeft = localStorage.getItem('ovl_left') ? parseFloat(localStorage.getItem('ovl_left')) : null;
	var lastTop  = localStorage.getItem('ovl_top')  ? parseFloat(localStorage.getItem('ovl_top'))  : null;

	var currentPanel = null;
	var retryCount = 0;
	var mutationBound = false;

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
		var el = document.querySelector('#overlay');

		if (!el) {
			retryCount++;
			if (retryCount < 120) setTimeout(setupPanel, 500);
			return;
		}

		if (el === currentPanel) return;

		removePanel();
		currentPanel = el;

		
		currentPanel.style.position = 'fixed';
		currentPanel.style.visibility = 'hidden';
		document.body.appendChild(currentPanel);

		var panelWidth  = currentPanel.offsetWidth  || 200;
		var panelHeight = currentPanel.offsetHeight || 100;

		
		var defaultLeft = window.innerWidth  - panelWidth  - 16;
		var defaultTop  = 16;

		currentPanel.style.left         = (lastLeft !== null ? lastLeft : defaultLeft) + 'px';
		currentPanel.style.top          = (lastTop  !== null ? lastTop  : defaultTop)  + 'px';
		currentPanel.style.zIndex       = '2147483647';
		currentPanel.style.cursor       = 'grab';
		currentPanel.style.userSelect   = 'none';
		currentPanel.style.display    = '';
		currentPanel.style.visibility = '';

		currentPanel.addEventListener('mousedown', function(evt) {
			isDragging = true;
			currentPanel.style.transition = 'none';
			currentPanel.style.cursor = 'grabbing';
			offsetX = evt.clientX - parseFloat(currentPanel.style.left);
			offsetY = evt.clientY - parseFloat(currentPanel.style.top);
			evt.preventDefault();
			evt.stopPropagation();
		});

		
		if (!mutationBound) {
			mutationBound = true;
			var timer = null;
			new MutationObserver(function() {
				clearTimeout(timer);
				timer = setTimeout(function() {
					var newPanel = document.querySelector('#overlay');
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
	}

	document.addEventListener('mousemove', function(e) {
		if (!isDragging || !currentPanel) return;
		var newLeft = keepInBounds(e.clientX - offsetX, 0, window.innerWidth  - currentPanel.offsetWidth);
		var newTop  = keepInBounds(e.clientY - offsetY, 0, window.innerHeight - currentPanel.offsetHeight);
		currentPanel.style.left = newLeft + 'px';
		currentPanel.style.top  = newTop  + 'px';
	});

	document.addEventListener('mouseup', function() {
		if (!isDragging || !currentPanel) return;
		isDragging = false;
		currentPanel.style.cursor = 'grab';
		currentPanel.style.transition = 'left 0.12s ease, top 0.12s ease';
		var finalLeft = keepInBounds(snapToGrid(parseFloat(currentPanel.style.left)), 0, window.innerWidth  - currentPanel.offsetWidth);
		var finalTop  = keepInBounds(snapToGrid(parseFloat(currentPanel.style.top)),  0, window.innerHeight - currentPanel.offsetHeight);
		lastLeft = finalLeft;
		lastTop  = finalTop;
		localStorage.setItem('ovl_left', finalLeft);
		localStorage.setItem('ovl_top',  finalTop);
		currentPanel.style.left = finalLeft + 'px';
		currentPanel.style.top  = finalTop  + 'px';
	});

	setupPanel();

})();
