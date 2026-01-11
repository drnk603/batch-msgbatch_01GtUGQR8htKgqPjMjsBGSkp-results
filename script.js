(function() {
  'use strict';

  if (!window.__app) {
    window.__app = {};
  }

  const app = window.__app;

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  class ValidationManager {
    constructor() {
      this.patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        name: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
        phone: /^[\d\s+\-()]{10,20}$/,
        message: /^.{10,}$/
      };
    }

    validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const id = field.id;
      let isValid = true;
      let message = '';

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Dit veld is verplicht';
      } else if (value) {
        if (type === 'email' || id.includes('email')) {
          if (!this.patterns.email.test(value)) {
            isValid = false;
            message = 'Voer een geldig e-mailadres in';
          }
        } else if (type === 'tel' || id.includes('phone')) {
          if (!this.patterns.phone.test(value)) {
            isValid = false;
            message = 'Voer een geldig telefoonnummer in';
          }
        } else if (field.tagName === 'TEXTAREA' || id.includes('message')) {
          if (!this.patterns.message.test(value)) {
            isValid = false;
            message = 'Het bericht moet minimaal 10 tekens bevatten';
          }
        } else if (id.includes('name') || id.includes('Name')) {
          if (!this.patterns.name.test(value)) {
            isValid = false;
            message = 'Voer een geldige naam in (alleen letters)';
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required')) {
        if (!field.checked) {
          isValid = false;
          message = 'U moet akkoord gaan met deze voorwaarden';
        }
      }

      this.setFieldValidity(field, isValid, message);
      return isValid;
    }

    setFieldValidity(field, isValid, message) {
      const feedback = field.parentElement.querySelector('.invalid-feedback') || this.createFeedback(field);

      if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        feedback.textContent = '';
        feedback.style.display = 'none';
      } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        feedback.textContent = message;
        feedback.style.display = 'block';
      }
    }

    createFeedback(field) {
      const feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentElement.appendChild(feedback);
      return feedback;
    }

    validateForm(form) {
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    }
  }

  class BurgerMenu {
    constructor() {
      this.navbar = document.querySelector('.navbar');
      this.toggler = document.querySelector('.navbar-toggler');
      this.collapse = document.querySelector('.navbar-collapse');
      this.body = document.body;
      this.isOpen = false;

      if (!this.toggler || !this.collapse) return;
      this.init();
    }

    init() {
      this.toggler.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      const links = this.collapse.querySelectorAll('.nav-link');
      links.forEach(link => {
        link.addEventListener('click', () => {
          if (this.isOpen) {
            this.close();
          }
        });
      });

      window.addEventListener('resize', debounce(() => {
        if (window.innerWidth >= 1024 && this.isOpen) {
          this.close();
        }
      }, 150));
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.collapse.classList.add('show');
      this.toggler.classList.add('active');
      this.toggler.setAttribute('aria-expanded', 'true');
      this.body.style.overflow = 'hidden';
      this.isOpen = true;
    }

    close() {
      this.collapse.classList.remove('show');
      this.toggler.classList.remove('active');
      this.toggler.setAttribute('aria-expanded', 'false');
      this.body.style.overflow = '';
      this.isOpen = false;
    }
  }

  class ScrollAnimations {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      const options = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, options);

      this.observeElements();
    }

    observeElements() {
      const selectors = [
        '.card',
        '.c-card',
        'h1', 'h2', 'h3',
        '.btn',
        '.c-button',
        '.form-control',
        '.accordion',
        'img:not(.c-logo__img)',
        'p',
        '.lead'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(30px)';
          el.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
          this.observer.observe(el);
        });
      });
    }
  }

  class RippleEffect {
    constructor() {
      this.init();
    }

    init() {
      const elements = document.querySelectorAll('.btn, .c-button, .nav-link, .card, .c-card');

      elements.forEach(element => {
        element.addEventListener('click', (e) => {
          this.createRipple(e, element);
        });
      });
    }

    createRipple(event, element) {
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
      `;

      const existingRipple = element.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      ripple.className = 'ripple';
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          const headerHeight = this.getHeaderHeight();
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }

    getHeaderHeight() {
      const header = document.querySelector('.l-header, .navbar');
      return header ? header.offsetHeight : 70;
    }
  }

  class ActiveMenu {
    constructor() {
      this.init();
    }

    init() {
      const currentPath = window.location.pathname;
      const links = document.querySelectorAll('.nav-link');

      links.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (!linkPath) return;

        let isMatch = false;

        if (linkPath === '/' || linkPath === '/index.html') {
          if (currentPath === '/' || currentPath.endsWith('/index.html')) {
            isMatch = true;
          }
        } else if (linkPath.startsWith('/') && !linkPath.startsWith('/#')) {
          if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
            isMatch = true;
          }
        }

        if (isMatch) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      });
    }
  }

  class FormHandler {
    constructor() {
      this.validator = new ValidationManager();
      this.init();
    }

    init() {
      const forms = document.querySelectorAll('.needs-validation, form');

      forms.forEach(form => {
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
          field.addEventListener('blur', () => {
            this.validator.validateField(field);
          });

          field.addEventListener('input', debounce(() => {
            if (field.classList.contains('is-invalid')) {
              this.validator.validateField(field);
            }
          }, 300));
        });

        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      });
    }

    handleSubmit(e, form) {
      e.preventDefault();

      if (!this.validator.validateForm(form)) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verzenden...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        this.showNotification('Bedankt! Uw bericht is succesvol verzonden.', 'success');
        form.reset();
        form.classList.remove('was-validated');

        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
          field.classList.remove('is-valid', 'is-invalid');
        });

        setTimeout(() => {
          window.location.href = 'thank_you.html';
        }, 1500);
      }, 1000);
    }

    showNotification(message, type) {
      const container = document.getElementById('notification-container') || this.createNotificationContainer();
      const notification = document.createElement('div');
      notification.className = `alert alert-${type} alert-dismissible fade show`;
      notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
      `;

      container.appendChild(notification);

      const closeBtn = notification.querySelector('.btn-close');
      closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
      });

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
      }, 5000);
    }

    createNotificationContainer() {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;max-width:350px;';
      document.body.appendChild(container);
      return container;
    }
  }

  class ImageLoader {
    constructor() {
      this.init();
    }

    init() {
      const images = document.querySelectorAll('img');

      images.forEach(img => {
        if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', function() {
          this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EImage%3C/text%3E%3C/svg%3E';
          this.style.objectFit = 'contain';
        });
      });
    }
  }

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    .navbar-collapse {
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 1023px) {
      .navbar-collapse {
        height: calc(100vh - var(--header-h));
        max-height: 0;
        overflow-y: auto;
      }

      .navbar-collapse.show {
        max-height: calc(100vh - var(--header-h));
      }
    }

    .btn, .c-button, .card, .c-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn:hover, .c-button:hover {
      transform: translateY(-2px) scale(1.02);
    }

    .btn:active, .c-button:active {
      transform: translateY(0) scale(0.98);
    }

    .card:hover, .c-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .nav-link {
      position: relative;
      overflow: hidden;
    }

    .form-control:focus, .c-input:focus {
      transform: scale(1.01);
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
      border-width: 0.15em;
      display: inline-block;
      border: 0.15em solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spinner-border 0.75s linear infinite;
    }

    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }

    #notification-container .alert {
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .accordion-button {
      transition: all 0.3s ease-in-out;
    }

    .accordion-button:not(.collapsed) {
      box-shadow: inset 0 -1px 0 rgba(0,0,0,0.125);
    }

    img {
      transition: transform 0.3s ease-in-out, opacity 0.5s ease-in-out;
    }

    img:hover {
      transform: scale(1.02);
    }
  `;
  document.head.appendChild(styleSheet);

  app.init = () => {
    if (app.initialized) return;
    app.initialized = true;

    new BurgerMenu();
    new ScrollAnimations();
    new RippleEffect();
    new SmoothScroll();
    new ActiveMenu();
    new FormHandler();
    new ImageLoader();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }
})();