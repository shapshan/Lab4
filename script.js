"use strict";

const events = [
  { id: 1, title: "Coffee master class", when: "Mon, 10:00", text: "Learn how to pour a milk and brew espresso" },
  { id: 2, title: "Skyrim Speedrun Competition", when: "Wed, 14:30", text: "Show your skills" },
  { id: 3, title: "Nap time", when: "Fri, 12:00", text: "Take some rest and nap a little" }
];
const registrations = [];
let selectedEvent = null;
let guestsLoading = false;

const body = document.querySelector("body");
const themeBtn = document.querySelector("#theme-btn");
const eventCards = document.querySelector("#event-cards");
const selectedLabel = document.querySelector("#selected-label");
const form = document.querySelector("#reg-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const groupInput = document.querySelector("#group");
const eventInput = document.querySelector("#event-input");
const agreeInput = document.querySelector("#agree");
const nameCount = document.querySelector("#name-count");
const confirmation = document.querySelector("#confirmation");
const registrationList = document.querySelector("#registrations");
const loadBtn = document.querySelector("#load-guests");
const guestStatus = document.querySelector("#guest-status");
const guestList = document.querySelector("#guest-list");

function validateName(value) { return value.trim().length >= 3; }
function validateEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()); }
function validateRequired(value) { return value.trim() !== ""; }

const rules = [
  { input: nameInput, error: "#name-error", check: () => validateName(nameInput.value), message: "Enter at least 3 characters." },
  { input: emailInput, error: "#email-error", check: () => validateEmail(emailInput.value), message: "Enter a valid email, like name@example.com." },
  { input: groupInput, error: "#group-error", check: () => validateRequired(groupInput.value), message: "Select your student group." },
  { input: eventInput, error: "#event-error", check: () => validateRequired(eventInput.value), message: "Select an event using the cards above." },
  { input: agreeInput, error: "#agree-error", check: () => agreeInput.checked, message: "You must agree to the rules." }
];

function showFieldState(rule) {
  const valid = rule.check();
  rule.input.classList.toggle("error", !valid);
  document.querySelector(rule.error).textContent = valid ? "" : rule.message;
  return valid;
}

function validateForm() {
  return rules.map(showFieldState).every(Boolean);
}

function renderEvents() {
  events.forEach(function (ev) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = ev.id;

    const title = document.createElement("h3");
    title.textContent = ev.title;
    const when = document.createElement("span");
    when.className = "when";
    when.textContent = ev.when;
    const text = document.createElement("p");
    text.textContent = ev.text;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "select-btn";
    btn.textContent = "Select";

    card.append(title, when, text, btn);
    eventCards.append(card);
  });
}

function selectEvent(card) {
  document.querySelectorAll(".card.selected-event").forEach(function (c) {
    c.classList.remove("selected-event");
  });
  card.classList.add("selected-event");
  selectedEvent = events.find(function (ev) { return ev.id === Number(card.dataset.id); });
  selectedLabel.textContent = "Selected: " + selectedEvent.title;
  eventInput.value = selectedEvent.title;
  showFieldState(rules[3]);
}

function addRegistration(entry) {
  registrations.push(entry);
  const item = document.createElement("li");
  item.textContent = entry.name + " (" + entry.group + ") registered for " + entry.event + ".";
  registrationList.append(item);
}

function renderGuests(guests) {
  guestList.replaceChildren(); // clear old cards so repeat clicks don't duplicate
  guests.slice(0, 5).forEach(function (g) {
    const card = document.createElement("article");
    card.className = "card";
    const name = document.createElement("h3");
    name.textContent = g.name;
    const email = document.createElement("p");
    email.textContent = g.email;
    const site = document.createElement("p");
    site.textContent = g.website;
    card.append(name, email, site);
    guestList.append(card);
  });
}

async function loadGuests() {
  if (guestsLoading) return;
  guestsLoading = true;
  loadBtn.disabled = true;
  guestStatus.classList.remove("status-error");
  guestStatus.textContent = "Loading guests...";
  guestList.replaceChildren();
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) throw new Error("Request failed with status " + response.status);
    const guests = await response.json();
    renderGuests(guests);
    guestStatus.textContent = "";
  } catch (error) {
    guestStatus.classList.add("status-error");
    guestStatus.textContent = "Could not load guests. Check your connection and try again.";
  } finally {
    guestsLoading = false;
    loadBtn.disabled = false;
  }
}

themeBtn.addEventListener("click", function () {
  const dark = body.classList.toggle("dark");
  themeBtn.textContent = dark ? "Light theme" : "Dark theme";
});

eventCards.addEventListener("click", function (e) {
  const btn = e.target.closest(".select-btn");
  if (btn) selectEvent(btn.closest(".card"));
});

nameInput.addEventListener("input", function () {
  nameCount.textContent = nameInput.value.length;
  if (nameInput.classList.contains("error")) showFieldState(rules[0]);
});
emailInput.addEventListener("input", function () {
  if (emailInput.classList.contains("error")) showFieldState(rules[1]);
});
groupInput.addEventListener("change", function () { showFieldState(rules[2]); });
agreeInput.addEventListener("change", function () { showFieldState(rules[4]); });

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!validateForm()) {
    confirmation.hidden = true;
    return;
  }
  const entry = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    group: groupInput.value,
    event: eventInput.value
  };
  addRegistration(entry);
  confirmation.textContent = "Thank you, " + entry.name + "! You are registered for " + entry.event + ".";
  confirmation.hidden = false;

  form.reset();
  nameCount.textContent = "0";
  eventInput.value = selectedEvent.title; // keep the chosen event for convenience
});

loadBtn.addEventListener("click", loadGuests);

renderEvents();
