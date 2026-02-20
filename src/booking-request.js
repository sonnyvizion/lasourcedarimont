const MODAL_SELECTOR = "[data-booking-request-modal]";

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const ensureModal = () => {
  let modal = document.querySelector(MODAL_SELECTOR);
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "booking-request-modal";
    modal.hidden = true;
    modal.setAttribute("data-booking-request-modal", "");
    modal.innerHTML = `
      <div class="booking-request-backdrop" data-booking-request-close></div>
      <div class="booking-request-panel">
        <button class="booking-request-close" type="button" aria-label="Fermer" data-booking-request-close>✕</button>
        <h3>Demande de réservation</h3>
        <form class="booking-request-form" data-booking-request-form>
          <div class="booking-request-grid">
            <label>
              <span>Arrivée</span>
              <input type="date" data-request-booking="checkin" required />
            </label>
            <label>
              <span>Départ</span>
              <input type="date" data-request-booking="checkout" required />
            </label>
            <label>
              <span>Adultes</span>
              <input type="number" min="1" max="12" step="1" data-request-booking="adults" required />
            </label>
            <label>
              <span>Enfants</span>
              <input type="number" min="0" max="12" step="1" data-request-booking="children" required />
            </label>
            <label>
              <span>Chambres</span>
              <input type="number" min="1" max="8" step="1" data-request-booking="rooms" required />
            </label>
          </div>
          <label>
            <span>Nom</span>
            <input type="text" data-request-input="lastname" required />
          </label>
          <label>
            <span>Prénom</span>
            <input type="text" data-request-input="firstname" required />
          </label>
          <label>
            <span>Message (optionnel)</span>
            <textarea rows="4" data-request-input="message"></textarea>
          </label>
          <button class="btn" type="submit">Envoyer l'email</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  return {
    modal,
    form: modal.querySelector("[data-booking-request-form]"),
    closeButtons: modal.querySelectorAll("[data-booking-request-close]"),
    bookingInputs: {
      checkin: modal.querySelector('[data-request-booking="checkin"]'),
      checkout: modal.querySelector('[data-request-booking="checkout"]'),
      adults: modal.querySelector('[data-request-booking="adults"]'),
      children: modal.querySelector('[data-request-booking="children"]'),
      rooms: modal.querySelector('[data-request-booking="rooms"]')
    },
    lastNameInput: modal.querySelector('[data-request-input="lastname"]'),
    firstNameInput: modal.querySelector('[data-request-input="firstname"]'),
    messageInput: modal.querySelector('[data-request-input="message"]')
  };
};

export const initBookingRequest = ({
  triggersSelector = "[data-booking-request-trigger]",
  getBookingValues = null,
  beforeOpen = null
} = {}) => {
  const triggers = document.querySelectorAll(triggersSelector);
  if (!triggers.length) return null;

  const refs = ensureModal();

  const resolveValues = () => {
    const values = (typeof getBookingValues === "function" ? getBookingValues() : {}) || {};
    return {
      checkin: values.checkin || "",
      checkout: values.checkout || "",
      adults: values.adults || "",
      children: values.children || "",
      rooms: values.rooms || ""
    };
  };

  const updateRecap = () => {
    const values = resolveValues();
    const todayIso = new Date().toISOString().slice(0, 10);
    refs.bookingInputs.checkin.value = values.checkin || "";
    refs.bookingInputs.checkout.value = values.checkout || "";
    refs.bookingInputs.adults.value = values.adults || "2";
    refs.bookingInputs.children.value = values.children || "0";
    refs.bookingInputs.rooms.value = values.rooms || "1";
    refs.bookingInputs.checkin.min = todayIso;
    refs.bookingInputs.checkout.min = refs.bookingInputs.checkin.value || todayIso;
  };

  const openModal = () => {
    updateRecap();
    refs.modal.hidden = false;
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    refs.modal.hidden = true;
    document.body.classList.remove("modal-open");
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (typeof beforeOpen === "function" && beforeOpen({ trigger, event, openModal }) === false) {
        return;
      }
      openModal();
    });
  });

  refs.closeButtons.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !refs.modal.hidden) closeModal();
  });

  refs.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!refs.lastNameInput?.value.trim() || !refs.firstNameInput?.value.trim()) return;
    const values = {
      checkin: refs.bookingInputs.checkin.value || "",
      checkout: refs.bookingInputs.checkout.value || "",
      adults: refs.bookingInputs.adults.value || "",
      children: refs.bookingInputs.children.value || "",
      rooms: refs.bookingInputs.rooms.value || ""
    };
    const lines = [
      "Bonjour,",
      "",
      "Je souhaite demander une réservation :",
      `- Arrivée : ${formatDate(values.checkin)}`,
      `- Départ : ${formatDate(values.checkout)}`,
      `- Adultes : ${values.adults || "-"}`,
      `- Enfants : ${values.children || "-"}`,
      `- Chambres : ${values.rooms || "-"}`,
      "",
      `Nom : ${refs.lastNameInput.value.trim()}`,
      `Prénom : ${refs.firstNameInput.value.trim()}`
    ];
    const extraMessage = refs.messageInput?.value.trim();
    if (extraMessage) lines.push("", "Message :", extraMessage);

    const subject = "Demande de réservation - Source d’Arimont";
    const body = lines.join("\n");
    window.location.href = `mailto:sourcedarimont@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    closeModal();
  });

  refs.bookingInputs.checkin?.addEventListener("change", () => {
    const checkin = refs.bookingInputs.checkin.value;
    const checkout = refs.bookingInputs.checkout.value;
    refs.bookingInputs.checkout.min = checkin || new Date().toISOString().slice(0, 10);
    if (checkin && checkout && checkout <= checkin) {
      const nextDay = new Date(checkin);
      nextDay.setDate(nextDay.getDate() + 1);
      refs.bookingInputs.checkout.value = nextDay.toISOString().slice(0, 10);
    }
  });

  return { openModal, closeModal, updateRecap };
};
