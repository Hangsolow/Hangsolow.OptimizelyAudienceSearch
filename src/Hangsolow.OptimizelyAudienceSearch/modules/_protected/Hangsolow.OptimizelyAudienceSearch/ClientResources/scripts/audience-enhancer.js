/**
 * Audience Search Enhancer — audience-enhancer.js
 *
 * Dojo AMD module. Injects a real-time search/filter bar into the
 * "Who can see this content?" tooltip that appears when editors personalise
 * content area blocks.
 *
 * How Dojo popup rendering works:
 *   - All popup widgets (.epi-menu--inverted) are pre-rendered in the DOM at
 *     page load with no header content.
 *   - When an editor clicks the audience icon, Dojo populates the widget and
 *     sets style.visibility = "visible" on it — no new DOM node is added.
 *
 * Strategy:
 *   1. In initialize(), attach an attribute MutationObserver to every
 *      existing .epi-menu--inverted element watching for style changes.
 *   2. Also watch body childList for any dynamically added widgets.
 *   3. When a widget becomes visible AND its header reads
 *      "Who can see this content?", inject the search bar.
 *   4. Reset the search bar each time the popup is re-opened.
 */
define([
    "dojo/_base/declare",
    "epi/_Module"
], function (declare, _Module) {

    /* ── Constants ─────────────────────────────────────────────────────── */

    var WIDGET_SELECTOR     = ".epi-menu--inverted";
    var HEADER_ATTACH_POINT = "[data-dojo-attach-point='header']";
    var AUDIENCE_TITLE      = "Who can see this content?";
    var MENU_ROW_SELECTOR   = "tr.dijitMenuItem";
    var LABEL_SELECTOR      = "td.dijitMenuItemLabel";

    /* RTE React dialog (secondary) */
    var RTE_PANEL_SELECTOR  = ".personalized-content";
    var RTE_ITEM_SELECTOR   = ".visitor-group-list-item";

    /* ── SVG icons ──────────────────────────────────────────────────────── */

    var SEARCH_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

    var CLEAR_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    /* ── Filter helpers ─────────────────────────────────────────────────── */

    function applyFilter(container, term) {
        var rows = container.querySelectorAll(MENU_ROW_SELECTOR);
        var norm = term.toLowerCase().trim();
        rows.forEach(function (row) {
            var label = row.querySelector(LABEL_SELECTOR);
            var text  = label ? label.textContent.toLowerCase() : "";
            row.style.visibility = (!norm || text.indexOf(norm) !== -1) ? "visible" : "collapse";
        });
    }

    function resetRowVisibility(container) {
        container.querySelectorAll(MENU_ROW_SELECTOR).forEach(function (row) {
            row.style.visibility = "visible";
        });
    }

    /* ── Inject the search bar into an audience tooltip ─────────────────── */

    function enhanceAudienceWidget(widget) {
        if (widget.dataset.audienceEnhanced === "1") return;
        widget.dataset.audienceEnhanced = "1";
        widget.style.minWidth = "280px";

        var tooltipContainer = widget.querySelector(".epi-dijitTooltipContainer");
        if (!tooltipContainer) return;

        var contentDiv = tooltipContainer.querySelector(".epi-tooltipDialogContent--max-height");
        if (!contentDiv) return;

        /* ── Build the filter row ──────────────────────────────────────── */
        var filterRow = document.createElement("div");
        filterRow.className = "epi-audience-filter-row";

        var wrap = document.createElement("div");
        wrap.style.cssText = "position:relative;display:flex;align-items:center;";

        var iconSpan = document.createElement("span");
        iconSpan.setAttribute("aria-hidden", "true");
        iconSpan.style.cssText =
            "position:absolute;left:8px;top:50%;transform:translateY(-50%);" +
            "pointer-events:none;color:#707070;display:flex;align-items:center;";
        iconSpan.innerHTML = SEARCH_SVG;

        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Filter audiences\u2026";
        input.setAttribute("aria-label", "Filter audiences");
        input.setAttribute("autocomplete", "off");
        input.style.cssText =
            "width:100%;height:32px;padding:0 28px 0 30px;" +
            "border:1px solid #c4c4c4;border-radius:4px;" +
            "font-size:13px;font-family:inherit;color:rgba(0,0,0,.87);" +
            "background:#fff;box-sizing:border-box;outline:none;";

        var clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.setAttribute("aria-label", "Clear filter");
        clearBtn.style.cssText =
            "position:absolute;right:6px;top:50%;transform:translateY(-50%);" +
            "background:none;border:none;cursor:pointer;padding:2px;" +
            "color:#707070;display:none;align-items:center;line-height:1;";
        clearBtn.innerHTML = CLEAR_SVG;

        wrap.appendChild(iconSpan);
        wrap.appendChild(input);
        wrap.appendChild(clearBtn);
        filterRow.appendChild(wrap);

        /* Keep popup open while interacting with filter controls */
        [filterRow, wrap, input, clearBtn].forEach(function (node) {
            node.addEventListener("mousedown", function (e) {
                e.stopPropagation();
            });
            node.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        });

        /*
         * Keep focus in the filter input while selecting rows.
         * Without this, Dojo can close the popup on input blur before the
         * CheckedMenuItem click handler toggles the audience state.
         */
        contentDiv.addEventListener("mousedown", function (e) {
            var row = e.target && e.target.closest ? e.target.closest(MENU_ROW_SELECTOR) : null;
            if (row) {
                e.preventDefault();
            }
        });

        tooltipContainer.insertBefore(filterRow, contentDiv);

        /* ── Focus / blur styling ──────────────────────────────────────── */
        input.addEventListener("focus", function () {
            input.style.borderColor = "#0037ff";
            input.style.boxShadow   = "0 0 0 2px rgba(0,55,255,.12)";
        });
        input.addEventListener("blur", function () {
            input.style.borderColor = "#c4c4c4";
            input.style.boxShadow   = "";
        });

        /* ── Filtering ─────────────────────────────────────────────────── */
        var currentTerm = "";

        function onInput() {
            currentTerm = input.value;
            clearBtn.style.display = currentTerm ? "flex" : "none";
            applyFilter(contentDiv, currentTerm);
        }

        input.addEventListener("input", onInput);

        input.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                input.value = "";
                currentTerm = "";
                clearBtn.style.display = "none";
                resetRowVisibility(contentDiv);
            }
            /* Prevent CMS key handlers from stealing keystrokes */
            e.stopPropagation();
        });

        clearBtn.addEventListener("click", function () {
            input.value = "";
            currentTerm = "";
            clearBtn.style.display = "none";
            resetRowVisibility(contentDiv);
            input.focus();
        });

        /* Re-apply filter if Dojo re-renders the menu rows */
        new MutationObserver(function () {
            if (currentTerm) {
                applyFilter(contentDiv, currentTerm);
            }
        }).observe(contentDiv, { childList: true, subtree: true });

        /* Reset filter when popup is re-opened (widget becomes visible again) */
        new MutationObserver(function () {
            if (widget.style.visibility === "visible" && currentTerm) {
                input.value = "";
                currentTerm = "";
                clearBtn.style.display = "none";
                resetRowVisibility(contentDiv);
            }
        }).observe(widget, { attributes: true, attributeFilter: ["style"] });
    }

    /* ── Try to enhance a widget if it's the audience picker ────────────── */

    function tryEnhanceWidget(widget) {
        if (!widget || widget.dataset.audienceEnhanced === "1") return;
        var header = widget.querySelector(HEADER_ATTACH_POINT);
        if (!header) return;
        if (header.textContent.trim() !== AUDIENCE_TITLE) return;
        enhanceAudienceWidget(widget);
    }

    /* ── Watch a widget; enhance immediately or when it becomes visible ──── */

    function watchWidget(widget) {
        /* Try immediately in case the widget is already populated */
        tryEnhanceWidget(widget);

        /* Watch for Dojo toggling visibility (popup open/close) */
        new MutationObserver(function () {
            if (widget.style.visibility === "visible") {
                tryEnhanceWidget(widget);
            }
        }).observe(widget, { attributes: true, attributeFilter: ["style"] });
    }

    /* ── Secondary: RTE React dialog enhancement ────────────────────────── */

    function enhanceRtePanel(panel) {
        if (panel.dataset.audienceEnhanced === "1") return;
        var items = panel.querySelectorAll(RTE_ITEM_SELECTOR);
        if (!items.length) return;
        panel.dataset.audienceEnhanced = "1";
        var listContainer = items[0].parentElement;
        var wrapper = document.createElement("div");
        wrapper.className = "epi-audience-list-wrapper";
        listContainer.parentNode.insertBefore(wrapper, listContainer);
        wrapper.appendChild(listContainer);
    }

    /* ── Module class ───────────────────────────────────────────────────── */

    return declare([_Module], {

        initialize: function () {
            this.inherited(arguments);

            /* Watch body for dynamically added widgets */
            var bodyObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType !== 1) return;

                        if (node.matches && node.matches(WIDGET_SELECTOR)) {
                            watchWidget(node);
                        } else if (node.querySelector) {
                            node.querySelectorAll(WIDGET_SELECTOR).forEach(watchWidget);
                        }

                        if (node.matches && node.matches(RTE_PANEL_SELECTOR)) {
                            enhanceRtePanel(node);
                        } else if (node.querySelector) {
                            var rte = node.querySelector(RTE_PANEL_SELECTOR);
                            if (rte) enhanceRtePanel(rte);
                        }
                    });
                });
            });

            bodyObserver.observe(document.body, { childList: true, subtree: true });

            /* Startup: watch all pre-rendered widgets for visibility changes */
            document.querySelectorAll(WIDGET_SELECTOR).forEach(watchWidget);
        }

    });
});
