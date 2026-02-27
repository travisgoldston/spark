// Mobile nav toggle
const navToggle = document.querySelector('[data-nav-toggle]');
const navDrawer = document.getElementById('nav-drawer');
if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    navDrawer.setAttribute('aria-hidden', !isOpen);
  });
  navDrawer.querySelectorAll('.nav-drawer-link, .nav-drawer-sublink, .nav-drawer-cta').forEach((link) => {
    link.addEventListener('click', () => {
      navDrawer.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      navDrawer.setAttribute('aria-hidden', 'true');
    });
  });
}

// Sticky header
const headerEl = document.querySelector('[data-header]');
const heroEl = document.querySelector('#hero');

if (headerEl && heroEl) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          headerEl.classList.add('scrolled');
        } else {
          headerEl.classList.remove('scrolled');
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(heroEl);
}

// Problem story cards reveal
const storyCards = document.querySelectorAll('.story-card');
if (storyCards.length) {
  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          storyObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  storyCards.forEach((card) => storyObserver.observe(card));
}

// Timeline interaction
const timeline = document.querySelector('[data-timeline]');
if (timeline) {
  const steps = Array.from(timeline.querySelectorAll('.timeline-step'));
  steps.forEach((step) => {
    const headerBtn = step.querySelector('.timeline-step-header');
    if (!headerBtn) return;
    headerBtn.addEventListener('click', () => {
      steps.forEach((s) => s.classList.remove('is-active'));
      step.classList.add('is-active');
    });
  });
}

// Service tabs
const serviceTabsRoot = document.querySelector('[data-service-tabs]');
if (serviceTabsRoot) {
  const tabs = Array.from(serviceTabsRoot.querySelectorAll('.service-tab'));
  const panels = Array.from(serviceTabsRoot.querySelectorAll('.service-panel'));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-service');
      if (!target) return;

      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      panels.forEach((panel) => {
        const service = panel.getAttribute('data-service-panel');
        if (service === target) {
          panel.classList.add('is-active');
        } else {
          panel.classList.remove('is-active');
        }
      });
    });
  });
}

// Before/after slider
const overlayEl = document.querySelector('[data-before-after-overlay]');
const sliderEl = document.querySelector('[data-before-after-slider]');

if (overlayEl && sliderEl) {
  const updateOverlay = () => {
    const value = Number(sliderEl.value);
    const rightInset = `${100 - value}%`;
    overlayEl.style.clipPath = `inset(0 ${rightInset} 0 0 round 26px)`;
  };

  updateOverlay();
  sliderEl.addEventListener('input', updateOverlay);
}

// Animated counters
const counters = document.querySelectorAll('[data-counter]');
if (counters.length) {
  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-target') || '0');
    let current = 0;
    const duration = 1200;
    const start = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      current = Math.floor(target * progress);
      el.textContent = String(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => counterObserver.observe(el));
}

// FAQ accordion
const faqRoot = document.querySelector('[data-faq]');
if (faqRoot) {
  const items = Array.from(faqRoot.querySelectorAll('.faq-item'));
  items.forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;
    const answer = item.querySelector('.faq-answer');
    if (!answer) return;

    // Ensure all answers start collapsed
    answer.style.maxHeight = '0';
    item.classList.remove('is-open');

    const setMaxHeight = (open) => {
      if (open) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        item.classList.add('is-open');
      } else {
        answer.style.maxHeight = '0';
        item.classList.remove('is-open');
      }
    };

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      // close others
      items.forEach((other) => {
        if (other === item) return;
        const otherAnswer = other.querySelector('.faq-answer');
        if (!otherAnswer) return;
        otherAnswer.style.maxHeight = '0';
        other.classList.remove('is-open');
      });
      setMaxHeight(!isOpen);
    });
  });
}

// Pricing calculator (simple heuristic)
const calculatorRoot = document.querySelector('[data-pricing-calculator]');
if (calculatorRoot) {
  const needSelect = calculatorRoot.querySelector('#needSelect');
  const leadsSlider = calculatorRoot.querySelector('#leadsSlider');
  const rangeEl = calculatorRoot.querySelector('[data-calculator-range]');
  const budgetInput = calculatorRoot.querySelector('#budgetInput');
  const serviceCheckboxes = Array.from(calculatorRoot.querySelectorAll('.chip input[type="checkbox"]'));

  const formatMoney = (value) => {
    const rounded = Math.round(value / 50) * 50;
    return `$${rounded.toLocaleString()}`;
  };

  const updateEstimate = () => {
    if (!rangeEl || !needSelect || !leadsSlider) return;

    const leads = Number(leadsSlider.value || '20');
    const budget = Number(budgetInput && budgetInput.value ? budgetInput.value : 0);
    const activeServices = serviceCheckboxes.filter((c) => c.checked).map((c) => c.value);

    // Keep this estimator conservative and aligned with the public pricing ranges.
    let base = 420;

    if (needSelect.value === 'fast-leads') base += 180;
    if (needSelect.value === 'website-refresh') base += 140;

    base += (leads - 10) * 6;
    base += activeServices.length * 90;

    let low = base * 0.85;
    let high = base * 1.2;

    if (budget > 0) {
      const cushion = budget * 0.3;
      low = Math.max(349, budget - cushion);
      high = budget + cushion;
    }

    // Public floor (some simple cases can start here).
    if (low < 349) low = 349;

    if (Math.round(low) === 349) {
      rangeEl.innerHTML = `Most owners in a similar spot start around <strong>$349+ per month</strong> after setup.`;
      return;
    }

    const lowStr = formatMoney(low);
    const highStr = formatMoney(high);

    rangeEl.innerHTML = `Most owners in a similar spot start around <strong>${lowStr} to ${highStr} per month</strong> after setup.`;
  };

  needSelect.addEventListener('change', updateEstimate);
  leadsSlider.addEventListener('input', updateEstimate);
  if (budgetInput) {
    budgetInput.addEventListener('input', updateEstimate);
  }
  serviceCheckboxes.forEach((cb) => cb.addEventListener('change', updateEstimate));

  updateEstimate();
}

// Conversational form
const formEl = document.querySelector('#contact-form');
if (formEl) {
  const stepsRoot = formEl.querySelector('[data-form-steps]');
  const confirmation = formEl.querySelector('[data-form-confirmation]');
  const steps = stepsRoot ? Array.from(stepsRoot.querySelectorAll('.form-step')) : [];
  const nextButtons = formEl.querySelectorAll('.form-next');
  const prevButtons = formEl.querySelectorAll('.form-prev');
  const phoneField = formEl.querySelector('[data-contact-phone]');
  const emailField = formEl.querySelector('[data-contact-email]');
  const preferenceRadios = formEl.querySelectorAll('input[name="contactPreference"]');

  const activateStep = (index) => {
    steps.forEach((step, i) => {
      if (i === index) {
        step.classList.add('is-active');
      } else {
        step.classList.remove('is-active');
      }
    });
  };

  const currentStepIndex = () => steps.findIndex((s) => s.classList.contains('is-active'));

  const goNext = () => {
    const index = currentStepIndex();
    if (index === -1) return;
    const current = steps[index];
    const requiredInputs = current.querySelectorAll('input[required], textarea[required]');

    for (const input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus();
        input.classList.add('field-error');
        setTimeout(() => input.classList.remove('field-error'), 800);
        return;
      }
    }

    const nextIndex = Math.min(steps.length - 1, index + 1);
    activateStep(nextIndex);
  };

  const goPrev = () => {
    const index = currentStepIndex();
    const prevIndex = Math.max(0, index - 1);
    activateStep(prevIndex);
  };

  nextButtons.forEach((btn) => btn.addEventListener('click', goNext));
  prevButtons.forEach((btn) => btn.addEventListener('click', goPrev));

  // Contact preference toggle
  const updateContactFields = () => {
    let preference = 'call';
    preferenceRadios.forEach((r) => {
      if (r.checked) preference = r.value;
    });

    if (phoneField instanceof HTMLElement && emailField instanceof HTMLElement) {
      if (preference === 'email') {
        phoneField.classList.add('field--hidden');
        const phoneInput = phoneField.querySelector('input');
        if (phoneInput) phoneInput.removeAttribute('required');

        emailField.classList.remove('field--hidden');
        const emailInput = emailField.querySelector('input');
        if (emailInput) emailInput.setAttribute('required', 'true');
      } else {
        emailField.classList.add('field--hidden');
        const emailInput = emailField.querySelector('input');
        if (emailInput) emailInput.removeAttribute('required');

        phoneField.classList.remove('field--hidden');
        const phoneInput = phoneField.querySelector('input');
        if (phoneInput) phoneInput.setAttribute('required', 'true');
      }
    }
  };

  preferenceRadios.forEach((r) => r.addEventListener('change', updateContactFields));
  updateContactFields();

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    activateStep(steps.length - 1);
    if (confirmation) {
      confirmation.classList.add('visible');
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

