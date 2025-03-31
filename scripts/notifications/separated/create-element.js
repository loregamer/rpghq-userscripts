const createElement = (tag, attributes = {}, innerHTML = "") => {
  const element = document.createElement(tag);
  Object.assign(element, attributes);
  element.innerHTML = innerHTML;
  return element;
};
