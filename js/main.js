// ===== 語言切換 =====
let currentLang = localStorage.getItem('lang') || 'zh';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-zh][data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (!text) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
      if (el.children.length === 0) {
        el.textContent = text;
      } else {
        el.innerHTML = text.split('\n\n').map(p => `<p>${p}</p>`).join('');
      }
    }
  });

  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = lang === 'zh' ? 'EN' : '中';
  });
}

document.querySelectorAll('.lang-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
  });
});

// 頁面載入時套用已儲存的語言
if (currentLang !== 'zh') {
  setLanguage(currentLang);
}

// ===== 頁面切換（點擊選單顯示對應區塊） =====
const hero = document.getElementById('hero');
const sections = document.querySelectorAll('.page-section');

function showPage(pageId) {
  // 隱藏首頁
  hero.hidden = true;

  // 隱藏所有區塊，再顯示目標
  sections.forEach(s => s.hidden = true);
  const target = document.getElementById(pageId);
  if (target) {
    target.hidden = false;
    window.scrollTo(0, 0);
  }

  // 更新 active 狀態
  document.querySelectorAll('.section-nav .nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-page') === pageId);
  });

  // 重新繪製星圖連線（如果是作品頁）
  if (pageId === 'works' && typeof drawLines === 'function') {
    setTimeout(drawLines, 100);
  }
}

function showHero() {
  sections.forEach(s => s.hidden = true);
  hero.hidden = false;
  window.scrollTo(0, 0);
}

// 所有導航連結（首頁 + 內頁）
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(link.getAttribute('data-page'));
  });
});

// 左上角名稱 → 回首頁
document.querySelectorAll('.site-title').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showHero();
  });
});

// 首頁 Enter 5秒後淡入
const heroEnter = document.getElementById('heroEnter');
if (heroEnter) {
  setTimeout(() => {
    heroEnter.classList.add('visible');
  }, 3000);
}

// 返回箭頭 → 回首頁
document.querySelectorAll('.back-home').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showHero();
  });
});

// 網址參數：從作品頁返回時直接顯示對應分頁
const urlParams = new URLSearchParams(window.location.search);
const startPage = urlParams.get('page');
if (startPage) {
  showPage(startPage);
}

// ===== 星圖上下左右拖曳 =====
const constellation = document.getElementById('constellation');

if (constellation) {
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;

  constellation.addEventListener('mousedown', (e) => {
    if (e.target.closest('.star')) return;
    isDragging = true;
    constellation.style.cursor = 'grabbing';
    startX = e.pageX;
    startY = e.pageY;
    scrollLeft = constellation.scrollLeft;
    scrollTop = constellation.scrollTop;
  });

  constellation.addEventListener('mouseleave', () => {
    isDragging = false;
    constellation.style.cursor = 'grab';
  });

  constellation.addEventListener('mouseup', () => {
    isDragging = false;
    constellation.style.cursor = 'grab';
  });

  constellation.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    constellation.scrollLeft = scrollLeft - (e.pageX - startX) * 1.5;
    constellation.scrollTop = scrollTop - (e.pageY - startY) * 1.5;
  });
}

// ===== 星圖連線效果 =====
let drawLines;

if (constellation && window.innerWidth > 768) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
  constellation.style.position = 'relative';
  constellation.insertBefore(canvas, constellation.firstChild);

  const ctx = canvas.getContext('2d');
  const stars = constellation.querySelectorAll('.star');

  function resizeCanvas() {
    canvas.width = constellation.offsetWidth;
    canvas.height = constellation.offsetHeight;
  }

  drawLines = function() {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positions = [];
    stars.forEach(star => {
      const rect = star.getBoundingClientRect();
      const parentRect = constellation.getBoundingClientRect();
      positions.push({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top + rect.height / 2
      });
    });

    const maxDist = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) * 0.4;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = Math.sqrt(
          (positions[i].x - positions[j].x) ** 2 +
          (positions[i].y - positions[j].y) ** 2
        );
        if (dist < maxDist) {
          const opacity = 0.04 * (1 - dist / maxDist);
          ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(positions[i].x, positions[i].y);
          ctx.lineTo(positions[j].x, positions[j].y);
          ctx.stroke();
        }
      }
    }
  };

  window.addEventListener('load', drawLines);
  window.addEventListener('resize', drawLines);
}
