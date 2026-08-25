let guestCount = 2;

function toggleGuestPopup() {

    let popup = document.getElementById("guest-popup");
    guestCount = window.selectedGuests ?? 2;

    if (!popup) {

        document.body.insertAdjacentHTML(
            "beforeend",
            getGuestPopupHTML()
        );

        popup = document.getElementById("guest-popup");

        document.getElementById("guest-minus").onclick = decreaseGuest;
        document.getElementById("guest-plus").onclick = increaseGuest;
        document.getElementById("guest-clear").onclick = clearGuest;
        document.getElementById("guest-done").onclick = closeGuestPopup;
    }

    const guestField = document.getElementById("guest-field");
    const rect = guestField.getBoundingClientRect();

    popup.style.left = rect.left + "px";
    popup.style.top = rect.bottom + window.scrollY + 10 + "px";

    popup.style.display = "block";

    updateGuestUI();

    document.addEventListener("click", outsideGuestPopup);
}

function outsideGuestPopup(e) {

    const popup = document.getElementById("guest-popup");

    if (
        !popup.contains(e.target) &&
        e.target.id !== "category-guests"
    ) {
        closeGuestPopup();
    }
}

function closeGuestPopup() {

    const popup = document.getElementById("guest-popup");

    if (popup)
        popup.style.display = "none";

    document.removeEventListener("click", outsideGuestPopup);
}

function increaseGuest() {

    guestCount++;

    updateGuestUI();
}

function decreaseGuest() {

    if (guestCount > 0)
        guestCount--;

    updateGuestUI();
}

function clearGuest() {

    guestCount = 0;

    updateGuestUI();
}

function updateGuestUI() {

    document.getElementById("guest-count").innerText = guestCount;

    const guestText = document.getElementById("guest-text");

    if (guestCount === 0) {
        guestText.textContent = "Guests";
    } else if (guestCount === 1) {
        guestText.textContent = "1 Guest";
    } else {
        guestText.textContent = `${guestCount} Guests`;
    }

    window.filterState.guests = guestCount;
    window.selectedGuests = guestCount;
}

function getGuestPopupHTML() {

    return `
<div id="guest-popup" class="guest-popup">

    <div class="guest-row">

        <span>GUESTS</span>

        <button id="guest-minus">−</button>

        <span id="guest-count">2</span>

        <button id="guest-plus">+</button>

    </div>

    <div class="guest-footer">

        <button id="guest-clear">Clear</button>

        <button id="guest-done">Done</button>

    </div>

</div>
`;
}