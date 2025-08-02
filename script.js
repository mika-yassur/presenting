// === LINE CONNECTION LOGIC ===
function getAbsoluteCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY
  };
}

function connectElements(lineId, elemId1, elemId2) {
  const line = document.getElementById(lineId);
  const elem1 = document.getElementById(elemId1);
  const elem2 = document.getElementById(elemId2);

  if (!line || !elem1 || !elem2) {
    console.warn('Missing elements for', lineId, elemId1, elemId2);
    return;
  }

  const pos1 = getAbsoluteCenter(elem1);
  const pos2 = getAbsoluteCenter(elem2);

  line.setAttribute('x1', pos1.x);
  line.setAttribute('y1', pos1.y);
  line.setAttribute('x2', pos2.x);
  line.setAttribute('y2', pos2.y);
}

function updateLines() {
  const quotesPanel = document.getElementById('quotes-panel');
  const conceptsPanel = document.getElementById('panel1');

  if (!quotesPanel || !conceptsPanel) {
    console.warn('One or both panels not found.');
    return;
  }

  const rectQuotes = quotesPanel.getBoundingClientRect();
  const rectConcepts = conceptsPanel.getBoundingClientRect();
  const viewportWidth = window.innerWidth;

  const quotesVisible = rectQuotes.right > 0 && rectQuotes.left < viewportWidth;
  const conceptsVisible = rectConcepts.right > 0 && rectConcepts.left < viewportWidth;

  if (!(quotesVisible && conceptsVisible)) {
    ['line-eyal', 'line-saba', 'line-samia'].forEach(id => {
      const line = document.getElementById(id);
      if (line) line.style.opacity = '0';
    });
    return;
  }

  ['line-eyal', 'line-saba', 'line-samia'].forEach(id => {
    const line = document.getElementById(id);
    if (line) line.style.opacity = '1';
  });

  connectElements('line-eyal', 'quote-eyal', 'concept-eyal');
  connectElements('line-saba', 'quote-saba', 'concept-saba');
  connectElements('line-samia', 'quote-samia1', 'concept-samia');
}

// === PANEL AND INTERACTION LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
  const panels = document.querySelectorAll('.panel');
  const panelRight = document.getElementById('panel-right');
  const followUp = panelRight?.querySelector('.follow-up');
  const followUpSpans = followUp?.querySelectorAll('span') || [];

  function checkPanelVisibility() {
    const viewportWidth = window.innerWidth;
    panels.forEach(panel => {
      const rect = panel.getBoundingClientRect();
      if (rect.left >= 0 && rect.left < viewportWidth / 2) {
        panel.classList.add('visible');
      } else {
        panel.classList.remove('visible');
      }
    });
  }

  window.addEventListener('scroll', checkPanelVisibility);
  window.addEventListener('resize', checkPanelVisibility);
  checkPanelVisibility();

  const panelAfter = document.getElementById('panel-after');
  const panelCartography = document.getElementById('panel-cartography');
  const situatednessParagraph = document.getElementById('situatedness-paragraph');

  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target.id === 'panel-right' && entry.isIntersecting) {
        panelRight.classList.add('visible');
        followUp?.classList.remove('hidden');
        followUpSpans.forEach((span, i) => {
          setTimeout(() => span.classList.add('show'), i * 700);
        });
      } else if (entry.target.id === 'panel-right') {
        panelRight.classList.remove('visible');
        followUp?.classList.add('hidden');
        followUpSpans.forEach(span => span.classList.remove('show'));
      }

      if (entry.target.id === 'panel-after' && entry.isIntersecting) {
        setTimeout(() => panelAfter.classList.add('visible'), 100);
      } else if (entry.target.id === 'panel-after') {
        panelAfter.classList.remove('visible');
      }

      if (entry.target.id === 'panel-cartography' && entry.isIntersecting) {
        setTimeout(() => {
          situatednessParagraph?.classList.remove('hidden');
          situatednessParagraph?.classList.add('show');
        }, 2000);
      }
    });
  }, { threshold: 0.5 });

  [panelRight, panelAfter, panelCartography].forEach(p => {
    if (p) visibilityObserver.observe(p);
  });

  // === MOUNTAIN SCROLL BAR ===
  const path = document.getElementById('mountain-path');
  const thumb = document.getElementById('scroll-thumb');

  if (path && thumb) {
    const pathLength = path.getTotalLength();

    function updateThumb() {
      const scrollLeft = window.scrollX;
      const maxScroll = document.body.scrollWidth - window.innerWidth;
      if (maxScroll === 0 || !isFinite(scrollLeft)) return;

      const scrollProgress = scrollLeft / maxScroll;
      const point = path.getPointAtLength(scrollProgress * pathLength);

      thumb.setAttribute('cx', point.x);
      thumb.setAttribute('cy', point.y);
    }

    window.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    updateThumb();
  } else {
    console.warn("🚫 mountain-path or scroll-thumb not found in DOM");
  }
});
