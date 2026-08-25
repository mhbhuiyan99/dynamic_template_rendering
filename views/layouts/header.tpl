<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{.Title}}</title>

    <link rel="stylesheet" href="/static/css/refine.css">
    <link rel="stylesheet" href="/static/css/filter.css">

    <script src="/static/js/guest_model.js"></script>
    <script src="/static/js/components/navbar.js"></script>

    <link rel="stylesheet" href="/static/css/shimmer.css">
    <link rel="stylesheet" href="/static/css/components/property_card.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13"></script>
</head>

<body>

<header class="navbar">
    <div class="navbar-container">

        <nav class="navbar-left">
            <a href="#">FIND A RENTAL</a>
            <a href="#">DESTINATIONS</a>
            <a href="#">ABOUT</a>
        </nav>

        <a href="/" class="navbar-logo">
            <img src="/static/images/logo.png" alt="OwnerDirect">
        </a>

        <div class="navbar-right">

            <select id="currency-select"></select>

            <button class="navbar-menu" type="button">
                <span></span>
                <span></span>
                <span></span>
            </button>

        </div>

    </div>
</header>