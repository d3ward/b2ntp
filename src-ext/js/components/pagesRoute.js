export function pagesRoute() {
  const link = Array.from(document.querySelectorAll("[topage]"));
  console.debug("[pagesRoute] links found:", link.length, link.map(l => l.getAttribute("topage")));

  if (!link.length) {
    console.warn("[pagesRoute] no [topage] elements found — settings partial may not be in the DOM yet");
    return;
  }

  const navigate = (id) => {
    const activePage = document.querySelector("section.page-active");
    const activeLink = document.querySelector("[topage].menu-active");
    console.debug("[pagesRoute] navigate →", id, "| leaving:", activePage?.id);

    if (activePage) activePage.classList.remove("page-active");
    if (activeLink) activeLink.classList.remove("menu-active");

    const nextPage = document.querySelector(id);
    const nextLink = document.querySelector("[topage='" + id + "']");

    if (!nextPage) console.warn("[pagesRoute] target element not found for selector:", id);
    if (nextPage) nextPage.classList.add("page-active");
    if (nextLink) nextLink.classList.add("menu-active");
  };

  link.forEach(function (page) {
    const id = page.getAttribute("topage");
    page.addEventListener("click", function () {
      navigate(id);
    });
    // These are <a> elements without href, so they neither take focus nor fire
    // click on Enter. tabindex in the markup handles the former; this handles
    // the latter (and Space, which is expected for role="button").
    page.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigate(id);
      }
    });
  });
}
