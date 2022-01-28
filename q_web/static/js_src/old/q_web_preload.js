function preloaderFadeOutInit() {
    const loader = document.getElementById("preloader");
    loader.style.opacity = "0";
    loader.style.transition = "opacity ease-in-out 200ms";
    setTimeout(function () {
        loader.style.display = "none";
    }, 200);
}

window.onload = function () {
    preloaderFadeOutInit();
    const body = document.querySelector("body");
    body.id = "";
}
