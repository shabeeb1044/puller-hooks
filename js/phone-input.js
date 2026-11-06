/**
 * Phone field with read-only dial-code prefix.
 * Validates with libphonenumber.isValidPhoneNumber(number, countryCode).
 */
(function (global) {
  'use strict';

  var uid = 0;

  function createEl(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'text') el.textContent = attrs[key];
        else if (attrs[key] === false || attrs[key] == null) return;
        else el.setAttribute(key, attrs[key]);
      });
    }
    return el;
  }

  function isValidPhone(number, countryCode) {
    var phone = global.libphonenumber;
    if (!phone || typeof phone.isValidPhoneNumber !== 'function') return false;
    if (!countryCode || !number) return false;
    try {
      return phone.isValidPhoneNumber(number, countryCode);
    } catch (err) {
      return false;
    }
  }

  function initPhoneInput(root) {
    if (!root || root.dataset.ready === '1') return null;
    root.dataset.ready = '1';

    var name = root.getAttribute('data-name') || 'phone';
    var inputId = root.getAttribute('data-input-id') || (name + '-input-' + (++uid));
    var errorId = inputId + '-error';
    var required = root.hasAttribute('data-required');
    var placeholder = root.getAttribute('data-placeholder') || 'Phone number';
    var countryCode = (root.getAttribute('data-country') || '').toUpperCase();
    var dialCode = root.getAttribute('data-dial') || '';

    root.classList.add('phone-input');
    root.innerHTML = '';

    var control = createEl('div', { class: 'phone-input__control' });
    var prefix = createEl('span', {
      class: 'phone-input__prefix',
      'aria-hidden': 'true',
      text: dialCode || '+—'
    });
    var input = createEl('input', {
      type: 'tel',
      id: inputId,
      name: name,
      class: 'phone-input__number',
      inputmode: 'tel',
      autocomplete: 'tel-national',
      placeholder: placeholder,
      'aria-required': required ? 'true' : 'false',
      'aria-describedby': errorId
    });
    if (required) input.setAttribute('required', '');

    var dialHidden = createEl('input', {
      type: 'hidden',
      name: name + '_dial',
      value: dialCode
    });
    var countryHidden = createEl('input', {
      type: 'hidden',
      name: name + '_country',
      value: countryCode
    });

    control.append(prefix, input);
    var error = createEl('p', {
      id: errorId,
      class: 'field-error',
      role: 'alert',
      hidden: 'hidden'
    });

    root.append(control, dialHidden, countryHidden, error);

    function setError(message) {
      if (message) {
        error.textContent = message;
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        root.classList.add('has-error');
      } else {
        error.textContent = '';
        error.hidden = true;
        input.setAttribute('aria-invalid', 'false');
        root.classList.remove('has-error');
      }
    }

    function setCountry(detail) {
      countryCode = (detail && detail.code) || '';
      dialCode = (detail && detail.dialCode) || '';
      prefix.textContent = dialCode || '+—';
      dialHidden.value = dialCode;
      countryHidden.value = countryCode;
      root.setAttribute('data-country', countryCode);
      root.setAttribute('data-dial', dialCode);
      if (input.value.trim()) validate();
      else setError('');
    }

    function validate() {
      var value = input.value.trim();
      if (!value) {
        if (required) {
          setError('Phone number is required.');
          return false;
        }
        setError('');
        return true;
      }
      if (!countryCode) {
        setError(root.hasAttribute('data-independent')
          ? 'Select a WhatsApp dial code first.'
          : 'Select a country first.');
        return false;
      }
      var full = dialCode ? (dialCode + value) : value;
      var ok = isValidPhone(full, countryCode) || isValidPhone(value, countryCode);
      if (!ok) {
        setError('Enter a valid phone number for the selected country.');
        return false;
      }
      setError('');
      return true;
    }

    input.addEventListener('blur', validate);
    input.addEventListener('input', function () {
      if (root.classList.contains('has-error')) validate();
    });

    var api = {
      root: root,
      getInput: function () { return input; },
      getCountry: function () { return countryCode; },
      setCountry: setCountry,
      validate: validate,
      isValid: function () { return validate(); },
      reset: function () {
        input.value = '';
        setError('');
        setCountry({ code: '', dialCode: '' });
      },
      getValue: function () { return input.value.trim(); },
      getE164Candidate: function () {
        var value = input.value.trim();
        if (!value) return '';
        if (value.charAt(0) === '+') return value;
        return (dialCode || '') + value.replace(/^0+/, '');
      }
    };

    root._phoneInput = api;
    return api;
  }

  function initAll(scope) {
    var roots = (scope || document).querySelectorAll('.phone-input');
    var apis = [];
    roots.forEach(function (root) {
      var api = initPhoneInput(root);
      if (api) apis.push(api);
    });
    return apis;
  }

  function wireCountryToPhone(form) {
    if (!form || form.dataset.phoneCountryWired === '1') return;
    form.dataset.phoneCountryWired = '1';

    form.querySelectorAll('.country-select').forEach(function (countryRoot) {
      countryRoot.addEventListener('countrychange', function (e) {
        var detail = e.detail || {};
        var targetId = countryRoot.getAttribute('data-phone-target');

        if (targetId) {
          var target = form.querySelector('.phone-input[data-input-id="' + targetId + '"]');
          if (target && target._phoneInput) target._phoneInput.setCountry(detail);
          return;
        }

        form.querySelectorAll('.phone-input:not([data-independent])').forEach(function (phoneRoot) {
          if (phoneRoot._phoneInput) phoneRoot._phoneInput.setCountry(detail);
        });
      });
    });
  }

  global.PullerPhoneInput = {
    init: initPhoneInput,
    initAll: initAll,
    wireCountryToPhone: wireCountryToPhone,
    isValidPhone: isValidPhone
  };

  function boot() {
    initAll();
    document.querySelectorAll('form').forEach(wireCountryToPhone);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
