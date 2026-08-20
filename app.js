const form = document.getElementById('age-form');
const birthDateInput = document.getElementById('birth-date');
const errorMessage = document.getElementById('date-error');
const result = document.getElementById('result');

const yearsEl = document.getElementById('years');
const detailEl = document.getElementById('age-detail');
const totalMonthsEl = document.getElementById('total-months');
const totalDaysEl = document.getElementById('total-days');
const nextBirthdayEl = document.getElementById('next-birthday');

const today = startOfDay(new Date());
birthDateInput.max = formatDateForInput(today);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorMessage.textContent = '';

  if (!birthDateInput.value) {
    showError('Choose your date of birth.');
    return;
  }

  const birthDate = parseLocalDate(birthDateInput.value);

  if (!birthDate || Number.isNaN(birthDate.getTime())) {
    showError('Enter a valid date.');
    return;
  }

  if (birthDate > today) {
    showError('Date of birth cannot be in the future.');
    return;
  }

  const age = getExactAge(birthDate, today);
  const totalDays = daysBetween(birthDate, today);
  const totalMonths = age.years * 12 + age.months;
  const daysUntilBirthday = getDaysUntilNextBirthday(birthDate, today);

  yearsEl.textContent = age.years.toLocaleString();
  detailEl.textContent = `${age.months} ${pluralize(age.months, 'Month')} · ${age.days} ${pluralize(age.days, 'Day')}`;
  totalMonthsEl.textContent = totalMonths.toLocaleString();
  totalDaysEl.textContent = totalDays.toLocaleString();
  nextBirthdayEl.textContent = daysUntilBirthday === 0 ? 'Today' : `${daysUntilBirthday} ${pluralize(daysUntilBirthday, 'day')}`;

  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function showError(message) {
  errorMessage.textContent = message;
  result.hidden = true;
  birthDateInput.focus();
}

function getExactAge(birthDate, currentDate) {
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let cursor = addYearsClamped(birthDate, years);

  if (cursor > currentDate) {
    years -= 1;
    cursor = addYearsClamped(birthDate, years);
  }

  let months = 0;
  while (months < 11) {
    const nextMonth = addMonthsClamped(cursor, 1);
    if (nextMonth > currentDate) break;
    cursor = nextMonth;
    months += 1;
  }

  return {
    years,
    months,
    days: daysBetween(cursor, currentDate)
  };
}

function addYearsClamped(date, years) {
  const targetYear = date.getFullYear() + years;
  const month = date.getMonth();
  const day = Math.min(date.getDate(), daysInMonth(targetYear, month));
  return new Date(targetYear, month, day);
}

function addMonthsClamped(date, months) {
  const firstOfTarget = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const year = firstOfTarget.getFullYear();
  const month = firstOfTarget.getMonth();
  const day = Math.min(date.getDate(), daysInMonth(year, month));
  return new Date(year, month, day);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getDaysUntilNextBirthday(birthDate, currentDate) {
  let nextBirthday = createBirthdayForYear(birthDate, currentDate.getFullYear());

  if (nextBirthday < currentDate) {
    nextBirthday = createBirthdayForYear(birthDate, currentDate.getFullYear() + 1);
  }

  return daysBetween(currentDate, nextBirthday);
}

function createBirthdayForYear(birthDate, year) {
  if (birthDate.getMonth() === 1 && birthDate.getDate() === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28);
  }

  return new Date(year, birthDate.getMonth(), birthDate.getDate());
}

function daysBetween(startDate, endDate) {
  const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endUtc = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.round((endUtc - startUtc) / 86400000);
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function pluralize(value, word) {
  return value === 1 ? word : `${word}s`;
}
