export function initTestimonialsSlider() {
  const slider = document.querySelector(".testimonials-slider");
  const prev = document.querySelector(".testimonials-prev");
  const next = document.querySelector(".testimonials-next");

  if (!slider || !prev || !next) return;

  const slide = (direction) => {
    slider.scrollBy({ left: slider.clientWidth * 0.7 * direction, behavior: "smooth" });
  };

  prev.addEventListener("click", () => slide(-1));
  next.addEventListener("click", () => slide(1));
}
