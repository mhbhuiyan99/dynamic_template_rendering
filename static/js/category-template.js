     
    "use strict";

const globalScript = {
  init: function () {
    this.headerScroll();
    this.setDynamicYear();
    this.viewAvailabilityText();
    this.initAccordion();
    this.faqContainer();
    this.isInEditor();
  },

  headerScroll: function () {
    window.onscroll = function () {
      const header = document.getElementById("header");
      const whiteLogo = document.querySelector(".logo1");
      const colorLogo = document.querySelector(".logo2");

      if (!header) {
        return;
      }

      if (
        document.body.scrollTop > 0 ||
        document.documentElement.scrollTop > 0
      ) {
        header.classList.add("scrolling");

        if (whiteLogo && colorLogo) {
          whiteLogo.style.display = "none";
          colorLogo.style.display = "flex";
        }
      } else {
        header.classList.remove("scrolling");

        if (whiteLogo && colorLogo) {
          whiteLogo.style.display = "flex";
          colorLogo.style.display = "none";
        }
      }
    };
  },
  setDynamicYear: function () {
    const yearElement = document.querySelector("#current_year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  },
  viewAvailabilityText: function () {
    const replacements = [
      { id: "tab_view_section", text: "CHECK DATES" },
      { id: "property_tiles_section", text: "CHECK DATES" },
    ];

    replacements.forEach(({ id, text }) => {
      const element = document.getElementById(id);
      if (element) {
        const walk = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let node;
        while ((node = walk.nextNode())) {
          node.textContent = node.textContent.replace(
            /View Availability/g,
            text
          );
        }
      }
    });
  },
  initAccordion: function () {
    const accordionItems = document.querySelectorAll("[data-faq-item]");

    accordionItems.forEach((item) => {
      const header = item.querySelector(".qn-wrap");

      if (header && !header.hasAttribute("data-initialized")) {
        header.setAttribute("data-initialized", "true");

        if (this.isInEditor()) {
          // Create a clickable overlay for editor mode
          const clickOverlay = document.createElement("div");
          clickOverlay.className = "accordion-click-overlay";
          clickOverlay.setAttribute("data-gjs-selectable", "false");
          clickOverlay.setAttribute("data-gjs-hoverable", "false");
          clickOverlay.setAttribute("data-gjs-draggable", "false");

          // Position the overlay where the pseudo-element appears
          header.style.position = "relative";
          header.appendChild(clickOverlay);

          // Add click handler to the overlay specifically
          clickOverlay.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();

            // Close other items
            accordionItems.forEach((otherItem) => {
              if (otherItem !== item) {
                otherItem.classList.remove("active");
              }
            });

            // Toggle current item
            item.classList.toggle("active");
          });
        } else {
          // Regular click handling for published site
          header.addEventListener("click", () => {
            // Close other items
            accordionItems.forEach((otherItem) => {
              if (otherItem !== item) {
                otherItem.classList.remove("active");
              }
            });

            // Toggle current item
            item.classList.toggle("active");
          });
        }
      }
    });

    // Open first item by default if not in editor
    if (accordionItems.length > 0 && !this.isInEditor()) {
      accordionItems[0].classList.add("active");
    }
  },
  faqContainer: function () {
    const faqContainer = document.getElementById("accordion-feeds");
    if (faqContainer) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            this.initAccordion();
          }
        });
      });
      observer.observe(faqContainer, { childList: true, subtree: true });
    }
  },
  isInEditor: function () {
    return (
      window.grapesjs ||
      document.querySelector(".gjs-cv-canvas") ||
      document.body.classList.contains("gjs-dashed")
    );
  },
};

globalScript.init();

document.addEventListener('DOMContentLoaded', function () {
  // Helper function to setup dot click handlers
  function setupDotClicks(dots, cards, onClickCallback) {
    dots.forEach((dot) => {
      dot.addEventListener('click', function () {
        const index = parseInt(this.dataset.index || this.dataset.slide);

        dots.forEach((d) => d.classList.remove('active'));
        this.classList.add('active');

        if (onClickCallback) {
          onClickCallback(index, cards);
        } else {
          cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });
  }

  // Helper function to find closest card to center
  function findCenterCard(cards, container) {
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let activeIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = index;
      }
    });

    return activeIndex;
  }

  // Helper function to setup scroll-based dot updates
  function setupScrollUpdates(container, dots, cards, updateActiveCards = true) {
    container.addEventListener('scroll', function () {
      const activeIndex = findCenterCard(cards, container);

      dots.forEach((d) => d.classList.remove('active'));
      dots[activeIndex].classList.add('active');

      if (updateActiveCards) {
        cards.forEach((c) => c.classList.remove('active'));
        cards[activeIndex].classList.add('active');
      }
    });
  }

  // Why Travelers Love Section
  const cardsContainer = document.getElementById('cardsContainer');
  const dots = document.querySelectorAll('.od-locpg-why-traveler-love-dot');
  const cards = document.querySelectorAll('.od-locpg-why-traveler-love-card');

  if (cardsContainer && dots.length && cards.length) {
    setupDotClicks(dots, cards);
    setupScrollUpdates(cardsContainer, dots, cards, true);
  }

  // Neighborhoods Section
  const neighborhoodsGrid = document.getElementById('neighborhoodsGrid');
  const neighborhoodsDots = document.querySelectorAll('.od-locpage-neighborhoods-dot');
  const neighborhoodsCards = document.querySelectorAll('.od-locpage-neighborhoods-card');

  if (neighborhoodsGrid && neighborhoodsDots.length && neighborhoodsCards.length) {
    setupDotClicks(neighborhoodsDots, neighborhoodsCards);
    setupScrollUpdates(neighborhoodsGrid, neighborhoodsDots, neighborhoodsCards, false);
  }

  // Weather Section
  const weatherContainer = document.querySelector('.od-locpg-weather-desc-container');
  const weatherDots = document.querySelectorAll('.od-locpg-weather-dots-container .dot');
  const weatherCards = document.querySelectorAll('.od-locpg-weather-desc-cards');
  const weatherSections = document.querySelectorAll('.od-locpg-weather-season-section');
  const weatherCardGroups = document.querySelectorAll('.od-locpg-weather-cards-group');

  if (weatherContainer && weatherDots.length && weatherCards.length) {
    let isWeatherClicking = false;

    // Weather has custom click behavior
    setupDotClicks(weatherDots, weatherCards, function (index, cards) {
      isWeatherClicking = true;

      const sectionIndex = Math.floor(index / 2);
      const cardIndex = index % 2;

      weatherSections[sectionIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });

      setTimeout(() => {
        const targetCard = weatherSections[sectionIndex].querySelectorAll(
          '.od-locpg-weather-desc-cards',
        )[cardIndex];
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        setTimeout(() => {
          isWeatherClicking = false;
        }, 500);
      }, 300);
    });

    // Weather has custom scroll behavior
    function updateWeatherDots() {
      if (isWeatherClicking) return;

      let activeIndex = 0;
      let maxVisibility = 0;

      weatherCards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const containerRect = weatherContainer.getBoundingClientRect();

        const visibleWidth = Math.max(
          0,
          Math.min(cardRect.right, containerRect.right) -
            Math.max(cardRect.left, containerRect.left),
        );
        const visibility = visibleWidth / cardRect.width;

        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          activeIndex = index;
        }
      });

      weatherDots.forEach((d) => d.classList.remove('active'));
      if (weatherDots[activeIndex]) {
        weatherDots[activeIndex].classList.add('active');
      }
    }

    weatherContainer.addEventListener('scroll', updateWeatherDots);
    weatherCardGroups.forEach((group) => {
      group.addEventListener('scroll', updateWeatherDots);
    });
  }
});



    (function() {
      let currentLocation = '';
      
      function getTodayLabel() {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const today = new Date();
        return days[today.getDay()] + ' ' + months[today.getMonth()] + ' ' + today.getDate();
      }
      
      function updateLocation() {
        const selectedLocation = localStorage.getItem('selected_location');
        
        if (selectedLocation && selectedLocation !== 'all') {
          if (selectedLocation !== currentLocation) {
            currentLocation = selectedLocation;
            
            const locationSpans = document.querySelectorAll('[data-location-name]');
            locationSpans.forEach(function(span) {
              span.textContent = selectedLocation;
            });
            
            const mapIframe = document.querySelector('#map_component iframe');
            if (mapIframe) {
              const encodedLocation = encodeURIComponent(selectedLocation);
              const newSrc = 'https://maps.google.com/maps?q=' + encodedLocation + '&t=q&z=11&output=embed';
              mapIframe.src = newSrc;
            }
          }
        }
        
        const currentDateElement = document.querySelector('.weekly-weather-current-date');
        if (currentDateElement) {
          currentDateElement.textContent = getTodayLabel();
        }
      }
      
      document.addEventListener('DOMContentLoaded', updateLocation);
      window.addEventListener('storage', function(e) {
        if (e.key === 'selected_location') updateLocation();
      });
      window.addEventListener('locationChanged', updateLocation);
    })();
    var items = document.querySelectorAll('#i51nmf');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){
try{let e=this,t=e.querySelector(".tab-component__tab-container"),a=e.querySelectorAll(".tab-component__options"),n=e.querySelector(".tab-component__dropdown"),l=e.querySelector(".tab-component__dropdown-button"),i=e=>{if(l){var t;let n=a[e];l.textContent=(null===(t=n.textContent)||void 0===t?void 0:t.trim())||""}},o=t=>{var a,l,o,s;null===(a=e.querySelector(".tab-component__options.active"))||void 0===a||a.classList.remove("active"),null===(l=e.querySelector(".tab-component__views.active"))||void 0===l||l.classList.remove("active"),null===(o=e.querySelector(".tab-component__opt-".concat(t)))||void 0===o||o.classList.add("active"),null===(s=e.querySelector(".tab-component__view-".concat(t)))||void 0===s||s.classList.add("active"),i(t),null==n||n.classList.remove("active")},s=[];null==a||a.forEach((e,t)=>{let a=()=>o(t);e.addEventListener("click",a),s.push({element:e,handler:a})});let r=()=>{null==n||n.classList.toggle("active")};null==l||l.addEventListener("click",r);let d=e=>{(null==t?void 0:t.contains(e.target))||null==n||n.classList.remove("active")};document.addEventListener("click",d);let c=()=>{let t=window.innerWidth<=768;if(e.classList.toggle("mobile-view",t),t){let e=Array.from(a).findIndex(e=>e.classList.contains("active"));-1!==e&&i(e)}};return window.addEventListener("resize",c),c(),()=>{s.forEach(e=>{let{element:t,handler:a}=e;t.removeEventListener("click",a)}),null==l||l.removeEventListener("click",r),document.removeEventListener("click",d),window.removeEventListener("resize",c)}}catch(e){console.error("Error in tab script: ",e)}
}.bind(items[i]))();
          }   
function guideSlider() {
  const guidesWrap = document.querySelector('.ptp_guides-wrap');
  const dots = document.querySelectorAll('.ptp_guides-wrap-dots');

  if (!guidesWrap || !dots.length) return;

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const cardWidth = guidesWrap.querySelector('.ptp_guide-card').offsetWidth + 16;
      guidesWrap.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    });
  });

  guidesWrap.addEventListener('scroll', () => {
    const cardWidth = guidesWrap.querySelector('.ptp_guide-card').offsetWidth + 16;
    const scrollLeft = guidesWrap.scrollLeft;
    const activeIndex = Math.round(scrollLeft / cardWidth);

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  });
}

function setupShowMore(tabView) {
  if (!tabView) return;

  const showMoreBtn = tabView.querySelector('.ptp_page-show-more-btn');
  const destinationsList = tabView.querySelector('.destination-list');
  const destinationsWrapper = tabView.querySelector('.destinations-wrapper');

  if (!showMoreBtn || !destinationsList || !destinationsWrapper) return;

  const MAX_ROWS = 6;
  const listItems = destinationsList.querySelectorAll('li');

  if (!listItems.length) return;

  const isVisible =
    tabView.classList.contains('active') || window.getComputedStyle(tabView).display !== 'none';

  if (!isVisible) {
    showMoreBtn.style.display = 'none';
    destinationsWrapper.classList.remove('show-gradient');

    const clonedBtn = showMoreBtn.cloneNode(true);
    showMoreBtn.replaceWith(clonedBtn);

    clonedBtn.addEventListener('click', () => {
      const isExpanded = destinationsList.classList.contains('expanded');
      destinationsList.classList.toggle('expanded', !isExpanded);
      destinationsWrapper.classList.toggle('expanded', !isExpanded);
      clonedBtn.textContent = isExpanded ? 'SHOW MORE' : 'SHOW LESS';
    });
    return;
  }

  showMoreBtn.style.display = 'none';
  destinationsWrapper.classList.remove('show-gradient');
  destinationsList.offsetHeight;

  const rowHeight = listItems[0].offsetHeight;
  const totalHeight = destinationsList.scrollHeight;
  const totalRows = Math.round(totalHeight / rowHeight) - 1;

  if (totalRows < MAX_ROWS) {
    showMoreBtn.style.display = 'none';
    destinationsWrapper.classList.remove('show-gradient');
    return;
  }

  showMoreBtn.style.display = 'inline-flex';
  destinationsWrapper.classList.add('show-gradient');

  if (showMoreBtn.hasAttribute('data-listener-attached')) {
    return;
  }

  showMoreBtn.setAttribute('data-listener-attached', 'true');

  showMoreBtn.addEventListener('click', () => {
    const isExpanded = destinationsList.classList.contains('expanded');
    destinationsList.classList.toggle('expanded', !isExpanded);
    destinationsWrapper.classList.toggle('expanded', !isExpanded);
    showMoreBtn.textContent = isExpanded ? 'SHOW MORE' : 'SHOW LESS';
  });
}

function setupAllTabs() {
  const allTabViews = document.querySelectorAll('.tab-component__views');
  allTabViews.forEach((tabView) => {
    setupShowMore(tabView);
  });
}

document.addEventListener('click', (e) => {
  if (e.target.matches('.tab-component__button')) {
    document.querySelectorAll('.tab-component__button').forEach((btn) => {
      btn.classList.remove('active');
    });

    e.target.classList.add('active');

    document.querySelectorAll('.ptp_page-show-more-btn').forEach((btn) => {
      btn.style.display = 'none';
    });

    document.querySelectorAll('.destinations-wrapper').forEach((wrapper) => {
      wrapper.classList.remove('show-gradient');
    });

    setTimeout(() => {
      setupAllTabs();
    }, 150);

    setTimeout(() => {
      const activeTab = document.querySelector('.tab-component__views.active');
      if (activeTab) {
        setupShowMore(activeTab);
      }
    }, 500);
  }
});


if (window.parent !== window) {
  let mutationTimeout;
  const observer = new MutationObserver((mutations) => {
    const relevantMutation = mutations.some((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        (mutation.target.classList.contains('destination-list') ||
          mutation.target.classList.contains('destinations-wrapper'))
      ) {
        return false;
      }
      return (
        mutation.addedNodes.length ||
        (mutation.attributeName === 'class' &&
          mutation.target.classList.contains('tab-component__views'))
      );
    });

    if (relevantMutation) {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(setupAllTabs, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

  var items = document.querySelectorAll('#iq9x8k, #iun419h');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){
try{let e=this,t=e.querySelector(".tab-component__tab-container"),a=e.querySelectorAll(".tab-component__options"),n=e.querySelector(".tab-component__dropdown"),l=e.querySelector(".tab-component__dropdown-button"),i=e=>{if(l){var t;let n=a[e];l.textContent=(null===(t=n.textContent)||void 0===t?void 0:t.trim())||""}},o=t=>{var a,l,o,s;null===(a=e.querySelector(".tab-component__options.active"))||void 0===a||a.classList.remove("active"),null===(l=e.querySelector(".tab-component__views.active"))||void 0===l||l.classList.remove("active"),null===(o=e.querySelector(".tab-component__opt-".concat(t)))||void 0===o||o.classList.add("active"),null===(s=e.querySelector(".tab-component__view-".concat(t)))||void 0===s||s.classList.add("active"),i(t),null==n||n.classList.remove("active")};null==a||a.forEach((e,t)=>{e.addEventListener("click",()=>o(t))}),null==l||l.addEventListener("click",()=>{null==n||n.classList.toggle("active")}),document.addEventListener("click",e=>{(null==t?void 0:t.contains(e.target))||null==n||n.classList.remove("active")});let s=()=>{let t=window.innerWidth<=768;if(e.classList.toggle("mobile-view",t),t){let e=Array.from(a).findIndex(e=>e.classList.contains("active"));-1!==e&&i(e)}};window.addEventListener("resize",s),s()}catch(e){console.error("Error in tab script: ",e)}
}.bind(items[i]))();
          } 
   
function guideSlider() {
  const guidesWrap = document.querySelector('.ptp_guides-wrap');
  const dots = document.querySelectorAll('.ptp_guides-wrap-dots');

  if (!guidesWrap || !dots.length) return;

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const cardWidth = guidesWrap.querySelector('.ptp_guide-card').offsetWidth + 16 || 16;
      guidesWrap.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    });
  });

  guidesWrap.addEventListener('scroll', () => {
    const cardWidth = guidesWrap.querySelector('.ptp_guide-card').offsetWidth + 16 || 16;
    const scrollLeft = guidesWrap.scrollLeft;
    const activeIndex = Math.round(scrollLeft / cardWidth);

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  });
}

function setupShowMore(tabView) {
  if (!tabView) return;

  const showMoreBtn = tabView.querySelector('.ptp_page-show-more-btn');
  const destinationsList = tabView.querySelector('.destination-list');
  const destinationsWrapper = tabView.querySelector('.destinations-wrapper');

  if (!showMoreBtn || !destinationsList || !destinationsWrapper) return;

  const MAX_ROWS = 6;
  const listItems = destinationsList.querySelectorAll('li');

  if (!listItems.length) return;

  const isVisible =
    tabView.classList.contains('active') || window.getComputedStyle(tabView).display !== 'none';

  if (!isVisible) {
    showMoreBtn.style.display = 'none';
    destinationsWrapper.classList.remove('show-gradient');

    const clonedBtn = showMoreBtn.cloneNode(true);
    showMoreBtn.replaceWith(clonedBtn);

    clonedBtn.addEventListener('click', () => {
      const isExpanded = destinationsList.classList.contains('expanded');
      destinationsList.classList.toggle('expanded', !isExpanded);
      destinationsWrapper.classList.toggle('expanded', !isExpanded);
      clonedBtn.textContent = isExpanded ? 'SHOW MORE' : 'SHOW LESS';
    });
    return;
  }

  showMoreBtn.style.display = 'none';
  destinationsWrapper.classList.remove('show-gradient');
  destinationsList.offsetHeight;

  const rowHeight = listItems[0].offsetHeight;
  const totalHeight = destinationsList.scrollHeight;
  const totalRows = Math.round(totalHeight / rowHeight) - 1;

  if (totalRows < MAX_ROWS) {
    showMoreBtn.style.display = 'none';
    destinationsWrapper.classList.remove('show-gradient');
    return;
  }

  showMoreBtn.style.display = 'inline-flex';
  destinationsWrapper.classList.add('show-gradient');

  if (showMoreBtn.hasAttribute('data-listener-attached')) {
    return;
  }

  showMoreBtn.setAttribute('data-listener-attached', 'true');

  showMoreBtn.addEventListener('click', () => {
    const isExpanded = destinationsList.classList.contains('expanded');
    destinationsList.classList.toggle('expanded', !isExpanded);
    destinationsWrapper.classList.toggle('expanded', !isExpanded);
    showMoreBtn.textContent = isExpanded ? 'SHOW MORE' : 'SHOW LESS';
  });
}

function setupAllTabs() {
  const allTabViews = document.querySelectorAll('.tab-component__views');
  allTabViews.forEach((tabView) => {
    setupShowMore(tabView);
  });
}

document.addEventListener('click', (e) => {
  if (e.target.matches('.tab-component__button')) {
    document.querySelectorAll('.tab-component__button').forEach((btn) => {
      btn.classList.remove('active');
    });

    e.target.classList.add('active');

    document.querySelectorAll('.ptp_page-show-more-btn').forEach((btn) => {
      btn.style.display = 'none';
    });

    document.querySelectorAll('.destinations-wrapper').forEach((wrapper) => {
      wrapper.classList.remove('show-gradient');
    });

    setTimeout(() => {
      setupAllTabs();
    }, 150);

    setTimeout(() => {
      const activeTab = document.querySelector('.tab-component__views.active');
      if (activeTab) {
        setupShowMore(activeTab);
      }
    }, 500);
  }
});

function ptpScriptInit() {
  guideSlider();
  setupAllTabs();
}

ptpScriptInit();

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(ptpScriptInit, 100);
});

if (window.parent !== window) {
  let mutationTimeout;
  const observer = new MutationObserver((mutations) => {
    const relevantMutation = mutations.some((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        (mutation.target.classList.contains('destination-list') ||
          mutation.target.classList.contains('destinations-wrapper'))
      ) {
        return false;
      }
      return (
        mutation.addedNodes.length ||
        (mutation.attributeName === 'class' &&
          mutation.target.classList.contains('tab-component__views'))
      );
    });

    if (relevantMutation) {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(setupAllTabs, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

  var items = document.querySelectorAll('#ibvqnl');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){
try{let e=this,t=e.querySelector(".tab-component__tab-container"),n=e.querySelectorAll(".tab-component__options"),a=e.querySelector(".tab-component__dropdown"),l=e.querySelector(".tab-component__dropdown-button"),i=e=>{if(l){var t;let a=n[e];l.textContent=(null===(t=a.textContent)||void 0===t?void 0:t.trim())||""}},o=t=>{var n,l,o,s;null===(n=e.querySelector(".tab-component__options.active"))||void 0===n||n.classList.remove("active"),null===(l=e.querySelector(".tab-component__views.active"))||void 0===l||l.classList.remove("active"),null===(o=e.querySelector(".tab-component__opt-".concat(t)))||void 0===o||o.classList.add("active"),null===(s=e.querySelector(".tab-component__view-".concat(t)))||void 0===s||s.classList.add("active"),i(t),null==a||a.classList.remove("active")};null==n||n.forEach((e,t)=>{e.addEventListener("click",()=>o(t))}),null==l||l.addEventListener("click",()=>{null==a||a.classList.toggle("active")}),document.addEventListener("click",e=>{(null==t?void 0:t.contains(e.target))||null==a||a.classList.remove("active")});let s=()=>{let t=window.innerWidth<=768;if(e.classList.toggle("mobile-view",t),t){let e=Array.from(n).findIndex(e=>e.classList.contains("active"));-1!==e&&i(e)}};window.addEventListener("resize",s),s()}catch(e){console.error("Error in tab script: ",e)}
}.bind(items[i]))();
          }   var items = document.querySelectorAll('#ise6jc');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){
try{let t;var e=this;let i=this.querySelector(".slider-control");if(!i)return;let n=this.querySelector(".tile-slider"),a=this.querySelectorAll(".tile-container"),o=i.querySelector(".dots-container"),s=i.querySelector(".slider-prev"),r=i.querySelector(".slider-next"),d=0,l=function(){let e=parseInt(n.dataset.per_page,10);(t=window.innerWidth>1024?Math.ceil(a.length/e):window.innerWidth<=1024&&window.innerWidth>575?Math.ceil(a.length/2):a.length)>1?(null==i||i.classList.remove("hidden"),null==i||i.classList.add("pres__flex")):(null==i||i.classList.add("hidden"),null==i||i.classList.remove("pres__flex")),c(),g(),h(),u()},c=()=>{o.innerHTML="";let e=Math.max(0,d-5),i=Math.min(t-e,6);for(let t=e;t<e+i;t++){let e=document.createElement("div");e.classList.add("dot"),e.setAttribute("data-slide",String(t)),e.addEventListener("click",()=>p(t)),o.appendChild(e)}h()},h=()=>{let e=o.querySelectorAll(".dot"),t=d%6;e.forEach((e,i)=>{i===t?e.classList.add("active"):e.classList.remove("active")})},p=e=>{e>=0&&e<t&&(d=e,g(),h(),u())},g=function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,i=e.querySelector(".tiles-wrapper");if(i){let e=i.clientWidth;if(n){let i=-(e*d)+t;n.style.transform="translateX(".concat(i,"px)")}}},u=()=>{0===d?s.classList.add("disable"):s.classList.remove("disable"),d===t-1?r.classList.add("disable"):r.classList.remove("disable")};null==r||r.addEventListener("click",()=>{d<t-1&&(d++,g(),h(),u())}),null==s||s.addEventListener("click",()=>{d>0&&(d--,g(),h(),u())});let m=0,v=!1;null==n||n.addEventListener("touchstart",e=>{v=!0,m=e.touches[0].clientX,n&&(n.style.transition="none")},{passive:!1}),null==n||n.addEventListener("touchmove",e=>{if(!v)return;let t=e.touches[0].clientX-m;g(t),e.preventDefault()},{passive:!1}),null==n||n.addEventListener("touchend",e=>{if(!v)return;v=!1,n&&(n.style.transition="transform 0.3s ease-out");let i=e.changedTouches[0].clientX-m;Math.abs(i)>50&&(i>0&&d>0?d--:i<0&&d<t-1&&d++),g(),h(),u()}),l.bind(this)(),window.addEventListener("resize",()=>l.bind(this)())}catch(e){console.error("Error initializing slider script:",e)}
}.bind(items[i]))();
          } 
function guideSlider() {
  const guidesWrap = document.querySelector('.ptp_guides-wrap');
  const dots = document.querySelectorAll('.ptp_guides-wrap-dots');

  if (!guidesWrap || !dots.length) return;

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const cardWidth = guidesWrap.querySelector('.ptp_guide-card').offsetWidth + 16;
      guidesWrap.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    });
  });

  guidesWrap.addEventListener('scroll', () => {
    const cardWidth = guidesWrap.querySelector('.ptp_guide-card').offsetWidth + 16;
    const scrollLeft = guidesWrap.scrollLeft;
    const activeIndex = Math.round(scrollLeft / cardWidth);

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  });
}

function setupShowMore(tabView) {
  if (!tabView) return;

  const showMoreBtn = tabView.querySelector('.ptp_page-show-more-btn');
  const destinationsList = tabView.querySelector('.destination-list');
  const destinationsWrapper = tabView.querySelector('.destinations-wrapper');

  if (!showMoreBtn || !destinationsList || !destinationsWrapper) return;

  const MAX_ROWS = 6;
  const listItems = destinationsList.querySelectorAll('li');

  if (!listItems.length) return;

  const isVisible =
    tabView.classList.contains('active') || window.getComputedStyle(tabView).display !== 'none';

  if (!isVisible) {
    showMoreBtn.style.display = 'none';
    destinationsWrapper.classList.remove('show-gradient');

    const clonedBtn = showMoreBtn.cloneNode(true);
    showMoreBtn.replaceWith(clonedBtn);

    clonedBtn.addEventListener('click', () => {
      const isExpanded = destinationsList.classList.contains('expanded');
      destinationsList.classList.toggle('expanded', !isExpanded);
      destinationsWrapper.classList.toggle('expanded', !isExpanded);
      clonedBtn.textContent = isExpanded ? 'SHOW MORE' : 'SHOW LESS';
    });
    return;
  }

  showMoreBtn.style.display = 'none';
  destinationsWrapper.classList.remove('show-gradient');
  destinationsList.offsetHeight;

  const rowHeight = listItems[0].offsetHeight;
  const totalHeight = destinationsList.scrollHeight;
  const totalRows = Math.round(totalHeight / rowHeight) - 1;

  if (totalRows < MAX_ROWS) {
    showMoreBtn.style.display = 'none';
    destinationsWrapper.classList.remove('show-gradient');
    return;
  }

  showMoreBtn.style.display = 'inline-flex';
  destinationsWrapper.classList.add('show-gradient');

  if (showMoreBtn.hasAttribute('data-listener-attached')) {
    return;
  }

  showMoreBtn.setAttribute('data-listener-attached', 'true');

  showMoreBtn.addEventListener('click', () => {
    const isExpanded = destinationsList.classList.contains('expanded');
    destinationsList.classList.toggle('expanded', !isExpanded);
    destinationsWrapper.classList.toggle('expanded', !isExpanded);
    showMoreBtn.textContent = isExpanded ? 'SHOW MORE' : 'SHOW LESS';
  });
}

function setupAllTabs() {
  const allTabViews = document.querySelectorAll('.tab-component__views');
  allTabViews.forEach((tabView) => {
    setupShowMore(tabView);
  });
}

document.addEventListener('click', (e) => {
  if (e.target.matches('.tab-component__button')) {
    document.querySelectorAll('.tab-component__button').forEach((btn) => {
      btn.classList.remove('active');
    });

    e.target.classList.add('active');

    document.querySelectorAll('.ptp_page-show-more-btn').forEach((btn) => {
      btn.style.display = 'none';
    });

    document.querySelectorAll('.destinations-wrapper').forEach((wrapper) => {
      wrapper.classList.remove('show-gradient');
    });

    setTimeout(() => {
      setupAllTabs();
    }, 150);

    setTimeout(() => {
      const activeTab = document.querySelector('.tab-component__views.active');
      if (activeTab) {
        setupShowMore(activeTab);
      }
    }, 500);
  }
});

function ptpScriptInit() {
  guideSlider();
  setupAllTabs();
}

ptpScriptInit();

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(ptpScriptInit, 100);
});

if (window.parent !== window) {
  let mutationTimeout;
  const observer = new MutationObserver((mutations) => {
    const relevantMutation = mutations.some((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        (mutation.target.classList.contains('destination-list') ||
          mutation.target.classList.contains('destinations-wrapper'))
      ) {
        return false;
      }
      return (
        mutation.addedNodes.length ||
        (mutation.attributeName === 'class' &&
          mutation.target.classList.contains('tab-component__views'))
      );
    });

    if (relevantMutation) {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(setupAllTabs, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

   var items = document.querySelectorAll('#i029925, #iq24toh, #i7umw5k');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){
try{var e,t;let n=window,a=this,l=(e,t)=>{let n;return function(){for(var a=arguments.length,l=Array(a),i=0;i<a;i++)l[i]=arguments[i];clearTimeout(n),n=setTimeout(()=>e.apply(null,l),t)}};if(null==n?void 0:null===(e=n.propertySearchBtnAdded)||void 0===e?void 0:e.find(e=>e===a))return;(null==n?void 0:n.propertySearchBtnAdded)||(n.propertySearchBtnAdded=[]),n.propertySearchBtnAdded.push(a);let i=e=>{let{container:t,result:n,input:a,className:l}=e;null==n||n.forEach(e=>{var n;let i=document.createElement("span");i.classList.add("pac-item");let o=document.createElement("span");o.classList.add("pac-icon"),o.classList.add(null!==(n=null==e?void 0:e.className)&&void 0!==n?n:l);let s=document.createElement("span");s.textContent=e.description,i.appendChild(o),i.appendChild(s),t.appendChild(i),i.addEventListener("click",t=>{var n;let l=null===(n=t.target)||void 0===n?void 0:n.closest(".pac-container");a.setAttribute("data-property-id",(null==e?void 0:e.Id)||""),a.value=e.description,l.classList.remove("active")})})};(()=>{let e=a.querySelector(".close-btn");null==e||e.addEventListener("click",e=>{var t;let n=null===(t=e.target)||void 0===t?void 0:t.closest(".search-property-wrap"),a=null==n?void 0:n.querySelector(".property-search-input");if(a){let e=localStorage.getItem("selected_location")||"";a.value="all"===e?"":e,(null==n?void 0:n.querySelector(".pac-container")).classList.remove("active"),n.classList.remove("has-value")}}),document.addEventListener("click",e=>{let t=a.querySelector(".pac-container.active");if(!(null==t?void 0:t.contains(e.target))){var n;null==t||null===(n=t.classList)||void 0===n||n.remove("active")}});let t=a.querySelector(".property-search-input"),n=localStorage.getItem("selected_location")||"";t.value="all"===n?"":n,t.addEventListener("input",l(async e=>{var t,n,a;let l=e.target,o=null==l?void 0:l.closest(".search-property-wrap"),s=o.querySelector(".pac-container"),r=s.querySelector(".pac-wrapper");o&&((null==l?void 0:l.value)?o.classList.add("has-value"):o.classList.remove("has-value"));let d=String(window.location.hostname),c=d.includes("canary")?".canary":d.includes("beta")?".beta":".canary",u="https://api".concat(c,".123presto.com/v1");s.classList.remove("active");let p=await fetch("".concat(u,"/auto-complete?location=").concat(e.target.value));s.classList.add("active");let m=[];if(200===p.status){let e=await p.json();m=(m=(null==e?void 0:null===(t=e.predictions)||void 0===t?void 0:t.splice(0,3))||[]).map(e=>({...e,className:"pac-location"})),i({container:r,result:(null==e?void 0:null===(n=e.predictions)||void 0===n?void 0:n.splice(0,3))||[],input:l,className:"pac-location"})}let g=await fetch("".concat(u,"/property/search?feeds=12-11-22-24-26&keyword=").concat(e.target.value,"&limit=6&searchType=name"));if(200===g.status){let e=await g.json();if(null==e?void 0:e.length){r.innerHTML="";let t=null==e?void 0:null===(a=e.splice(0,3))||void 0===a?void 0:a.map(e=>({...e,description:"".concat(null==e?void 0:e.PropertyName,", ").concat(null==e?void 0:e.Display)}));m=m.concat(t)}if(null==m?void 0:m.length)r.innerHTML="",i({container:r,result:m,input:l,className:"pac-property"});else{let e=document.createElement("span");e.classList.add("pac-item"),e.innerHTML="Nothing Found",r.append(e)}}},500))})(),(()=>{document.addEventListener("click",e=>{let t=a.querySelector(".guest-container");if(!(null==t?void 0:t.contains(e.target))){var n;let e=a.querySelector(".search-guest-content.active");null==e||null===(n=e.classList)||void 0===n||n.remove("active")}});let e=a.querySelector(".search-guest-input");null==e||e.addEventListener("click",e=>{var t;(null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".search-input-wrap")).querySelector(".search-guest-content").classList.toggle("active")});let t=a.querySelectorAll(".guest-nav");null==t||t.forEach(e=>{null==e||e.addEventListener("click",e=>{var t;let n=(null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".guest-input-wrap")).querySelector(".guest-count"),a=null==n?void 0:n.innerHTML,l=null==e?void 0:e.target.getAttribute("data-nav"),i=parseInt(a)+parseInt(l);i>0&&(n.innerHTML=i)})});let n=a.querySelector(".guest-clear-btn");null==n||n.addEventListener("click",e=>{var t;let n=null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".search-input-wrap"),a=null==n?void 0:n.querySelector(".search-guest-input"),l=n.querySelector(".search-guest-content"),i=n.querySelector(".guest-count");l.classList.toggle("active"),a.value="",i.innerHTML=0});let l=a.querySelector(".guest-save-btn");null==l||l.addEventListener("click",e=>{var t;let n=null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".search-input-wrap"),a=null==n?void 0:n.querySelector(".search-guest-input"),l=n.querySelector(".search-guest-content"),i=n.querySelector(".guest-count"),o=(null==i?void 0:i.innerHTML)||0;a.value=o,l.classList.toggle("active")})})();let o=e=>{var t;null===(t=a.querySelector(e))||void 0===t||t.addEventListener("click",e=>{var t;null===(t=e.target)||void 0===t||t.closest(".search-property-wrap").classList.toggle("active")})};o(".property-search-button"),o(".close-pop-btn");let s=()=>{var e;let t=null===(e=a.closest("body"))||void 0===e?void 0:e.clientWidth,n=a.querySelector(".property-search-button");if(!n){console.warn("propertySearchButton not found");return}let l=n.getBoundingClientRect(),i=t/2-l.left;a.querySelector(".property-search-content").style.left="".concat(i,"px")};s(),window.addEventListener("resize",()=>{s()}),(()=>{if(!(null==n?void 0:n.HotelDatepicker))return;let e=a.querySelectorAll(".search-datepicker-input");(null==e?void 0:e.length)&&e.forEach(e=>{let t=new n.HotelDatepicker(e,{format:"MMM DD, YY",infoFormat:"YYYY-MM-DD",ariaDayFormat:"YYYY-MM-DD",autoClose:!1,submitButtonName:"submit",inline:!0,clearButton:!0,submitButton:!0,topbarPosition:"bottom"});document.addEventListener("click",e=>{let t=a.querySelector(".datepicker-wrap");if(!(null==t?void 0:t.contains(e.target))){var n;let e=a.querySelector(".datepicker-wrap.active");null==e||null===(n=e.classList)||void 0===n||n.remove("active")}});let l=a.querySelector(".search-datepicker-input");null==l||l.addEventListener("click",e=>{var t;(null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".datepicker-wrap")).classList.toggle("active")});let i=document.getElementById(t.getSubmitButtonId());null==i||i.addEventListener("click",()=>{var e;let t=a.querySelector(".datepicker-wrap");null==t||null===(e=t.classList)||void 0===e||e.remove("active")})})})();let r=e=>{var t;let[n,a,l]=null==e?void 0:null===(t=e.trim())||void 0===t?void 0:t.split(" "),i=new Date("".concat(n," ").concat(a,", 20").concat(l)),o=i.getFullYear(),s=String(i.getMonth()+1).padStart(2,"0"),r=String(i.getDate()).padStart(2,"0");return"".concat(o,"-").concat(s,"-").concat(r)};null===(t=a.querySelector(".search-property-btn"))||void 0===t||t.addEventListener("click",e=>{var t,n;let a=null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".search-property-wrap"),l=a.querySelector(".property-search-input"),i=a.querySelector(".search-datepicker-input"),o=a.querySelector(".search-guest-input"),s=l.getAttribute("data-property-id"),d=[];if(s&&d.push("property=".concat(s)),i){let e=null==i?void 0:null===(n=i.value)||void 0===n?void 0:n.split("-");(null==e?void 0:e.length)>1&&(d.push("dateStart=".concat(r(e[0]))),d.push("dateEnd=".concat(r(e[1]))))}parseInt(null==o?void 0:o.value)>0&&d.push("pax=".concat(null==o?void 0:o.value)),(null==l?void 0:l.value)&&(d.push("search=".concat(l.value)),window.location.href="/refine?".concat(d.join("&&")))})}catch(e){console.error("Error in property search script: ",e)}
}.bind(items[i]))();
          }
          var items = document.querySelectorAll('#ialit8r');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){
var e;let t=window,n=(e,t)=>{let n;return function(){for(var a=arguments.length,l=Array(a),i=0;i<a;i++)l[i]=arguments[i];clearTimeout(n),n=setTimeout(()=>e.apply(null,l),t)}};if(null==t?void 0:null===(e=t.propertySearchAdded)||void 0===e?void 0:e.find(e=>e===this))return;(null==t?void 0:t.propertySearchAdded)||(t.propertySearchAdded=[]),t.propertySearchAdded.push(this);let a="";function l(e){let{container:t,result:n,input:l,className:i}=e;null==n||n.forEach(e=>{var n;let o=document.createElement("span");o.classList.add("pac-item");let s=document.createElement("span");s.classList.add("pac-icon"),s.classList.add(null!==(n=null==e?void 0:e.className)&&void 0!==n?n:i);let r=document.createElement("img");r.src="pac-location"===i?"/static/img/location-marker-icon.svg":"/static/img/property-marker-icon.svg",r.alt="Location Marker",r.style.width="20px",r.style.height="20px",s.appendChild(r);let d=document.createElement("span");d.classList.add("auto-content"),d.textContent=e.description,o.appendChild(s),o.appendChild(d),t.appendChild(o),o.addEventListener("click",t=>{var n;let i=null===(n=t.target)||void 0===n?void 0:n.closest(".pac-container");l.setAttribute("data-property-id",(null==e?void 0:e.Id)||""),l.value=e.description,a=l.value,localStorage.setItem("selected_location",e.description),i.classList.remove("active")})})}(function(){let e=this.querySelectorAll(".close-btn"),t=localStorage.getItem("selected_location")||"",a="all"===t?"":t,i=this.querySelector(".autocomplete-input");i&&a&&(i.value=a||"USA"),null==i||i.addEventListener("click",function(e){var t,n;e.stopPropagation();let a=(null===(t=e.target)||void 0===t?void 0:t.closest(".autocomplete-wrap")).querySelector(".pac-container"),l=a.querySelector(".pac-wrapper");null===this||void 0===this||this.select(),(null==l?void 0:null===(n=l.innerHTML)||void 0===n?void 0:n.trim())&&a.classList.add("active")}),(null==e?void 0:e.length)&&e.forEach(e=>{e.addEventListener("click",()=>{let t=null==e?void 0:e.closest(".autocomplete-wrap");(null==t?void 0:t.querySelector(".autocomplete-input"))&&(t.querySelector(".autocomplete-input").value="",e.classList.remove("active"))})}),null==i||i.addEventListener("input",n(async e=>{var t,n,a,i;let o=e.target,s=null==o?void 0:o.closest(".autocomplete-wrap"),r=s.querySelector(".pac-container"),d=s.querySelector(".autocomplete-input"),c=r.querySelector(".pac-wrapper"),u=s.querySelector(".close-btn");(null==o?void 0:o.value)?(null==u||null===(t=u.classList)||void 0===t||t.add("active"),d.classList.remove("focus-highlight")):null==u||null===(n=u.classList)||void 0===n||n.remove("active");let p=String(window.location.hostname),m=p.includes("canary")?".canary":p.includes("beta")?".beta":"",g="https://api".concat(m,".123presto.com/v1"),v=s.querySelector(".shimmer-wrap-e");if(e.target.value.length>=3){r.classList.add("active"),null==v||v.classList.add("active"),c.innerHTML="";let t=await fetch("".concat(g,"/auto-complete?location=").concat(e.target.value)),n=[];if(200===t.status){let e=await t.json();n=(n=(null==e?void 0:e.predictions)||[]).map(e=>({...e,className:"pac-location"})),l({container:c,result:(null==e?void 0:null===(a=e.predictions)||void 0===a?void 0:a.splice(0,3))||[],input:o,className:"pac-location"}),n.length&&v.classList.remove("active")}let s=await fetch("".concat(g,"/property/search?feeds=12-11-22-24-26&keyword=").concat(e.target.value,"&limit=6&searchType=name"));if(v.classList.remove("active"),200===s.status){let e=await s.json();if(null==e?void 0:e.length){let t=null==e?void 0:null===(i=e.splice(0,3))||void 0===i?void 0:i.map(e=>({...e,description:"".concat(null==e?void 0:e.PropertyName,", ").concat(null==e?void 0:e.Display)}));n=n.concat(t),l({container:c,result:t,input:o,className:"pac-property"})}if(!(null==n?void 0:n.length)){let e=document.createElement("span");e.classList.add("pac-item"),e.innerHTML="Nothing Found",c.append(e)}}}},500)),document.addEventListener("click",e=>{let t=this.querySelector(".pac-container.active");if(!(null==t?void 0:t.contains(e.target))){var n;null==t||null===(n=t.classList)||void 0===n||n.remove("active")}})}).bind(this)(),(function(){document.addEventListener("click",e=>{let t=this.querySelector(".guest-input-container");if(!(null==t?void 0:t.contains(e.target))){var n;let e=this.querySelector(".auto-guest-content.active");null==e||null===(n=e.classList)||void 0===n||n.remove("active")}});let e=this.querySelector(".auto-guest-input");null==e||e.addEventListener("click",e=>{var t;(null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".auto-guest-input-wrap")).querySelector(".auto-guest-content").classList.toggle("active")});let t=this.querySelectorAll(".auto-guest-nav");null==t||t.forEach(e=>{null==e||e.addEventListener("click",e=>{var t;let n=(null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".wrap-guest-input")).querySelector(".guestCount"),a=null==n?void 0:n.innerHTML,l=null==e?void 0:e.target.getAttribute("data-nav"),i=parseInt(a)+parseInt(l);i>0&&(n.innerHTML=i)})});let n=this.querySelector(".guests-clear-btn");null==n||n.addEventListener("click",e=>{var t;let n=null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".auto-guest-input-wrap"),a=null==n?void 0:n.querySelector(".auto-guest-input"),l=n.querySelector(".auto-guest-content"),i=n.querySelector(".guestCount");l.classList.toggle("active"),a.value="",i.innerHTML=0});let a=this.querySelector(".guests-save-btn");null==a||a.addEventListener("click",e=>{var t;let n=null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".auto-guest-input-wrap"),a=null==n?void 0:n.querySelector(".auto-guest-input"),l=n.querySelector(".auto-guest-content"),i=n.querySelector(".guestCount"),o=(null==i?void 0:i.innerHTML)||0;a.value="".concat(o," Persons"),l.classList.toggle("active")})}).bind(this)(),(function(){if(!(null==t?void 0:t.HotelDatepicker))return!1;let e=this.querySelectorAll(".datepicker-input");(null==e?void 0:e.length)&&e.forEach(e=>{let n=new t.HotelDatepicker(e,{format:"MMM DD, YY",infoFormat:"YYYY-MM-DD",ariaDayFormat:"YYYY-MM-DD",autoClose:!1,submitButtonName:"submit",moveBothMonths:!0,inline:!0,clearButton:!0,submitButton:!0,topbarPosition:"bottom"});document.addEventListener("click",e=>{let t=this.querySelector(".datepicker-wrap");if(!(null==t?void 0:t.contains(e.target))){var n;let e=this.querySelector(".datepicker-wrap.active");null==e||null===(n=e.classList)||void 0===n||n.remove("active")}});let a=this.querySelector(".datepicker-input");null==a||a.addEventListener("click",e=>{var t;(null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".datepicker-wrap")).classList.toggle("active")});let l=document.getElementById(n.getSubmitButtonId());null==l||l.addEventListener("click",()=>{var e;let t=this.querySelector(".datepicker-wrap");null==t||null===(e=t.classList)||void 0===e||e.remove("active")})})}).bind(this)();let i=e=>{var t;let[n,a,l]=null==e?void 0:null===(t=e.trim())||void 0===t?void 0:t.split(" "),i=new Date("".concat(n," ").concat(a,", 20").concat(l)),o=i.getFullYear(),s=String(i.getMonth()+1).padStart(2,"0"),r=String(i.getDate()).padStart(2,"0");return"".concat(o,"-").concat(s,"-").concat(r)};this.querySelectorAll(".search-submit-btn").forEach(e=>{null==e||e.addEventListener("click",e=>{var t,n;let l=null==e?void 0:null===(t=e.target)||void 0===t?void 0:t.closest(".property-search"),o=l.querySelector(".autocomplete-input"),s=l.querySelector(".datepicker-input"),r=o.getAttribute("data-property-id"),d=parseInt(l.querySelector(".auto-guest-input").value.replace(/\D/g,"")),c=[];if(r&&c.push("property=".concat(r)),s){let e=null==s?void 0:null===(n=s.value)||void 0===n?void 0:n.split("-");(null==e?void 0:e.length)>1&&(c.push("dateStart=".concat(i(e[0]))),c.push("dateEnd=".concat(i(e[1]))))}d>0&&c.push("pax=".concat(d)),a&&""!==a&&(c.push("search=".concat(o.value)),window.location.href="/refine?".concat(c.join("&&")))})})
}.bind(items[i]))();
          } 