let residences = [];

$(function(){
    let includes = $('[data-include]');
    $.each(includes, function () {
        let file = 'views/' + $(this).data('include') + '.html';
        $(this).load(file, function(){
            switch($(this).data('include')){
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
            }
        });
    });

    // Force to load residences content
    loadResidences();
});

let setMenuPositioning = function(selected){
    let mainElem = $('.main-header');
    let scrollPosition =  $(window).scrollTop();

    $(window).scroll(function(){
        let current = $(window).scrollTop();
        if (current > scrollPosition){
            if(current > 70){
                mainElem.removeClass('active');
            }else{
                mainElem.addClass('active');
            }
        } else {
            mainElem.addClass('active');
        }
        scrollPosition = current;
    });
};

let setMainMenuNavigation = function(selected){
    let mainElem = $('.main-header .menu .menu-item');

    if(selected){
        mainElem.each(function(){
            if($(this).data('current') === selected){
                $(this).addClass('current')
            }
        })
    }
    setResponsiveMenu();
    setInscriptionResponsive();
    setScrollNavigation();
};

let setGoToInformations = function(){
    let mainElem = $('#goto-informations');
    let inscriptionElem = $('[data-target="' + mainElem.data('scroll') + '"]');

    if(inscriptionElem.length){
        if(inscriptionElem.isInViewport()){
            mainElem.removeClass('active')
        }else{
            mainElem.addClass('active')
        }
        $(window).on('scroll', function(){
            if(inscriptionElem.isInViewport()){
                mainElem.removeClass('active')
            }else{
                mainElem.addClass('active')
            }
        });
    }
};

let setInscriptionForm = function(){
    let mainElem = $('form.inscription-form');
    mainElem.unbind('submit').submit(function(){
        console.log('ok !', $(this));
        return false;
    });
};

let setResponsiveMenu = function(){
    $('.main-header .responsive-menu .menu-item.open-menu').click(function(){
        $(this).toggleClass('open');
        $('.main-header .menu').toggleClass('open');
        $('.main-header .responsive-menu .menu-item.mail').toggleClass('active');
        return false;
    });

    $('.main-header .responsive-menu .menu-item.mail').click(function(){
        $('.content-inscription').addClass('open');
        return false;
    });
};

let setInscriptionResponsive = function(){
    $('.content-inscription .closer').unbind('click').click(function(){
        $('.content-inscription').removeClass('open');
    });
};

let setScrollNavigation = function(){
    $('[data-scroll]').unbind('click').click(function(){
        closeResidenceModal();

        $('.main-header .menu').removeClass('open');
        $('.main-header .responsive-menu .menu-item.open-menu').removeClass('open');
        $('.main-header .responsive-menu .menu-item.mail').addClass('active');

        let elem = $('[data-target="'+$(this).data('scroll')+'"]');
        if(elem.length){
            $('html, body').animate( { scrollTop: elem.offset().top - 100}, 500 );
        }else{
            window.location.href = "./";
        }
        return false;
    });
};

let setFooterNavigation = function(){
    $('.gotop').unbind("click").click(function(){
        let test = false;
        $.each(residences, function(index, residence){
            if(residence.modal && residence.modal.hasClass('open')){
                residence.modal.animate( { scrollTop: 0}, 500 );
                test = true;
            }
        });
        if(!test){
            $('html').animate( { scrollTop: 0}, 500 );
        }
        return false;
    });
};

let setLegals = function(){
    $('.legals-opener').unbind("click").click(function(){
        $('body').addClass('noscroll');
        $('.content-legals').addClass('active');
        return false;
    });

    $('.legals-closer').unbind("click").click(function(){
        $('body').removeClass('noscroll');
        $('.content-legals').removeClass('active');
        return false;
    });
};

let loadResidences = function(){
    $.getJSON('./config/residences.json', function(data) {
        setResidences(data);
    });
};

let setResidences = function(data){
    let mainElem = $('.residences-list');
    let modalElem = $('#content-residences-modal').children('.residence-modal.default');

    $.each(data, function(index, item){
        let thumbnailElem = $('<div class="residence-thumbnail"></div>');
        let src = "assets/img/residences/" + item.folderImg + '/' + item.thumbnail;
        thumbnailElem.css('backgroundImage', 'url("' + src + '")');

        let residenceElem = $('<div class="residence swiper-slide"></div>');
        residenceElem.append(thumbnailElem);

        if(item.active){
            let nameElem = $('<div class="residence-name"></div>');
            let pretitle = $('<div class="residence-pre-title">Résidence</div>');
            let title = $('<h3 class="residence-title">' + item.name + '</h3>');
            let opener = $('<div class="opener"></div>');

            nameElem.append(pretitle).append(title).append(opener);
            residenceElem.append(nameElem);

            residenceElem.click(function(){
                openResidenceModal(item.id);
            });
        }else{
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

    $.each(residences, function(index, residence){
        if(residence.item.active){
            residence.modal = setResidenceModal(modalElem.clone(true), residence.item);
        }
    });

    initResidenceCarousel();
};

let initResidenceCarousel = function () {
  let options = {
    direction: 'horizontal',
    loop: false,
    autoplayDisableOnInteraction: false,
    mousewheel: {
      enabled: true,
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
  let swiper = new Swiper(".residence-swiper", options);
}

let setResidenceModal = function(defaultModal, residence){
    let mainElem = $('#content-residences-modal');

    defaultModal.data('id', residence.id);
    defaultModal.removeClass('default');

    let closerElem = defaultModal.children('[data-closer]');
    let url = './assets/img/residences/' + residence.folderImg + '/' + residence.closer;
    closerElem.css('backgroundImage', 'url("' + url + '")');
    closerElem.click(function(){
        closeResidenceModal();
    });

    let bodyElem = defaultModal.children('.residence-modal-body');
    let file = 'views/' + residence.template + '.html';
    bodyElem.load(file);

    let includes = defaultModal.children('.residence-modal-footer').children('[data-include]');
    $.each(includes, function () {
        let file = 'views/' + $(this).data('include') + '.html';
        $(this).load(file, function(){
            switch($(this).data('include')){
                case 'inscription':
                    setInscriptionForm();
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

let openResidenceModal = function(id){
    $('body').addClass('noscroll');

    $.each(residences, function(index, residence){
        if(residence.item.active){
            if(id === residence.item.id){
                if(!residence.modal.hasClass('open')){
                    residence.modal.scrollTop(0);
                }else{
                    residence.modal.animate( { scrollTop: 0}, 500 );
                }
                residence.modal.addClass('open');
            }else{
                residence.modal.removeClass('open');
            }
        }
    });
};

let closeResidenceModal = function(){
    $('body').removeClass('noscroll');

    $.each(residences, function(index, residence){
        if(residence.item.active){
            residence.modal.removeClass('open');
        }
    });
};

$.fn.isInViewport = function() {
    if($(this)){
        let elementTop = $(this).offset().top;
        let elementBottom = elementTop + $(this).outerHeight();

        let viewportTop = $(window).scrollTop();
        let viewportBottom = viewportTop + $(window).height();

        return elementBottom > viewportTop && elementTop < viewportBottom;
    }
};
