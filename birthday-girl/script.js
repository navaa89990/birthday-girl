// ===== STATE =====
const TOTAL = 9;
let current = 1;
let musicPlaying = false;
let musicReady = false;

// ===== DOTS =====
const dotsEl = document.getElementById('dots');
for(let i = 1; i <= TOTAL; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i===1?' active':'');
  d.onclick = () => goTo(i);
  dotsEl.appendChild(d);
}

function goTo(n) {
  document.querySelector('#slide-'+current).classList.remove('active');
  document.querySelectorAll('.dot')[current-1].classList.remove('active');
  current = n;
  document.querySelector('#slide-'+current).classList.add('active');
  document.querySelectorAll('.dot')[current-1].classList.add('active');
  document.getElementById('prev-btn').disabled = current === 1;
  document.getElementById('next-btn').disabled = current === TOTAL;

  // confetti on last slide
  if(current === TOTAL) startConfetti();
  // confetti burst on slide 1
  if(current === 1) startConfetti(true);
}

function changeSlide(dir) {
  const next = current + dir;
  if(next < 1 || next > TOTAL) return;
  goTo(next);
}

// keyboard
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowRight' || e.key === 'ArrowDown') changeSlide(1);
  if(e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   changeSlide(-1);
});

// touch/swipe
let touchX = 0;
document.addEventListener('touchstart', e => touchX = e.touches[0].clientX, {passive:true});
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if(Math.abs(dx) > 40) changeSlide(dx < 0 ? 1 : -1);
}, {passive:true});

// ===== MUSIC (Love Me Like You Do - Ellie Goulding, embedded MP3) =====
const music = document.getElementById('bg-music');
music.volume = 0.4;

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  if(musicPlaying) {
    music.pause();
    musicPlaying = false;
    btn.textContent = '♪ Play Musik';
  } else {
    music.play().then(() => {
      musicPlaying = true;
      btn.textContent = '♪ Pause Musik';
    }).catch(() => {
      btn.textContent = '♪ Play Musik';
    });
  }
}

// auto-play on first interaction
document.addEventListener('click', function autoPlay() {
  if(!musicPlaying) {
    music.play().then(() => {
      musicPlaying = true;
      document.getElementById('music-btn').textContent = '♪ Pause Musik';
    }).catch(()=>{});
  }
  document.removeEventListener('click', autoPlay);
}, {once:true});

// ===== CONFETTI =====
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let pieces = [];
let animId = null;
let confettiRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#e8a0b0','#c9a96e','#f5d0da','#c2687a','#e8d5b0','#fce4eb'];

function startConfetti(quick = false) {
  pieces = [];
  for(let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      speed: Math.random() * 2.5 + 1.2,
      drift: (Math.random()-0.5) * 1.2,
      rot: Math.random()*360,
      rotSpeed: (Math.random()-0.5)*4,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      opacity: 1
    });
  }
  if(!confettiRunning) animateConfetti();
}

function animateConfetti() {
  confettiRunning = true;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pieces.forEach((p, i) => {
    p.y += p.speed;
    p.x += p.drift;
    p.rot += p.rotSpeed;
    if(p.y > canvas.height + 20) {
      p.opacity -= 0.02;
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI/180);
    ctx.fillStyle = p.color;
    if(p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0,0,p.size/2,0,Math.PI*2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*0.6);
    }
    ctx.restore();
  });
  pieces = pieces.filter(p => p.opacity > 0);
  if(pieces.length > 0) {
    animId = requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
}

// initial confetti burst
setTimeout(() => startConfetti(), 600);