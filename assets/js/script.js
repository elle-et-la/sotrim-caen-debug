let residences = [];

$(function () {
  let includes = $('[data-include]');
  $.each(includes, function () {
    let file = 'views/' + $(this).data('include') + '.html';
    $(this).load(file, function () {
      switch ($(this).data('include')) {
        case 'header':
          setMenuPositioning();
          setMainMenuNavigation($(this).data('selected'));
          break;
        case 'inscription':
          setGoToInformations();
          setInscriptionForm();
          break;
        case 'footer':
          setFooterNavigation();
          setLegals();
          break;
        case 'starter-modal':
          MicroModal.init({
            openTrigger: 'data-custom-open',
            closeTrigger: 'data-custom-close',
            openClass: 'is-open',
            disableScroll: true,
            disableFocus: false,
            awaitOpenAnimation: false,
            awaitCloseAnimation: false,
            debugMode: false
          });
          checkCookieForPopinExist();
          break;
      }
    });
  });

  // Force to load residences content
  loadResidences();
  setUpCookies();

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied'
  });
});

let setUpCookies = function () {
  window.cookieconsent.initialise({
    "palette": {
      "popup": {
        "background": "#337754",
        "text": "#ffffff"
      },
      "button": {
        "background": "#aec63d",
        "text": "#ffffff"
      }
    },
    "type": "opt-in",
    "content": {
      "message": "Des cookies sont placés pour analyser les données de nos visiteurs, améliorer notre site web et afficher un contenu personnalisé.",
      "dismiss": "Fermer",
      "allow": "Autoriser",
      "deny": "Refuser",
      "link": "En savoir plus"
    },
    onInitialise: function (status) {
      if (status == cookieconsent.status.allow) loadCustomCookies();
    },
    onStatusChange: function (status) {
      if (this.hasConsented()) loadCustomCookies();
    }
  });
}

let loadCustomCookies = function () {
  setCookieForPopin();
  setupTrackingAnalytics();
  if (!document.cookie.split('; ').find(row => row.startsWith("lastTimePopinOpened"))) {
    setCookieForPopin()
  }
}

let showPopin = function () {
  MicroModal.show('modal-1')
}

let checkCookieForPopinExist = function () {
  if (!document.cookie.split('; ').find(row => row.startsWith("lastTimePopinOpened"))) {
    showPopin();
  }
}

let setCookieForPopin = function () {
  let date = new Date();
  let days = 7;
  let timestamp = Math.round(new Date().getTime() / 1000)
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  let expires = "; expires=" + date.toUTCString();
  document.cookie = "lastTimePopinOpened=" + timestamp + "; expires=" + expires + "; Secure; Path=/";

}

let setupTrackingAnalytics = function () {
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('consent', 'update', {
    ad_storage: 'granted',
    analytics_storage: 'granted'
  });
}

let checkIfAnchorResidenceOnURL = function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const residenceParam = urlParams.get('show')
  let regex = /residence-[a-z-A-Z-_]/g;

  if (residenceParam !== null && residenceParam.match(regex)) {
    residences.forEach(residence => {
      let regexResidenceName = /^(.*?)(?=\s-)/g;
      let residenceName = residence.item.name.match(regexResidenceName).toString().replace(/\s+/g, '-').toLowerCase();
      let prefixedResidenceName = "residence-" + residenceName
      if (prefixedResidenceName === residenceParam) {
        openResidenceModal(residence.item.id);
      }
    });

    // openResidenceModal(residenceFound.id);
  }

}

let setMenuPositioning = function (selected) {
  /*let mainElem = $('.main-header');
  let scrollPosition = $(window).scrollTop();

  $(window).scroll(function () {
    let current = $(window).scrollTop();
    if (current > scrollPosition) {
      if (current > 70) {
        mainElem.removeClass('active');
      } else {
        mainElem.addClass('active');
      }
    } else {
      mainElem.addClass('active');
    }
    scrollPosition = current;
  });*/
};

let setMainMenuNavigation = function (selected) {
  let mainElem = $('.main-header .menu .menu-item');

  if (selected) {
    mainElem.each(function () {
      if ($(this).data('current') === selected) {
        $(this).addClass('current')
      }
    })
  }
  setResponsiveMenu();
  setInscriptionResponsive();
  setScrollNavigation();
};

let setGoToInformations = function () {
  let mainElem = $('#goto-informations');
  let inscriptionElem = $('[data-target="' + mainElem.data('scroll') + '"]');

  if (inscriptionElem.length) {
    if (inscriptionElem.isInViewport()) {
      mainElem.removeClass('active')
    } else {
      mainElem.addClass('active')
    }
    $(window).on('scroll', function () {
      if (inscriptionElem.isInViewport()) {
        mainElem.removeClass('active')
      } else {
        mainElem.addClass('active')
      }
    });
  }
};

let setInscriptionForm = function (setResidence = null) {
  let mainElem = $('form.inscription-form');
  mainElem.unbind('submit').submit(function (evt) {
    var submitBtn = $(evt.target).find('.content-submit input');
    submitBtn.attr('disabled', 'true');
    var unindexed_array = $(evt.target).serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function (n, i) {
      indexed_array[n['name']] = n['value'];
    });
    indexed_array['residence'] = $(evt.target).find('select[name=residence] option[value=' + indexed_array['residence'] + ']').html();
    $.ajax({
      method: "POST",
      url: "./server/mailSender.php",
      data: JSON.stringify(indexed_array)
    }).then(function (data) {
      mainElem.trigger("reset");
      submitBtn.attr('disabled', 'false');
      try {
        data = JSON.parse(data);
        if (data.status === 'ok') {
          addSnackbar("Mail envoyé", "success");
          dataLayer.push({'event': 'formInscription'});
        } else {
          console.error('ERROR sending form: ', data.msg);
          //alert("Une erreur est survenue lors de l'envoi du mail");
          addSnackbar("Une erreur est survenue lors de l'envoi du mail", "error");
        }
      } catch (err) {
        console.error('ERROR sending form: ', err);
        addSnackbar("Une erreur est survenue lors de l'envoi du mail", "error");
      }
    });
    return false;
  });

  if (setResidence !== null && typeof parseInt(setResidence) === 'number') {
    const activeResidenceForm = $('#content-residences-modal .residence-modal[data-id="' + setResidence + '"] form.inscription-form');
    activeResidenceForm.find('select[name=residence]').val(setResidence);
  }
};

let setResponsiveMenu = function () {
  $('.main-header .responsive-menu .menu-item.open-menu').click(function () {
    $(this).toggleClass('open');
    $('.main-header .menu').toggleClass('open');
    $('.main-header .responsive-menu .menu-item.mail').toggleClass('active');
    return false;
  });

  $('.main-header .responsive-menu .menu-item.mail, .homepage .presentation .entry-presentation .btn-entry').click(function () {
    $('.content-inscription').addClass('open');
    return false;
  });
};

let setInscriptionResponsive = function () {
  $('.content-inscription .closer').unbind('click').click(function () {
    $('.content-inscription').removeClass('open');
  });
};

let setScrollNavigation = function () {
  $('[data-scroll]').unbind('click').click(function () {
    closeResidenceModal();

    $('.main-header .menu').removeClass('open');
    $('.main-header .responsive-menu .menu-item.open-menu').removeClass('open');
    $('.main-header .responsive-menu .menu-item.mail').addClass('active');

    let elem = $('[data-target="' + $(this).data('scroll') + '"]');
    if (elem.length) {
      $('html, body').animate({scrollTop: elem.offset().top - 100}, 500);
    } else {
      window.location.href = "./";
    }
    return false;
  });
};

let setFooterNavigation = function () {
  $('.gotop').unbind("click").click(function () {
    let test = false;
    $.each(residences, function (index, residence) {
      if (residence.modal && residence.modal.hasClass('open')) {
        residence.modal.animate({scrollTop: 0}, 500);
        test = true;
      }
    });
    if (!test) {
      $('html').animate({scrollTop: 0}, 500);
    }
    return false;
  });
};

let setLegals = function () {
  $('.legals-opener').unbind("click").click(function () {
    $('body').addClass('noscroll');
    $('.content-legals').addClass('active');
    return false;
  });

  $('.legals-closer').unbind("click").click(function () {
    $('body').removeClass('noscroll');
    $('.content-legals').removeClass('active');
    return false;
  });
};

let loadResidences = function () {
  $.getJSON('./config/residences.json', async function (data) {
    await setResidences(data);
    checkIfAnchorResidenceOnURL();
  });
};

let setResidences = function (data) {
  let mainElem = $('.residences-list');
  let modalElem = $('#content-residences-modal').children('.residence-modal.default');

  $.each(data, function (index, item) {
    let thumbnailElem = $('<div class="residence-thumbnail"></div>');
    let src = "assets/img/residences/" + item.folderImg + '/' + item.thumbnail;
    thumbnailElem.css('backgroundImage', 'url("' + src + '")');

    let residenceElem = $('<div class="residence swiper-slide"></div>');
    residenceElem.append(thumbnailElem);

    if (item.active) {
      let nameElem = $('<div class="residence-name"></div>');
      let pretitle = $('<div class="residence-pre-title">Résidence</div>');
      let title = $('<h3 class="residence-title">' + item.name + '</h3>');
      let opener = $('<div class="opener"></div>');

      nameElem.append(pretitle).append(title).append(opener);
      residenceElem.append(nameElem);

      residenceElem.click(function () {
        openResidenceModal(item.id);
      });
    } else {
      let mentionElem = $('<div class="mention">Prochainement</div>');
      residenceElem.prepend(mentionElem);
      residenceElem.addClass('inactive');
    }

    residences.push({
      elem: residenceElem,
      item: item
    });
    mainElem.append(residenceElem);
  });

  $.each(residences, function (index, residence) {
    if (residence.item.active) {
      residence.modal = setResidenceModal(modalElem.clone(true), residence.item);
    }
  });

  detectResidenceCarousel();
};

let detectResidenceCarousel = function (element = null) {
  const swiperClassName = '.residence-swiper';
  let item = ((element !== null) ? element : document).querySelector(swiperClassName);
  initResidenceCarousel(item);
}

let initResidenceCarousel = function (item) {
  let options = {
    direction: 'horizontal',
    loop: false,
    autoplayDisableOnInteraction: false,
    mousewheel: {
      enabled: false,
    },
    keyboard: {
      enabled: true,
    },
    slidesPerView: 1.2,
    centeredSlides: false,
    spaceBetween: 20,
    breakpoints: {
      768: {
        slidesPerView: 2.3,
        spaceBetween: 50,
      },
      1011: {
        slidesPerView: 3,
        spaceBetween: 50,
      },
    },
  }
  let swiper = new Swiper(item, options);
}

let setResidenceModal = function (defaultModal, residence) {
  let mainElem = $('#content-residences-modal');
  defaultModal.data('id', residence.id);
  defaultModal.attr('data-id', residence.id);
  defaultModal.removeClass('default');

  let closerElem = defaultModal.children('[data-closer]');
  let url = './assets/img/residences/' + residence.folderImg + '/' + residence.closer;
  closerElem.css('backgroundImage', 'url("' + url + '")');
  closerElem.click(function () {
    closeResidenceModal();
  });

  let bodyElem = defaultModal.children('.residence-modal-body');
  let file = 'views/' + residence.template + '.html';
  bodyElem.load(file);

  let includes = defaultModal.children('.residence-modal-footer').children('[data-include]');
  $.each(includes, function () {
    let file = 'views/' + $(this).data('include') + '.html';
    $(this).load(file, function () {
      switch ($(this).data('include')) {
        case 'inscription':
          setInscriptionForm(residence.id);
          setInscriptionResponsive();
          break;
        case 'footer':
          setFooterNavigation();
          setScrollNavigation();
          setLegals();
          break;
      }
    });
  });

  mainElem.prepend(defaultModal);
  return defaultModal;
};

let openResidenceModal = function (id) {
  $('body').addClass('noscroll');

  $.each(residences, function (index, residence) {
    if (residence.item.active) {
      if (id === residence.item.id) {
        if (!residence.modal.hasClass('open')) {
          residence.modal.scrollTop(0);
        } else {
          residence.modal.animate({scrollTop: 0}, 500);
        }
        residence.modal.addClass('open');
      } else {
        residence.modal.removeClass('open');
      }

      let modal = document.querySelector('.residence-modal.open');
      detectResidenceCarousel(modal);
    }
  });
};

let closeResidenceModal = function () {
  $('body').removeClass('noscroll');

  $.each(residences, function (index, residence) {
    if (residence.item.active) {
      residence.modal.removeClass('open');
    }
  });
};

$.fn.isInViewport = function () {
  if ($(this)) {
    let elementTop = $(this).offset().top;
    let elementBottom = elementTop + $(this).outerHeight();

    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
  }
};
