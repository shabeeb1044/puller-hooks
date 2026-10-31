/**
 * Searchable country combobox for <div class="country-select" data-name="country">.
 * Dispatches "countrychange" with detail { code, name, dialCode, flagClass }.
 */
(function (global) {
  'use strict';

  var uid = 0;

  function countries() {
    if (!global.PullerCountries || typeof global.PullerCountries.buildCountries !== 'function') {
      return [];
    }
    return global.PullerCountries.buildCountries();
  }

  function createEl(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'text') el.textContent = attrs[key];
        else if (key === 'html') el.innerHTML = attrs.html;
        else if (attrs[key] === false || attrs[key] == null) return;
        else el.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) el.appendChild(child);
    });
    return el;
  }

  function initCountrySelect(root) {
    if (!root || root.dataset.ready === '1') return null;
    root.dataset.ready = '1';

    var name = root.getAttribute('data-name') || 'country';
    var inputId = root.getAttribute('data-input-id') || (name + '-combobox-' + (++uid));
    var listId = inputId + '-listbox';
    var placeholder = root.getAttribute('data-placeholder') || 'Select a country';
    var required = root.hasAttribute('data-required') || root.getAttribute('aria-required') === 'true';
    var all = countries();
    var filtered = all.slice();
    var selected = null;
    var activeIndex = -1;
    var open = false;
    var letterFilter = '';

    function firstLetter(name) {
      var ch = String(name || '').charAt(0);
      if (!ch) return '';
      try {
        ch = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      } catch (err) { /* older engines without normalize */ }
      return ch.toUpperCase();
    }

    var lettersPresent = {};
    all.forEach(function (c) {
      var ch = firstLetter(c.name);
      if (ch >= 'A' && ch <= 'Z') lettersPresent[ch] = true;
    });

    root.classList.add('country-select');
    root.innerHTML = '';

    var trigger = createEl('div', { class: 'country-select__trigger' });
    var flagHost = createEl('span', {
      class: 'country-select__flag',
      'aria-hidden': 'true'
    });
    var combo = createEl('input', {
      type: 'text',
      id: inputId,
      class: 'country-select__input',
      role: 'combobox',
      'aria-expanded': 'false',
      'aria-controls': listId,
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      autocomplete: 'country-name',
      placeholder: placeholder,
      'aria-required': required ? 'true' : 'false'
    });
    var chevron = createEl('span', {
      class: 'country-select__chevron',
      'aria-hidden': 'true',
      text: '▾'
    });
    trigger.append(flagHost, combo, chevron);

    var panel = createEl('div', {
      class: 'country-select__panel',
      hidden: 'hidden'
    });
    var search = createEl('input', {
      type: 'search',
      class: 'country-select__search',
      placeholder: 'Search country or code',
      'aria-label': 'Filter countries',
      autocomplete: 'off'
    });

    var alpha = createEl('div', {
      class: 'country-select__alpha',
      role: 'group',
      'aria-label': 'Filter by letter'
    });
    var allBtn = createEl('button', {
      type: 'button',
      class: 'country-select__letter is-active',
      'data-letter': '',
      'aria-pressed': 'true',
      text: 'All'
    });
    alpha.appendChild(allBtn);
    for (var i = 0; i < 26; i++) {
      var letter = String.fromCharCode(65 + i);
      var has = !!lettersPresent[letter];
      var btn = createEl('button', {
        type: 'button',
        class: 'country-select__letter' + (has ? '' : ' is-empty'),
        'data-letter': letter,
        'aria-pressed': 'false',
        'aria-label': 'Countries starting with ' + letter,
        disabled: has ? false : 'disabled',
        text: letter
      });
      alpha.appendChild(btn);
    }

    var listbox = createEl('ul', {
      id: listId,
      class: 'country-select__list',
      role: 'listbox',
      'aria-label': 'Countries'
    });
    panel.append(search, alpha, listbox);

    var hidden = createEl('input', {
      type: 'hidden',
      name: name,
      value: '',
      'aria-hidden': 'true'
    });
    if (required) hidden.setAttribute('required', '');

    root.append(trigger, panel, hidden);

    function setFlag(flagClass) {
      flagHost.innerHTML = '';
      if (!flagClass) return;
      var span = createEl('span', { class: flagClass, 'aria-hidden': 'true' });
      flagHost.appendChild(span);
    }

    function optionLabel(country) {
      return country.dialCode
        ? country.name + ' (' + country.dialCode + ')'
        : country.name;
    }

    function syncActiveDescendant() {
      if (activeIndex < 0 || activeIndex >= filtered.length) {
        combo.removeAttribute('aria-activedescendant');
        return;
      }
      combo.setAttribute('aria-activedescendant', listId + '-opt-' + filtered[activeIndex].code);
    }

    function renderList() {
      listbox.innerHTML = '';
      if (!filtered.length) {
        var empty = createEl('li', {
          class: 'country-select__empty',
          role: 'presentation',
          text: 'No countries match'
        });
        listbox.appendChild(empty);
        activeIndex = -1;
        syncActiveDescendant();
        return;
      }

      filtered.forEach(function (country, index) {
        var isSelected = selected && selected.code === country.code;
        var option = createEl('li', {
          id: listId + '-opt-' + country.code,
          class: 'country-select__option' + (isSelected ? ' is-selected' : '') + (index === activeIndex ? ' is-active' : ''),
          role: 'option',
          'aria-selected': isSelected ? 'true' : 'false',
          'data-code': country.code
        });
        var flag = createEl('span', {
          class: country.flagClass + ' country-select__option-flag',
          'aria-hidden': 'true'
        });
        var label = createEl('span', {
          class: 'country-select__option-label',
          text: optionLabel(country)
        });
        option.append(flag, label);
        option.addEventListener('mousedown', function (e) {
          e.preventDefault();
          selectCountry(country, true);
        });
        listbox.appendChild(option);
      });
      syncActiveDescendant();
      scrollActiveIntoView();
    }

    function scrollActiveIntoView() {
      var active = listbox.querySelector('.is-active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function syncLetterButtons() {
      var buttons = alpha.querySelectorAll('.country-select__letter');
      buttons.forEach(function (btn) {
        var on = (btn.getAttribute('data-letter') || '') === letterFilter;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      scrollLetterIntoView();
    }

    function scrollLetterIntoView() {
      var active = alpha.querySelector('.country-select__letter.is-active');
      if (active && typeof active.scrollIntoView === 'function') {
        active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    }

    function applyFilter(query) {
      var raw = (query || '').trim();
      var q = raw.toLowerCase();

      // Single A–Z letter → letter-based country list (same as alphabet buttons).
      if (/^[a-zA-Z]$/.test(raw)) {
        letterFilter = raw.toUpperCase();
        syncLetterButtons();
        filtered = all.filter(function (c) {
          return firstLetter(c.name) === letterFilter;
        });
      } else if (!q) {
        filtered = all.filter(function (c) {
          if (!letterFilter) return true;
          return firstLetter(c.name) === letterFilter;
        });
      } else {
        // Free-text search: match name / ISO code / dial code; starts-with first.
        letterFilter = '';
        syncLetterButtons();
        var dialQ = q.replace(/^\+/, '');
        filtered = all.filter(function (c) {
          var name = c.name.toLowerCase();
          var code = c.code.toLowerCase();
          var dial = (c.dialCode || '').replace(/^\+/, '');
          return name.indexOf(q) !== -1
            || code.indexOf(q) !== -1
            || (dial && dial.indexOf(dialQ) !== -1);
        });
        filtered.sort(function (a, b) {
          var aStart = a.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
          var bStart = b.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
          if (aStart !== bStart) return aStart - bStart;
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
      }

      activeIndex = filtered.length ? 0 : -1;
      renderList();
    }

    function setLetter(letter) {
      letterFilter = letter || '';
      // Letter chips own the filter; clear search so results stay letter-based.
      if (search.value) search.value = '';
      syncLetterButtons();
      applyFilter('');
    }

    function setOpen(next) {
      open = next;
      combo.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        panel.removeAttribute('hidden');
        root.classList.add('is-open');
        applyFilter(search.value);
        setTimeout(function () { search.focus(); }, 0);
      } else {
        panel.setAttribute('hidden', 'hidden');
        root.classList.remove('is-open');
        search.value = '';
        letterFilter = '';
        syncLetterButtons();
        activeIndex = -1;
        combo.removeAttribute('aria-activedescendant');
      }
    }

    function notifyPhone() {
      var detail = selected
        ? {
            code: selected.code,
            name: selected.name,
            dialCode: selected.dialCode,
            flagClass: selected.flagClass
          }
        : { code: '', name: '', dialCode: '', flagClass: '' };
      root.dispatchEvent(new CustomEvent('countrychange', { bubbles: true, detail: detail }));
    }

    function selectCountry(country, focusCombo) {
      selected = country;
      hidden.value = country.code;
      combo.value = country.name;
      combo.setAttribute('aria-label', 'Country, ' + country.name);
      setFlag(country.flagClass);
      setOpen(false);
      notifyPhone();
      if (focusCombo) combo.focus();
      root.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    }

    function clearSelection() {
      selected = null;
      hidden.value = '';
      combo.value = '';
      combo.removeAttribute('aria-label');
      setFlag('');
      notifyPhone();
    }

    combo.addEventListener('focus', function () {
      if (!open) setOpen(true);
    });

    combo.addEventListener('click', function () {
      if (!open) setOpen(true);
    });

    chevron.addEventListener('mousedown', function (e) {
      e.preventDefault();
      setOpen(!open);
      if (!open) combo.focus();
    });

    search.addEventListener('input', function () {
      // Clearing the search box also clears a letter chip driven by typing.
      if (!(search.value || '').trim()) {
        letterFilter = '';
        syncLetterButtons();
      }
      applyFilter(search.value);
    });

    alpha.addEventListener('click', function (e) {
      var btn = e.target.closest('.country-select__letter');
      if (!btn || btn.disabled) return;
      e.preventDefault();
      setLetter(btn.getAttribute('data-letter') || '');
    });

    function moveActive(delta) {
      if (!filtered.length) return;
      if (!open) setOpen(true);
      activeIndex = (activeIndex + delta + filtered.length) % filtered.length;
      renderList();
    }

    function onKeydown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveActive(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveActive(-1);
      } else if (e.key === 'Enter') {
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          e.preventDefault();
          selectCountry(filtered[activeIndex], true);
        }
      } else if (e.key === 'Escape') {
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          combo.focus();
        }
      } else if (e.key === 'Tab') {
        if (open) setOpen(false);
      }
    }

    combo.addEventListener('keydown', onKeydown);
    search.addEventListener('keydown', onKeydown);

    combo.addEventListener('input', function () {
      if (!open) setOpen(true);
      // Keep panel search in sync so letter typing filters the list immediately.
      search.value = combo.value;
      applyFilter(search.value);
      if (selected && combo.value !== selected.name) {
        selected = null;
        hidden.value = '';
        setFlag('');
        notifyPhone();
      }
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target) && open) setOpen(false);
    });

    var api = {
      root: root,
      getValue: function () { return hidden.value; },
      getSelected: function () { return selected; },
      setValue: function (code) {
        var match = all.find(function (c) { return c.code === code; });
        if (match) selectCountry(match, false);
        else clearSelection();
      },
      reset: function () {
        clearSelection();
        setOpen(false);
        combo.removeAttribute('aria-invalid');
      },
      getCombobox: function () { return combo; },
      getHidden: function () { return hidden; }
    };

    root._countrySelect = api;
    return api;
  }

  function initAll(scope) {
    var roots = (scope || document).querySelectorAll('.country-select');
    var apis = [];
    roots.forEach(function (root) {
      var api = initCountrySelect(root);
      if (api) apis.push(api);
    });
    return apis;
  }

  global.PullerCountrySelect = {
    init: initCountrySelect,
    initAll: initAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
})(typeof window !== 'undefined' ? window : this);
