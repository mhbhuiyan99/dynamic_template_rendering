(() => {
  const defaultGuests = 2;
  const maximumGuests = 30;
  let guestCount = defaultGuests;
  let datePicker;

  function replaceInput(input) {
    const replacement = input.cloneNode(true);
    input.replaceWith(replacement);
    return replacement;
  }

  function closePanels() {
    document
      .querySelectorAll(".property-date-modal, .property-guest-popup")
      .forEach((panel) => {
        panel.style.display = "none";
      });
  }

  function createDateModal() {
    const modal = document.createElement("div");
    modal.className = "property-date-modal";
    modal.innerHTML = `
      <div class="property-date-dialog" role="dialog" aria-modal="true" aria-label="Select dates">
        <div class="property-date-header">
          <h2>Select dates</h2>
          <button type="button" class="property-date-close" aria-label="Close">X</button>
        </div>
        <div class="property-date-body"><input type="text" class="property-date-range"></div>
        <div class="property-date-footer">
          <button type="button" class="property-date-cancel">Cancel</button>
          <button type="button" class="property-date-apply">Apply</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function openDatePicker(input) {
    closePanels();
    const modal = createDateModal();
    const rangeInput = modal.querySelector(".property-date-range");
    datePicker = window.flatpickr(rangeInput, {
      mode: "range",
      inline: true,
      showMonths: window.innerWidth >= 700 ? 2 : 1,
      dateFormat: "Y-m-d",
      minDate: "today",
    });

    modal.style.display = "flex";
    modal.querySelector(".property-date-close").onclick = () => modal.remove();
    modal.querySelector(".property-date-cancel").onclick = () => modal.remove();
    modal.querySelector(".property-date-apply").onclick = () => {
      if (datePicker.selectedDates.length !== 2) {
        window.alert("Please select both check-in and check-out dates.");
        return;
      }

      const [start, end] = datePicker.selectedDates;
      input.value = `${datePicker.formatDate(start, "Y-m-d")} - ${datePicker.formatDate(end, "Y-m-d")}`;
      modal.remove();
    };
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    };
  }

  function createGuestPopup(container, input) {
    const popup = document.createElement("div");
    popup.className = "property-guest-popup";
    popup.innerHTML = `
      <div class="property-guest-row">
        <span>Guests</span>
        <button type="button" class="property-guest-minus" aria-label="Decrease guests">-</button>
        <span class="property-guest-count">${guestCount}</span>
        <button type="button" class="property-guest-plus" aria-label="Increase guests">+</button>
      </div>
      <div class="property-guest-footer">
        <button type="button" class="property-guest-clear">Clear</button>
        <button type="button" class="property-guest-done">Done</button>
      </div>`;
    container.appendChild(popup);

    const count = popup.querySelector(".property-guest-count");
    const update = () => {
      count.textContent = String(guestCount);
      input.value = guestCount ? `${guestCount} Guests` : "";
    };
    popup.querySelector(".property-guest-minus").onclick = () => {
      guestCount = Math.max(1, guestCount - 1);
      update();
    };
    popup.querySelector(".property-guest-plus").onclick = () => {
      guestCount = Math.min(maximumGuests, guestCount + 1);
      update();
    };
    popup.querySelector(".property-guest-clear").onclick = () => {
      guestCount = 0;
      update();
    };
    popup.querySelector(".property-guest-done").onclick = () => {
      popup.style.display = "none";
    };
    return popup;
  }

  function formatDate(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDates(input) {
    const value = input.value.trim();
    if (!value) {
      return null;
    }

    const parts = value.split(/\s+-\s+/);
    if (parts.length !== 2) {
      return null;
    }

    const start = formatDate(parts[0].trim());
    const end = formatDate(parts[1].trim());
    if (
      !start ||
      !end ||
      start < new Date().toISOString().slice(0, 10) ||
      end < start
    ) {
      return null;
    }

    return { start, end };
  }

  function showValidationMessage(message) {
    window.alert(message);
  }

  function submitSearch(event) {
    const button = event.target.closest(".search-submit-btn");
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const search = button.closest(".property-search");
    const locationInput = search?.querySelector(".autocomplete-input");
    const dateInput = search?.querySelector(".datepicker-input");
    const guestInput = search?.querySelector(".auto-guest-input");
    const location = locationInput?.value.trim() || "";
    const guests =
      Number((guestInput?.value || "").replace(/\D/g, "")) || defaultGuests;

    if (!location) {
      showValidationMessage("Please enter a location.");
      locationInput?.focus();
      return;
    }

    const dates = dateInput ? getDates(dateInput) : null;
    if (!dates) {
      showValidationMessage(
        "Please select a valid check-in and check-out date.",
      );
      dateInput?.focus();
      return;
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > maximumGuests) {
      showValidationMessage(
        `Please select between 1 and ${maximumGuests} guests.`,
      );
      guestInput?.focus();
      return;
    }

    const query = new URLSearchParams({
      search: location,
      dateStart: dates.start,
      dateEnd: dates.end,
      pax: String(guests),
    });

    window.location.assign(`/refine?${query.toString()}`);
  }

  function initializeSearchControls() {
    document.querySelectorAll(".property-search").forEach((search) => {
      const locationInput = search.querySelector(".autocomplete-input");
      const dateInput = search.querySelector(".datepicker-input");
      const guestInput = search.querySelector(".auto-guest-input");
      const guestContainer = search.querySelector(".guest-input-container");

      if (!locationInput || !dateInput || !guestInput || !guestContainer) {
        return;
      }

      replaceInput(locationInput);
      const cleanDateInput = replaceInput(dateInput);
      const cleanGuestInput = replaceInput(guestInput);
      cleanGuestInput.value = `${defaultGuests} Guests`;
      const popup = createGuestPopup(guestContainer, cleanGuestInput);

      cleanDateInput.addEventListener("click", (event) => {
        event.stopPropagation();
        openDatePicker(cleanDateInput);
      });
      cleanGuestInput.addEventListener("click", (event) => {
        event.stopPropagation();
        closePanels();
        popup.style.display = "block";
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest(
          ".property-date-dialog, .property-guest-popup, .datepicker-input, .auto-guest-input",
        )
      ) {
        closePanels();
      }
    });
  }

  initializeSearchControls();
  document.addEventListener("click", submitSearch, true);
})();
