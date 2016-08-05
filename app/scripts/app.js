import $ from 'jquery';
import svg4everybody from 'svg4everybody';

import swiper from 'swiper';

import uikitCore from 'uikit/src/js/core/core';
import uikitUtility from 'uikit/src/js/core/utility';
import uikitModal from 'uikit/src/js/core/modal';
import uikitScrollspy from 'uikit/src/js/core/scrollspy';
import uikitSmoothScroll from 'uikit/src/js/core/smooth-scroll';
import uikitTouch from 'uikit/src/js/core/touch';
import uikitToggle from 'uikit/src/js/core/toggle';
import uikitSwitcher from 'uikit/src/js/core/switcher';
import uikitDropdown from 'uikit/src/js/core/dropdown';

import uikitSticky from 'uikit/src/js/components/sticky';

import boostrapUtil from 'bootstrap/dist/js/umd/util';
import boostrapCollapse from 'bootstrap/dist/js/umd/collapse';

import lazyload from 'jquery-lazyload';

$(() => {
	svg4everybody();

    swiper('.swiper-container--logo', {
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        slidesPerView: 4,
        spaceBetween: 40,
        loop: true
    });

    var swiperThumbs = swiper('.swiper-container--thumbs', {
        spaceBetween: 17,
        centeredSlides: true,
        slidesPerView: 7,
        touchRatio: 0.2,
        slideToClickedSlide: true,
        loop: true
    });

    var swiperRecept = swiper('.swiper-container--recept', {
        slidesPerView: 'auto',
        calculateHeight:true,
        spaceBetween: 25,
        centeredSlides: true,
        loop: true//,
        //loopedSlides: 7
    });

    swiperRecept.params.control = swiperThumbs;
    swiperThumbs.params.control = swiperRecept;

    swiperRecept.on('onTransitionStart', function(swiper){
        var $activeSlide = $(swiper.slides).eq(swiper.activeIndex);

        $(swiper.slides).not(':eq(' + swiper.activeIndex + ')')
            .find('.promo__collapse.in').collapse('hide');
    });

    var $pcards = $('.product-card');
    for (var i = $pcards.length - 1; i >= 0; i--) {
        var swiperPcard = swiper($($pcards[i]).find('.swiper-container--pcard'), {
            effect: 'fade',
            fade: {
                crossFade: false
            },
            slidesPerView: 1,
            calculateHeight:true,
            spaceBetween: 50,
            preloadImages: false,
            lazyLoading: true
        });

        var swiperThumbsIcons = swiper($($pcards[i]).find('.swiper-container--thumbs-icon'), {
            spaceBetween: 0,
            centeredSlides: true,
            grabCursor: true,
            slidesPerView: 'auto',
            slideToClickedSlide: true
        });

        swiperPcard.params.control = swiperThumbsIcons;
        swiperThumbsIcons.params.control = swiperPcard;
    };


    swiper('.swiper-container--index', {
        slidesPerView: 1,
        calculateHeight:true,
        spaceBetween: 0,
        effect: 'fade',
        freeMode: true,
        scrollbar: '.swiper-scrollbar',
        direction: 'vertical',
        mousewheelControl: true
    });

    var $promoMain = $('#promo-main');
    var $body = $('body');
    if ($promoMain.length) {
        var $promoMainSlides = $promoMain.find('.swiper-slide');
        var totalSlides = $promoMainSlides.length;
        var $promoMainSlidesReversed = $($promoMainSlides.get().reverse());
        $promoMain.activeSlideIndex = 0;

        $promoMain.on('enable', function() {
            $(this).data('disabled', false);

            $(this).removeClass('disabled');

            $(window).on('resize.titleTranslate', function() {
                $promoMainSlides.each(function(i, slide) {
                    var h = $(slide).height();

                    var originTranslate = (-i * h);

                    $(slide).find('[data-fixed]').data('originTranslate', originTranslate);

                    $(this).trigger('updateTitlesTranslate');
                });
            }).trigger('resize.titleTranslate');

            $(window).on('updateTitlesTranslate', function(e, origin) {
                $promoMainSlides.find('[data-fixed]').each(function(i, title) {
                    var originTranslate = $(title).data('originTranslate');

                    if (!$promoMain.hasClass('promo--fixed') || origin) {
                        $(title).css('transform', 'translate(0, ' + originTranslate + 'px)');
                    } else {
                        $(title).css('transform', 'translate(0, ' + (originTranslate + $(window).scrollTop() - $promoMain.offset().top) + 'px)');
                    }
                });
            });

            $(window).on('scroll.promoMain', function (e) {

                var boundRect = $promoMain[0].getBoundingClientRect();

                if (boundRect.top <= 0 && boundRect.bottom >= $(window).height()) {
                    if (!$promoMain.hasClass('promo--fixed')) {
                        $promoMain.addClass('promo--fixed');
                        $body.css('background-attachment', 'fixed');
                    }

                    var slidesStep = 0;
                    var activeSlide;
                    while (slidesStep < totalSlides) {
                        var testRect = $promoMainSlidesReversed.get(slidesStep).getBoundingClientRect();

                        if (testRect.top <= testRect.height / 2) {
                            activeSlide = totalSlides - slidesStep - 1;
                            if ($promoMain.activeSlideIndex != activeSlide) {
                                $promoMain.activeSlideIndex = activeSlide;
                                $promoMain.trigger('changeActiveSlideIndex.promoMain');
                            }

                            break;
                        }

                        slidesStep++;
                    }

                    $(this).trigger('updateTitlesTranslate');
                } else {
                    if ($promoMain.hasClass('promo--fixed')) {
                        $promoMain.removeClass('promo--fixed');
                        $body.css('background-attachment', 'scroll');
                    }

                    if (boundRect.top >= 0) {
                        $(this).trigger('updateTitlesTranslate', [true]);
                    }
                }
            }).trigger('changeActiveSlideIndex.promoMain').trigger('scroll.promoMain');
        }).on('disable', function(e, scrollTo) {

            $(window).trigger('updateTitlesTranslate', [true]);

            $(this).data('disabled', true);

            $(window).off('resize.titleTranslate');
            $(window).off('updateTitlesTranslate');
            $(window).off('scroll.promoMain');

            $(this)
                .removeClass('promo--fixed')
                .addClass('disabled');

            if (scrollTo) {
                $('body, html').animate({
                    scrollTop: $promoMain.offset().top + 'px'
                }, 'fast');
            }
        }).on('changeActiveSlideIndex.promoMain', function(){
            $promoMainSlides.removeClass('swiper-slide-active').eq($promoMain.activeSlideIndex).addClass('swiper-slide-active');
            var link = $('<a data-uk-smooth-scroll={duration:1000} href="#promo-main-slide-' + $promoMain.activeSlideIndex + '"></a>');
            link.appendTo($body).trigger('click').remove();
        });

        $promoMain.trigger('enable');
    }

    $("body").delegate("a.js-double-hover", "mouseover", function(e) {
        $(this).parents(".js-double-hover-wrap:first").find("a[href='" + $(this).attr("href") + "']").addClass("hover");
    });

    $("body").delegate("a.js-double-hover", "mouseout", function(e) {
        $(this).parents(".js-double-hover-wrap:first").find("a[href='" + $(this).attr("href") + "']").removeClass("hover");
    });

    $('img.lazy, div.lazy').lazyload({
        effect: 'fadeIn'
    });

    $('.lazy-decor').lazyload({
        effect: 'fadeIn',
        event: 'decor'
    });

    $(window).on('load', function() {
        $(".lazy-decor").trigger('decor');
    });

    $('.promo__toggle').on('click', function() {
        var target = $(this).data('target');
        var $primaryTarget = $(this).parents('.swiper-slide').find(target);

        if ($primaryTarget.hasClass('in')) {
            $(target).collapse('hide');
        } else {
            $(target).collapse('show');
        }
    });

    var $btnUp = $('.icon-btn--up');
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 600) {
            $btnUp.fadeIn(300);
        } else {
            $btnUp.fadeOut(300);
        }
    });

    $('.js-pin').on('click', function(){
        var $pin = $(this);
        var options = UIkit.Utils.options($pin.attr("data-uk-modal"));
        var $modal = $(options.target);
        var $more = $modal.find('.js-modal-recept__more');
        var modal = UIkit.modal(options.target, options);
        var isMore = false;

        $modal.on('hide.uk.modal', function(){
            var $scrollTo = $($more.data('scroll-to'));
            var slideIndex = $more.data('slide-index');
            var swiper = $scrollTo.find('.swiper-container--recept')[0].swiper;
            var $collapse = $($(swiper.slides).eq(slideIndex).find('.promo__toggle').data('target'));

            if (!!isMore) {
                UIkit.Utils.scrollToElement($scrollTo);
            }

            swiper.slideTo(slideIndex);
            $collapse.collapse('show');

            isMore = false;
        });

        $more.on('click', function(){
            isMore = true;

            modal.hide();
        });
    });
});
