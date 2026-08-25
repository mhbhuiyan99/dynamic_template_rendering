const SORT_OPTIONS = [
    {
        value: "1",
        label: "Most Popular",
    },
    {
        value: "2",
        label: "Price: Low to High",
    },
    {
        value: "3",
        label: "Price: High to Low",
    },
    {
        value: "4",
        label: "Lowest Rating",
    },
    {
        value: "5",
        label: "Highest Rating",
    },
];

function renderSort() {

    const container =
        document.getElementById("sort-container");

    const currentOrder =
        window.refineConfig.order || "1";

    const options = SORT_OPTIONS
        .map(option => `
            <option
                value="${option.value}"
                ${option.value === currentOrder ? "selected" : ""}>
                ${option.label}
            </option>
        `)
        .join("");

    container.innerHTML = `
        <label class="sort-label">
            Sort By
        </label>

        <select
            id="sort-select"
            class="sort-select">

            ${options}

        </select>
    `;

    document
        .getElementById("sort-select")
        .addEventListener("change", function () {

            const params =
                new URLSearchParams(window.location.search);

            params.set("order", this.value);

            window.location.search = params.toString();
        });
}