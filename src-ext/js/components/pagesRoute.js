export function pagesRoute() {
  const link = Array.from(document.querySelectorAll("[topage]"));
  console.debug("[pagesRoute] links found:", link.length, link.map(l => l.getAttribute("topage")));

  if (!link.length) {
    console.warn("[pagesRoute] no [topage] elements found — settings partial may not be in the DOM yet");
    return;
  }

  const navigate = (id) => {
    const activePage = document.querySelector("section.page-active");
    const activeLink = document.querySelector("[topage].active");
    console.debug("[pagesRoute] navigate →", id, "| leaving:", activePage?.id);

    if (activePage) activePage.classList.remove("page-active");
    if (activeLink) activeLink.classList.remove("active");

    const nextPage = document.querySelector(id);
    const nextLink = document.querySelector("[topage='" + id + "']");

    if (!nextPage) console.warn("[pagesRoute] target element not found for selector:", id);
    if (nextPage) nextPage.classList.add("page-active");
    if (nextLink) nextLink.classList.add("active");
  };

  link.forEach(function (page) {
    const id = page.getAttribute("topage");
    page.addEventListener("click", function () {
      navigate(id);
    });
  });
}
