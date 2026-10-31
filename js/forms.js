/**
 * Validation and submit handling for contact and dealer forms (plain JS).
 */
(function (global) {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function closestField(el) {
    return el.closest('.field, .apply-field, .dealer-field');
  }

  function ensureErrorEl(field, control) {
    if (!field) return null;
    var id = (control && control.id) ? control.id + '-error' : null;
    var existing = id ? document.getElementById(id) : field.querySelector('.field-error');
    if (existing && !field.contains(existing)) existing = field.querySelector('.field-error');
    if (existing) return existing;
    var err = document.createElement('p');
    err.className = 'field-error';
    err.setAttribute('role', 'alert');
    if (id) err.id = id;
    err.hidden = true;
    field.appendChild(err);
    return err;
  }

  function setFieldError(control, message) {
    if (!control) return;
    var field = closestField(control);
    var target = control.classList && control.classList.contains('country-select')
      ? (control._countrySelect && control._countrySelect.getCombobox())
      : control.classList && control.classList.contains('phone-input')
        ? (control._phoneInput && control._phoneInput.getInput())
        : control;

    var err = ensureErrorEl(field, target || control);
    if (field) field.classList.toggle('has-error', !!message);

    if (target) {
      if (message) {
        target.setAttribute('aria-invalid', 'true');
        if (err && err.id) {
          var described = (target.getAttribute('aria-describedby') || '')
            .split(/\s+/)
            .filter(Boolean);
          if (described.indexOf(err.id) === -1) described.push(err.id);
          target.setAttribute('aria-describedby', described.join(' '));
        }
      } else {
        target.setAttribute('aria-invalid', 'false');
      }
    }

    if (err) {
      if (message) {
        err.textContent = message;
        err.hidden = false;
      } else {
        err.textContent = '';
        err.hidden = true;
      }
    }
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.has-error').forEach(function (el) {
      el.classList.remove('has-error');
    });
    form.querySelectorAll('.field-error').forEach(function (el) {
      el.textContent = '';
      el.hidden = true;
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
      el.setAttribute('aria-invalid', 'false');
    });
  }

  function countryCodes() {
    return (global.PullerCountries && global.PullerCountries.ISO_CODES) || [];
  }

  function validateCountry(root) {
    var api = root && root._countrySelect;
    var code = api ? api.getValue() : '';
    var list = countryCodes();
    if (!code) {
      setFieldError(root, 'Please select a country.');
      return false;
    }
    if (list.indexOf(code) === -1) {
      setFieldError(root, 'Please select a valid country.');
      return false;
    }
    setFieldError(root, '');
    return true;
  }

  function validatePhone(root) {
    var api = root && root._phoneInput;
    if (!api) {
      setFieldError(root, 'Phone number is required.');
      return false;
    }
    var value = api.getValue();
    if (!value) {
      setFieldError(root, 'Phone number is required.');
      return false;
    }
    var ok = api.validate();
    if (!ok) {
      var field = closestField(root);
      if (field) field.classList.add('has-error');
      return false;
    }
    setFieldError(root, '');
    return true;
  }

  function validateEmail(input) {
    var value = (input.value || '').trim();
    if (!value) {
      setFieldError(input, 'Email is required.');
      return false;
    }
    if (!EMAIL_RE.test(value)) {
      setFieldError(input, 'Enter a valid email address.');
      return false;
    }
    setFieldError(input, '');
    return true;
  }

  function validateRequiredText(input, label) {
    var value = (input.value || '').trim();
    if (!value) {
      setFieldError(input, (label || 'This field') + ' is required.');
      return false;
    }
    setFieldError(input, '');
    return true;
  }

  function firstInvalid(form) {
    return form.querySelector(
      '.has-error .country-select__input, .has-error .phone-input__number, .has-error input:not([type="hidden"]), .has-error select, .has-error textarea'
    );
  }

  function validateContactForm(form) {
    clearFormErrors(form);
    var ok = true;

    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var company = form.querySelector('[name="company"]');
    var message = form.querySelector('[name="message"]');
    var country = form.querySelector('.country-select');
    var phone = form.querySelector('.phone-input');

    if (name && !validateRequiredText(name, 'Name')) ok = false;
    if (email && !validateEmail(email)) ok = false;
    if (company && !validateRequiredText(company, 'Company name')) ok = false;
    if (country && !validateCountry(country)) ok = false;
    if (phone && !validatePhone(phone)) ok = false;
    if (message && !validateRequiredText(message, 'Message')) ok = false;

    return ok;
  }

  function validateDealerForm(form) {
    clearFormErrors(form);
    var ok = true;

    var business = form.querySelector('[name="company"], [name="business_name"]');
    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var city = form.querySelector('[name="city"], [name="region"]');
    var country = form.querySelector('.country-select');
    var phone = form.querySelector('.phone-input');
    var message = form.querySelector('[name="message"]');

    if (business && !validateRequiredText(business, 'Name')) ok = false;
    if (name && !validateRequiredText(name, 'Name')) ok = false;
    if (email && !validateEmail(email)) ok = false;
    if (country && !validateCountry(country)) ok = false;
    if (city && !validateRequiredText(city, 'City / region')) ok = false;
    if (phone && !validatePhone(phone)) ok = false;
    if (message && message.hasAttribute('required') && !validateRequiredText(message, 'Message')) ok = false;

    return ok;
  }

  function formPayload(form) {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      data[key] = typeof value === 'string' ? value.trim() : value;
    });
    form.querySelectorAll('.country-select').forEach(function (root) {
      if (root._countrySelect) data.country = root._countrySelect.getValue() || data.country || '';
    });
    form.querySelectorAll('.phone-input').forEach(function (root) {
      if (root._phoneInput) data.phone = root._phoneInput.getValue() || data.phone || '';
    });
    return data;
  }

  function resetFormControls(form) {
    form.reset();
    form.querySelectorAll('.country-select').forEach(function (root) {
      if (root._countrySelect) root._countrySelect.reset();
    });
    form.querySelectorAll('.phone-input').forEach(function (root) {
      if (root._phoneInput) root._phoneInput.reset();
    });
    clearFormErrors(form);
  }

  function bindContactForm(form) {
    if (!form || form.dataset.formsBound === '1') return;
    form.dataset.formsBound = '1';
    var status = form.querySelector('#formStatus, .form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validateContactForm(form);
      if (!ok) {
        if (status) status.textContent = '';
        var bad = firstInvalid(form);
        if (bad) bad.focus();
        return;
      }

      if (status) status.textContent = 'Sending…';
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload(form))
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data.error || 'Unable to send message.');
            return data;
          });
        })
        .then(function () {
          if (status) status.textContent = 'Thank you! Our team will get back to you shortly.';
          resetFormControls(form);
        })
        .catch(function (err) {
          if (status) status.textContent = err.message || 'Unable to send message. Please try again.';
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function bindDealerForm(form) {
    if (!form || form.dataset.formsBound === '1') return;
    form.dataset.formsBound = '1';
    var status = form.querySelector('#applyStatus, #dealerStatus, .apply-status, .form-status');
    var formView = document.getElementById('applyFormView');
    var successView = document.getElementById('applySuccessView');
    var modal = document.getElementById('applyModal');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validateDealerForm(form);
      if (!ok) {
        if (status) {
          status.classList.add('is-error');
          status.textContent = 'Please complete all required fields with valid details.';
        }
        var bad = firstInvalid(form);
        if (bad) bad.focus();
        return;
      }

      if (status) {
        status.classList.remove('is-error');
        status.textContent = 'Sending…';
      }
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload(form))
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data.error || 'Unable to submit application.');
            return data;
          });
        })
        .then(function () {
          if (formView && successView) {
            formView.hidden = true;
            successView.hidden = false;
            if (modal) modal.setAttribute('aria-labelledby', 'applySuccessTitle');
            var done = successView.querySelector('[data-apply-close]');
            if (done) done.focus();
            return;
          }

          if (status) {
            status.classList.remove('is-error');
            status.textContent = 'Thank you. Our dealer team will review your details and contact you within one business day.';
          }
          resetFormControls(form);
        })
        .catch(function (err) {
          if (status) {
            status.classList.add('is-error');
            status.textContent = err.message || 'Unable to submit application. Please try again.';
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function init() {
    document.querySelectorAll('#contactForm, form[data-form="contact"]').forEach(function (form) {
      if (form.dataset.pullerBound === '1') return;
      form.dataset.pullerBound = '1';
      bindContactForm(form);
    });
    document.querySelectorAll('#applyForm, #dealerForm, form[data-form="dealer"]').forEach(function (form) {
      if (form.dataset.pullerBound === '1') return;
      form.dataset.pullerBound = '1';
      bindDealerForm(form);
    });
  }

  global.PullerForms = {
    init: init,
    validateContactForm: validateContactForm,
    validateDealerForm: validateDealerForm,
    clearFormErrors: clearFormErrors
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
