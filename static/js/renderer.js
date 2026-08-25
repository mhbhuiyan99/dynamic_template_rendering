let allItems = [];
let renderedCount = 0;
let currentCountryCode = "";
let isLoading = false;
const PAGE_SIZE = 32;

function renderTiles(data, countryCode) {

    currentCountryCode = countryCode;
    const container = document.getElementById("property-container");

    let items = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data.Success && data.Items) {
        items = data.Items;
    } else {
        container.innerHTML = "<p>No properties found.</p>";
        return;
    }

    if (items.length === 0) {

        allItems = [];
        renderedCount = 0;

        container.innerHTML = "<p>No properties found.</p>";

        return;
    }

    allItems = items;

    renderedCount = 0;
    container.innerHTML = "";
    renderNextBatch(countryCode);
}

function renderNextBatch(countryCode) {
    const container = document.getElementById("property-container");
    const nextItems = allItems.slice(renderedCount, renderedCount + PAGE_SIZE);

    nextItems.forEach(item => {
        container.insertAdjacentHTML("beforeend", renderPropertyCard(item, countryCode));
    });

    renderedCount += nextItems.length;

    // initSlider guards itself against double-init, so it's safe to call
    // for every slider currently in the container, not just new ones.
    container.querySelectorAll(".property-slider").forEach(initSlider);
}

window.addEventListener("scroll", () => {
    if (isLoading) {
        return;
    }

    if (
        window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 500 &&
        renderedCount < allItems.length
    ) {
        isLoading = true;
        requestAnimationFrame(() => {
            renderNextBatch(currentCountryCode);
            isLoading = false;
        });
    }
});

const loadMoreObserver = new IntersectionObserver(
    entries => {
        if (entries[0].isIntersecting && renderedCount < allItems.length) {
            renderNextBatch(currentCountryCode);
        }
    },
    { rootMargin: "300px" }
);

const loadMoreTrigger = document.getElementById("load-more-trigger");
if (loadMoreTrigger) {
    loadMoreObserver.observe(loadMoreTrigger);
}

function renderSkeletonCards(count = 32) {
    const container = document.getElementById("property-container");
    container.innerHTML = "";

    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line skeleton-short"></div>
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-medium"></div>
                    <div class="skeleton-line"></div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

/* =========================================================
   PROPERTY IMAGE SLIDER
   ---------------------------------------------------------
   Rules:
   - Every card always shows exactly MIN_SLIDES dots from the
     very first paint (feature image = slide 0, active).
   - No fetch happens until the user clicks Next for the first time.
   - If the real image count (feature + fetched) is under MIN_SLIDES,
     pad with random images from DEMO_IMAGES until MIN_SLIDES is met.
   - State lives on the slider element's dataset:
       currentIndex, loading, loaded, initialized
   ========================================================= */

const MIN_SLIDES = 5;

// Placeholder pool used to pad out properties with too few real images.
// UPDATE THESE PATHS to match whatever demo images actually exist on
// your server — this is a stub, not a real manifest.
const DEMO_IMAGES = [
    "/static/images/demo/demo1.jpg",
    "/static/images/demo/demo2.jpg",
    "/static/images/demo/demo3.jpg",
    "/static/images/demo/demo4.jpg",
    "/static/images/demo/demo5.jpg",
    "/static/images/demo/demo6.jpg",
    "/static/images/demo/demo7.jpg",
    "/static/images/demo/demo8.jpg",
];

// Returns `count` random, non-repeating paths from DEMO_IMAGES.
// Falls back to allowing repeats only if count exceeds the pool size,
// so a small demo set never breaks padding for a property that needs a lot.
function getRandomDemoImages(count) {
    const shuffled = [...DEMO_IMAGES].sort(() => Math.random() - 0.5);

    if (count <= shuffled.length) {
        return shuffled.slice(0, count);
    }

    const result = [];
    while (result.length < count) {
        result.push(shuffled[result.length % shuffled.length]);
    }
    return result;
}

async function fetchPropertyImages(propertyId) {
    try {
        const response = await fetch(`/api/property/images/v1?propertyId=${propertyId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(
            `[PropertySlider] Failed to load images | propertyId=${propertyId}`,
            error
        );
        return null;
    }
}

// Sets up a slider in its baseline state: feature image active,
// MIN_SLIDES dots visible, prev disabled, next enabled. Safe to call
// more than once on the same slider — the initialized flag makes it a no-op
// after the first call, so both renderer.js (dynamic batches) and
// category.js (static server-rendered cards) can call it freely.
function initSlider(slider) {
    if (slider.dataset.initialized === "true") {
        return;
    }
    slider.dataset.initialized = "true";
    slider.dataset.currentIndex = "0";
    slider.dataset.loading = "false";
    slider.dataset.loaded = "false";

    const prevBtn = slider.querySelector(".prev");
    const nextBtn = slider.querySelector(".next");

    prevBtn.disabled = true;
    nextBtn.disabled = false;

    // Baseline dots exist before any fetch — this is the "always 5 dots"
    // requirement. They'll be rebuilt to the true count after loading,
    // which is always >= MIN_SLIDES thanks to demo padding.
    rebuildDots(slider, MIN_SLIDES);

    prevBtn.addEventListener("click", () => handlePrev(slider));
    nextBtn.addEventListener("click", () => handleNext(slider));
}

function createDot(index, slider) {
    const dot = document.createElement("span");
    dot.className = "slider-dot";
    dot.addEventListener("click", () => goToSlide(slider, index));
    return dot;
}

function rebuildDots(slider, totalSlides) {
    const dotsContainer = slider.querySelector(".slider-dots");
    const currentIndex = Number(slider.dataset.currentIndex || 0);

    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
        const dot = createDot(i, slider);
        if (i === currentIndex) {
            dot.classList.add("active");
        }
        dotsContainer.appendChild(dot);
    }
}

async function handleNext(slider) {
    await ensureSliderLoaded(slider);
    const current = Number(slider.dataset.currentIndex);
    goToSlide(slider, current + 1);
}

function handlePrev(slider) {
    const current = Number(slider.dataset.currentIndex);
    goToSlide(slider, current - 1);
}

// Fetches real images exactly once per property. The "loading" flag
// closes the race window where a fast double-click could start a second
// fetch before the first resolves.
async function ensureSliderLoaded(slider) {
    if (slider.dataset.loaded === "true") {
        return;
    }
    if (slider.dataset.loading === "true") {
        return;
    }

    slider.dataset.loading = "true";
    showSliderLoading(slider);

    const propertyId = slider.dataset.propertyId;
    const result = await fetchPropertyImages(propertyId);

    const realImages =
        result && result.Success && Array.isArray(result.Images) ? result.Images : [];

    buildSlider(slider, realImages);

    hideSliderLoading(slider);

    slider.dataset.loaded = "true";
    slider.dataset.loading = "false";
}

function appendSlideImage(slider, insertBeforeEl, src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "property-image slider-image";
    slider.insertBefore(img, insertBeforeEl);
}

// Appends real images after the feature image, then pads with random
// demo images if the real count falls short of MIN_SLIDES. Dots are
// rebuilt once at the end to match the final, true slide count.
function buildSlider(slider, imageNames) {
    const featureImage = slider.querySelector(".property-image");
    const prevBtn = slider.querySelector(".prev");

    if (!featureImage || !prevBtn) {
        return;
    }

    featureImage.classList.add("slider-image", "active");

    const imageBaseURL = featureImage.src.substring(0, featureImage.src.lastIndexOf("/") + 1);

    imageNames.forEach(name => {
        appendSlideImage(slider, prevBtn, imageBaseURL + name, featureImage.alt);
    });

    let totalSlides = slider.querySelectorAll(".slider-image").length;

    if (totalSlides < MIN_SLIDES) {
        const padding = getRandomDemoImages(MIN_SLIDES - totalSlides);
        padding.forEach(src => {
            appendSlideImage(slider, prevBtn, src, featureImage.alt);
        });
        totalSlides = slider.querySelectorAll(".slider-image").length;
    }

    rebuildDots(slider, totalSlides);
}

// Single funnel for every navigation path (buttons and dots both call
// this) so active image, active dot, and button disabled-state can
// never drift out of sync with each other.
function goToSlide(slider, index) {
    const images = slider.querySelectorAll(".slider-image");
    if (images.length === 0) {
        return;
    }
    if (index < 0 || index > images.length - 1) {
        return;
    }
    showSlide(slider, index);
}

function showSlide(slider, index) {
    const images = slider.querySelectorAll(".slider-image");
    const dots = slider.querySelectorAll(".slider-dot");

    images.forEach((img, i) => img.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));

    slider.dataset.currentIndex = index;

    const prevBtn = slider.querySelector(".prev");
    const nextBtn = slider.querySelector(".next");
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === images.length - 1;
}

function showSliderLoading(slider){

    slider
        .querySelector(".slider-loading")
        ?.classList.remove("hidden");

}

function hideSliderLoading(slider){

    slider
        .querySelector(".slider-loading")
        ?.classList.add("hidden");

}