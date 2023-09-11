const firstRow = $(".slider .row:first-child");
const secondRow = $(".slider .row:nth-child(2)");
const firstContainer = $(`.slider .row .img-container[data-row=1]`);
const secondContainer = $(`.slider .row .img-container[data-row=2]`);

let slider = {
  firstClick: false,
  controlsActive: true,
  images: [],
  secondContainerInitialOffset: undefined,
  rowInFocus: undefined,
  HTML: undefined,
};

const getAllContainerImages = () => {
  let imageContainers = $(".slider .img-container");

  imageContainers.each((containerIndex, container) => {
    let items = [];
    $(container)
      .children()
      .each((index, item) => {
        items.push(item);
      });
    slider.images[containerIndex] = [...items];
  });
};

const getTwoClosestImagesToTheLeftOfTheBorder = () => {
  const border = getBorderPosition();
  let imagePositions = [];

  $(slider.images).each((containerIndex, imagesContainer) => {
    $(imagesContainer).each((index, item) => {
      let itemRightEdgePosition = $(item).offset().left + $(item).width();

      if (Math.round(border) >= Math.round(itemRightEdgePosition)) {
        imagePositions.push({
          img: item,
          relativePosition: border - itemRightEdgePosition,
        });
      }
    });
  });
  imagePositions.sort((a, b) => a.relativePosition - b.relativePosition);

  return imagePositions.slice(0, 2);
};

const getTwoClosestImagesToTheRightOfTheBorder = () => {
  const border = getBorderPosition();
  let imagePositions = [];

  $(slider.images).each((containerIndex, imagesContainer) => {
    $(imagesContainer).each((index, item) => {
      let itemRightEdgePosition = $(item).offset().left + $(item).width();

      if (Math.round(border) <= Math.round(itemRightEdgePosition)) {
        imagePositions.push({
          img: item,
          relativePosition: itemRightEdgePosition - border,
        });
      }
    });
  });
  imagePositions.sort((a, b) => a.relativePosition - b.relativePosition);

  return imagePositions.slice(0, 2);
};

const changeArrowIcon = () => {
  $(".left-control img").attr("src", "assets/img/arrow-blue-left.png");
};

const getBorderPosition = () => {
  return firstRow.offset().left + firstRow.width();
};

const shiftToRight = () => {
  const closestImages = getTwoClosestImagesToTheLeftOfTheBorder();
  const shiftValue =
    closestImages[1].relativePosition - closestImages[0].relativePosition;

  const firstContainerShift = parseFloat(firstContainer.css("right"));
  const secondContainerShift = parseFloat(secondContainer.css("right"));

  $(".slider .img-container").css("transition", "0.5s");
  firstContainer.css("right", `${firstContainerShift - shiftValue}px`);
  secondContainer.css("right", `${secondContainerShift - shiftValue}px`);
  slider.rowInFocus = $(closestImages[1].img).parent().data("row");
  setTimeout(removeImagesFromFront, 500);
};

const shiftToLeft = () => {
  addImageToFront();
  const closestImages = getTwoClosestImagesToTheRightOfTheBorder();
  const shiftValue =
    closestImages[1].relativePosition - closestImages[0].relativePosition;

  const firstContainerShift = parseFloat(firstContainer.css("right"));
  const secondContainerShift = parseFloat(secondContainer.css("right"));

  $(".slider .img-container").css("transition", "0.5s");
  firstContainer.css("right", `${firstContainerShift + shiftValue}px`);
  secondContainer.css("right", `${secondContainerShift + shiftValue}px`);
  slider.rowInFocus = $(closestImages[1].img).parent().data("row");
  setTimeout(removeImagesFromFront, 500);
};

const addImageToBack = (img) => {
  let rowNumber = $(img).parent().data("row");

  if (rowNumber === 1) {
    firstContainer.append($(img));
  } else {
    secondContainer.append($(img));
  }
};

const addImageToFront = () => {
  let lastImageInFirstContainer = $(slider.images[0].slice(-1));
  let lastImageInSecondContainer = $(slider.images[1].slice(-1));

  let firstContainerOffset = parseFloat(firstContainer.css("right"));
  let secondContainerOffset = parseFloat(secondContainer.css("right"));

  firstContainer.prepend(lastImageInFirstContainer);
  secondContainer.prepend(lastImageInSecondContainer);

  $(lastImageInFirstContainer).addClass("fade-in-image");
  $(lastImageInSecondContainer).addClass("fade-in-image");

  firstContainer.css(
    "right",
    `${firstContainerOffset - lastImageInFirstContainer.width() - 10}px`
  );
  secondContainer.css(
    "right",
    `${secondContainerOffset - lastImageInSecondContainer.width() - 10}px`
  );

  getAllContainerImages();
};

const fillScreen = () => {
  let firstContainerLastImage = $(slider.images[0].slice(-1));
  let secondContainerLastImage = $(slider.images[1].slice(-1));

  if (firstContainerLastImage.offset().left >= -750) {
    firstContainer.append(firstContainer.html());
  }

  if (secondContainerLastImage.offset().left >= -750) {
    secondContainer.append(secondContainer.html());
  }
};

const removeImagesFromFront = () => {
  $(".slider .img-container").css("transition", "unset");
  let toBeRemoved;

  $(slider.images).each((rowIndex, imagesRow) => {
    $(imagesRow).each((index, item) => {
      if ($(item).offset().left > getBorderPosition()) {
        toBeRemoved = item;
      }
    });
  });

  let rowNumber = $(toBeRemoved).parent().data("row");

  if (rowNumber === 1 && slider.rowInFocus === 1)
    $(`.slider .img-container[data-row=${rowNumber}]`).css("right", `0`);
  else if (rowNumber === 2 && slider.rowInFocus === 2)
    $(`.slider .img-container[data-row=${rowNumber}]`).css(
      "right",
      `${slider.secondContainerInitialOffset}px`
    );
  else if (rowNumber === 2 && slider.rowInFocus === 1) {
    let previousOffset = parseFloat(secondContainer.css("right"));
    secondContainer.css(
      "right",
      `${previousOffset + $(toBeRemoved).width() + 10}px`
    );
  } else if (rowNumber === 1 && slider.rowInFocus === 2) {
    let previousOffset = parseFloat(firstContainer.css("right"));
    firstContainer.css(
      "right",
      `${previousOffset + $(toBeRemoved).width() + 10}px`
    );
  }
  addImageToBack(toBeRemoved);
  getAllContainerImages();
};

const enableLeftArrow = () => {
  $(".left-control").click((e) => {
    if (slider.controlsActive) {
      slider.controlsActive = false;
      shiftToLeft();
      setTimeout(() => {
        slider.controlsActive = true;
      }, 600);
    }
  });
};

const enableRightArrow = () => {
  $(".right-control").click((e) => {
    if (!slider.firstClick) {
      slider.firstClick = true;

      enableLeftArrow();
      changeArrowIcon();
      setTimeout(() => {
        slider.secondContainerInitialOffset = parseFloat(
          secondContainer.css("right")
        );
      }, 500);
    }
    if (slider.controlsActive) {
      slider.controlsActive = false;

      shiftToRight();
      setTimeout(() => {
        slider.controlsActive = true;
      }, 600);
    }
  });
};

const configureSlider = () => {
  getAllContainerImages();
  fillScreen();
  enableRightArrow();
};

$(document).ready(() => {
  $(window).on("load", () => {
    slider.HTML = $(".slider").html();
    configureSlider();
  });

  $(window).resize(() => {
    location.reload();
  });
});
