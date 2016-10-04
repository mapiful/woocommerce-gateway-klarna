jQuery(document).ready(function ($) {

	// Update country
	$(document).on('change', 'select#klarna-checkout-euro-country', function (event) {
		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		new_country = $(this).val();

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_country_callback',
					new_country: new_country,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
					document.location.assign(response.data.new_url);
				},
				error: function (response) {
					console.log('select euro country AJAX error');
					console.log(response);
				}
			}
		);

	});

	// Update order note
	$(document).on('change', 'textarea#klarna-checkout-order-note, #kco_order_note', function (event) {
		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		order_note = $(this).val();

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_order_note_callback',
					order_note: order_note,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
				},
				error: function (response) {
					console.log('order note AJAX error');
					console.log(response);
				},
				complete: function() {
					if (typeof window._klarnaCheckout == 'function') {
						window._klarnaCheckout(function (api) {
							api.resume();
						});
					}
				}
			}
		);

	});

	// Update shipping (v2)
	$(document).on('change', 'table#kco-totals #kco-page-shipping input[type="radio"]', function (event) {
		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		new_method = $(this).val();
		kco_widget = $('#klarna-checkout-widget');

		$(document.body).trigger('kco_widget_update_shipping', new_method);

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_shipping_callback',
					new_method: new_method,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
					$(kco_widget).html(response.data.widget_html);
				},
				error: function (response) {
					console.log('update shipping AJAX error');
					console.log(response);
				},
				complete: function() {
					if (typeof window._klarnaCheckout == 'function') {
						window._klarnaCheckout(function (api) {
							api.resume();
						});
					}

					$(document.body).trigger('kco_widget_updated_shipping', new_method);
				}
			}
		);

	});

	// Update cart (v2)
	$(document).on('change', 'td.product-quantity input[type=number]', function (event) {
		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		ancestor = $(this).closest('td.product-quantity');
		cart_item_key = $(ancestor).data('cart_item_key');
		new_quantity = $(this).val();
		kco_widget = $('#klarna-checkout-widget');

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_cart_callback_update',
					cart_item_key: cart_item_key,
					new_quantity: new_quantity,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
					$(kco_widget).html(response.data.widget_html);
				},
				error: function (response) {
					console.log('update cart item AJAX error');
					console.log(response);
				},
				complete: function() {
					if (typeof window._klarnaCheckout == 'function') {
						window._klarnaCheckout(function (api) {
							api.resume();
						});
					}
				}
			}
		);
	});

	// Remove cart item (v2)
	$(document).on('click', 'td.kco-product-remove a', function (event) {
		event.preventDefault();

		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		ancestor = $(this).closest('tr').find('td.product-quantity');
		item_row = $(this).closest('tr');
		kco_widget = $('#klarna-checkout-widget');
		cart_item_key_remove = $(ancestor).data('cart_item_key');

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_cart_callback_remove',
					cart_item_key_remove: cart_item_key_remove,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
					if (0 == response.data.item_count) {
						location.reload();
					} else {
						$(kco_widget).html(response.data.widget_html);
						$(item_row).remove();

						if (typeof window._klarnaCheckout != 'function') {
							location.reload();
						}
					}
				},
				error: function (response) {
					console.log('remove cart item AJAX error');
					console.log(response);
				},
				complete: function (response) {
					if (typeof window._klarnaCheckout == 'function') {
						window._klarnaCheckout(function (api) {
							api.resume();
						});
					}
				}
			}
		);
	});

	// Add coupon (v2)
	$('#klarna-checkout-widget .checkout_coupon').off(); // Remove WC built-in event handler
	$(document).on('submit', '#klarna-checkout-widget .checkout_coupon', function (event) {
		event.preventDefault();

		$('#klarna_checkout_coupon_result').html('');

		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		coupon = $('#klarna-checkout-widget #coupon_code').val();
		kco_widget = $('#klarna-checkout-widget');
		input_field = $(this).find('#coupon_code');

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_coupons_callback',
					coupon: coupon,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
					if (response.data.coupon_success) {
						$('#klarna_checkout_coupon_result').html('<p>' + kcoAjax.coupon_success + '</p>');

						html_string = '<tr class="kco-applied-coupon"><td class="kco-rightalign">Coupon: ' + response.data.coupon + ' <a class="kco-remove-coupon" data-coupon="' + response.data.coupon + '" href="#">(remove)</a></td><td class="kco-rightalign">-' + response.data.amount + '</td></tr>';

						$('tr#kco-page-total').before(html_string);
						$(input_field).val('');
						$(kco_widget).html(response.data.widget_html);

						if (typeof window._klarnaCheckout != 'function') {
							location.reload();
						}
					}
					else {
						$('#klarna_checkout_coupon_result').html('<div class="woocommerce-error">' + kcoAjax.coupon_fail + '</div>');
					}
				},
				error: function (response) {
					$('#klarna_checkout_coupon_result').html('<div class="woocommerce-error">' + kcoAjax.coupon_fail + '</div>');
					console.log('add coupon AJAX error');
					console.log(response);
				},
				complete: function (response) {
					if (typeof window._klarnaCheckout == 'function') {
						window._klarnaCheckout(function (api) {
							api.resume();
						});
					}
				}
			}
		);

	});


	// Remove coupon (v2)
	$(document).on('click', 'table#kco-totals .kco-remove-coupon', function (event) {
		event.preventDefault();

		if (typeof window._klarnaCheckout == 'function') {
			window._klarnaCheckout(function (api) {
				api.suspend();
			});
		}

		remove_coupon = $(this).data('coupon');
		clicked_el = $(this);
		kco_widget = $('#klarna-checkout-widget');

		$.ajax(
			kcoAjax.ajaxurl,
			{
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'klarna_checkout_remove_coupon_callback',
					remove_coupon: remove_coupon,
					nonce: kcoAjax.klarna_checkout_nonce
				},
				success: function (response) {
					$(clicked_el).closest('tr').remove();
					$(kco_widget).html(response.data.widget_html);

					// Remove WooCommerce notification
					$('#klarna-checkout-widget .woocommerce-info + .woocommerce-message').remove();
				},
				error: function (response) {
					console.log('remove coupon AJAX error');
					console.log(response);
				},
				complete: function (response) {
					if (typeof window._klarnaCheckout == 'function') {
						window._klarnaCheckout(function (api) {
							api.resume();
						});
					}
				}
			}
		);
	});

	// End KCO widget

	var returned_data_v2 = '';
	var returned_shipping_data_v2 = '';
	// Address change (email, postal code) v2
	if (typeof window._klarnaCheckout == 'function') {
		window._klarnaCheckout(function (api) {
			// For v2 use 'change' JS event to capture
			if ('v2' == kcoAjax.version) {
				var customerEmail = '';
				var customerPostal = '';
				var customerShippingCountry = '';
				var customerShippingPostal = '';

				api.on({
					'change': function (data) {
						// console.log(data);

						// Check if the data actually changed
						if ( returned_data_v2 !== JSON.stringify(data) ) {
							returned_data_v2 = JSON.stringify(data);
							
							if ('' != data.email && '' != data.postal_code) {
								// Check if email and postal code have changed since last 'change' event
								if (customerEmail != data.email || customerPostal != data.postal_code) {
									customerEmail = data.email;
									customerPostal = data.postal_code;

									window._klarnaCheckout(function (api) {
										api.suspend();
									});

									// Check if email is not defined (AT and DE only) and set it to this value
									// For AT and DE, email field is not captured inside data object
									if (data.email === undefined) {
										data.email = 'guest_checkout@klarna.com';
									}

									if ('' != data.email) {
										var kco_widget = $('#klarna-checkout-widget');

										$(document.body).trigger('kco_widget_update', data);

										$.ajax(
											kcoAjax.ajaxurl,
											{
												type: 'POST',
												dataType: 'json',
												data: {
													action: 'kco_iframe_change_cb',
													email: data.email,
													postal_code: data.postal_code,
													country: data.country,
													nonce: kcoAjax.klarna_checkout_nonce
												},
												success: function (response) {
													// Check if a product is out of stock
													if (false === response.success) {
														location.reload();
														return;
													}

													$(kco_widget).html(response.data.widget_html);
													$(document.body).trigger('kco_widget_updated', response);

													window._klarnaCheckout(function (api) {
														api.resume();
													});
												},
												error: function (response) {
													console.log('change AJAX error');
													console.log(response);

													window._klarnaCheckout(function (api) {
														api.resume();
													});
												}
											}
										);
									}
								}
							}
						}

						$(document.body).trigger('kco_change', data);
					},
					shipping_address_change: function(data) {
						if ( returned_shipping_data_v2 !== JSON.stringify(data) ) {
							returned_shipping_data_v2 = JSON.stringify(data);

							if ('' != data.country && '' != data.postal_code) {
								// Check if purchase country and postal code have changed since last 'change' event
								if (customerShippingCountry != data.country || customerShippingPostal != data.postal_code) {
									customerShippingCountry = data.country;
									customerShippingPostal = data.postal_code;

									window._klarnaCheckout(function (api) {
										api.suspend();
									});

									var kco_widget = $('#klarna-checkout-widget');
									$(document.body).trigger('kco_widget_update', data);

									$.ajax(
										kcoAjax.ajaxurl,
										{
											type: 'POST',
											dataType: 'json',
											data: {
												action: 'kco_iframe_v2_shipping_address_change_cb',
												postal_country: customerShippingCountry,
												postal_code: customerShippingPostal,
												nonce: kcoAjax.klarna_checkout_nonce
											},
											success: function (response) {
												$(kco_widget).html(response.data.widget_html);
												$(document.body).trigger('kco_widget_updated', response);

												window._klarnaCheckout(function (api) {
													api.resume();
												});
											},
											error: function (response) {
												console.log('shipping address change AJAX error');
												console.log(response);

												window._klarnaCheckout(function (api) {
													api.resume();
												});
											}
										}
									);
								}
							}
						}

						$(document.body).trigger('kco_shipping_address_change', data);
					},
					order_total_change: function(data) {
						$(document.body).trigger('kco_order_total_change', data);
					}
				});
			}

			var returned_address_v3 = '';
			// Address change (postal code, region) v3
			if ('v3' == kcoAjax.version) {
				api.on({
					'shipping_address_change': function (data) {
						// Check if the address actually changed
						if ( returned_address_v3 !== JSON.stringify(data) ) {
							returned_address_v3 = JSON.stringify(data);

							if ('' != data.postal_code || '' != data.region) {
								window._klarnaCheckout(function (api) {
									api.suspend();
								});

								kco_widget = $('#klarna-checkout-widget');

								$.ajax(
									kcoAjax.ajaxurl,
									{
										type: 'POST',
										dataType: 'json',
										data: {
											action: 'kco_iframe_shipping_address_change_cb',
											region: data.region,
											postal_code: data.postal_code,
											country: data.country,
											nonce: kcoAjax.klarna_checkout_nonce
										},
										success: function (response) {
											$(kco_widget).html(response.data.widget_html);
										},
										error: function (response) {
											console.log('shipping_address_change AJAX error');
											console.log(response);
										},
										complete: function (response) {
											window._klarnaCheckout(function (api) {
												api.resume();
											});
										}
									}
								);
							}
						}
					}
				});
			}


			api.on({
				'shipping_option_change': function (data) {
					// var seconds = new Date().getTime() / 1000;
					// console.log( 'Shipping option change: ' + seconds );

					new_method = data.id;
					kco_widget = $('#klarna-checkout-widget');

					$.ajax(
						kcoAjax.ajaxurl,
						{
							type: 'POST',
							dataType: 'json',
							data: {
								action: 'kco_iframe_shipping_option_change_cb',
								new_method: new_method,
								nonce: kcoAjax.klarna_checkout_nonce
							},
							success: function (response) {
								$(kco_widget).html(response.data.widget_html);
							},
							error: function (response) {
								console.log('shipping_option_change AJAX error');
								console.log(response);
							}
						}
					);
				}
			});

		});
	}

});