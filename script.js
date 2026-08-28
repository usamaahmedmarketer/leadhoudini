// ── Leadhoudini — Main Script ─────────────────────────────────────────────
(function () {

  // ── Nav scroll ──
  const nav = document.querySelector('nav.main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // ── Mobile menu ──
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mobileMenu.classList.remove('open'))
    );
  }

  // ── Fade-up observer ──
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => obs.observe(el));


  // ══════════════════════════════════════════════════════════════════════════
  //  SCORECARD QUIZ
  // ══════════════════════════════════════════════════════════════════════════
  const scorecard = document.getElementById('scorecard');
  if (scorecard) {
    const steps      = scorecard.querySelectorAll('.sc-step');
    const progressBar = scorecard.querySelector('.sc-progress-bar');
    const leadForm   = scorecard.querySelector('.sc-lead-form');
    const results    = scorecard.querySelector('.sc-results');
    const totalQ     = steps.length;
    let current      = 0;
    let answers      = {};

    function showStep(idx) {
      steps.forEach((s, i) => { s.classList.toggle('active', i === idx); });
      if (progressBar) progressBar.style.width = ((idx + 1) / (totalQ + 1) * 100) + '%';
    }

    // Option click
    scorecard.addEventListener('click', function (e) {
      const opt = e.target.closest('.sc-option');
      if (!opt) return;
      const step = opt.closest('.sc-step');
      if (!step) return;
      step.querySelectorAll('.sc-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[step.dataset.q] = parseInt(opt.dataset.val, 10);
    });

    // Next / Back
    scorecard.addEventListener('click', function (e) {
      if (e.target.closest('.sc-next')) {
        const step = steps[current];
        if (!step.querySelector('.sc-option.selected')) {
          step.querySelector('.sc-options').style.outline = '2px solid #e53e3e';
          setTimeout(() => step.querySelector('.sc-options').style.outline = '', 1500);
          return;
        }
        if (current < totalQ - 1) {
          current++;
          showStep(current);
        } else {
          // Show lead form
          steps.forEach(s => s.classList.remove('active'));
          if (leadForm) {
            leadForm.classList.add('active');
            if (progressBar) progressBar.style.width = '90%';
          }
        }
      }
      if (e.target.closest('.sc-back')) {
        if (current > 0) {
          current--;
          showStep(current);
        }
      }
    });

    // Lead form submit → show results
    const scForm = scorecard.querySelector('.sc-lead-submit');
    if (scForm) {
      scForm.addEventListener('click', function (e) {
        e.preventDefault();
        const name  = scorecard.querySelector('[name="sc-name"]');
        const email = scorecard.querySelector('[name="sc-email"]');
        if (!name.value.trim() || !email.value.trim()) {
          if (!name.value.trim()) name.style.borderColor = '#e53e3e';
          if (!email.value.trim()) email.style.borderColor = '#e53e3e';
          return;
        }

        // Calculate score
        let total = 0;
        let maxScore = totalQ * 3; // each question max 3 points
        Object.values(answers).forEach(v => total += v);
        const pct = Math.round((total / maxScore) * 100);

        // Show results
        if (leadForm) leadForm.classList.remove('active');
        if (results) {
          results.classList.add('active');
          const numEl = results.querySelector('.sc-score-num');
          if (numEl) numEl.textContent = pct;
          if (progressBar) progressBar.style.width = '100%';

          // Score label
          const labelEl = results.querySelector('.sc-score-label');
          if (labelEl) {
            if (pct >= 80) labelEl.textContent = 'Excellent';
            else if (pct >= 60) labelEl.textContent = 'Good — Room to Grow';
            else if (pct >= 40) labelEl.textContent = 'Needs Improvement';
            else labelEl.textContent = 'Critical — Leaving Money on the Table';
          }

          // Dynamic recs
          const recsEl = results.querySelector('.sc-recs');
          if (recsEl) {
            recsEl.innerHTML = '';
            const recs = [];
            if ((answers['q1'] || 0) < 2) recs.push('Your online presence needs work. A conversion-focused landing page or website could dramatically increase your lead volume.');
            if ((answers['q2'] || 0) < 2) recs.push('You\'re missing out on high-intent traffic. PPC and Meta Ads can put your business in front of people actively searching for your services.');
            if ((answers['q3'] || 0) < 2) recs.push('Your social media presence is an untapped channel. Consistent posting builds trust and keeps you top-of-mind with potential customers.');
            if ((answers['q4'] || 0) < 2) recs.push('Your lead follow-up process has gaps. An appointment settlement system ensures no lead falls through the cracks.');
            if ((answers['q5'] || 0) < 2) recs.push('You\'re not tracking marketing ROI effectively. Without data, you can\'t optimize spend or scale what works.');
            if ((answers['q6'] || 0) < 2) recs.push('Your reviews and reputation need attention. 90% of consumers check reviews before choosing a local service provider.');
            if ((answers['q7'] || 0) < 2) recs.push('You don\'t have a system to re-engage past customers. Repeat business is the most profitable kind.');
            if ((answers['q8'] || 0) < 2) recs.push('Your website isn\'t optimized for mobile. Over 70% of local searches happen on phones.');
            if (recs.length === 0) recs.push('Your marketing is in great shape! Let\'s talk about scaling to the next level.');
            recs.forEach(r => {
              const div = document.createElement('div');
              div.className = 'sc-rec';
              div.textContent = r;
              recsEl.appendChild(div);
            });
          }
        }

        // TODO: Send lead data to your endpoint
        console.log('Scorecard lead:', {
          name: name.value,
          email: email.value,
          phone: scorecard.querySelector('[name="sc-phone"]')?.value || '',
          business: scorecard.querySelector('[name="sc-business"]')?.value || '',
          score: pct,
          answers: answers
        });
      });
    }

    showStep(0);
  }


  // ══════════════════════════════════════════════════════════════════════════
  //  CONTACT FORM
  // ══════════════════════════════════════════════════════════════════════════
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Simulate send (replace with real endpoint)
      setTimeout(() => {
        btn.textContent = '✓ Sent! We\'ll be in touch.';
        btn.style.background = '#14B87A';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1000);
    });
  }

})();
