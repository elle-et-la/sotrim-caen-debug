let districtIframes = [];

let carrouselData = {
  current: 0,
  images: false,
  stop: false
};

$(document).ready(function () {
  setHomeCarrousel();
  setDistrictIframes();
});

let setHomeCarrousel = function () {
  $.getJSON('./config/home-carrousel.json', function (data) {
    carrouselData.images = data;

    $('.homepage .presentation .navigation .item').hover(function () {
      carrouselData.stop = true;
    }, function () {
      carrouselData.stop = false;
    }).click(function () {
      switchSlideCaroussel($(this).data('direction'), true);
    });

    setInterval(function () {
      switchSlideCaroussel('next');
    }, 7000);
  })
};

let switchSlideCaroussel = function (direction, force) {
  if (!carrouselData.stop || force) {
    switch (direction) {
      case 'next':
        carrouselData.current = (carrouselData.current + 1) <= (carrouselData.images.length - 1) ? carrouselData.current + 1 : 0;
        break;
      case 'prev':
        carrouselData.current = (carrouselData.current - 1) >= 0 ? carrouselData.current - 1 : carrouselData.images.length - 1;
        break;
    }

    let mainElem = $('.homepage .presentation .content-background');
    let src = './assets/img/home/carrousel/' + carrouselData.images[carrouselData.current];

    mainElem.css('backgroundPositionX', '1000px');
    setTimeout(function () {
      mainElem.css('backgroundImage', 'url("' + src + '")');
      setTimeout(function () {
        mainElem.css('backgroundPositionX', '50%');
      }, 300);
    }, 300);
  }
};

let setDistrictIframes = function () {
  $.getJSON('./config/district-iframes.json', function (data) {
    let mainElem = $('#district-iframes');
    let menuElem = mainElem.children('[data-menu]');
    let contentIframesElem = mainElem.children('[data-iframes]');

    $.each(data, function (index, iframe) {
      let menuItemElem = $('<div class="menu-item"></div>');
      menuItemElem.html(iframe.name);
      menuItemElem.click(function () {
        showDistrictIframe(index);
      });

      let iframeElem = $('<div class="content-iframe" data-index="' + index + '"></div>');
      let innerElem;
      switch (iframe.type) {
        case "image":
          innerElem = $('<img>');
          innerElem.attr('src', iframe.url);
          break;
        case "iframe":
          innerElem = $('<iframe></iframe>');
          innerElem.attr('src', iframe.url);
          innerElem.attr('onload', 'reloadIframeKRPanoRepair()');
          break;
      }
      innerElem.addClass('iframe-item');

      if (index === 0) {
        menuItemElem.addClass('active');
        iframeElem.addClass('active');
      }

      menuElem.append(menuItemElem);
      iframeElem.append(innerElem);
      contentIframesElem.append(iframeElem);
      districtIframes.push({
        menuItem: menuItemElem,
        iframeItem: iframeElem,
      });
    });
  });
};

let showDistrictIframe = function (index) {
  $.each(districtIframes, function (_index, item) {
    if (item.iframeItem.data('index') === index) {
      item.menuItem.addClass('active');
      item.iframeItem.addClass('active')
    } else {
      item.menuItem.removeClass('active');
      item.iframeItem.removeClass('active');
    }
  });
};

let reloadIframeKRPanoRepair = function () {
  /* Trick repair KRPano */
  let $iframe = $("iframe.iframe-item");
  let url = $iframe.attr('src');
  if (url.indexOf('?reloaded') === -1) {
    setTimeout(function () {
      $iframe.attr('src', $iframe.attr('src') + '?reloaded=' + Date.now());
    }, 2500);
  }
};