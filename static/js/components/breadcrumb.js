function renderBreadcrumb(location) {

    const html = location.GeoInfo.Breadcrumbs
        .map(b => `
            <a href="${getCategoryUrl(b)}">
                ${b.Name}
            </a>
        `)
        .join(' <span class="separator">›</span> ');

    document.getElementById("breadcrumb").innerHTML = html;
}

function getCategoryUrl(breadcrumb) {

    let parts = [...breadcrumb.Display];

    // remove numeric location id
    if (/^\d+$/.test(parts[parts.length - 1])) {
        parts.pop();
    }

    return "/all/" + parts.join("/");
}