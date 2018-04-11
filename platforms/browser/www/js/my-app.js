var $$ = Dom7;

var base_path = 'http://ksm-if.com/xxii/';
var app_path = base_path + 'application/';
var asset_path = base_path + 'asset/';

var app = new Framework7({
	name: 'XXII',
	id: 'com.ubaya.zyxave.xxii',
	root: '#app',
	theme: 'md',
	cache: false,
	panel: { swipe: 'left' },
	routes: [
		{
			path: '/index/',
			url: 'index.html',
		},
		{
			path: '/home/',
			url: 'pages/home.html',
			on: {
				pageInit: function(e, page){

					app.panel.enableSwipe();

					app.request.post(app_path + 'movies.php', 
						{ 
							action: 'getMovies',
							path: asset_path 
						},
						function(data){
							var obj = JSON.parse(data);
							var html = Template7.compile($$('#t7Home').html())(obj);
							$$('#listMovies').html(html);
						});

					if(!sessionStorage.opened){
						sessionStorage.opened = 'opened';
						$$('#btnlogout').on('click', function(){
							app.dialog.confirm("Are you sure?", "Logout", function(){
								app.dialog.progress();
								setTimeout(function(){
									app.dialog.close();
									localStorage.removeItem('userId');
									page.router.navigate('/login/', { animate: false, reloadAll: true });
								}, 500);
							});
						});
					}
				},
				// pageAfterIn: function(e, page){
				// 	if(!localStorage.userId){
				// 		page.router.navigate('/login/', { animate: false, reloadAll: true });
				// 	}
				// 	else{
				// 		page.router.navigate('/home/', { animate: false, reloadAll: true });
				// 	}
				// }
			},
		},
		{
			path: '/login/',
			url: 'pages/login.html',
			on: {
				pageInit: function(e, page){
					app.panel.disableSwipe();

					$$('#btnlogin').on('click', function(){
						app.dialog.progress();

						var username = $$('#username').val();
						var password = $$('#password').val();

						app.request.post(app_path + 'users.php', 
							{ 
								action: 'login', 
								user: username, 
								pass: password 
							},
							function(data){
								var obj = JSON.parse(data);

								setTimeout(function(){ 
									app.dialog.close();

									if(obj != 0){
										localStorage.setItem('userId', obj);
										page.router.navigate('/home/', { reloadAll: true });
									}
									else{
										app.dialog.alert("Invalid username or password!");
									}
								}, 500);
							});
					});
				},
				pageAfterIn: function(e, page){
					if(localStorage.userId){
						// app.dialog.progress();
						// setTimeout(function(){ app.dialog.close(); }, 500);
						page.router.navigate('/home/', { reloadAll: true });
					}
				}
			},
		},
		{
			path: '/register/',
			url: 'pages/register.html',
			on: {
				pageInit: function(e, page){
					app.panel.disableSwipe();

					var nameValid = false;
					var userValid = false;
					var passValid = false;
					var confirmed = false;

					$$('#nameR').on('focusout', function(){
						if(!$$('#nameR').hasClass('input-invalid')){ nameValid = true; }
						else{ nameValid = false; }
					});

					$$('#usernameR').on('focusout', function(){
						if(!$$('#usernameR').hasClass('input-invalid')){ userValid = true; }
						else{ userValid = false; }
					});

					$$('#passwordR').on('focusout', function(){
						if(!$$('#passwordR').hasClass('input-invalid')){ passValid = true; }
						else{ passValid = false; }
					});

					$$('#confirmR').on('focusout', function(){
						if($$('#confirmR').val() != $$('#passwordR').val()){
							$$('.match').css('visibility', 'visible');
							$$('.match').css('display', 'block');
							confirmed = false;
						}
						else{
							confirmed = true;
						}
					});

					$$('#confirmR').on('focusin', function(){
						$$('.match').css('visibility', 'hidden');
						$$('.match').css('display', 'none');
					});

					$$('#btnregister').on('click', function(){
						app.dialog.progress();

						if(confirmed && nameValid && userValid && passValid){
							var username = $$('#usernameR').val();
							var password = $$('#passwordR').val();
							var name = $$('#nameR').val();

							app.request.post(app_path + 'users.php', 
								{ 
									action: 'register', 
									user: username, 
									pass: password, 
									name: name 
								},
								function(data){
									var obj = JSON.parse(data);

									setTimeout(function(){
										app.dialog.close();
										
										if(obj == -1){
											app.dialog.alert("Username already exists!", "Failed",
												function(e){
													page.router.navigate('/register/');
												});
										}
										else if(obj == 0){
											app.dialog.alert("ERROR in mysql syntax!", "Failed",
												function(e){
													page.router.navigate('/register/');
												});
										}
										else if(obj == 1){
											app.dialog.alert("Registered!", "Success",
												function(e){
													page.router.navigate('/login/');
												});
										}
									});
								});
						}
						else if(!confirmed){
							setTimeout(function(){
								app.dialog.close();
								app.dialog.alert("Password doesn't match.", "ERROR");
							}, 500);
						}
						else{
							setTimeout(function(){
								app.dialog.close();
								app.dialog.alert("Please match the requested format.", "ERROR");
							}, 500);
						}
					});
				},
			},
		},
		{
			path: '/profile/',
			url: 'pages/profile.html',
			on: {
				pageInit: function(e, page){
					var userId = localStorage.userId;

					app.request.post(app_path + 'users.php', 
						{ 
							action: 'getProfiles', 
							userId: userId,
							path: asset_path
						},
						function(data){
							var obj = JSON.parse(data);

							$$('#propic').attr('src', obj['picture']);

							var html = Template7.compile($$('#t7Profile').html())(obj);
							$$('.page-content').html(html);

							$$('#btnpic').on('click', function(e){
								navigator.camera.getPicture(onSuccess, onFail, {
								  quality: 100,
								  destinationType: Camera.DestinationType.DATA_URL,
								  sourceType: Camera.PictureSourceType.CAMERA,
								  encodingType: Camera.EncodingType.JPEG,
								  mediaType: Camera.MediaType.PICTURE,
								  correctOrientation: true
								});

								var imgURI = $$('#propic').attr('src');
								app.dialog.alert(imgURI);
								var options = new FileUploadOptions();
								options.fileKey = "photo";
								options.fileName = imgURI.substr(imgURI.lastIndexOf('/') + 1);
								options.mimeType = "image/jpeg";
								options.params = { id: "ini id"	};
							});

							function onSuccess(imageData){
								$$('#propic').attr('src', 'data:image/jpeg; base64,' + imageData);
								// $$('#propic').attr('src', imageData);
							}

							function onFail(message){
								app.dialog.alert("Failed because: " + message);
							}
						});
				},
			},
		},
		{
			path: '/history/',
			url: 'pages/history.html',
			on: {
				pageInit: function(e, page){
					var userId = localStorage.userId;

					app.request.post(app_path + 'tickets.php', 
					{
						action: 'getHistory',
						userId: userId,
					},
					function(data){
						var obj = JSON.parse(data);
						var html = Template7.compile($$('#t7History').html())(obj);
						$$('.page-content').html(html);
					});
				},
			},
		},
		{
			path: '/password/',
			url: 'pages/password.html',
			on: {
				pageInit: function(e, page){
					var passValid = false;
					var confirmed = false;

					$$('#passwordC').on('focusout', function(){
						if(!$$('#passwordC').hasClass('input-invalid')){ passValid = true; }
						else{ passValid = false; }
					});

					$$('#confirmC').on('focusout', function(){
						if($$('#confirmC').val() != $$('#passwordC').val()){
							$$('.match').css('visibility', 'visible');
							$$('.match').css('display', 'block');
							confirmed = false;
						}
						else{
							confirmed = true;
						}
					});

					$$('#confirmC').on('focusin', function(){
						$$('.match').css('visibility', 'hidden');
						$$('.match').css('display', 'none');
					});

					$$('#btnchange').on('click', function(){
						var newpass = $$('#passwordC').val();

						if(confirmed && passValid){
							app.dialog.password("Enter current password", function(password){
								app.dialog.progress();
								app.request.post(app_path + 'users.php',
									{
										action: 'changePassword',
										userId: localStorage.userId,
										pass: password,
										newpass: newpass
									},
									function(data){
										var obj = JSON.parse(data);

										setTimeout(function(){ 
											app.dialog.close(); 

											if(obj == 1){
												app.dialog.alert("Password changed!", function(e){
													page.router.navigate('/home/');
												});
											}
											else if(obj == 0){
												app.dialog.alert("Invalid password!", function(e){
													$$('#passwordC').val("");
													$$('#confirmC').val("");
												});
											}
											else{
												app.dialog.alert("Error: -1", "Error");
											}
										}, 1000);
									});
							});
						}
						else{
							app.dialog.alert("Please match the requested format.", "ERROR");
						}
					});
				},
			},
		},
		{
			path: '/ticket/:movieId',
			url: 'pages/ticket.html',
			on:{
				pageInit: function(e, page){

					var movieId = page.router.currentRoute.params.movieId;
					var showtime, studio, qty;

					app.request.post(app_path + 'movies.php', 
						{ 
							action: 'getMoviesById', 
							movieId: movieId 
						},
						function(data){
							var title = JSON.parse(data)[0]['title'];
							$$('#textTitle').val(title);
						});

					function getAvailable(){
						studio = $$('select[name="studio"]').val();
						showtime = $$('select[name="showtime"]').val();

						app.request.post(app_path + 'tickets.php', 
							{ 
								action: 'getSeats', 
								movieId: movieId, 
								studio: studio, 
								showtime: showtime 
							},
							function(data){
								var seat = JSON.parse(data);
								if(seat.length > 0){
									$$('#able-seat').html("Available: " + seat.length + " seat(s)");

									var ablecode = "Seats: ";
									for(var i = 0; i < seat.length; i++){
										ablecode += seat[i];
										if(i != seat.length - 1){
											ablecode += ", ";
										}
									}
									$$('#able-code').html(ablecode);

									if(seat.length > 0){
										$$('#btnpick').removeClass('disabled');
										$$('#qty').html("");

										var maxQty = 5;
										if(seat.length < maxQty){
											maxQty = seat.length;
										}

										for(var i = 1; i <= maxQty; i++){
											if(i == 1){
												$$('#qty').append("<option value='" + i + " selected'>" + i + "</option>");
											}
											else{
												$$('#qty').append("<option value='" + i + "'>" + i + "</option>");
											}
										}
										
										qty = $$('select[name="qty"]').val();
									}
									else{
										$$('#btnpick').addClass('disabled');
									}
								}
							});
					}

					getAvailable();

					$$('select[name="studio"]').on('change propertychange', function(){
						getAvailable();
					});
					$$('select[name="showtime"]').on('change propertychange', function(){
						getAvailable();
					});
					$$('select[name="qty"]').on('change propertychange', function(){
						qty = $$('select[name="qty"]').val();
					});

					$$('#btnpick').on('click', function(){
						 page.router.navigate('/seat/' + movieId + '/' + showtime + '/' + studio + '/' + qty);
					});
				},
			},
		},
		{
			path: '/seat/:movieId/:showtime/:studio/:qty',
			url: 'pages/seat.html',
			on: {
				pageInit: function(e, page){

					var movieId = page.router.currentRoute.params.movieId;
					var showtime = page.router.currentRoute.params.showtime;
					var studio = page.router.currentRoute.params.studio;
					var qty = page.router.currentRoute.params.qty.split(" ")[0];
					var qtytemp = qty;
					var seatlist = '';

					$$('.btnback').attr("href", "/ticket/" + movieId);

					app.request.post(app_path + 'tickets.php', 
						{ 
							action: 'getSeats', 
							movieId: movieId, 
							studio: studio, 
							showtime: showtime
						},
						function(data){
							var seat = JSON.parse(data);

							$$('.block-title').append(
								"<span id='spanqty'><br><br><b>You must pick " + qtytemp + " seat(s) before proceeding.</b></span>");
							for(var i = 0; i < seat.length; i++){
								$$('#seatlist').append(
									'<li>' +
						            '<span>' + seat[i] + '</span>' +
						            '<label class="toggle toggle-init color-blue">' +
						              '<input class="tog-input" type="checkbox" name="seat" value="' + seat[i] + '">' +
						              '<span class="toggle-icon tog-icon" data-code="' + seat[i] + '"></span>' +
						            '</label>' +
						          	'</li>');
							}

							$$('.toggle').on('change', function(){
								$$(this).toggleClass('checked');
								if($$(this).hasClass('checked')){
									qtytemp--;
								}
								else{
									qtytemp++;
								}

								if(qtytemp <= 0){
									for(var i = 0; i < seat.length; i++){
										if(!$$('input[value="' + seat[i] + '"]').parent().hasClass('checked')){
											$$('input[value="' + seat[i] + '"]').parent().addClass('disabled');
										}
									}
									$$('#btnconfirm').removeClass('disabled');

									$$('#spanqty').html('<br><br><b>You\'re ready to continue.</b>');
								}
								else if(qtytemp > 0){
									$$('.toggle').removeClass('disabled');
									if(!$$('#btnconfirm').hasClass('disabled')){
										$$('#btnconfirm').addClass('disabled');
									}

									$$('#spanqty').html('<br><br><b>You must pick ' + qtytemp + ' seat(s) to continue.</b>');
								}
							});

							$$('#btnconfirm').on('click', function(){
								app.dialog.confirm("Are you sure?", "Purchase",
									function(e){
										seatlist = '';
										for(var i = 0; i < seat.length; i++){
											if($$('input[value="' + seat[i] + '"]').parent().hasClass('checked')){
												if(seatlist == ''){
													seatlist += seat[i];
												}
												else{
													seatlist += ', ' + seat[i];
												}
											}
										}

										page.router.navigate('/purchase/' + movieId + '/' + showtime + '/' + studio + '/' + qty + '/' + seatlist);
								});
							});
						});
				},
			},
		},
		{
			path: '/purchase/:movieId/:showtime/:studio/:qty/:seatlist',
			url: 'pages/purchase.html',
			on: {
				pageInit: function(e, page){
					app.panel.disableSwipe();

					var movieId = page.router.currentRoute.params.movieId;
					var showtime = page.router.currentRoute.params.showtime;
					var studio = page.router.currentRoute.params.studio;
					var qty = page.router.currentRoute.params.qty;
					var seatlist = page.router.currentRoute.params.seatlist;
					var userId = localStorage.userId;

					app.request.post(app_path + 'tickets.php', 
						{ 
							action: 'insertTickets', 
							movieId: movieId, 
							studio: studio, 
							showtime: showtime, 
							seatlist: seatlist,
							userId: userId
						},
						function(data){
							var obj = JSON.parse(data);

							var context = {
								title: obj['title'],
								date: obj['showdate'],
								studio: studio,
								showtime: obj['showtime'],
								seatlist: seatlist,
								qty: qty,
							};

							var html = Template7.compile($$('#t7Purchase').html())(context);
							$$('.page-content').html(html);
						});
				},
			},
		},
	],
	navbar: {
		hideOnPageScroll: true,
		showOnPageScrollEnd: true,
	}
});

var mainView = app.views.create('.view-main', { url: '/login/' });

// mainView.router.navigate('/seat/');