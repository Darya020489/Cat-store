export function createEl(tag, className, content) {
  let el = document.createElement(tag);
  if (className) {
    let classArray = className.split(" ");
    for (let cl of classArray) {
      el.classList.add(cl);
    }
  }
  content ? (el.innerText = content) : null;
  return el;
}