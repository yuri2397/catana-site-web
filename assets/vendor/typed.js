document.querySelectorAll("[data-strings]").forEach(e => {
    var t = e.getAttribute("data-strings").split(", ");
    new Typed(e, {
        strings: t,
        typeSpeed: 40,
        backSpeed: 40,
        backDelay: 1e3,
        loop: !0
    })
});