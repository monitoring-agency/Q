const sidebar = document.getElementById("sidebar");
const topbar = document.getElementById("topbar");
const content = document.getElementById("content");
const toggle = document.getElementById("sidebarToggle");
document.getElementById("sidebarToggle").addEventListener("click", function() {
    if (sidebar.classList.contains("close")) {
        sidebar.classList.remove("close");
    } else {
        sidebar.classList.add("close");
    }
    if (topbar.classList.contains("close")) {
        topbar.classList.remove("close");
    } else {
        topbar.classList.add("close");
    }
    if (content.classList.contains("close")) {
        content.classList.remove("close");
    } else {
        content.classList.add("close");
    }
    if (toggle.classList.contains("close")) {
        toggle.classList.remove("close");
        toggle.classList.add("open");
    } else {
        toggle.classList.add("close");
        toggle.classList.remove("open");
    }
});
