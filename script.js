/* =========================================================
   HELI — Voice Assistant
   Script
   Sections: Navigation · Waveform · Orb/listening · Mic
   sensitivity · Command chips · History search/clear ·
   Settings controls (sliders, toggles, theme, checkboxes,
   persona) · Reminders (add/filter/check/delete/snooze) ·
   Mini calendar · Completion chart
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navigation ---------- */
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + item.dataset.view).classList.add('active');
    });
  });

  /* ---------- Waveform ---------- */
  const waveform = document.getElementById('waveform');
  const BAR_COUNT = 40;
  for (let i = 0; i < BAR_COUNT; i++) {
    waveform.appendChild(document.createElement('span'));
  }
  const bars = waveform.querySelectorAll('span');
  let listening = false;
  let micSensitivity = 60; // 0-100, controlled by slider

  function animateWave() {
    bars.forEach(b => {
      const amp = listening ? (micSensitivity / 100) : 0;
      const h = listening ? (6 + Math.random() * 46 * amp + 4) : 4;
      b.style.height = h + 'px';
    });
  }
  setInterval(animateWave, 140);
  animateWave();

  /* ---------- Mic sensitivity slider ---------- */
  const micSenseSlider = document.getElementById('micSenseSlider');
  const micSenseOutput = document.getElementById('micSenseOutput');
  if (micSenseSlider) {
    updateRangeFill(micSenseSlider);
    micSenseSlider.addEventListener('input', () => {
      micSensitivity = Number(micSenseSlider.value);
      micSenseOutput.textContent = micSensitivity + '%';
      updateRangeFill(micSenseSlider);
    });
  }

  /* ---------- Orb / listening ---------- */
  const orbBtn = document.getElementById('orbBtn');
  const orbWrap = document.getElementById('orbWrap');
  const orbState = document.getElementById('orbState');
  const historyList = document.getElementById('historyList');

  const responses = {
    email: "Drafting an email — who's it going to?",
    search: 'Searching the web now...',
    remind: 'Sure — what should I remind you about, and when?',
    app: 'Which app would you like me to open?'
  };

  function addHistory(text, tag) {
    const empty = historyList.querySelector('.history-empty');
    if (empty) empty.remove();
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `<div class="history-cmd mono">"<span class="quote">${escapeHtml(text)}</span>"</div>
      <div class="history-time">Just now · ${escapeHtml(tag)}</div>`;
    historyList.insertBefore(el, historyList.firstChild);
  }

  function setListening(on, message) {
    listening = on;
    orbWrap.classList.toggle('listening', on);
    orbState.classList.toggle('live', on);
    orbState.textContent = message || (on ? 'Listening...' : 'Tap to wake HELI, or just say "Hey HELI"');
  }

  orbBtn.addEventListener('click', () => {
    if (!listening) {
      setListening(true, 'Listening...');
      setTimeout(() => {
        setListening(false, 'Got it — working on it now.');
        addHistory("Hey HELI, what's next on my schedule", 'Schedule');
        setTimeout(() => setListening(false), 2400);
      }, 1800);
    } else {
      setListening(false);
    }
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      setListening(true, responses[cmd]);
      setTimeout(() => {
        setListening(false, 'Done — check active tasks.');
        addHistory(chip.textContent.trim(), 'Command');
        setTimeout(() => setListening(false), 2200);
      }, 1400);
    });
  });

  /* ---------- Test wake word button (Settings) ---------- */
  const testWakeBtn = document.getElementById('testWakeBtn');
  if (testWakeBtn) {
    testWakeBtn.addEventListener('click', () => {
      const original = testWakeBtn.textContent;
      testWakeBtn.textContent = 'Listening for wake word...';
      testWakeBtn.disabled = true;
      setTimeout(() => {
        testWakeBtn.textContent = 'Wake word detected ✓';
        setTimeout(() => {
          testWakeBtn.textContent = original;
          testWakeBtn.disabled = false;
        }, 1400);
      }, 1200);
    });
  }

  /* ---------- History search + clear ---------- */
  const historySearch = document.getElementById('historySearch');
  if (historySearch) {
    historySearch.addEventListener('input', () => {
      const q = historySearch.value.trim().toLowerCase();
      historyList.querySelectorAll('.history-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      historyList.innerHTML = '<div class="history-empty">No commands yet — try the orb.</div>';
    });
  }

  /* ---------- Generic range sliders (speech rate, volume) ---------- */
  document.querySelectorAll('input[type="range"][data-live]').forEach(slider => {
    const out = document.getElementById(slider.dataset.live);
    updateRangeFill(slider);
    const suffix = slider.dataset.suffix || '';
    if (out) out.textContent = slider.value + suffix;
    slider.addEventListener('input', () => {
      updateRangeFill(slider);
      if (out) out.textContent = slider.value + suffix;
    });
  });

  function updateRangeFill(slider) {
    const min = Number(slider.min || 0);
    const max = Number(slider.max || 100);
    const pct = ((Number(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', pct + '%');
  }

  /* ---------- Toggles ---------- */
  document.querySelectorAll('[data-toggle]').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });

  /* ---------- Accent theme swatches ---------- */
  document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      document.body.classList.remove('theme-cyan', 'theme-violet', 'theme-amber', 'theme-rose');
      document.body.classList.add('theme-' + sw.dataset.theme);
    });
  });

  /* ---------- Notification category checkboxes ---------- */
  document.querySelectorAll('.check-box').forEach(cb => {
    cb.addEventListener('click', () => {
      const isChecked = cb.classList.toggle('checked');
      cb.innerHTML = isChecked
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>'
        : '';
    });
  });

  /* ---------- Persona tags ---------- */
  document.querySelectorAll('.persona-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.persona-tag').forEach(p => p.classList.remove('selected'));
      tag.classList.add('selected');
    });
  });

  /* ---------- Reminder checkboxes (existing items) ---------- */
  function wireRemCheck(chk) {
    chk.addEventListener('click', () => {
      const isChecked = chk.classList.toggle('checked');
      const title = chk.parentElement.querySelector('.rem-title');
      title.classList.toggle('strike', isChecked);
      chk.innerHTML = isChecked
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>'
        : '';
      applyReminderFilter();
    });
  }
  document.querySelectorAll('.rem-check').forEach(wireRemCheck);

  document.querySelectorAll('.rem-list-item .icon-btn[title="Delete"]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.rem-list-item').remove());
  });
  document.querySelectorAll('.rem-list-item .icon-btn[title="Snooze"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const timeEl = btn.closest('.rem-list-item').querySelector('.rem-time');
      timeEl.textContent += ' (snoozed +1h)';
    });
  });

  /* ---------- Add reminder form ---------- */
  const addRemForm = document.getElementById('addRemForm');
  const remList = document.getElementById('remList');
  if (addRemForm) {
    addRemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('remTextInput').value.trim();
      const date = document.getElementById('remDateInput').value;
      const time = document.getElementById('remTimeInput').value;
      const priority = document.getElementById('remPriorityInput').value;
      if (!text) return;

      const when = [date, time].filter(Boolean).join(' · ') || 'No date set';
      const item = document.createElement('div');
      item.className = 'rem-list-item';
      item.dataset.status = 'pending';
      item.innerHTML = `
        <div class="rem-check" data-checked="0"></div>
        <div class="rem-info">
          <div class="rem-title-row">
            <span class="priority-dot ${priority}"></span>
            <div class="rem-title">${escapeHtml(text)}</div>
          </div>
          <div class="rem-time">${escapeHtml(when)}</div>
        </div>
        <div class="rem-actions">
          <div class="icon-btn" title="Snooze"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg></div>
          <div class="icon-btn" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></div>
        </div>`;
      remList.appendChild(item);

      wireRemCheck(item.querySelector('.rem-check'));
      item.querySelector('.icon-btn[title="Delete"]').addEventListener('click', () => item.remove());
      item.querySelector('.icon-btn[title="Snooze"]').addEventListener('click', () => {
        const timeEl = item.querySelector('.rem-time');
        timeEl.textContent += ' (snoozed +1h)';
      });

      addRemForm.reset();
      applyReminderFilter();
    });
  }

  /* ---------- Reminder filter tabs ---------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  let currentFilter = 'all';
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      applyReminderFilter();
    });
  });

  function applyReminderFilter() {
    document.querySelectorAll('#remList .rem-list-item').forEach(item => {
      const isDone = item.querySelector('.rem-check').classList.contains('checked');
      let show = true;
      if (currentFilter === 'pending') show = !isDone;
      if (currentFilter === 'done') show = isDone;
      item.style.display = show ? '' : 'none';
    });
  }

  /* ---------- Mini calendar (August 2026, today = Aug 2) ---------- */
  const miniCal = document.getElementById('miniCal');
  if (miniCal) {
    const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dows.forEach(d => {
      const el = document.createElement('div');
      el.className = 'dow';
      el.textContent = d;
      miniCal.appendChild(el);
    });
    const firstDayOffset = 6; // Aug 1, 2026 is a Saturday
    const daysInMonth = 31;
    const todayDate = 2;
    const eventDays = [2, 4, 6, 12, 20];
    for (let i = 0; i < firstDayOffset; i++) {
      const el = document.createElement('div');
      el.className = 'day muted';
      miniCal.appendChild(el);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      el.className = 'day';
      if (d === todayDate) el.classList.add('today');
      else if (eventDays.includes(d)) el.classList.add('has-event');
      el.textContent = d;
      miniCal.appendChild(el);
    }
  }

  /* ---------- Completion chart ---------- */
  const chart = document.getElementById('chart');
  if (chart) {
    const chartData = [
      { lbl: 'M', v: 60 }, { lbl: 'T', v: 85 }, { lbl: 'W', v: 40 },
      { lbl: 'T', v: 95 }, { lbl: 'F', v: 70 }, { lbl: 'S', v: 30 }, { lbl: 'S', v: 20 }
    ];
    chartData.forEach(d => {
      const col = document.createElement('div');
      col.className = 'completion-bar';
      col.innerHTML = `<div class="bar" style="height:${d.v * 0.7}px"></div><div class="lbl">${d.lbl}</div>`;
      chart.appendChild(col);
    });
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});
