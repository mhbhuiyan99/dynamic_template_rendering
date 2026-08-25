{{template "layouts/header.tpl" .}}
    
<div class="refine-page">

    <main class="container">

        <div id="breadcrumb"></div>

        <div class="page-header">
            <h1 id="page-title">Loading...</h1>
        </div>

        <div class="toolbar">

            <div id="filters"></div>

            <div id="sort-container"></div>

        </div>

        <section
            id="property-container"
            class="property-grid">
        </section>

        <div id="load-more-trigger"></div>

    </main>

</div>



<script>
window.refineConfig = {
    search: "{{.Search}}",
    order: "{{.Order}}"
};
</script>



{{template "layouts/footer.tpl" .}}

<script src="/static/js/components/navbar.js"></script>
<script src="/static/js/components/breadcrumb.js"></script>
<script src="/static/js/components/header.js"></script>

<script src="/static/js/filter.js"></script>
<script src="/static/js/filter_state.js"></script>
<script src="/static/js/refine_reload.js"></script>
<script src="/static/js/filter_modal.js"></script>
<script src="/static/js/date_modal.js"></script>
<script src="/static/js/filter_apply.js"></script>

<script src="/static/js/components/sort.js"></script>

<script src="/static/js/refine.js"></script>