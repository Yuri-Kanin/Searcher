"use strict";

const container = document.querySelector(".container");
const input = container.querySelector(".input");
const autocompletelist = container.querySelector(".autocompletelist");
const repolist = container.querySelector(".repolist");

const elementConstructor = function (elementTag, textContent, elementClass) {
  const element = document.createElement(elementTag);
  if (textContent) {
    element.textContent = textContent;
  }
  if (elementClass) {
    element.classList.add(elementClass);
  }
  return element;
};

const addElementTo = function (element, pointOfAim) {
  pointOfAim.appendChild(element);
};

const debounce = function (func, wait, immediate) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const clearAutocompleteList = function () {
  autocompletelist.innerHTML = "";
};

const searchRepositories = async function () {
  try {
    if (!input.value) {
      clearAutocompleteList();
      return;
    }

    const response = await fetch(`https://api.github.com/search/repositories?q=${input.value}&per_page=5`);

    if (!response.ok) {
      throw new Error("Упс.. что-то пошло не так, перезагрузи страницу и попробуй еще раз!");
    }

    const data = await response.json();
    clearAutocompleteList();

    data.items.forEach((item) => {
      const itemOfRepositories = elementConstructor("li", item.name, "list-group-item");
      itemOfRepositories.classList.add("list-group-item-action");
      addElementTo(itemOfRepositories, autocompletelist);

      itemOfRepositories.addEventListener("click", () => {
        const repoCard = elementConstructor("li", undefined, "list-group-item");
        const repoName = elementConstructor("p", `Name: ${item.name}`);
        const repoOwner = elementConstructor("p", `Owner: ${item.owner.login}`);
        const repoStars = elementConstructor("p", `Stars: ${item.stargazers_count}`);
        const closeButton = elementConstructor("button", undefined, "btn-close");
        closeButton.type = "button";

        [repoName, repoOwner, repoStars, closeButton].forEach((el) => {
          addElementTo(el, repoCard);
        });
        addElementTo(repoCard, repolist);
        input.value = "";
        clearAutocompleteList();

        closeButton.addEventListener("click", () => {
          repolist.removeChild(repoCard);
        });
      });
    });
  } catch (error) {
    alert(error);
  }
};

input.addEventListener("keyup", debounce(searchRepositories, 1000));
