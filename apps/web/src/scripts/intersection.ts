export const isElementInView = (
  element: HTMLElement,
  callback: (inView: boolean) => void,
  options?: IntersectionObserverInit,
) => {
  if (!element) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting); // true if element is visible
      });
    },
    options
  );

  observer.observe(element);

  return () => observer.unobserve(element);
}
