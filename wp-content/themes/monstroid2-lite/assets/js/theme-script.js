(function($){
	"use strict";

	CherryJsCore.utilites.namespace('theme_script');
	CherryJsCore.theme_script = {
		init: function () {
			var self = this;

			// Document ready event check
			if( CherryJsCore.status.is_ready ){
				self.document_ready_render( self );
			}else{
				CherryJsCore.variable.$document.on( 'ready', self.document_ready_render( self ) );
			}

			// Windows load event check
			if( CherryJsCore.status.on_load ){
				self.window_load_render( self );
			}else{
				CherryJsCore.variable.$window.on( 'load', self.window_load_render( self ) );
			}
		},

		document_ready_render: function ( self ) {
			var self = self;

			self.smart_slider_init( self );
			self.post_formats_custom_init( self );
			self.navbar_init( self );
			self.main_menu( self, $( '.main-navigation' ) );
			self.to_top_init( self );
			self.header_search( self );
			self.mobile_menu( self );
		},

		window_load_render: function ( self ) {
			var self = self;
			self.page_preloader_init( self );
		},

		smart_slider_init: function( self ) {
			$( '.monstroid2-lite-smartslider' ).each( function() {
				var slider = $(this),
					sliderId = slider.data('id'),
					sliderWidth = slider.data('width'),
					sliderHeight = slider.data('height'),
					sliderOrientation = slider.data('orientation'),
					slideDistance = slider.data('slide-distance'),
					slideDuration = slider.data('slide-duration'),
					sliderFade = slider.data('slide-fade'),
					sliderNavigation = slider.data('navigation'),
					sliderFadeNavigation = slider.data('fade-navigation'),
					sliderPagination = slider.data('pagination'),
					sliderAutoplay = slider.data('autoplay'),
					sliderFullScreen = slider.data('fullscreen'),
					sliderShuffle = slider.data('shuffle'),
					sliderLoop = slider.data('loop'),
					sliderThumbnailsArrows = slider.data('thumbnails-arrows'),
					sliderThumbnailsPosition = slider.data('thumbnails-position'),
					sliderThumbnailsWidth = slider.data('thumbnails-width'),
					sliderThumbnailsHeight = slider.data('thumbnails-height');

				if ( $('.smart-slider__items', '#' + sliderId ).length > 0 ) {
					$( '#' + sliderId ).sliderPro( {
						width: sliderWidth,
						height: sliderHeight,
						orientation: sliderOrientation,
						slideDistance: slideDistance,
						slideAnimationDuration: slideDuration,
						fade: sliderFade,
						arrows: sliderNavigation,
						fadeArrows: sliderFadeNavigation,
						buttons: sliderPagination,
						autoplay: sliderAutoplay,
						fullScreen: sliderFullScreen,
						shuffle: sliderShuffle,
						loop: sliderLoop,
						waitForLayers: false,
						thumbnailArrows: sliderThumbnailsArrows,
						thumbnailsPosition: sliderThumbnailsPosition,
						thumbnailWidth: sliderThumbnailsWidth,
						thumbnailHeight: sliderThumbnailsHeight,
						init: function() {
							$( this ).resize();
						},
						sliderResize: function( event ) {
							var thisSlider = $( '#' + sliderId ),
								slides = $( '.sp-slide', thisSlider );

								slides.each( function(){

									if ( $( '.sp-title a', this ).width() > $( this ).width() ){
										$( this ).addClass('text-wrapped');
									}else{
										$( this ).removeClass('text-wrapped');
									}

								} );
						},
						breakpoints: {
							991: {
								height: parseFloat( sliderHeight ) * 0.75
							},
							767: {
								height: parseFloat( sliderHeight ) * 0.5,
								thumbnailsPosition: ( 'top' === this.thumbnailsPosition ) ? 'top' : 'bottom',
								thumbnailHeight: parseFloat( sliderThumbnailsHeight ) * 0.75,
								thumbnailWidth: parseFloat( sliderThumbnailsWidth ) * 0.75
							}
						},
					} );
				}
			});//each end
		},

		post_formats_custom_init: function ( self ) {
			CherryJsCore.variable.$document.on( 'cherry-post-formats-custom-init', function( event ) {

				if ( 'slider' !== event.object ) {
					return;
				}

				var uniqId = '#' + event.item.attr( 'id' ),
					swiper = new Swiper( uniqId, {
						pagination: uniqId + ' .swiper-pagination',
						paginationClickable: true,
						nextButton: uniqId + ' .swiper-button-next',
						prevButton: uniqId + ' .swiper-button-prev',
						spaceBetween: 30,
						onInit: function(){
							$( uniqId + ' .swiper-button-next' ).css({ 'display': 'block' });
							$( uniqId + ' .swiper-button-prev' ).css({ 'display': 'block' });
						},
					} );

				event.item.data( 'initalized', true );
			});

			var items = [];

			$('.mini-gallery .post-thumbnail__link').on('click', function(event) {
				event.preventDefault();

				$(this).parents('.mini-gallery').find('.post-gallery__slides > a[href]').each(function() {
					items.push({
						src: $(this).attr('href'),
						type: 'image'
					});
				});

				$.magnificPopup.open({
					items: items,
					gallery: {
						enabled: true
					}
				});
			});
		},

		navbar_init: function ( self ) {

			$( window ).load( function() {

				var $navbar = $('.main-navigation');

				if ( ! $.isFunction( jQuery.fn.stickUp ) || ! $navbar.length ) {
					return !1;
				}

				$navbar.stickUp({
					correctionSelector: '#wpadminbar',
					listenSelector: '.listenSelector',
					pseudo: true,
					active: true
				});
				CherryJsCore.variable.$document.trigger( 'scroll.stickUp' );

			});
		},

		main_menu: function ( self, target ) {

			var menu = target,
				duration_timeout,
				closeSubs,
				hideSub,
				showSub,
				init,
				moreButtonText = '&middot;&middot;&middot;';

			if ( 'undefined' !== typeof monstroid2Lite &&
				 'undefined' !== typeof monstroid2Lite.labels &&
				 'undefined' !== typeof monstroid2Lite.labels[ 'hidden_menu_items_title' ] &&
				 '' !== monstroid2Lite.labels.hidden_menu_items_title ) {
				 moreButtonText = monstroid2Lite.labels.hidden_menu_items_title;
			}

			menu.superGuacamole( {
				threshold: 768, // Minimal menu width, when this plugin activates
				minChildren: 3, // Minimal visible children count
				childrenFilter: '.menu-item', // Child elements selector
				menuTitle: moreButtonText, // Menu title
				menuUrl: '#',
				templates: {
					menu: '<li class="%1$s"><a href="%2$s">%3$s</a>%4$s</li>',
					child_wrap: '<ul class="%1$s">%2$s</ul>',
					child: '<li class="%1$s"><a href="%2$s">%3$s</a></li>'
				}
			} );

			closeSubs = function() {
				$( '.menu-hover > a', menu ).each(
					function() {
						hideSub( $(this) );
					}
				);
			};

			hideSub = function( anchor ) {

				anchor.parent().removeData( 'index' ).removeClass( 'menu-hover' ).triggerHandler( 'close_menu' );

				anchor.siblings('ul').addClass('in-transition');

				clearTimeout( duration_timeout );
				duration_timeout = setTimeout(
					function() {
						anchor.siblings('ul').removeClass( 'in-transition' );
					},
					200
				);
			};

			showSub = function( anchor ) {

				// all open children of open siblings
				var item = anchor.parent();

				item
					.siblings()
					.find( '.menu-hover' )
					.addBack( '.menu-hover' )
					.children( 'a' )
					.each(function() {
						hideSub( $( this ), true );
					});

				item.addClass( 'menu-hover' ).triggerHandler( 'open_menu' );
			};

			init = function() {
				var $mainNavigation = $( '.main-navigation' ),
					$mainMenu = $( 'ul.menu', $mainNavigation ),
					$menuToggle = $( '.menu-toggle[aria-controls="main-menu"]' ),
					$liWithChildren = $( 'li.menu-item-has-children, li.page_item_has_children', menu ),
					$self;

				$liWithChildren.hoverIntent( {
					over   : function() {
						showSub( $( this ).children( 'a' ) );
					},
					out    : function() {
						if ( $( this ).hasClass( 'menu-hover' ) ) {
							hideSub( $( this ).children( 'a' ) );
						}
					},
					timeout: 300
				} );

				var $parentNode,
					$self,
					index = -1;

				/**
				 * Double click on menu item
				 * @access private
				 */
				function doubleClickMenu( $jqEvent ) {
					$self = $(this);

					if ( $self.index() !== parseInt( $parentNode.data( 'index' ), 10 ) ) {
						$jqEvent.preventDefault();
					}

					$parentNode.data( 'index', $self.index() );
				}

				// Check if touch events supported
				if ( 'ontouchend' in window ) {

					// Attach event listener for double click
					$mainNavigation.find( '#main-menu li[class*="children"] > a' ).on( 'click', doubleClickMenu );

					// Reset index on touchend event
					CherryJsCore.variable.$document.on( 'touchend', function( $jqEvent ) {
						$parentNode = $( $jqEvent.target ).parent();

						if ( $parentNode.hasClass( 'menu-hover' ) === false ) {
							closeSubs();

							index = $parentNode.data( 'index' );

							if ( index ) {
								$parentNode.data( 'index', parseInt( index, 10 ) - 1 );
							}
						}
					} );
				}

				$menuToggle.on('click', function( $event ) {
					$event.preventDefault();

					setTimeout( function() {
						if ( !$mainNavigation.hasClass( 'animate' ) ) {
							$mainNavigation.addClass( 'animate' );
						}
						$mainNavigation.toggleClass( 'show' );
						$( 'html' ).toggleClass( 'mobile-menu-active' );
					}, 10);

					$menuToggle.attr( 'aria-expanded', !$menuToggle.hasClass( 'toggled' ) );
					$menuToggle.toggleClass( 'toggled' );
				});
			};

			init();
		},

		mobile_menu: function( self ) {
			var $mainNavigation = $( '.main-navigation' ),
				$menuToggle = $( '.menu-toggle[aria-controls="main-menu"]' );

			$mainNavigation
				.find( 'li.menu-item-has-children > a' )
				.after( '<a href="#" class="sub-menu-toggle"></a>' );

			/**
			 * Debounce the function call
			 *
			 * @param  {number}   threshold The delay.
			 * @param  {Function} callback  The function.
			 */
			function debounce( threshold, callback ) {
				var timeout;

				return function debounced( $event ) {
					function delayed() {
						callback( $event );
						timeout = null;
					}

					if ( timeout ) {
						clearTimeout( timeout );
					}

					timeout = setTimeout( delayed, threshold );
				};
			}

			/**
			 * Resize event handler.
			 *
			 * @param {jqEvent} jQuery event.
			 */
			function resizeHandler( $event ) {
				var $window = CherryJsCore.variable.$window,
					width = $window.outerWidth( true );

				if ( 768 <= width ) {
					$mainNavigation.removeClass( 'mobile-menu' );
				} else {
					$mainNavigation.addClass( 'mobile-menu' );
				}
			}

			/**
			 * Toggle sub-menus.
			 *
			 * @param  {jqEvent} $event jQuery event.
			 */
			function toggleSubMenuHandler( $event ) {
				var $subMenu = $( this );

				$subMenu.toggleClass( 'active' );
				$subMenu.parent().toggleClass( 'sub-menu-open' );
			}

			/**
			 * Toggle menu.
			 *
			 * @param  {jqEvent} $event jQuery event.
			 */
			function toggleMenuHandler( $event ) {
				var $toggle = $( this );

				$event.preventDefault();

				$mainNavigation.toggleClass( 'active' );

				if ( $toggle.hasClass( 'active' ) ) {
					$toggle.removeClass( 'active' );
					$mainNavigation.find( '.sub-menu-open' ).removeClass( 'sub-menu-open' );
				}
			}

			resizeHandler();
			CherryJsCore.variable.$window.on( 'resize orientationchange', debounce( 500, resizeHandler ) );
			$mainNavigation.on( 'click', '.sub-menu-toggle', toggleSubMenuHandler );
			$menuToggle.on( 'click', toggleMenuHandler );
		},

		page_preloader_init: function ( self ) {

			if ( $( '.page-preloader-cover' )[0] ) {
				$( '.page-preloader-cover' ).delay( 500 ).fadeTo( 500, 0, function() {
					$( this ).remove();
				});
			}
		},

		to_top_init: function ( self ) {
			if ( $.isFunction( jQuery.fn.UItoTop ) ) {
				$().UItoTop({
					text: monstroid2Lite.labels.totop_button,
					scrollSpeed: 600
				});
			}
		},

		header_search: function ( self ) {
			var	$header       = $( '.site-header' ),
				$searchToggle = $( '.search-form__toggle', $header ),
				$headerSearch = $( '.header-search', $header ),
				searchHandler = function ( event ) {
					$header.toggleClass( 'search-active' );
				},
				removeActiveClass = function ( event ) {
					if( $( event.target ).closest($searchToggle).length || $( event.target ).closest( $headerSearch ).length ) {
						return;
					}

					if( $header.hasClass( 'search-active' ) ) {
						$header.removeClass( 'search-active' );
					}

					event.stopPropagation();
				};

			$searchToggle.on( 'click', searchHandler );

			$( document ).on( 'click', removeActiveClass );
		}

	}
	CherryJsCore.theme_script.init();
}(jQuery));
